// src/admin/Resourses/LineupSection.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  useNotify,
  useRefresh,
  useRecordContext,
  useDataProvider,
} from 'react-admin';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Typography,
  Divider,
} from '@mui/material';

import serverConfig from '../../../../serverConfig';
import { fetchJsonWithToken } from '../JS/fetchJsonWithToken';

const toChoices = (players) =>
  players.map((p) => ({
    id: p.id,
    name: p.number != null ? `${p.name} (#${p.number})` : p.name,
  }));

function MultiSelect({ label, value, onChange, choices }) {
  return (
    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((id) => {
              const c = choices.find((x) => x.id === id);
              return <Chip key={id} label={c?.name || id} size="small" />;
            })}
          </Box>
        )}
      >
        {choices.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function SingleSelect({ label, value, onChange, choices, noneText = '—' }) {
  return (
    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <MenuItem value="">{noneText}</MenuItem>
        {choices.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function LineupSection() {
  const record = useRecordContext(); // матч из MatchEdit
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const matchId = record?.id;
  const homeTeamId = record?.homeTeamId;
  const guestTeamId = record?.guestTeamId;

  const [homeTeamTitle, setHomeTeamTitle] = useState(
    record?.homeTeam?.title || 'Команда 1'
  );
  const [guestTeamTitle, setGuestTeamTitle] = useState(
    record?.guestTeam?.title || 'Команда 2'
  );

  const [homePlayers, setHomePlayers] = useState([]);
  const [guestPlayers, setGuestPlayers] = useState([]);

  const [homeStarters, setHomeStarters] = useState([]);
  const [homeSubs, setHomeSubs] = useState([]);
  const [homeReserve, setHomeReserve] = useState([]);
  const [homeCaptainId, setHomeCaptainId] = useState(null);

  const [guestStarters, setGuestStarters] = useState([]);
  const [guestSubs, setGuestSubs] = useState([]);
  const [guestReserve, setGuestReserve] = useState([]);
  const [guestCaptainId, setGuestCaptainId] = useState(null);

  const [loading, setLoading] = useState(false);

  const homeChoices = useMemo(() => toChoices(homePlayers), [homePlayers]);
  const guestChoices = useMemo(() => toChoices(guestPlayers), [guestPlayers]);

  // 1) Подстрахуемся: если названия команд не пришли в record — дотянем
  useEffect(() => {
    (async () => {
      try {
        if (homeTeamId && !record?.homeTeam?.title) {
          const { data } = await dataProvider.getOne('teams', {
            id: homeTeamId,
          });
          setHomeTeamTitle(data?.title || homeTeamTitle);
        }
        if (guestTeamId && !record?.guestTeam?.title) {
          const { data } = await dataProvider.getOne('teams', {
            id: guestTeamId,
          });
          setGuestTeamTitle(data?.title || guestTeamTitle);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeTeamId, guestTeamId]);

  // 2) Загрузка игроков по командам через dataProvider (с токеном/базовым URL)
  useEffect(() => {
    if (!homeTeamId || !guestTeamId) return;
    (async () => {
      try {
        setLoading(true);
        const [homeRes, guestRes] = await Promise.all([
          dataProvider.getList('players', {
            pagination: { page: 1, perPage: 500 },
            sort: { field: 'id', order: 'ASC' },
            filter: { teamId: homeTeamId },
          }),
          dataProvider.getList('players', {
            pagination: { page: 1, perPage: 500 },
            sort: { field: 'id', order: 'ASC' },
            filter: { teamId: guestTeamId },
          }),
        ]);
        setHomePlayers(homeRes.data || []);
        setGuestPlayers(guestRes.data || []);
      } catch (e) {
        console.error(e);
        notify('Не удалось загрузить игроков команд', { type: 'warning' });
      } finally {
        setLoading(false);
      }
    })();
  }, [homeTeamId, guestTeamId, dataProvider, notify]);

  // 3) Загрузка текущих составов через fetchJsonWithToken на serverConfig
  useEffect(() => {
    if (!matchId) return;
    (async () => {
      try {
        setLoading(true);
        const url = `${serverConfig}/matches/${matchId}/lineups`;
        const res = await fetchJsonWithToken(url, { method: 'GET' });
        const lineup = res?.json ?? res; // fetchJsonWithToken возвращает { json } или сам json — поддержим оба случая

        const h = lineup.home || { starters: [], subs: [], reserve: [] };
        const g = lineup.guest || { starters: [], subs: [], reserve: [] };

        setHomeStarters(h.starters.map((x) => x.playerId));
        setHomeSubs(h.subs.map((x) => x.playerId));
        setHomeReserve(h.reserve.map((x) => x.playerId));
        setHomeCaptainId(
          h.starters.concat(h.subs, h.reserve).find((x) => x.isCaptain)
            ?.playerId ?? null
        );

        setGuestStarters(g.starters.map((x) => x.playerId));
        setGuestSubs(g.subs.map((x) => x.playerId));
        setGuestReserve(g.reserve.map((x) => x.playerId));
        setGuestCaptainId(
          g.starters.concat(g.subs, g.reserve).find((x) => x.isCaptain)
            ?.playerId ?? null
        );
      } catch (e) {
        console.error(e);
        notify('Не удалось загрузить составы', { type: 'warning' });
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId, notify]);

  const save = async () => {
    if (!matchId) return;
    try {
      setLoading(true);
      const payload = {
        home: {
          starters: homeStarters,
          subs: homeSubs,
          reserve: homeReserve,
          captainId: homeCaptainId,
        },
        guest: {
          starters: guestStarters,
          subs: guestSubs,
          reserve: guestReserve,
          captainId: guestCaptainId,
        },
      };
      const url = `${serverConfig}/matches/${matchId}/lineups`;
      await fetchJsonWithToken(url, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      notify('Составы сохранены', { type: 'info' });
      refresh();
    } catch (e) {
      console.error(e);
      notify('Ошибка сохранения составов', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Составы" subheader="Старт, запас, капитан" />
      <CardContent>
        {!matchId ? (
          <Typography variant="body2" color="text.secondary">
            Сначала сохраните матч (чтобы появился ID), потом редактируйте
            составы.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">{homeTeamTitle}</Typography>
              <MultiSelect
                label="Старт (11)"
                value={homeStarters}
                onChange={setHomeStarters}
                choices={homeChoices}
              />
              <MultiSelect
                label="Запас"
                value={homeSubs}
                onChange={setHomeSubs}
                choices={homeChoices}
              />
              <MultiSelect
                label="Резерв"
                value={homeReserve}
                onChange={setHomeReserve}
                choices={homeChoices}
              />
              <SingleSelect
                label="Капитан"
                value={homeCaptainId}
                onChange={setHomeCaptainId}
                choices={homeChoices}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">{guestTeamTitle}</Typography>
              <MultiSelect
                label="Старт (11)"
                value={guestStarters}
                onChange={setGuestStarters}
                choices={guestChoices}
              />
              <MultiSelect
                label="Запас"
                value={guestSubs}
                onChange={setGuestSubs}
                choices={guestChoices}
              />
              <MultiSelect
                label="Резерв"
                value={guestReserve}
                onChange={setGuestReserve}
                choices={guestChoices}
              />
              <SingleSelect
                label="Капитан"
                value={guestCaptainId}
                onChange={setGuestCaptainId}
                choices={guestChoices}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="contained" onClick={save} disabled={loading}>
                  Сохранить составы
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

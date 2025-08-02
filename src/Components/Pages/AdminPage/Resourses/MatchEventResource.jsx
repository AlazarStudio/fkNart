import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  NumberField,
  TextField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  NumberInput,
  SelectInput,
  ReferenceInput,
  TextInput,
  useDataProvider,
  useRecordContext,
  FunctionField,
  RadioButtonGroupInput,
} from 'react-admin';

const eventTypes = [
  { id: 'GOAL', name: 'Гол' },
  { id: 'ASSIST', name: 'Передача' },
  { id: 'YELLOW_CARD', name: 'Жёлтая карточка' },
  { id: 'RED_CARD', name: 'Красная карточка' },
  { id: 'SUBSTITUTION', name: 'Замена' },
];

export const MatchEventList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <NumberField source="minute" label="Минута" />
      <NumberField source="half" label="Тайм" />
      <FunctionField
        label="Тип"
        render={(record) =>
          eventTypes.find((e) => e.id === record.type)?.name || record.type
        }
      />
      <TextField source="description" label="Описание" />
      <TextField source="player.name" label="Игрок" />
      <TextField source="team.title" label="Команда" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const MatchEventForm = (props) => {
  const dataProvider = useDataProvider();
  const record = useRecordContext(props);

  const [leagueId, setLeagueId] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // ✅ При редактировании заполняем стейт
  useEffect(() => {
    if (record) {
      if (record.match?.leagueId) setLeagueId(record.match.leagueId);
      if (record.matchId) setMatchId(record.matchId);
      if (record.teamId) setTeamId(record.teamId);
    }
  }, [record]);

  // ✅ Загружаем матчи по лиге
  useEffect(() => {
    if (leagueId) {
      dataProvider
        .getList('matches', {
          filter: { leagueId },
          pagination: { page: 1, perPage: 100 },
        })
        .then(({ data }) => setMatches(data));
    } else {
      setMatches([]);
    }
  }, [leagueId]);

  // ✅ Загружаем команды по матчу
  useEffect(() => {
    if (matchId) {
      dataProvider.getOne('matches', { id: matchId }).then(({ data }) => {
        if (data) {
          setTeams([
            { id: data.homeTeam.id, title: data.homeTeam.title },
            { id: data.guestTeam.id, title: data.guestTeam.title },
          ]);
        }
      });
    } else {
      setTeams([]);
    }
  }, [matchId]);

  // ✅ Загружаем игроков по команде
  useEffect(() => {
    if (teamId) {
      dataProvider
        .getList('players', {
          filter: { teamId },
          pagination: { page: 1, perPage: 100 },
        })
        .then(({ data }) => setPlayers(data));
    } else {
      setPlayers([]);
    }
  }, [teamId]);

  return (
    <SimpleForm {...props}>
      {/* Лига */}
      <ReferenceInput source="leagueId" reference="leagues" label="Лига">
        <SelectInput
          optionText="title"
          value={leagueId || ''}
          onChange={(e) => {
            setLeagueId(Number(e.target.value));
            setMatchId(null);
            setTeamId(null);
            setMatches([]);
            setTeams([]);
            setPlayers([]);
          }}
          parse={(v) => Number(v)}
        />
      </ReferenceInput>

      {/* Матч */}
      <SelectInput
        source="matchId"
        label="Матч"
        optionText="title"
        choices={matches.map((m) => ({
          id: m.id,
          title: `${m.stadium} (${m.homeTeam.title} vs ${m.guestTeam.title})`,
        }))}
        onChange={(e) => {
          setMatchId(Number(e.target.value));
          setTeamId(null);
          setPlayers([]);
        }}
        parse={(v) => Number(v)}
      />

      {/* Команда */}
      <SelectInput
        source="teamId"
        label="Команда"
        choices={teams}
        optionText="title"
        onChange={(e) => setTeamId(Number(e.target.value))}
        parse={(v) => Number(v)}
      />

      {/* Игрок */}
      <SelectInput
        source="playerId"
        label="Игрок"
        choices={players.map((p) => ({ id: p.id, title: p.name }))}
        optionText="title"
        parse={(v) => Number(v)}
      />

      {/* Ассистент */}
      <SelectInput
        source="assistPlayerId"
        label="Ассистент"
        choices={players.map((p) => ({ id: p.id, title: p.name }))}
        optionText="title"
        emptyText="Без ассистента"
        parse={(v) => (v === '' ? null : Number(v))}
        format={(v) => (v == null ? '' : v)}
      />

      <NumberInput source="minute" label="Минута" />
      <RadioButtonGroupInput
        source="half"
        label="Тайм"
        choices={[
          { id: 1, name: '1' },
          { id: 2, name: '2' },
        ]}
        parse={(v) => Number(v)}
        format={(v) => Number(v)}
      />
      <SelectInput source="type" label="Тип события" choices={eventTypes} />
      <TextInput source="description" label="Описание" fullWidth />
    </SimpleForm>
  );
};

export const MatchEventCreate = (props) => (
  <Create {...props}>
    <MatchEventForm />
  </Create>
);

export const MatchEventEdit = (props) => (
  <Edit {...props}>
    <MatchEventForm />
  </Edit>
);

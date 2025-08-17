import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import classes from './TournamentTablePage.module.css';

export default function TournamentTablePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [standings, setStandings] = useState([]);

  // фильтры
  const [highlightTeamId, setHighlightTeamId] = useState('ALL'); // только подсветка строки
  const [season, setSeason] = useState('ALL');
  const [leagueId, setLeagueId] = useState(null);

  // пагинация
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const tableRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [tRes, lRes, sRes] = await Promise.all([
          axios.get(`${serverConfig}/teams`),
          axios.get(`${serverConfig}/leagues`),
          axios.get(`${serverConfig}/leagueStandings`), // предполагается include { league, team }
        ]);

        if (alive) {
          setTeams(Array.isArray(tRes.data) ? tRes.data : []);
          const leaguesData = Array.isArray(lRes.data) ? lRes.data : [];
          setLeagues(leaguesData);
          setStandings(Array.isArray(sRes.data) ? sRes.data : []);

          // дефолтный сезон — последний по алфавиту (обычно самый свежий)
          const seasons = leaguesData
            .map((l) => l.season)
            .filter(Boolean)
            .sort((a, b) => (a < b ? 1 : -1));
          const defaultSeason = seasons[0] || 'ALL';
          setSeason(defaultSeason);

          // дефолтная лига — первая лига этого сезона
          const leaguesOfSeason = leaguesData.filter(
            (l) => String(l.season) === String(defaultSeason)
          );
          setLeagueId(leaguesOfSeason[0]?.id ?? leaguesData[0]?.id ?? null);
        }
      } catch (e) {
        if (alive) setErr('Не удалось загрузить турнирную таблицу');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // сезоны для селекта
  const seasonOptions = useMemo(() => {
    const set = new Set(leagues.map((l) => String(l.season)));
    const list = Array.from(set)
      .filter(Boolean)
      .sort((a, b) => (a < b ? 1 : -1));
    return list.length ? list : ['ALL'];
  }, [leagues]);

  // лиги выбранного сезона
  const leaguesOfSeason = useMemo(() => {
    return leagues
      .filter((l) => String(l.season) === String(season))
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }, [leagues, season]);

  // пересбрасываем лигу при смене сезона
  useEffect(() => {
    if (!leaguesOfSeason.length) return;
    if (!leagueId || !leaguesOfSeason.some((l) => l.id === leagueId)) {
      setLeagueId(leaguesOfSeason[0].id);
    }
    // сброс номера страницы
    setPage(1);
  }, [season, leaguesOfSeason]); // eslint-disable-line

  // строки таблицы для выбранной лиги
  const rows = useMemo(() => {
    const list = standings
      .filter((st) => leagueId && st.league_id === leagueId)
      .map((st) => ({
        id: st.id,
        teamId: st.team_id,
        teamTitle: st.team?.title || '',
        teamLogo: st.team?.logo?.[0]
          ? `${uploadsConfig}${st.team.logo[0]}`
          : '',
        played: st.played ?? 0,
        wins: st.wins ?? 0,
        draws: st.draws ?? 0,
        losses: st.losses ?? 0,
        gf: st.goals_for ?? 0,
        ga: st.goals_against ?? 0,
        gd: (st.goals_for ?? 0) - (st.goals_against ?? 0),
        points: st.points ?? 0,
      }))
      // базовая сортировка: очки, разница, забитые, победы
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.gd - a.gd ||
          b.gf - a.gf ||
          b.wins - a.wins ||
          a.played - b.played ||
          a.teamTitle.localeCompare(b.teamTitle, 'ru')
      );

    // перенумерация позиций
    return list.map((r, idx) => ({ ...r, pos: idx + 1 }));
  }, [standings, leagueId]);

  // пагинация
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const pageRows = rows.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  // автоматический скролл к подсвеченной команде (если есть)
  useEffect(() => {
    if (highlightTeamId === 'ALL' || !tableRef.current) return;
    const el = tableRef.current.querySelector(
      `[data-team-row="${String(highlightTeamId)}"]`
    );
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [highlightTeamId, pageSafe, pageRows]);

  if (loading) return <div className={classes.pageWrap}>Загрузка…</div>;
  if (err) return <div className={classes.pageWrap}>{err}</div>;

  return (
    <div className={classes.container}>
      <div className={classes.pageWrap}>
        <h1 className={classes.title}>ТУРНИРНАЯ ТАБЛИЦА</h1>

        {/* Фильтры */}
        <div className={classes.filters}>
          <label className={classes.filter}>
            <span>Команда</span>
            <select
              value={highlightTeamId}
              onChange={(e) => {
                setHighlightTeamId(e.target.value);
                // при смене команды попробуем перейти на страницу, где она находится
                if (e.target.value !== 'ALL') {
                  const idx = rows.findIndex(
                    (r) => String(r.teamId) === String(e.target.value)
                  );
                  if (idx >= 0) setPage(Math.floor(idx / pageSize) + 1);
                }
              }}
            >
              <option value="ALL">Все команды (без подсветки)</option>
              {teams
                .slice()
                .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </label>

          <label className={classes.filter}>
            <span>Сезон</span>
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              {seasonOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className={classes.filter}>
            <span>Турнир</span>
            <select
              value={leagueId ?? ''}
              onChange={(e) => {
                setLeagueId(Number(e.target.value));
                setPage(1);
              }}
            >
              {leaguesOfSeason.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Название выбранной лиги */}
        <div className={classes.leagueTitle}>
          {leagues.find((l) => l.id === leagueId)?.title || '—'}
        </div>

        {/* Таблица */}
        <div ref={tableRef} className={classes.tableWrap}>
          <div className={`${classes.row} ${classes.head}`}>
            <span className={classes.colPos}>№</span>
            <span className={classes.colTeam}>Команда</span>
            <span className={classes.colNum}>И</span>
            <span className={classes.colNum}>В</span>
            <span className={classes.colNum}>Н</span>
            <span className={classes.colNum}>П</span>
            <span className={classes.colGoals}>Голы</span>
            <span className={classes.colNum}>Очки</span>
          </div>

          {pageRows.map((r) => {
            const highlight =
              String(highlightTeamId) !== 'ALL' &&
              String(highlightTeamId) === String(r.teamId);
            return (
              <div
                key={r.id}
                className={`${classes.row} ${
                  highlight ? classes.highlight : ''
                }`}
                data-team-row={String(r.teamId)}
              >
                <span className={classes.colPos}>{r.pos}</span>

                <span className={classes.colTeam}>
                  {r.teamLogo ? (
                    <img src={r.teamLogo} alt={r.teamTitle} />
                  ) : (
                    <div className={classes.logoStub} />
                  )}
                  <span className={classes.teamName}>{r.teamTitle}</span>
                </span>

                <span className={classes.colNum}>{r.played}</span>
                <span className={classes.colNum}>{r.wins}</span>
                <span className={classes.colNum}>{r.draws}</span>
                <span className={classes.colNum}>{r.losses}</span>
                <span className={classes.colGoals}>
                  {r.gf}-{r.ga}
                </span>
                <span className={`${classes.colNum} ${classes.points}`}>
                  {r.points}
                </span>
              </div>
            );
          })}

          {/* пагинация */}
          {pageCount > 1 && (
            <div className={classes.pagination}>
              {Array.from({ length: pageCount }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`${classes.pageBtn} ${
                      pageSafe === n ? classes.pageActive : ''
                    }`}
                    aria-label={`Страница ${n}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

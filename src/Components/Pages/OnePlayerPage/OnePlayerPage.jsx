import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import classes from './OnePlayerPage.module.css';

const posRu = {
  GOALKEEPER: 'Вратарь',
  DEFENDER: 'Защитник',
  MIDFIELDER: 'Полузащитник',
  FORWARD: 'Нападающий',
  HEAD_COACH: 'Главный тренер',
  ASSISTANT_COACH: 'Тренер/ассистент',
  GOALKEEPER_COACH: 'Тренер вратарей',
  FITNESS_COACH: 'Тренер по физподготовке',
  ANALYST: 'Аналитик',
  PHYSIOTHERAPIST: 'Физиотерапевт',
  DOCTOR: 'Врач',
  TEAM_MANAGER: 'Администратор',
  MASSEUR: 'Массажист',
  KIT_MANAGER: 'Экипировщик',
};

const PLAYER_POS = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];

export default function OnePlayerPage() {
  const { playerId } = useParams();

  const [player, setPlayer] = useState(null);
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // таблица по матчам
  const [matchRows, setMatchRows] = useState([]); // [{matchId, league, matchTitle, matchDateText, played, goals, pens, assists, yc, rc}]
  const [totals, setTotals] = useState(null); // {played, goals, pens, assists, yc, rc}

  const fmtMatchDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
    const time = d.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
      .format(d)
      .replace('.', '');
    return `${date}/${weekday}/${time}`;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 1) игрок
        const pRes = await axios.get(`${serverConfig}/players/${playerId}`);
        const p = pRes.data;
        if (alive) setPlayer(p);

        // 2) команда
        if (p?.team) {
          if (alive) setTeam(p.team);
        } else if (p?.teamId) {
          try {
            const tRes = await axios.get(`${serverConfig}/teams/${p.teamId}`);
            if (alive) setTeam(tRes.data);
          } catch {}
        }

        // если тренерский штаб — дальнейшие запросы статистики нам не нужны
        if (p && !PLAYER_POS.includes(p.position)) {
          if (alive) {
            setLoading(false);
          }
          return;
        }

        // 3) общая статистика
        try {
          const sList = await axios.get(`${serverConfig}/playerStats`, {
            params: { filter: JSON.stringify({ playerId: Number(playerId) }) },
          });
          const arr = Array.isArray(sList.data) ? sList.data : [];
          if (alive && arr[0]) setStats(arr[0]);
        } catch {
          try {
            const sOne = await axios.get(
              `${serverConfig}/players/${playerId}/stats`
            );
            if (alive) setStats(sOne.data);
          } catch {}
        }

        // 4) события по матчам
        const filter = {
          OR: [
            { playerId: Number(playerId) },
            { assistPlayerId: Number(playerId) },
          ],
        };
        const evRes = await axios.get(`${serverConfig}/matchEvents`, {
          params: { filter: JSON.stringify(filter) },
        });
        const events = Array.isArray(evRes.data) ? evRes.data : [];

        const byMatch = new Map();
        const matchIds = new Set();
        for (const ev of events) {
          if (!ev?.matchId) continue;
          matchIds.add(ev.matchId);
          if (!byMatch.has(ev.matchId)) byMatch.set(ev.matchId, []);
          byMatch.get(ev.matchId).push(ev);
        }

        if (matchIds.size === 0) {
          if (alive) {
            setMatchRows([]);
            setTotals({
              played: 0,
              goals: 0,
              pens: 0,
              assists: 0,
              yc: 0,
              rc: 0,
            });
          }
          return;
        }

        // матчи пачкой
        const idsArr = Array.from(matchIds);
        const mRes = await axios.get(`${serverConfig}/matches`, {
          params: { filter: JSON.stringify({ id: idsArr }) },
        });
        const matches = Array.isArray(mRes.data) ? mRes.data : [];
        const matchById = new Map(matches.map((m) => [m.id, m]));

        let totalPlayed = 0,
          totalGoals = 0,
          totalPens = 0,
          totalAssists = 0,
          totalYC = 0,
          totalRC = 0;

        const rows = idsArr.map((mid) => {
          const evs = byMatch.get(mid) || [];
          const played = evs.length > 0 ? 1 : 0;

          let goals = 0,
            pens = 0,
            assists = 0,
            yc = 0,
            rc = 0;

          for (const e of evs) {
            const t = e.type;
            const isThisPlayer = e.playerId === Number(playerId);
            const isAssistOnGoal =
              e.type === 'GOAL' && e.assistPlayerId === Number(playerId);

            if (t === 'GOAL' && isThisPlayer) {
              goals += 1;
              const d = (e.description || '').toLowerCase();
              if (d.includes('пен') || d.includes('пн') || d.includes('pen'))
                pens += 1;
            }
            if (isAssistOnGoal) assists += 1;
            if (t === 'YELLOW_CARD' && isThisPlayer) yc += 1;
            if (t === 'RED_CARD' && isThisPlayer) rc += 1;
          }

          totalPlayed += played;
          totalGoals += goals;
          totalPens += pens;
          totalAssists += assists;
          totalYC += yc;
          totalRC += rc;

          const m = matchById.get(mid);
          const league = m?.league?.title || '';
          const matchTitle = m
            ? `${m?.homeTeam?.title || 'Хозяева'} ${m?.homeScore ?? '-'}:${
                m?.guestScore ?? '-'
              } ${m?.guestTeam?.title || 'Гости'}`
            : `Матч #${mid}`;

          return {
            matchId: mid,
            date: m?.date ? new Date(m.date).getTime() : 0,
            matchDateText: m?.date ? fmtMatchDate(m.date) : '',
            league,
            matchTitle,
            played,
            goals,
            pens,
            assists,
            yc,
            rc,
          };
        });

        rows.sort((a, b) => b.date - a.date);

        if (alive) {
          setMatchRows(rows);
          setTotals({
            played: totalPlayed,
            goals: totalGoals,
            pens: totalPens,
            assists: totalAssists,
            yc: totalYC,
            rc: totalRC,
          });
        }
      } catch (e) {
        if (alive) setErr('Не удалось загрузить игрока');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [playerId]);

  if (loading) return <div className={classes.pageWrap}>Загрузка…</div>;
  if (err) return <div className={classes.pageWrap}>{err}</div>;
  if (!player) return <div className={classes.pageWrap}>Игрок не найден</div>;

  const mainImg =
    Array.isArray(player.images) && player.images[0]
      ? `${uploadsConfig}${player.images[0]}`
      : null;

  const safeStats = {
    matchesPlayed: Number(stats?.matchesPlayed) || 0,
    goals: Number(stats?.goals) || 0,
    assists: Number(stats?.assists) || 0,
    yellow_cards: Number(stats?.yellow_cards) || 0,
    red_cards: Number(stats?.red_cards) || 0,
  };

  const tableTotals = totals || {
    played: safeStats.matchesPlayed,
    goals: safeStats.goals,
    pens: 0,
    assists: safeStats.assists,
    yc: safeStats.yellow_cards,
    rc: safeStats.red_cards,
  };

  const isStaff = player && !PLAYER_POS.includes(player.position);

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.card}>
          <div className={classes.left}>
            {mainImg ? (
              <img
                src={mainImg}
                alt={player.name}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className={classes.noPhoto}>{player.name?.[0] || '?'}</div>
            )}
          </div>

          <div className={classes.right}>
            <img
              src="../images/aboutNart.png"
              className={classes.bg}
              style={{ transform: 'scaleX(-1)' }}
              alt=""
            />
            <div className={classes.right1}>
              <span className={classes.name}>{player.name}</span>

              {/* Метаданные: для штаба показываем только позицию */}
              {isStaff ? (
                <div className={classes.meta}>
                  <div className={classes.metaLeft}>
                    <span>Позиция:</span>
                  </div>
                  <div className={classes.metaRight}>
                    <span>
                      {posRu[player.position] || player.position || '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={classes.meta}>
                  <div className={classes.metaLeft}>
                    <span>Позиция:</span>
                    <span>Дата рождения:</span>
                    <span>Клуб:</span>
                  </div>
                  <div className={classes.metaRight}>
                    <span>
                      {posRu[player.position] || player.position || '—'}
                    </span>
                    <span>
                      {player.birthDate &&
                        new Date(player.birthDate).toLocaleDateString('ru-RU')}
                    </span>
                    <span>{team?.title || '—'}</span>
                  </div>
                </div>
              )}

              {/* Сводная статистика только для игроков */}
              {!isStaff && (
                <div className={classes.statsGrid}>
                  <div className={classes.stat}>
                    <div className={classes.statLabel}>Игры</div>
                    <div className={classes.statVal}>
                      {safeStats.matchesPlayed}
                    </div>
                  </div>
                  <div className={classes.stat}>
                    <div className={classes.statLabel}>Голы</div>
                    <div className={classes.statVal}>{safeStats.goals}</div>
                  </div>
                  <div className={classes.stat}>
                    <div className={classes.statLabel}>Передачи</div>
                    <div className={classes.statVal}>{safeStats.assists}</div>
                  </div>
                  <div className={classes.stat}>
                    <div className={classes.statLabel}>ЖК</div>
                    <div className={classes.statVal}>
                      {safeStats.yellow_cards}
                    </div>
                  </div>
                  <div className={classes.stat}>
                    <div className={classes.statLabel}>КК</div>
                    <div className={classes.statVal}>{safeStats.red_cards}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Таблица и заголовок — показываем только для игроков */}
      </div>
      {!isStaff && (
        <>
          <div className={classes.statTitle}>
            <span>СТАТИСТИКА</span>
          </div>

          <div className={classes.allStat}>
            <div className={classes.table}>
              {/* шапка */}
              <div className={`${classes.row} ${classes.head}`}>
                <div className={`${classes.cell} ${classes.colLeague}`}>
                  Лига
                </div>
                <div className={`${classes.cell} ${classes.colMatch}`}>
                  Матч
                </div>
                <div className={classes.cell}>И</div>
                <div className={classes.cell}>Г (ПН)</div>
                <div className={classes.cell}>Пас</div>
                <div className={classes.cell}>ЖК</div>
                <div className={classes.cell}>КК</div>
              </div>

              {/* итого */}
              <div className={`${classes.row} ${classes.total}`}>
                <div className={`${classes.cell} ${classes.colLeague}`}>
                  ИТОГО
                </div>
                <div className={`${classes.cell} ${classes.colMatch}`}>-</div>
                <div className={classes.cell}>{tableTotals.played}</div>
                <div className={classes.cell}>
                  {tableTotals.goals} ({tableTotals.pens})
                </div>
                <div className={classes.cell}>{tableTotals.assists}</div>
                <div className={classes.cell}>{tableTotals.yc}</div>
                <div className={classes.cell}>{tableTotals.rc}</div>
              </div>

              {/* строки по матчам */}
              {matchRows.length > 0 ? (
                matchRows.map((r) => (
                  <div key={r.matchId} className={classes.row}>
                    <div className={`${classes.cell} ${classes.colLeague}`}>
                      {r.league || '—'}
                    </div>
                    <div className={`${classes.cell} ${classes.colMatch}`}>
                      <div className={classes.matchTitle}>{r.matchTitle}</div>
                      {r.matchDateText && (
                        <div className={classes.matchDate}>
                          {r.matchDateText}
                        </div>
                      )}
                    </div>
                    <div className={classes.cell}>{r.played}</div>
                    <div className={classes.cell}>
                      {r.goals} ({r.pens})
                    </div>
                    <div className={classes.cell}>{r.assists}</div>
                    <div className={classes.cell}>{r.yc}</div>
                    <div className={classes.cell}>{r.rc}</div>
                  </div>
                ))
              ) : (
                <div className={`${classes.row} ${classes.empty}`}>
                  <div
                    className={classes.cell}
                    style={{ gridColumn: '1 / -1' }}
                  >
                    Нет данных по матчам (без событий игрока матчи не
                    отображаются)
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

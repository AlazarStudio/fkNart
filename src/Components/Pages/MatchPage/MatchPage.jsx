import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import classes from './MatchPage.module.css';

const TAB = {
  PROTOCOL: 'PROTOCOL',
  EVENTS: 'EVENTS',
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
};

const posRu = {
  GOALKEEPER: 'Вр',
  DEFENDER: 'Зщ',
  MIDFIELDER: 'Пз',
  FORWARD: 'Нап',
  HEAD_COACH: 'Главный тренер',
  ASSISTANT_COACH: 'Ассистент',
  GOALKEEPER_COACH: 'Тренер вратарей',
  FITNESS_COACH: 'Фитнес-тренер',
  ANALYST: 'Аналитик',
  PHYSIOTHERAPIST: 'Физиотерапевт',
  DOCTOR: 'Врач',
  TEAM_MANAGER: 'Администратор',
  MASSEUR: 'Массажист',
  KIT_MANAGER: 'Экипировщик',
};

function fmtHeaderDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
  }).format(d);
  const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' })
    .format(d)
    .toLowerCase();
  const time = d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} / ${weekday} / ${time}`;
}

function ytId(url = '') {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('embed');
    return idx >= 0 ? parts[idx + 1] : null;
  } catch {
    return null;
  }
}

const PLAYER_POSITIONS = new Set([
  'GOALKEEPER',
  'DEFENDER',
  'MIDFIELDER',
  'FORWARD',
]);
const isPlayerPosition = (p) => (p && PLAYER_POSITIONS.has(p)) || false;

export default function MatchPage() {
  const { matchId } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [homePlayers, setHomePlayers] = useState([]);
  const [guestPlayers, setGuestPlayers] = useState([]);
  const [tab, setTab] = useState(TAB.EVENTS);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // матч
        let m;
        try {
          const r = await axios.get(`${serverConfig}/matches/${matchId}`);
          m = r.data;
        } catch {
          const r = await axios.get(`${serverConfig}/matches`, {
            params: { filter: JSON.stringify({ id: [Number(matchId)] }) },
          });
          m = Array.isArray(r.data) ? r.data[0] : null;
        }
        if (!m) throw new Error('Матч не найден');
        if (alive) setMatch(m);

        // события
        try {
          const evR = await axios.get(`${serverConfig}/matchEvents`, {
            params: { filter: JSON.stringify({ matchId: Number(matchId) }) },
          });
          const arr = Array.isArray(evR.data) ? evR.data : [];
          arr.sort(
            (a, b) =>
              (a.half || 1) - (b.half || 1) ||
              (a.minute ?? 0) - (b.minute ?? 0) ||
              a.id - b.id
          );
          if (alive) setEvents(arr);
        } catch {
          if (alive) setEvents([]);
        }

        // составы
        const hp = m?.homeTeamId
          ? axios.get(`${serverConfig}/players`, {
              params: {
                filter: JSON.stringify({ teamId: Number(m.homeTeamId) }),
              },
            })
          : Promise.resolve({ data: [] });
        const gp = m?.guestTeamId
          ? axios.get(`${serverConfig}/players`, {
              params: {
                filter: JSON.stringify({ teamId: Number(m.guestTeamId) }),
              },
            })
          : Promise.resolve({ data: [] });
        const [homeRes, guestRes] = await Promise.all([hp, gp]);
        if (alive) {
          setHomePlayers(Array.isArray(homeRes.data) ? homeRes.data : []);
          setGuestPlayers(Array.isArray(guestRes.data) ? guestRes.data : []);
        }
      } catch (e) {
        if (alive) setErr('Не удалось загрузить страницу матча');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [matchId]);

  const homeSquad = useMemo(
    () =>
      homePlayers
        .filter((p) => isPlayerPosition(p.position))
        .sort((a, b) => (a.number ?? 0) - (b.number ?? 0)),
    [homePlayers]
  );
  const guestSquad = useMemo(
    () =>
      guestPlayers
        .filter((p) => isPlayerPosition(p.position))
        .sort((a, b) => (a.number ?? 0) - (b.number ?? 0)),
    [guestPlayers]
  );

  const headerHalfScore = useMemo(() => {
    if (!events?.length || !match) return null;
    let h = 0;
    let g = 0;
    events.forEach((e) => {
      if (e.type !== 'GOAL' || (e.half || 1) !== 1) return;
      if (e.teamId === match.homeTeamId) h += 1;
      if (e.teamId === match.guestTeamId) g += 1;
    });
    return `(${h}:${g})`;
  }, [events, match]);

  const homeImages = match?.homeTeam?.images?.[0]
    ? `${uploadsConfig}${match.homeTeam.images[0]}`
    : null;
  const guestImages = match?.guestTeam?.images?.[0]
    ? `${uploadsConfig}${match.guestTeam.images[0]}`
    : null;
  const homeLogo = match?.homeTeam?.logo?.[0]
    ? `${uploadsConfig}${match.homeTeam.logo[0]}`
    : null;
  const guestLogo = match?.guestTeam?.logo?.[0]
    ? `${uploadsConfig}${match.guestTeam.logo[0]}`
    : null;

  const images = Array.isArray(match?.images) ? match.images : [];
  const videos = Array.isArray(match?.videos) ? match.videos : [];

  const isPenaltyType = (t) => t === 'PENALTY_SCORED' || t === 'PENALTY_MISSED';
  const isPenaltyShootoutEvent = (e) =>
    isPenaltyType(e.type) && (e.minute == null || e.minute === 0);

  const half1 = events.filter(
    (e) => (e.half || 1) === 1 && !isPenaltyShootoutEvent(e)
  );
  const half2 = events.filter(
    (e) => (e.half || 1) === 2 && !isPenaltyShootoutEvent(e)
  );
  const pens = events.filter(isPenaltyShootoutEvent);

  const iconByType = (t) => {
    switch (t) {
      case 'GOAL':
        return '/images/goal.svg';
      case 'ASSIST':
        return '/images/ev_assist.svg';
      case 'YELLOW_CARD':
        return '/images/yellow.svg';
      case 'RED_CARD':
        return '/images/red.svg';
      case 'SUBSTITUTION':
        return '/images/substitution.svg';
      case 'PENALTY_SCORED':
        return '/images/penalty.svg';
      case 'PENALTY_MISSED':
        return '/images/penalty-no.svg';
      default:
        return '/images/penalty-no.svg';
    }
  };

  const sideOf = (teamId) =>
    teamId === match?.homeTeamId
      ? 'home'
      : teamId === match?.guestTeamId
      ? 'guest'
      : 'home';

  const renderEventRow = (e) => {
    const side = sideOf(e.teamId);
    const icon = iconByType(e.type);
    const minute = e.minute != null ? `${e.minute}'` : '';
    const who = e?.player?.name || (e.playerId ? `Игрок #${e.playerId}` : '—');
    const assistText = e.assistPlayerId
      ? ` (ассист — ${e.assist_player?.name ?? `#${e.assistPlayerId}`})`
      : '';

    let text;
    if (e.type === 'GOAL') text = `${who}${assistText}`;
    else if (e.type === 'ASSIST') text = `${who} — результативная передача`;
    else if (e.type === 'YELLOW_CARD') text = `${who} — жёлтая карточка`;
    else if (e.type === 'RED_CARD') text = `${who} — красная карточка`;
    else if (e.type === 'SUBSTITUTION') text = `${who} — замена`;
    else if (e.type === 'PENALTY_SCORED') text = `${who} — пенальти (забил)`;
    else if (e.type === 'PENALTY_MISSED') text = `${who} — пенальти (не забил)`;
    else text = who;

    return (
      <div
        key={e.id}
        className={`${classes.eventRow} ${
          side === 'home' ? classes.left : classes.right
        }`}
      >
        {side === 'home' ? (
          <>
            <div className={classes.evText}>{text}</div>
            <img className={classes.evIcon} src={icon} alt={e.type} />
            <div className={classes.evMinute}>{minute}</div>
          </>
        ) : (
          <>
            <div className={classes.evMinute}>{minute}</div>
            <img className={classes.evIcon} src={icon} alt={e.type} />
            <div className={classes.evText}>{text}</div>
          </>
        )}
      </div>
    );
  };

  if (loading) return <div className={classes.pageWrap}>Загрузка…</div>;
  if (err) return <div className={classes.pageWrap}>{err}</div>;
  if (!match) return <div className={classes.pageWrap}>Матч не найден</div>;

  return (
    <div className={classes.container}>
      <div className={classes.pageWrap}>
        {/* HEADER */}
        <div className={classes.headerCard}>
          <img src="/images/aboutNart.png" alt="" className={classes.bg} />
          <div className={classes.headerInner}>
            <div className={classes.headerMeta}>
              <span>{fmtHeaderDate(match.date)}</span>
              <span className={classes.stadium}>
                <img src="/images/nartLocation.svg" alt="" />
                {match.stadium}
              </span>
            </div>

            <div className={classes.scoreRow}>
              <div className={classes.teamBox}>
                <img
                  src={homeImages}
                  alt={match?.homeTeam?.title}
                  className={classes.img}
                />
                <div className={classes.teamBoxBottom}>
                  {homeLogo ? (
                    <img src={homeLogo} alt={match?.homeTeam?.title} />
                  ) : (
                    <div className={classes.logoStub}>H</div>
                  )}
                  <div className={classes.teamName}>
                    {match?.homeTeam?.title}
                  </div>
                </div>
              </div>

              <div className={classes.scoreBox}>
                <div className={classes.score}>
                  {match.homeScore} : {match.guestScore}
                </div>
                {!!headerHalfScore && (
                  <div className={classes.halfScore}>{headerHalfScore}</div>
                )}
                <div className={classes.leagueRound}>
                  {match?.league?.title || ''} · {match.round} тур
                </div>
              </div>

              <div className={classes.teamBox}>
                <img
                  src={guestImages}
                  alt={match?.guestTeam?.title}
                  className={classes.img}
                />
                <div className={classes.teamBoxBottom}>
                  {guestLogo ? (
                    <img src={guestLogo} alt={match?.guestTeam?.title} />
                  ) : (
                    <div className={classes.logoStub}>G</div>
                  )}
                  <div className={classes.teamName}>
                    {match?.guestTeam?.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className={classes.tabs}>
          <button
            onClick={() => setTab(TAB.PROTOCOL)}
            className={tab === TAB.PROTOCOL ? 'active' : ''}
          >
            ПРОТОКОЛ
          </button>
          <button
            onClick={() => setTab(TAB.EVENTS)}
            className={tab === TAB.EVENTS ? 'active' : ''}
          >
            СОБЫТИЯ
          </button>
          <button
            onClick={() => setTab(TAB.PHOTO)}
            className={tab === TAB.PHOTO ? 'active' : ''}
          >
            ФОТО
          </button>
          <button
            onClick={() => setTab(TAB.VIDEO)}
            className={tab === TAB.VIDEO ? 'active' : ''}
          >
            ВИДЕО
          </button>
        </div>

        {/* CONTENT */}
        {tab === TAB.PROTOCOL && (
          <div className={classes.protocolCard}>
            <div className={classes.protocolHeader}>
              {/* <div className={classes.sideHeader}>
                {homeLogo ? (
                  <img src={homeLogo} alt="" />
                ) : (
                  <div className={classes.logoStub}>H</div>
                )}
                <span>{match?.homeTeam?.title}</span>
              </div> */}
              <div className={classes.protoTitle}>СТАРТОВЫЕ СОСТАВЫ</div>
              {/* <div className={classes.sideHeader}>
                {guestLogo ? (
                  <img src={guestLogo} alt="" />
                ) : (
                  <div className={classes.logoStub}>G</div>
                )}
                <span>{match?.guestTeam?.title}</span>
              </div> */}
            </div>

            <div className={classes.protocolGrid}>
              {/* Левая колонка */}
              <div className={classes.col}>
                <div className={classes.colHead}>
                  {homeLogo ? (
                    <img src={homeLogo} alt="" />
                  ) : (
                    <div className={classes.logoStub}>H</div>
                  )}
                  <span className={classes.colTitle}>
                    {match?.homeTeam?.title}
                  </span>
                </div>

                {homeSquad.length > 0 ? (
                  homeSquad.map((p) => (
                    <div key={p.id} className={classes.playerRow}>
                      <span className={classes.shirt}>{p.number ?? '-'}</span>
                      <span className={classes.pname}>{p.name}</span>
                      <span className={classes.ppos}>
                        {posRu[p.position] || p.position}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={classes.empty}>Нет данных по составу</div>
                )}
              </div>

              {/* Правая колонка — ТАК ЖЕ слева-направо */}
              <div className={classes.col}>
                <div className={classes.colHead}>
                  {guestLogo ? (
                    <img src={guestLogo} alt="" />
                  ) : (
                    <div className={classes.logoStub}>G</div>
                  )}
                  <span className={classes.colTitle}>
                    {match?.guestTeam?.title}
                  </span>
                </div>

                {guestSquad.length > 0 ? (
                  guestSquad.map((p) => (
                    <div key={p.id} className={classes.playerRow}>
                      <span className={classes.shirt}>{p.number ?? '-'}</span>
                      <span className={classes.pname}>{p.name}</span>
                      <span className={classes.ppos}>
                        {posRu[p.position] || p.position}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={classes.empty}>Нет данных по составу</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === TAB.EVENTS && (
          <div className={classes.eventsCard}>
            {!events.length ? (
              <div className={classes.empty}>Событий нет</div>
            ) : (
              <>
                {!!half1.length && (
                  <div className={classes.halfBlock}>
                    <div className={classes.halfTitle}>ПЕРВЫЙ ТАЙМ</div>
                    <div className={classes.timeline}>
                      {half1.map(renderEventRow)}
                    </div>
                  </div>
                )}

                {!!half2.length && (
                  <div className={classes.halfBlock}>
                    <div className={classes.halfTitle}>ВТОРОЙ ТАЙМ</div>
                    <div className={classes.timeline}>
                      {half2.map(renderEventRow)}
                    </div>
                  </div>
                )}

                {!!pens.length && (
                  <div className={classes.halfBlock}>
                    <div className={classes.halfTitle}>ПЕНАЛЬТИ</div>
                    <div className={classes.timeline}>
                      {pens.map((e) => {
                        const side = sideOf(e.teamId);
                        const icon = iconByType(e.type);
                        const who =
                          e?.player?.name ||
                          (e.playerId ? `Игрок #${e.playerId}` : '—');
                        const text =
                          e.type === 'PENALTY_SCORED'
                            ? `${who} — пенальти (забил)`
                            : `${who} — пенальти (не забил)`;
                        return (
                          <div
                            key={`pen-${e.id}`}
                            className={`${classes.eventRow} ${classes.penRow} ${
                              side === 'home' ? classes.left : classes.right
                            }`}
                          >
                            {side === 'home' ? (
                              <>
                                <div className={classes.evText}>{text}</div>
                                <img
                                  className={classes.evIcon}
                                  src={icon}
                                  alt={e.type}
                                />
                                <div className={classes.evMinute}></div>
                              </>
                            ) : (
                              <>
                                <div className={classes.evMinute}></div>
                                <img
                                  className={classes.evIcon}
                                  src={icon}
                                  alt={e.type}
                                />
                                <div className={classes.evText}>{text}</div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === TAB.PHOTO && (
          <div className={classes.photosCard}>
            {images.length === 0 ? (
              <div className={classes.empty}>Фотографий нет</div>
            ) : (
              <div className={classes.photosGrid}>
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={`${uploadsConfig}${src}`}
                    alt={`Фото #${i + 1}`}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === TAB.VIDEO && (
          <div className={classes.videosCard}>
            {videos.length === 0 ? (
              <div className={classes.empty}>Видео нет</div>
            ) : (
              <div className={classes.videosList}>
                {videos.map((v, i) => {
                  const id = ytId(v);
                  if (id) {
                    return (
                      <div key={i} className={classes.videoBox}>
                        <iframe
                          src={`https://www.youtube.com/embed/${id}`}
                          title={`video-${i}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  const src = v.startsWith('http') ? v : `${uploadsConfig}${v}`;
                  return (
                    <div key={i} className={classes.videoBox}>
                      <video src={src} controls />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

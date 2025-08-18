import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import classes from './ClubPage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ClubPage() {
  const [team, setTeam] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const navigate = useNavigate();
  const { hash, search } = useLocation();
  const teamBlockRef = useRef(null);

  // --- календарь ---
  const [matches, setMatches] = useState([]);
  const [type, setType] = useState('FINISHED');
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [perPage, setPerPage] = useState(window.innerWidth <= 768 ? 1 : 3);
  const sliderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // --- состав ---
  const [players, setPlayers] = useState([]);
  const [tab, setTab] = useState('ALL'); // ALL | GOALKEEPER | DEFENDER | MIDFIELDER | FORWARD | STAFF

  const PLAYER_POS = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];
  const STAFF_POS = [
    'HEAD_COACH',
    'ASSISTANT_COACH',
    'GOALKEEPER_COACH',
    'FITNESS_COACH',
    'ANALYST',
    'PHYSIOTHERAPIST',
    'DOCTOR',
    'TEAM_MANAGER',
    'MASSEUR',
    'KIT_MANAGER',
  ];

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
  const posToRu = (p) => posRu[p] || p || '—';
  const norm = (s) => (s ?? '').toString().trim().toLocaleLowerCase('ru-RU');

  // обработка переходов #players / #staff
  useEffect(() => {
    const params = new URLSearchParams(search);
    const qtab = (params.get('tab') || '').toLowerCase();

    let target = null;
    if (hash === '#staff' || qtab === 'staff') target = 'STAFF';
    if (
      hash === '#players' ||
      qtab === 'players' ||
      qtab === 'all' ||
      qtab === 'sostav'
    )
      target = 'ALL';

    if (target) {
      setTab(target);
      requestAnimationFrame(() => {
        teamBlockRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [hash, search]);

  // загрузка команды
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const teamsRes = await axios.get(`${serverConfig}/teams`);
        const rows = Array.isArray(teamsRes.data) ? teamsRes.data : [];
        const exact = rows.find((t) => norm(t.title) === 'нарт');
        const byIncludes =
          exact || rows.find((t) => norm(t.title).includes('нарт'));
        if (!byIncludes) {
          if (alive) setErr('Команда «Нарт» не найдена');
        }
        if (alive) setTeam(byIncludes || null);

        const stRes = await axios.get(`${serverConfig}/leagueStandings`);
        if (alive) setStandings(Array.isArray(stRes.data) ? stRes.data : []);
      } catch {
        if (alive) setErr('Не удалось загрузить данные клуба');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // загрузка матчей
  useEffect(() => {
    axios
      .get(`${serverConfig}/matches`)
      .then((res) => setMatches(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Ошибка загрузки матчей:', err));
  }, []);

  // загрузка игроков
  useEffect(() => {
    if (!team) return;
    let alive = true;
    (async () => {
      try {
        let res;
        try {
          res = await axios.get(`${serverConfig}/players`, {
            params: { filter: JSON.stringify({ teamId: team.id }) },
          });
          if (!Array.isArray(res.data)) throw new Error('fallback');
        } catch {
          res = await axios.get(`${serverConfig}/players`);
        }
        const rows = Array.isArray(res.data) ? res.data : [];
        const onlyTeam = rows.filter((p) => p.teamId === team.id);
        if (alive) setPlayers(onlyTeam);
      } catch (e) {
        console.error('Ошибка загрузки игроков:', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [team]);

  // perPage по ширине
  useEffect(() => {
    const handleResize = () => setPerPage(window.innerWidth <= 768 ? 1 : 3);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aggregated = useMemo(() => {
    if (!team)
      return { games: 0, wins: 0, goals: 0, tournaments: 0, source: 'none' };
    const byTeam = standings.filter((row) => row.team_id === team.id);
    if (byTeam.length > 0) {
      const games = byTeam.reduce((sum, r) => sum + (r.played ?? 0), 0);
      const wins = byTeam.reduce((sum, r) => sum + (r.wins ?? 0), 0);
      const goals = byTeam.reduce((sum, r) => sum + (r.goals_for ?? 0), 0);
      const tournaments = new Set(byTeam.map((r) => r.league_id)).size;
      return { games, wins, goals, tournaments, source: 'standings' };
    }
    return {
      games: Number.isFinite(team.games) ? team.games : 0,
      wins: Number.isFinite(team.wins) ? team.wins : 0,
      goals: Number.isFinite(team.goals) ? team.goals : 0,
      tournaments: Number.isFinite(team.tournaments) ? team.tournaments : 0,
      source: 'team',
    };
  }, [team, standings]);

  const filtered = useMemo(() => {
    const now = new Date();
    const list = matches.filter((m) =>
      type === 'FINISHED' ? new Date(m.date) < now : new Date(m.date) >= now
    );
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [matches, type]);

  const slides = useMemo(() => {
    if (filtered.length === 0) return [];
    return [
      ...filtered.slice(-perPage),
      ...filtered,
      ...filtered.slice(0, perPage),
    ];
  }, [filtered, perPage]);

  const total = filtered.length;
  const startIndex = perPage;

  useEffect(() => {
    setIndex(startIndex);
  }, [filtered, type, perPage]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsAnimating(false);
    if (!sliderRef.current) return;
    if (index >= total + perPage) {
      setIndex(startIndex);
      sliderRef.current.style.transition = 'none';
      requestAnimationFrame(() => {
        sliderRef.current.style.transform = `translateX(-${
          startIndex * (100 / perPage)
        }%)`;
      });
    }
    if (index <= 0) {
      setIndex(total);
      sliderRef.current.style.transition = 'none';
      requestAnimationFrame(() => {
        sliderRef.current.style.transform = `translateX(-${
          total * (100 / perPage)
        }%)`;
      });
    }
  };

  useEffect(() => {
    if (!sliderRef.current) return;
    sliderRef.current.style.transition = isAnimating
      ? 'transform 0.5s ease-in-out'
      : 'none';
    sliderRef.current.style.transform = `translateX(-${
      index * (100 / perPage)
    }%)`;
  }, [index, perPage, isAnimating]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) handleNext();
      else handlePrev();
    }
  };

  const activeIndex = total > 0 ? (index - perPage + total) % total : 0;

  const filteredPlayers = useMemo(() => {
    const roster = players || [];
    const onlyPlayers = roster.filter((p) => PLAYER_POS.includes(p.position));
    const onlyStaff = roster.filter((p) => STAFF_POS.includes(p.position));

    switch (tab) {
      case 'GOALKEEPER':
      case 'DEFENDER':
      case 'MIDFIELDER':
      case 'FORWARD':
        return onlyPlayers.filter((p) => p.position === tab);
      case 'STAFF':
        return onlyStaff;
      case 'ALL':
      default:
        return onlyPlayers;
    }
  }, [players, tab]);

  if (loading) return <div style={{ padding: 16 }}>Загрузка…</div>;
  if ((err && !team) || !team)
    return <div style={{ padding: 16 }}>{err || 'Команда не найдена'}</div>;

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        {/* верхний блок клуба */}
        <div className={classes.containerBlockTop}>
          <div className={classes.containerBlockTopLeft}>
            {Array.isArray(team.images) && team.images[0] && (
              <img
                src={`${uploadsConfig}${team.images[0]}`}
                alt={team.title}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          <div className={classes.containerBlockTopRight}>
            <img
              src="../images/aboutNart.png"
              className={classes.bg}
              style={{ transform: 'scaleX(-1)' }}
              alt=""
            />
            <div className={classes.containerBlockTopRight1}>
              <div className={classes.containerBlockTopRightTop}>
                {Array.isArray(team.logo) && team.logo[0] && (
                  <img
                    src={`${uploadsConfig}${team.logo[0]}`}
                    alt={team.title}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <div className={classes.containerBlockTopRightTopTitle}>
                  <span>ФУТБОЛЬНЫЙ КЛУБ</span>
                  <span>«{team.title}»</span>
                </div>
              </div>

              <div className={classes.containerBlockTopRightBottom}>
                <div className={classes.containerBlockTopRightBottomEl}>
                  <span>Игры</span>
                  <span>{team.games}</span>
                </div>
                <div className={classes.containerBlockTopRightBottomEl}>
                  <span>Победы</span>
                  <span>{team.wins}</span>
                </div>
                <div className={classes.containerBlockTopRightBottomEl}>
                  <span>Голы</span>
                  <span>{team.goals}</span>
                </div>
                <div className={classes.containerBlockTopRightBottomEl}>
                  <span>Турниры</span>
                  <span>{team.tournaments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== КАЛЕНДАРЬ ===== */}
        {/* ... календарь без изменений ... */}

        {/* ===== СОСТАВ ===== */}
        <div className={classes.containerTeam} ref={teamBlockRef} id="players">
          <div className={classes.containerTeamTitle}>ОСНОВНОЙ СОСТАВ</div>

          <div className={classes.containerTeamFilter}>
            <button
              onClick={() => setTab('ALL')}
              className={tab === 'ALL' ? classes.tabActive : ''}
            >
              ИГРОКИ
            </button>
            <button
              onClick={() => setTab('DEFENDER')}
              className={tab === 'DEFENDER' ? classes.tabActive : ''}
            >
              ЗАЩИТНИКИ
            </button>
            <button
              onClick={() => setTab('MIDFIELDER')}
              className={tab === 'MIDFIELDER' ? classes.tabActive : ''}
            >
              ПОЛУЗАЩИТНИКИ
            </button>
            <button
              onClick={() => setTab('GOALKEEPER')}
              className={tab === 'GOALKEEPER' ? classes.tabActive : ''}
            >
              ВРАТАРИ
            </button>
            <button
              onClick={() => setTab('FORWARD')}
              className={tab === 'FORWARD' ? classes.tabActive : ''}
            >
              НАПАДАЮЩИЕ
            </button>
            <button
              onClick={() => setTab('STAFF')}
              className={tab === 'STAFF' ? classes.tabActive : ''}
            >
              ТРЕНЕРСКИЙ ШТАБ
            </button>
          </div>

          <div className={classes.containerTeamComand}>
            {filteredPlayers.map((p) => {
              const img =
                Array.isArray(p.images) && p.images[0]
                  ? `${uploadsConfig}${p.images[0]}`
                  : null;
              return (
                <div
                  key={p.id}
                  className={classes.playerCard}
                  onClick={() => navigate(`/club/${p.id}`)}
                >
                  <div className={classes.playerThumb}>
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"
                        onError={(e) =>
                          (e.currentTarget.style.visibility = 'hidden')
                        }
                      />
                    ) : (
                      <div className={classes.noPhoto}>
                        {p.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className={classes.playerInfo}>
                    <div className={classes.playerTop}>
                      <div className={classes.playerPos}>
                        <span>{posToRu(p.position)}</span>
                        <span> {p.number}</span>
                      </div>
                      <span className={classes.playerName}>{p.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredPlayers.length === 0 && (
              <div className={classes.emptyList}>
                Нет записей для этой категории
              </div>
            )}
          </div>
        </div>
        {/* ===== /СОСТАВ ===== */}
      </div>
    </div>
  );
}

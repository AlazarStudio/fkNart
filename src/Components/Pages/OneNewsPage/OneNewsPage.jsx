import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import classes from './OneNewsPage.module.css';

// --- helpers: извлекаем youtube id и нормализуем ссылку ---
const toUrl = (v) => (typeof v === 'string' ? v : v?.src || v?.url || '');

const getYoutubeId = (url = '') => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1);
    if (host.includes('youtube.com')) {
      const vParam = u.searchParams.get('v');
      if (vParam) return vParam;
      const parts = u.pathname.split('/').filter(Boolean);
      const i = parts.findIndex((p) => p === 'embed' || p === 'shorts');
      if (i >= 0) return parts[i + 1] || null;
    }
    return null;
  } catch {
    return null;
  }
};

export default function OneNewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [randomNews, setRandomNews] = useState([]);

  // загрузка данных
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${serverConfig}/news/${id}`);
        setNews(response.data);
      } catch (err) {
        setError('Ошибка при загрузке новости');
      } finally {
        setLoading(false);
      }
    };

    const fetchLeaguesAndStandings = async () => {
      try {
        const [leaguesRes, standingsRes] = await Promise.all([
          axios.get(`${serverConfig}/leagues`),
          axios.get(`${serverConfig}/leagueStandings`),
        ]);
        setLeagues(leaguesRes.data || []);
        setStandings(standingsRes.data || []);
        if ((leaguesRes.data || []).length > 0) {
          setSelectedLeague(leaguesRes.data[0].id);
        }
      } catch (err) {
        console.error('Ошибка загрузки лиг/таблиц:', err);
      }
    };

    const fetchRandomNews = async () => {
      try {
        const response = await axios.get(`${serverConfig}/news`, {
          params: { _start: 0, _end: 10 },
        });
        const rows = Array.isArray(response.data) ? response.data : [];
        const shuffled = rows.sort(() => 0.5 - Math.random());
        setRandomNews(shuffled.slice(0, 3));
      } catch (err) {
        console.error('Ошибка при загрузке случайных новостей:', err);
      }
    };

    fetchNews();
    fetchLeaguesAndStandings();
    fetchRandomNews();
  }, [id]);

  const filteredStandings = standings
    .filter((row) => !selectedLeague || row.league_id === selectedLeague)
    .sort((a, b) => b.points - a.points || b.goals_for - a.goals_for);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  // массив видео (может быть строками или объектами {src})
  const videos = Array.isArray(news?.videos) ? news.videos : [];

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.newsDetails}>
          {news ? (
            <>
              <p className={classes.oneNewsDate}>
                {news?.date
                  ? new Date(news.date).toLocaleDateString('ru-RU')
                  : ''}
              </p>
              <h1 className={classes.oneNewsTitle}>{news.title}</h1>

              {news?.images?.[0] && (
                <img
                  src={`${uploadsConfig}${news.images[0]}`}
                  alt={news.title || 'Новость'}
                  className={classes.newsImage}
                />
              )}

              <div
                className={classes.oneNewsDescription}
                dangerouslySetInnerHTML={{ __html: news.description || '' }}
              />

              {/* ==== ВИДЕО (только если есть) ==== */}
              {videos.length > 0 && (
                <div className={classes.newsVideos}>
                  <h2 className={classes.title}>ВИДЕО</h2>
                  <div className={classes.videosList}>
                    {videos.map((raw, i) => {
                      const v = toUrl(raw);
                      if (!v) return null;

                      const yt = getYoutubeId(v);
                      if (yt) {
                        return (
                          <div key={i} className={classes.videoBox}>
                            <div className={classes.ratio16x9}>
                              <iframe
                                src={`https://www.youtube.com/embed/${yt}`}
                                title={`video-${i}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        );
                      }

                      const src = v?.startsWith?.('http')
                        ? v
                        : `${uploadsConfig}${v}`;
                      return (
                        <div key={i} className={classes.videoBox}>
                          <video src={src} controls preload="metadata" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* ==== /ВИДЕО ==== */}
            </>
          ) : (
            <div>Новость не найдена</div>
          )}
        </div>

        {/* Правый блок — турнирная таблица */}
        <div className={classes.containerBlockRight}>
          <div className={classes.containerBlockRightTop}>
            <div className={classes.standingsHeader}>
              <span className={classes.containerBlockRightTopTitle}>
                ТУРНИРНАЯ ТАБЛИЦА
              </span>
            </div>

            {leagues.length > 0 && (
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(Number(e.target.value))}
                className={classes.leagueSelect}
              >
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.title}
                  </option>
                ))}
              </select>
            )}

            <div className={classes.standingsTable}>
              <div className={classes.headerRow}>
                <span>№</span>
                <span>Команда</span>
                <span>И</span>
                <span>О</span>
              </div>

              {filteredStandings.map((row, idx) => (
                <div key={row.id} className={classes.standingRow}>
                  <span>{idx + 1}</span>
                  <span className={classes.teamName}>
                    {row?.team?.logo?.[0] && (
                      <img
                        src={`${uploadsConfig}${row.team.logo[0]}`}
                        alt={row.team.title}
                      />
                    )}
                    {row?.team?.title}
                  </span>
                  <span>{row.played}</span>
                  <span className={classes.points}>{row.points}</span>
                </div>
              ))}
              <button onClick={() => navigate('/tournamentTable')}>
                ПОСМОТРЕТЬ ВСЮ ТАБЛИЦУ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Похожие новости */}
      <div className={classes.newsBlock}>
        <span className={classes.title}>ПОХОЖИЕ НОВОСТИ</span>

        <div className={classes.newsList}>
          {randomNews.map((item) => (
            <div key={item.id} className={classes.newsCard}>
              {item?.images?.[0] && (
                <img
                  src={`${uploadsConfig}${item.images[0]}`}
                  alt={item.title || 'Новость'}
                  className={classes.randomNewsImage}
                  loading="lazy"
                />
              )}
              <div className={classes.newsContent}>
                <h3 className={classes.newsTitle}>{item?.title}</h3>
                {item?.description && (
                  <p className={classes.newsDesc}>{item.description}</p>
                )}
                <span className={classes.date}>
                  {item?.date
                    ? new Date(item.date).toLocaleDateString('ru-RU')
                    : ''}
                  <img
                    src="../images/nartNewsArr.svg"
                    onClick={() => navigate(`/news/${item.id}`)}
                    alt=""
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

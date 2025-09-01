import React, { useEffect, useState } from 'react';
import classes from './Container2.module.css';
import axios from 'axios';
import serverConfig from '../../../../serverConfig';
import { useNavigate } from 'react-router-dom';
import uploadsConfig from '../../../../uploadsConfig';

export default function Container2() {
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, standingsRes, leaguesRes, matchesRes] =
          await Promise.all([
            axios.get(`${serverConfig}/news`),
            axios.get(`${serverConfig}/leagueStandings`),
            axios.get(`${serverConfig}/leagues`),
            axios.get(`${serverConfig}/matches`),
          ]);

        const sortedNews = [...newsRes.data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setNews(sortedNews.slice(0, 6));
        setStandings(standingsRes.data);
        setLeagues(leaguesRes.data);
        setMatches(matchesRes.data);
        if (leaguesRes.data.length > 0) {
          setSelectedLeague(leaguesRes.data[0].id); // ✅ первая лига по умолчанию
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };

    fetchData();
  }, []);

  const finishedMatches = matches
    .filter(
      (m) =>
        m.status === 'FINISHED' &&
        m.league?.id === selectedLeague &&
        m.homeTeam &&
        m.guestTeam
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredStandings = standings
    .filter((row) => !selectedLeague || row.league_id === selectedLeague)
    .sort((a, b) => b.points - a.points || b.goals_for - a.goals_for);

  return (
    <div className={classes.container}>
      <div className={classes.containerImg}>
        <a href="https://leon.ru">
          <img src="../images/topNart.png" />
        </a>
      </div>
      <div className={classes.containerBlock}>
        <div className={classes.containerBlockLeft}>
          <span className={classes.containerBlockLeftTitle}>
            НОВОСТИ{' '}
            <button onClick={() => navigate('/news')}>Все новости</button>
          </span>
          <div className={classes.containerBlockLeftNews}>
            {news.map((news) => (
              <div
                key={news.id}
                className={classes.containerBlockLeftNewsCard}
                onClick={() => navigate(`/news/${news.id}`)}
              >
                <img src={`${uploadsConfig}${news.images[0]}`} alt="home" />
                <div className={classes.containerBlockLeftNewsCardBottom}>
                  <span>{news.title}</span>
                  <span>{news.description}</span>
                  <div className={classes.containerBlockLeftNewsCardBottomDate}>
                    <span>
                      {new Date(news.date).toLocaleDateString('ru-RU')}
                    </span>
                    <span onClick={() => navigate(`/news/${news.id}`)}>
                      <img src="../images/nartNewsArr.svg" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                    <img
                      src={`${uploadsConfig}${row.team.logo[0]}`}
                      alt="guest"
                    />
                    {row.team.title}
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

          <div className={classes.containerBlockRightBottom}>
            <span className={classes.containerBlockRightBottomTitle}>
              РЕЗУЛЬТАТЫ
            </span>

            <div className={classes.resultsTable}>
              {finishedMatches.slice(0, 6).map((match) => {
                const date = new Date(match.date);
                const formattedDate = date.toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                });
                const formattedTime = date.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={match.id} className={classes.resultsRow}>
                    <span className={classes.date}>
                      <div>{formattedDate}</div>
                    </span>
                    <span>{match.homeTeam.title}</span>
                    <span>
                      {match.homeScore} : {match.guestScore}
                    </span>
                    <span>{match.guestTeam.title}</span>
                  </div>
                );
              })}
              <button onClick={() => navigate('/calendar')}>
                ВСЕ РЕЗУЛЬТАТЫ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

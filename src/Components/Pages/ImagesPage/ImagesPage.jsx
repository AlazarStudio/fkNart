import React, { useEffect, useState } from 'react';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import { useNavigate } from 'react-router-dom';
import classes from './ImagesPage.module.css';

export default function ImagesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1); // Текущая страница
  const [matchesPerPage] = useState(12); // Количество матчей на странице

  const navigate = useNavigate();

  // Загружаем матчи с сервера
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${serverConfig}/matches`);
        const finishedMatches = res.data.filter(
          (match) =>
            match.status === 'FINISHED' &&
            Array.isArray(match.images) &&
            match.images.length > 0
        );
        setMatches(finishedMatches);
      } catch (err) {
        setError('Ошибка при загрузке матчей');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  // Логика пагинации
  const indexOfLastMatch = currentPage * matchesPerPage; // Индекс последнего матча на текущей странице
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage; // Индекс первого матча на текущей странице
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch); // Массив матчей на текущей странице

  const totalPages = Math.ceil(matches.length / matchesPerPage); // Общее количество страниц

  // Обработчик клика на номер страницы
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.containerBlockTitle}>
          <span>ФОТО</span>
        </div>

        <div className={classes.containerBlockEl}>
          {currentMatches.map((match) => {
            const date = new Date(match.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return (
              <div
                key={match.id}
                className={classes.matchCard}
                onClick={() => navigate(`/matches/${match.id}`)}
              >
                {match.images?.[0] && (
                  <img
                    src={`${uploadsConfig}${match.images[0]}`}
                    alt="Матч"
                    className={classes.matchImg}
                  />
                )}
                <div className={classes.matchInfo}>
                  <div className={classes.matchInfoLeft}>
                    <div className={classes.matchInfoLeftData}>
                      <div className={classes.matchInfoLeftDataTop}>
                        <span>
                          {match.homeTeam?.title} - {match.guestTeam?.title}
                        </span>
                        {' — '}
                        <span>
                          {match.homeScore} : {match.guestScore}
                        </span>
                      </div>
                      <div className={classes.matchInfoLeftDataBottom}>
                        <span>{formattedDate}</span>
                        <div className={classes.matchInfoRight}>
                          <span>{match.images.length} ФОТО</span>
                          <span onClick={() => navigate(`/images/${match.id}`)}>
                            <img src="../images/Arrow 1.png" alt="arrow" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Пагинация только с цифрами */}
        <div className={classes.pagination}>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageClick(index + 1)}
              className={`${classes.pageButton} ${
                currentPage === index + 1 ? classes.active : ''
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

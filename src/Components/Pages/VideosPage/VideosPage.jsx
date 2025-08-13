import React, { useEffect, useState } from 'react';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import { useNavigate } from 'react-router-dom';
import classes from './VideosPage.module.css';

export default function VideosPage() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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
            Array.isArray(match.videos) && // фильтруем по наличию видео
            match.videos.length > 0
        );
        setMatches(finishedMatches);
      } catch (err) {
        console.error('Ошибка загрузки матчей:', err);
      }
    };

    fetchMatches();
  }, []);

  // Логика пагинации
  const indexOfLastMatch = currentPage * matchesPerPage; // Индекс последнего матча на текущей странице
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage; // Индекс первого матча на текущей странице
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch); // Массив матчей на текущей странице

  const totalPages = Math.ceil(matches.length / matchesPerPage); // Общее количество страниц

  // Обработчик клика на номер страницы
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Открытие видео
  const handlePlayVideo = (match) => {
    setSelectedMatch(match);
    setIsVideoOpen(true);
  };

  // Закрытие модального окна
  const closeVideo = () => {
    setSelectedMatch(null);
    setIsVideoOpen(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        {/* Видео */}
        <div className={classes.containerBlockTitle}>
          <span>ВИДЕО</span>
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
              <div key={match.id} className={classes.matchCard}>
                {match.images?.[0] && (
                  <img
                    src={`${uploadsConfig}${match.images[0]}`}
                    alt="Матч"
                    className={classes.matchImg}
                  />
                )}
                <div className={classes.matchInfo}>
                  <div className={classes.matchInfoLeft}>
                    <span
                      className={classes.svg}
                      onClick={() => handlePlayVideo(match)} // Открыть видео при клике
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src="../images/nartPlayer.svg"
                        alt="player"
                        className={classes.icon}
                      />
                    </span>

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

        {/* Модальное окно с видео */}
        {isVideoOpen && selectedMatch?.videos?.[0] && (
          <div className={classes.videoModal} onClick={closeVideo}>
            <div
              className={classes.videoContent}
              onClick={(e) => e.stopPropagation()}
            >
              <video controls autoPlay>
                <source
                  src={`${uploadsConfig}${selectedMatch.videos[0]}`}
                  type="video/mp4"
                />
                Ваш браузер не поддерживает видео.
              </video>
              <button onClick={closeVideo}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import classes from './Container3.module.css';
import axios from 'axios';
import serverConfig from '../../../../serverConfig';
import uploadsConfig from '../../../../uploadsConfig';
import { useNavigate } from 'react-router-dom';

export default function Container3() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${serverConfig}/matches`);
        const finished = res.data
          .filter(
            (match) =>
              match.status === 'FINISHED' &&
              Array.isArray(match.images) &&
              match.images.length > 0
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 2);

        setMatches(finished);
      } catch (err) {
        console.error('Ошибка загрузки матчей:', err);
      }
    };

    fetchMatches();
  }, []);

  const handlePlayVideo = (match) => {
    setSelectedMatch(match);
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setSelectedMatch(null);
    setIsVideoOpen(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        {/* Фото */}
        <div className={classes.containerBlockTitle}>
          <span>ФОТО</span>
          <span onClick={() => navigate('/images')}>Все фото</span>
        </div>

        <div className={classes.containerBlockEl}>
          {matches.map((match) => {
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
                    <span className={classes.svg}>
                      <img src="../images/nartFoto.svg" alt="icon" />
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

        {/* Видео */}
        <div className={classes.containerBlockTitle}>
          <span>ВИДЕО</span>
          <span onClick={() => navigate('/videos')}>Все видео</span>
        </div>

        <div className={classes.containerBlockEl}>
          {matches.map((match) => {
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
                      onClick={() => handlePlayVideo(match)}
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

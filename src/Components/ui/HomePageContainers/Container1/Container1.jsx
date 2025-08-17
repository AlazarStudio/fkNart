import React, { useEffect, useState, useMemo, useRef } from 'react';
import classes from './Container1.module.css';
import axios from 'axios';
import serverConfig from '../../../../serverConfig';
import uploadsConfig from '../../../../uploadsConfig';
import { useNavigate } from 'react-router-dom';

export default function Container1() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [type, setType] = useState('FINISHED');
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [perPage, setPerPage] = useState(window.innerWidth <= 768 ? 1 : 3);
  const sliderRef = useRef(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setPerPage(window.innerWidth <= 768 ? 1 : 3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    axios
      .get(`${serverConfig}/matches`)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error('Ошибка загрузки матчей:', err));
  }, []);

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
  }, [index, perPage]);

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

  // ✅ индекс активной карточки
  const activeIndex = total > 0 ? (index - perPage + total) % total : 0;
  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.containerBlockTitle}>
          <span className={classes.title}>ФУТБОЛЬНЫЙ КЛУБ «НАРТ»</span>
          <div className={classes.containerBlockTopRight}>
            <span>
              <img src={'../images/nartBlackTg.svg'} />
            </span>
            <span>
              <img src={'../images/nartBlackVk.svg'} />
            </span>
            <span>
              <img src={'../images/nartBlackWa.svg'} />
            </span>
          </div>
        </div>
        <div className={classes.containerBlockLeft}>
          <span>
            <img src="../images/nartCal.svg" alt="calendar" />
            КАЛЕНДАРЬ
          </span>
          <div className={classes.containerBlockLeftButtons}>
            <button
              onClick={() => setType('FINISHED')}
              className={type === 'FINISHED' ? classes.activeTab : ''}
            >
              ПРОШЕДШИЕ
            </button>
            <button
              onClick={() => setType('SCHEDULED')}
              className={type === 'SCHEDULED' ? classes.activeTab : ''}
            >
              БУДУЩИЕ
            </button>
          </div>
          <div className={classes.containerBlockLeftButtonsControl}>
            <span onClick={handlePrev}>
              <img src="../images/nartLeft.svg" alt="prev" />
            </span>
            <span onClick={handleNext}>
              <img src="../images/nartRight.svg" alt="next" />
            </span>
          </div>
        </div>

        <div
          className={classes.containerBlockRight}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={classes.slider}
            ref={sliderRef}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((match, i) => {
              const date = new Date(match.date);
              const dayMonth = new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: 'long',
              }).format(date);
              const weekday = new Intl.DateTimeFormat('ru-RU', {
                weekday: 'short',
              })
                .format(date)
                .replace('.', '');
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const formatted = `${dayMonth} ${hours}:${minutes} ${weekday}`;

              return (
                <div
                  key={`${match.id}-${i}`}
                  className={classes.matchCard}
                  onClick={() => navigate(`/match/${match.id}`)}
                >
                  <div className={classes.matchDate}>{formatted}</div>
                  <div className={classes.matchStadium}>
                    <img src="../images/nartLocation.svg" alt="loc" />
                    {match.stadium}
                  </div>
                  <div className={classes.matchScore}>
                    <img
                      src={`${uploadsConfig}${match.homeTeam.logo[0]}`}
                      alt="home"
                    />
                    <span>
                      {match.homeScore} : {match.guestScore}
                    </span>
                    <img
                      src={`${uploadsConfig}${match.guestTeam.logo[0]}`}
                      alt="guest"
                    />
                  </div>
                  <div className={classes.matchLeague}>
                    {match.league.title}
                  </div>
                  <div className={classes.matchRound}>{match.round} ТУР</div>
                </div>
              );
            })}
          </div>
          {perPage === 1 && total > 1 && (
            <div className={classes.dots}>
              {filtered.map((_, i) => (
                <span
                  key={i}
                  className={`${classes.dot} ${
                    i === activeIndex ? classes.activeDot : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

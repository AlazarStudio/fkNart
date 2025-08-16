import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import classes from './OneImagesPage.module.css';

export default function OneImagesPage() {
  const { id } = useParams(); // /images/:id
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const imagesPerPage = 24;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    axios
      .get(`${serverConfig}/matches/${id}`)
      .then((res) => {
        if (!alive) return;
        setMatch(res.data);
        setCurrentPage(1); // сброс страницы при смене матча
      })
      .catch(() => alive && setErr('Ошибка при загрузке матча'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  // ХУКИ ДОЛЖНЫ ВЫЗЫВАТЬСЯ ВСЕГДА — поэтoму useMemo выше любых return
  const images = useMemo(() => {
    const arr = Array.isArray(match?.images) ? match.images : [];
    return arr.filter(Boolean);
  }, [match]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(images.length / imagesPerPage)),
    [images.length]
  );

  const currentImages = useMemo(() => {
    const start = (currentPage - 1) * imagesPerPage;
    return images.slice(start, start + imagesPerPage);
  }, [images, currentPage]);

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (loading) return <div style={{ padding: 16 }}>Загрузка…</div>;
  if (err) return <div style={{ padding: 16 }}>{err}</div>;
  if (!match) return <div style={{ padding: 16 }}>Матч не найден</div>;
  if (images.length === 0)
    return <div style={{ padding: 16 }}>Нет фотографий</div>;

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        {currentImages.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={`${uploadsConfig}${src}`}
            alt={`Фото ${i + 1 + (currentPage - 1) * imagesPerPage}`}
            className={classes.photo}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={classes.pagination}>
          {Array.from({ length: totalPages }, (_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`${classes.pageButton} ${
                  currentPage === page ? classes.active : ''
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

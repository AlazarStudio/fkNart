import React, { useEffect, useMemo, useState } from 'react';
import classes from './NewsPage.module.css';
import axios from 'axios';
import serverConfig from '../../../serverConfig';
import uploadsConfig from '../../../uploadsConfig';
import { useNavigate } from 'react-router-dom';

export default function NewsPage() {
  const navigate = useNavigate();

  // data
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);

  // ui state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('new'); // 'new' | 'old'

  // pagination — фиксированно 12
  const perPage = 9;
  const [page, setPage] = useState(1); // 1-based

  // --- дебаунс поиска
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // --- загрузка
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setLoadError(null);

      const start = (page - 1) * perPage;
      const end = start + perPage - 1;

      const params = {
        range: JSON.stringify([start, end]),
        sort: JSON.stringify(['date', sortOrder === 'new' ? 'desc' : 'asc']),
        filter: JSON.stringify(debouncedSearch ? { q: debouncedSearch } : {}),
      };

      try {
        const res = await axios.get(`${serverConfig}/news`, { params });
        const data = Array.isArray(res.data) ? res.data : [];
        setNews(data);

        const cr = res.headers['content-range'] || res.headers['Content-Range'];
        if (cr) {
          const totalStr = cr.split('/')[1];
          const parsed = parseInt(totalStr, 10);
          setTotal(Number.isFinite(parsed) ? parsed : data.length);
        } else if (typeof res.data?.total === 'number') {
          setTotal(res.data.total);
        } else {
          setTotal(data.length);
        }
      } catch (err) {
        console.error('Ошибка загрузки новостей:', err);
        setLoadError('Не удалось загрузить новости');
        setNews([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [page, sortOrder, debouncedSearch]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / perPage)),
    [total]
  );

  // --- массив страниц с "…"
  const pageList = useMemo(() => {
    const pages = [];
    const add = (p) => pages.push(p);
    const DOTS = '...';
    const siblingCount = 1;

    const left = Math.max(2, page - siblingCount);
    const right = Math.min(totalPages - 1, page + siblingCount);

    add(1);

    if (left > 2) add(DOTS);

    for (let p = left; p <= right; p++) add(p);

    if (right < totalPages - 1) add(DOTS);

    if (totalPages > 1) add(totalPages);

    return pages.filter((v, i, arr) => i === 0 || v !== arr[i - 1]);
  }, [page, totalPages]);

  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.containerBlockTitle}>
          <span>НОВОСТИ</span>
        </div>

        {/* Фильтры */}
        <div className={classes.containerBlockFilter}>
          <span className={classes.total}>Найдено: {total}</span>
          <div className={classes.inputBlock}>
            <input
              placeholder="Поиск"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={classes.containerBlockFilterNew}>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                className={classes.sortSelect}
              >
                <option value="new">Сначала новые</option>
                <option value="old">Сначала старые</option>
              </select>
            </div>
          </div>
        </div>

        {/* Состояния */}
        {loading && <div className={classes.loading}>Загрузка…</div>}
        {!loading && loadError && (
          <div className={classes.error}>{loadError}</div>
        )}

        {/* Список новостей */}
        {!loading && !loadError && (
          <>
            <div className={classes.newsList}>
              {news.map((item) => (
                <div key={item.id} className={classes.newsCard}>
                  {item?.images?.[0] && (
                    <img
                      src={`${uploadsConfig}${item.images[0]}`}
                      alt={item.title || 'Новость'}
                      className={classes.newsImage}
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
                      />
                    </span>
                  </div>
                </div>
              ))}
              {news.length === 0 && (
                <div className={classes.noResults}>Ничего не найдено</div>
              )}
            </div>

            {/* Пагинация цифрами */}
            <div className={classes.paginationNumbers}>
              {pageList.map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className={classes.dots}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`${classes.pageBtn} ${
                      p === page ? classes.pageActive : ''
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

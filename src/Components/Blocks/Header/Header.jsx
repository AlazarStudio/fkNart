import React, { useEffect, useState } from 'react';
import classes from './Header.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  // блокируем прокрутку фона, когда меню открыто
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  // закрытие по Esc
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ссылки меню (общие для desktop и mobile)
  const NavList = ({ onClick }) => (
    <ul className={classes.navList} onClick={onClick}>
      <li>
        <Link to="/club">О КЛУБЕ</Link>
      </li>
      <li>
        <Link to="/calendar">ТУРНИРЫ</Link>
      </li>
      <li>
        <Link to="/news">НОВОСТИ</Link>
      </li>
      <li>
        <Link to="/images">МЕДИА</Link>
      </li>
    </ul>
  );

  return (
    <>
      {/* DESKTOP */}
      <div className={classes.container}>
        <div className={classes.containerBlock}>
          <div className={classes.containerBlockTop}>
            <div className={classes.containerBlockTopLeft}>
              <img
                src="../images/nartLogo.svg"
                alt="Нарт"
                onClick={() => navigate('/')}
              />
              <span style={{ color: pathname === '/' ? '' : '#000' }}>
                ФУТБОЛЬНЫЙ КЛУБ «НАРТ»
              </span>
            </div>

            <div className={classes.containerBlockTopRight}>
              <a
                href="https://t.me/fc_nart_cherkessk"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: pathname === '/' ? '#ffffff' : '#166137',
                }}
              >
                <img
                  src={
                    pathname === '/'
                      ? '../images/nartBlackTg.svg'
                      : '../images/nartTg11.svg'
                  }
                  alt="Telegram"
                />
              </a>
              <a
                href="https://vk.com/fcnart2010"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: pathname === '/' ? '#ffffff' : '#166137',
                }}
              >
                <img
                  src={
                    pathname === '/'
                      ? '../images/nartBlackVk.svg'
                      : '../images/nartVk1.svg'
                  }
                  alt="VK"
                />
              </a>
              <a
                href="https://wa.me/79000000000" // укажи реальный номер WhatsApp
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: pathname === '/' ? '#ffffff' : '#166137',
                }}
              >
                <img
                  src={
                    pathname === '/'
                      ? '../images/nartBlackWa.svg'
                      : '../images/nartWa1.svg'
                  }
                  alt="WhatsApp"
                />
              </a>
            </div>
          </div>

          <div className={classes.containerBlockCenter}></div>

          <div
            className={classes.containerBlockBottom}
            style={{ backgroundColor: pathname === '/' ? '' : '#166137' }}
          >
            <ul style={{ backgroundColor: pathname === '/' ? '' : '#166137' }}>
              <li>
                <Link to="/club">О КЛУБЕ</Link>
              </li>
              <li>
                <Link to="/calendar">ТУРНИРЫ</Link>
              </li>
              <li>
                <Link to="/news">НОВОСТИ</Link>
              </li>
              <li>
                <Link to="/images">МЕДИА</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className={classes.mobileHeader}>
        <div className={classes.mobileBar}>
          <img
            src="../images/nartLogo.svg"
            alt="Нарт"
            className={classes.mobileLogo}
            onClick={() => navigate('/')}
          />

          <button
            className={`${classes.burger} ${open ? classes.open : ''}`}
            aria-label="Открыть меню"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* выпадающее меню */}
        {open && (
          <div
            className={classes.menuOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className={classes.menuPanel}>
              <button
                className={classes.menuClose}
                aria-label="Закрыть меню"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

              <NavList onClick={() => setOpen(false)} />

              <div className={classes.mobileSocials}>
                <a
                  href="https://t.me/fc_nart_cherkessk"
                  target="_blank"
                  rel="noreferrer"
                >
                  Telegram
                </a>
                <a href="#" rel="noreferrer">
                  VK
                </a>
                <a href="#" rel="noreferrer">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Header;

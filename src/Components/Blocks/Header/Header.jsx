import React from 'react';
import classes from './Header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Header({ children, ...props }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div className={classes.container}>
        <div className={classes.containerBlock}>
          <div className={classes.containerBlockTop}>
            <div className={classes.containerBlockTopLeft}>
              <img src="../images/nartLogo.svg" onClick={() => navigate('/')} />
              <span
                style={{
                  color: pathname === '/' ? '' : '#000',
                }}
              >
                ФУТБОЛЬНЫЙ КЛУБ «НАРТ»
              </span>
            </div>
            <div className={classes.containerBlockTopRight}>
              <span
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
                />
              </span>
              <span
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
                />
              </span>
              <span
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
                />
              </span>
            </div>
          </div>
          <div className={classes.containerBlockCenter} style={{}}></div>
          <div
            className={classes.containerBlockBottom}
            style={{
              backgroundColor: pathname === '/' ? '' : '#166137',
            }}
          >
            <ul
              style={{
                backgroundColor: pathname === '/' ? '' : '#166137',
              }}
            >
              <li>
                <Link to={'/club'}>О КЛУБЕ</Link>
              </li>
              <li>
                <Link to={'/calendar'}>ТУРНИРЫ</Link>
              </li>
              <li>
                <Link to={'/news'}>НОВОСТИ</Link>
              </li>
              <li>
                <Link to={''}>МЕДИА</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;

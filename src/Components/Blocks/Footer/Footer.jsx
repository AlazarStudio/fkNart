import React from 'react';
import classes from './Footer.module.css';
import { useNavigate } from 'react-router-dom';

function Footer({ children, ...props }) {
  const navigate = useNavigate();
  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.containerBlockTop}>
          <div className={classes.containerBlockLeft}>
            <span className={classes.title}>
              <img src="../images/nartLogo.svg" />
              ФУТБОЛЬНЫЙ КЛУБ «НАРТ»
            </span>
            <span className={classes.number}> +7 777 777 77 77</span>
            <div className={classes.containerBlockLeftLink}>
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
          <div className={classes.containerBlockRight}>
            <div className={classes.containerBlockRightEl}>
              <span>О КЛУБЕ</span>
              <span onClick={() => navigate('/about')}>О клубе</span>
              <span></span>
              <span></span>
            </div>
            <div className={classes.containerBlockRightEl}>
              <span>ТУРНИРЫ</span>
              <span onClick={() => navigate('/tourtamentTable')}>Турниры</span>
              <span></span>
              <span></span>
            </div>
            <div className={classes.containerBlockRightEl}>
              <span onClick={() => navigate('/')}>УЧАСТНИКИ</span>
              <span onClick={() => navigate('/')}>Состав</span>
              <span onClick={() => navigate('/')}>Тренерский штаб</span>
              <span>Административный штаб</span>
            </div>
            <div className={classes.containerBlockRightEl}>
              <span>НОВОСТИ</span>
              <span onClick={() => navigate('/news')}>Новости</span>
              <span></span>
              <span></span>
            </div>
            <div className={classes.containerBlockRightEl}>
              <span>МЕДИА</span>
              <span onClick={() => navigate('/images')}>Фото</span>
              <span onClick={() => navigate('/videos')}>Видео</span>
              <span></span>
            </div>
          </div>
        </div>
        <div className={classes.containerBlockCenter}></div>
        <div className={classes.containerBlockBottom}>
          <div className={classes.containerBlockBottomLeft}>
            <span>Политика конфиденциальности</span>
            <span>Пользовательское соглашение</span>
          </div>
          <a href="https://alazarstudio.ru/">
            <img src="../images/AlazarLogo.png" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;

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
            {/* <span className={classes.number}> +7 777 777 77 77</span> */}
            <div className={classes.containerBlockLeftLink}>
              <a
                href="https://t.me/fc_nart_cherkessk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={'../images/nartBlackTg.svg'} alt="Telegram" />
              </a>

              <a
                href="https://vk.com/fcnart2010"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={'../images/nartBlackVk.svg'} alt="VK" />
              </a>

              {/* <a
                href="https://wa.me/79000000000" // замени на реальный номер
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={'../images/nartBlackWa.svg'} alt="WhatsApp" />
              </a> */}
            </div>
          </div>
          <div className={classes.containerBlockRight}>
            <div className={classes.containerBlockRightEl}>
              <span>О КЛУБЕ</span>
              <span onClick={() => navigate('/club')}>О клубе</span>
              <span></span>
              <span></span>
            </div>
            <div className={classes.containerBlockRightEl}>
              <span>ТУРНИРЫ</span>
              <span onClick={() => navigate('/calendar')}>Турниры</span>
              <span></span>
              <span></span>
            </div>
            <div className={classes.containerBlockRightEl}>
              <span>УЧАСТНИКИ</span>
              <span onClick={() => navigate('/club?tab=sostav')}>Состав</span>
              <span onClick={() => navigate('/club?tab=staff')}>
                Тренерский штаб
              </span>
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

import React from 'react';
import classes from './Container4.module.css';

export default function Container4() {
  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.title}>ОФИЦИАЛЬНЫЕ СПОНСОРЫ</div>
        <div className={classes.containerBlockSpon}>
          <a href="https://leon.ru">
            <img src="../images/leonBlack.png" />
          </a>
          <a href="https://bookmaker-ratings.ru/bookmakers-homepage/luchshie-bukmekerskie-kontory/">
            <img src="../images/rb1.png" />
          </a>
          <a href="https://metaratings.ru/">
            <img src="../images/meta1.png" />
          </a>
          <a href="https://legalbet.ru/">
            <img src="../images/legalRed.png" />
          </a>
          <a href="https://betonmobile.ru/">
            <img src="../images/betonBlack.png" />
          </a>
          <a href="https://www.sportmaster.ru/?utm_source=fnl&utm_medium=partnership&utm_campaign=fnl_site&utm_content=fnl_footer">
            <img src="../images/sport1.png" />
          </a>
          <a href="https://fnl.pro/">
            <img src="../images/fnl1.png" />
          </a>
        </div>
      </div>
    </div>
  );
}

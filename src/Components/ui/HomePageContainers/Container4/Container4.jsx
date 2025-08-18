import React from 'react';
import classes from './Container4.module.css';

export default function Container4() {
  return (
    <div className={classes.container}>
      <div className={classes.containerBlock}>
        <div className={classes.title}>ОФИЦИАЛЬНЫЕ СПОНСОРЫ</div>
        <div className={classes.containerBlockSpon}>
          <span>
            <img src="../images/spon1.png" />
          </span>
          <span>
            <img src="../images/spon2.png" />
          </span>
          <span>
            <img src="../images/spon3.png" />
          </span>
        </div>
      </div>
    </div>
  );
}

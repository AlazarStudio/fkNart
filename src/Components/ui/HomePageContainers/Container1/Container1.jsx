import React from 'react';
import classes from './Container1.module.css';

export default function Container1() {
  return (
    <div className={classes.container}>
      <div className={classes.bgWrapper}>
        {/* <img src="/images/nartHomeBg.png" className={classes.bg} /> */}
      </div>

      <div className={classes.containerBlock}>
        <div className={classes.containerBlockLeft}>
          <span>
            <img src="../images/nartCal.svg" />
            КАЛЕНДАРЬ
          </span>
          <div className={classes.containerBlockLeftButtons}>
            <button>ПРОШЕДШИЕ</button>
            <button>БУДУЩИЕ</button>
          </div>
          <div className={classes.containerBlockLeftButtonsControl}>
            <span>
              <img src="../images/nartLeft.svg" />
            </span>
            <span>
              <img src="../images/nartRight.svg" />
            </span>
          </div>
        </div>
        <div className={classes.containerBlockRight}></div>
      </div>
    </div>
  );
}

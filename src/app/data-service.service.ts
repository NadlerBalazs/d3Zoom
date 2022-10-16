import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Data } from './model';
import { filter, sortBy } from 'lodash';

export const DATAS: Data[] = [];
export const filteredData: Data[] = [];

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  constructor() {}

  ngOnInit(): void {}
  private generateRandomDOB = (index: number): Date => {
    const random = this.getRandomDate(
      new Date(moment().subtract(14, 'days').calendar()),
      new Date(moment.now())
    );
    return random;
  };

  private getRandomDate(from: Date, to: Date) {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return new Date(fromTime + Math.random() * (toTime - fromTime));
  }

  private generateRandomNumber = (min: number, max: number): number => {
    return +Math.random().toFixed(2) * max - min;
  };

  getData(): Data[] {
    for (let i = 1; i < 550; i++) {
      DATAS?.push({
        date: this.generateRandomDOB(i),
        value: this.generateRandomNumber(0, 1),
        type: Math.random() > 0.5 ? 'Type1' : 'Type2',
      });
    }
    DATAS.sort((objA, objB) => objA.date.getTime() - objB.date.getTime());
    //   console.log(...DATAS);
    return DATAS;
  }

  defineTimeInterval(select: string): Data[] {
    console.log(select);
    let filteredData: Data[] = [];
    switch (select) {
      case 'Elmúlt nap':
        filteredData = DATAS.filter(
          (date: Data) => date.date >= moment().subtract(1, 'd').toDate()
        );
        break;
      case 'Elmúlt 3 nap':
        filteredData = DATAS.filter(
          (date: Data) => date.date >= moment().subtract(3, 'd').toDate()
        );
        break;
      case 'Elmúlt 7 nap':
        filteredData = DATAS.filter(
          (date: Data) => date.date >= moment().subtract(7, 'd').toDate()
        );
        break;
      case 'Teljes skála':
        filteredData = DATAS;
        break;
      default:
        filteredData = DATAS;
        break;
    }
    return filteredData;
  }
}

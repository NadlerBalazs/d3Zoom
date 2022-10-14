import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Data } from './model';
import { sortBy } from 'lodash';

export const DATAS: Data[] = [];

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  constructor() {}

  ngOnInit(): void {}
  private generateRandomDOB = (): Date => {
    const random = this.getRandomDate(
      new Date('2022-01-01T01:57:45.271Z'),
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
    for (let i = 0; i < 100; i++) {
      DATAS?.push({
        date: this.generateRandomDOB(),
        value: this.generateRandomNumber(0, 1),
        value2: this.generateRandomNumber(0, 100),
      });
    }
    DATAS.sort((objA, objB) => objA.date.getTime() - objB.date.getTime());
    //   console.log(...DATAS);
    return DATAS;
  }
}

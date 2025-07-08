import KSUID from 'ksuid';

export class Goal {
  readonly accountId: string;

  calories: number;

  proteins: number;

  carbohydrates:  number;

  fats: number;

  readonly createdAt: Date;

  constructor(attr: Goal.Attributes) {
    this.accountId = attr.accountId ?? KSUID.randomSync().string;
    this.calories = attr.calories;
    this.carbohydrates = attr.carbohydrates;
    this.fats = attr.fats;
    this.proteins= attr.proteins;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Goal {
  export type Attributes = {
    accountId?: string;
    calories: number;
    proteins: number;
    carbohydrates:  number;
    fats: number;
    createdAt?: Date;
  };

}

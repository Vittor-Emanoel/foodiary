import KSUID from 'ksuid';

export class Profile {
  readonly accountId: string;
  name: string;
  birthDate: Date;
  gender: Profile.Gender;
  height: number;
  activityLevel: Profile.ActivityLevel;
  weight: number;

  readonly createdAt: Date;

  constructor(attr: Profile.Attributes) {
    this.accountId = attr.accountId ?? KSUID.randomSync().string;
    this.name = attr.name;
    this.birthDate = attr.birthDate;
    this.gender = attr.gender;
    this.height = attr.height;
    this.activityLevel = attr.activityLevel;
    this.weight = attr.weight;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Profile {
  export type Attributes = {
    name: string;
    birthDate: Date;
    gender: Profile.Gender;
    height: number;
    activityLevel: Profile.ActivityLevel;
    weight: number;
    accountId?: string;
    createdAt?: Date;
  };

  export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
  }

  export enum ActivityLevel {
    SEDENTARY = 'SEDENTARY',
    LIGHT = 'LIGHT',
    MODERATE = 'MODERATE',
    HEAVY = 'HEAVY',
    ATHLETE = 'ATHLETE',
  }
}

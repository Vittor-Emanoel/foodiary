import { Profile } from '@application/entities/Profile';
import { AccountItem } from './AccountItem';

export class ProfileItem {
  private readonly type = 'Profile';

  private readonly keys: ProfileItem.Keys;

  constructor(private readonly attrs: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(this.attrs.accountId),
      SK: ProfileItem.getSK(this.attrs.accountId),
    };
  }

  static fromEntity(profile: Profile) {
    return new ProfileItem({
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      birthDate: profile.birthDate.toISOString(),
    });
  }

  static toEntity(profileItem: ProfileItem.ItemType) {
    return new Profile({
      accountId: profileItem.accountId,
      activityLevel: profileItem.activityLevel,
      birthDate: new Date(profileItem.birthDate),
      gender: profileItem.gender,
      height: profileItem.height,
      name: profileItem.name,
      weight: profileItem.weight,
      createdAt: new Date(profileItem.createdAt),
    });
  }

  public toItem(): ProfileItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: this.type,
    };
  }

  static getPK(profileId: string): ProfileItem.Keys['PK'] {
    return `ACCOUNT#${profileId}`;
  }

  static getSK(profileId: string): ProfileItem.Keys['SK'] {
    return `ACCOUNT#${profileId}#PROFILE`;
  }

}

export namespace ProfileItem {
  export type Keys = {
    PK: AccountItem.Keys['PK'];
    SK: `ACCOUNT#${string}#PROFILE`;
  };

  export type Attributes = {
    accountId: string;
    name: string;
    birthDate: string;
    gender: Profile.Gender;
    height: number;
    activityLevel: Profile.ActivityLevel;
    weight: number;
    createdAt: string;
  };

  export type ItemType = Keys & Attributes & {
    type: 'Profile'
  };
}

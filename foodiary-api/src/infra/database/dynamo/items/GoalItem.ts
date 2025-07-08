import { Goal } from '@application/entities/Goal';
import { AccountItem } from './AccountItem';

export class GoalItem {
  private readonly type = 'Goal';

  private readonly keys: GoalItem.Keys;

  constructor(private readonly attrs: GoalItem.Attributes) {
    this.keys = {
      PK: GoalItem.getPK(this.attrs.accountId),
      SK: GoalItem.getSK(this.attrs.accountId),
    };
  }

  static fromEntity(goal: Goal) {
    return new GoalItem({
      ...goal,
      createdAt: goal.createdAt.toISOString(),
    });
  }

  static toEntity(goalItem: GoalItem.ItemType) {
    return new Goal({
      accountId: goalItem.accountId,
      calories: goalItem.calories,
      carbohydrates: goalItem.carbohydrates,
      fats: goalItem.fats,
      proteins: goalItem.proteins,
      createdAt: new Date(goalItem.createdAt),
    });
  }

  public toItem(): GoalItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: this.type,
    };
  }

  static getPK(goalId: string): GoalItem.Keys['PK'] {
    return `ACCOUNT#${goalId}`;
  }

  static getSK(goalId: string): GoalItem.Keys['SK'] {
    return `ACCOUNT#${goalId}#GOAL`;
  }

}

export namespace GoalItem {
  export type Keys = {
    PK: AccountItem.Keys['PK'];
    SK: `ACCOUNT#${string}#GOAL`;
  };

  export type Attributes = {
    accountId: string;
    calories: number;
    proteins: number;
    carbohydrates:  number;
    fats: number;
    createdAt: string;
  };

  export type ItemType = Keys & Attributes & {
    type: 'Goal'
  };
}

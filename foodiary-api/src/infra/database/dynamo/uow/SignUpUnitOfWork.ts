import { Account } from '@application/entities/Account';
import { Goal } from '@application/entities/Goal';
import { Profile } from '@application/entities/Profile';
import { Injectable } from '@kernel/decorators/Injectable';
import { AccountRepository } from '../repositories/AccountRepository';
import { GoalRepository } from '../repositories/GoalRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { UnitOfWork } from './UnitOfWork';

@Injectable()
export class SignUpUnitOfWork extends UnitOfWork {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly accountRepository: AccountRepository,
    private readonly goalRepository: GoalRepository,
  ) {
    super();
  }

  async run({ account, goal, profile }: SignUpUnitOfWork.RunParams) {
    this.addPut(this.accountRepository.getPutCommandInput(account));
    this.addPut(this.goalRepository.getPutCommandInput(goal));
    this.addPut(this.profileRepository.getPutCommandInput(profile));

    await this.commit();
  }
}

export namespace SignUpUnitOfWork {
  export type RunParams = {
    account: Account,
    goal: Goal,
    profile: Profile
  }
}

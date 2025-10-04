import { Account } from '@application/entities/Account';
import { Goal } from '@application/entities/Goal';
import { Profile } from '@application/entities/Profile';
import { EmailAlreadyInUseError } from '@application/errors/application/EmailAlreadyInUse';
import { GoalCalculator } from '@application/services/GoalCalculator';
import { AccountRepository } from '@infra/database/dynamo/repositories/AccountRepository';
import { SignUpUnitOfWork } from '@infra/database/dynamo/uow/SignUpUnitOfWork';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { Saga } from '@shared/saga/Saga';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly signUpUow: SignUpUnitOfWork,
    private readonly saga: Saga,
  ) { }

  async execute({
    account: { email, password },
    profile: ProfileInfo,
  }: SignupUseCase.Input): Promise<SignupUseCase.Output> {
    return this.saga.run(async () => {
      const emailAlreadyInUse = await this.accountRepository.findByEmail(email);

      if (emailAlreadyInUse) {
        throw new EmailAlreadyInUseError();
      }

      const account = new Account({ email });
      const profile = new Profile({
        ...ProfileInfo,
        accountId: account.id,
      });

      const { carbohydrates, calories, fats, proteins } = GoalCalculator.calculate(profile);

      const goal = new Goal({
        accountId: account.id,
        carbohydrates,
        calories,
        fats,
        proteins,
      });

      const { externalId } = await this.authGateway.signUp({
        email,
        password,
        internalId: account.id,
      });

      this.saga.addCompensation(async () => this.authGateway.deleteUser({ externalId }));

      account.externalId = externalId;

      await this.signUpUow.run({
        account,
        goal,
        profile,
      });

      const { accessToken, refreshToken } = await this.authGateway.signIn({
        email,
        password,
      });

      return {
        accessToken,
        refreshToken,
      };
    });
  }
}

export namespace SignupUseCase {
  export type Input = {
    account: {
      email: string;
      password: string;
    };
    profile: {
      name: string;
      birthDate: Date;
      gender: Profile.Gender;
      height: number;
      activityLevel: Profile.ActivityLevel;
      goal: Profile.Goal
      weight: number;
    };
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}

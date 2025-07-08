import { Account } from '@application/entities/Account';
import { Profile } from '@application/entities/Profile';
import { EmailAlreadyInUseError } from '@application/errors/application/EmailAlreadyInUse';
import { AccountRepository } from '@infra/database/dynamo/repositories/AccountRepository';
import { AuthGateway } from '@infra/gateways/AuthGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute({
    account: { email, password },
    profile,
  }: SignupUseCase.Input): Promise<SignupUseCase.Output> {
    const emailAlreadyInUse = await this.accountRepository.findByEmail(email);

    if (emailAlreadyInUse) {
      throw new EmailAlreadyInUseError();
    }

    const account = new Account({ email });

    const { externalId } = await this.authGateway.signUp({
      email,
      password,
      internalId: account.id,
    });

    account.externalId = externalId;

    await this.accountRepository.create(account);

    const { accessToken, refreshToken } = await this.authGateway.signIn({
      email,
      password,
    });

    return {
      accessToken,
      refreshToken,
    };
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
      weight: number;
    };
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}

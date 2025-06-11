import { Controller } from '@application/contracts/Controller';
import { SignupUseCase } from '@application/usecases/auth/SignUpUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { SignUpBody, signUpSchema } from './schemas/signupSchema';

@Injectable()
@Schema(signUpSchema)
export class SignUpController extends Controller<SignUpController.Response> {
  constructor(private signupUseCase: SignupUseCase) {
    super();
  }

  protected override async handle({ body }: Controller.Request<SignUpBody>): Promise<Controller.Response<SignUpController.Response>> {
    const { account } = body;

    const { accessToken, refreshToken } = await this.signupUseCase.execute(account);

    return {
      statusCode: 201,
      body: {
        accessToken,
        refreshToken,
      },
    };
  }
}

export namespace SignUpController {
  export type Response = {
    accessToken: string
    refreshToken: string
  }
}

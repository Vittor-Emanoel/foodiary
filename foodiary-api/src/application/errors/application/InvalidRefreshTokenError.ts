import { ErrorCode } from '../ErrorCode';
import { ApplicationError } from './ApplicationError';

export class InvalidRefreshTokenError extends ApplicationError {
  public override statusCode = 401;

  public override code: ErrorCode;

  constructor() {
    super();

    this.name = 'InvalidRefreshTokenError';
    this.message = 'Invalid refresh token.';
    this.code = ErrorCode.INVALID_REFRESH_TOKEN;
  }

}


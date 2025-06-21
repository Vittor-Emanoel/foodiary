import { Account } from '@application/entities/Account';

export class AccountItem {
  private readonly type = 'Account';

  private readonly keys: AccountItem.Keys;

  constructor(private readonly attrs: AccountItem.Attributes) {
    this.keys = {
      PK: AccountItem.getPK(this.attrs.id),
      SK: AccountItem.getSK(this.attrs.id),
      GSI1PK: AccountItem.getSGI1PK(this.attrs.email),
      GSI1SK: AccountItem.getSGI1SK(this.attrs.email),
    };
  }

  static fromEntity(account: Account) {
    return new AccountItem({
      ...account,
      createdAt: account.createdAt.toISOString(),
    });
  }

  static toEntity(accountItem: AccountItem.ItemType) {
    return new Account({
      id: accountItem.id,
      email: accountItem.email,
      externalId: accountItem.externalId,
      createdAt: new Date(accountItem.createdAt),
    });
  }

  public toItem(): AccountItem.ItemType {
    return {
      ...this.keys,
      ...this.attrs,
      type: this.type,
    };
  }

  static getPK(accountId: string): AccountItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): AccountItem.Keys['SK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSGI1PK(email: string): AccountItem.Keys['GSI1PK'] {
    return `ACCOUNT#${email}`;
  }

  static getSGI1SK(email: string): AccountItem.Keys['GSI1SK'] {
    return `ACCOUNT#${email}`;
  }
}

export namespace AccountItem {
  export type Keys = {
    PK: `ACCOUNT#${string}`;
    SK: `ACCOUNT#${string}`;
    GSI1PK: `ACCOUNT#${string}`;
    GSI1SK: `ACCOUNT#${string}`;
  };

  export type Attributes = {
    id: string;
    email: string;
    externalId: string | undefined;
    createdAt: string;
  };

  export type ItemType = Keys & Attributes & {
    type: 'Account'
  };
}

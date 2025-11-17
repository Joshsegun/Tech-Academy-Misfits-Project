export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  accountBalance: number;
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    this.id = this.id || this.generateId();
    this.accountBalance = this.accountBalance || 0;
    this.createdAt = this.createdAt || new Date();
  }

  private generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}

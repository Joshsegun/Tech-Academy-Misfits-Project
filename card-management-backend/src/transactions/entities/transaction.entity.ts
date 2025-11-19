export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  SWAP = 'Swap',
  CARD_FUNDING = 'Card Funding',
  CARD_SPENDING = 'Card Spending',
  INFLOW = 'Inflow',
  OUTFLOW = 'Outflow',
  TRANSFER = 'Transfer',
}

export enum TransactionStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  FAILED = 'Failed',
}

export class Transaction {
  id: string;
  userId: string;
  cardId?: string; // Optional, for card-related transactions
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  merchant?: string; // For card spending
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  createdAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
    this.id = this.id || this.generateId();
    this.status = this.status || TransactionStatus.PENDING;
    this.currency = this.currency || 'NGN';
    this.reference = this.reference || this.generateReference();
    this.createdAt = this.createdAt || new Date();
  }

  private generateId(): string {
    return 'txn_' + Math.random().toString(36).substr(2, 9);
  }

  private generateReference(): string {
    return (
      'REF' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
    );
  }
}

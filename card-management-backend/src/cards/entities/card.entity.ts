export enum CardType {
  VIRTUAL = 'virtual',
  PHYSICAL = 'physical',
}

export enum CardStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export class Card {
  id: string;
  userId: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardName: string;
  type: CardType;
  status: CardStatus;
  currency: Currency;
  balance: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Card>) {
    Object.assign(this, partial);
    this.id = this.id || this.generateId();
    this.balance = this.balance || 0;
    this.status = this.status || CardStatus.ACTIVE;
    this.currency = this.currency || Currency.NGN;
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }

  private generateId(): string {
    return 'card_' + Math.random().toString(36).substr(2, 9);
  }

  // Generate random card number
  static generateCardNumber(): string {
    const prefix = '5399'; // GTBank prefix (example)
    let number = prefix;
    for (let i = 0; i < 12; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  }

  // Generate random CVV
  static generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  // Generate expiry date (3 years from now)
  static generateExpiryDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  }

  // Mask card number for display
  getMaskedCardNumber(): string {
    return `**** **** **** ${this.cardNumber.slice(-4)}`;
  }

  // Mask CVV for display
  getMaskedCVV(): string {
    return '***';
  }
}

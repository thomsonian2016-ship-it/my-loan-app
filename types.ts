export type InterestType = 'simple' | 'compound';
export type Frequency = 'yearly' | 'monthly';

export interface Loan {
  id: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number; // Stored as a percentage (e.g., 5 for 5%)
  rateFrequency: Frequency; // Is the rate per year or per month?
  startDate: string; // ISO String
  dueDate?: string; // ISO String, optional
  status: 'active' | 'settled';
  notes?: string;
  history?: Payment[];
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface CalculationResult {
  daysElapsed: number;
  interestAccrued: number;
  totalAmountDue: number;
  principal: number;
}
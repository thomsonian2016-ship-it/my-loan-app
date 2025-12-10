import { Loan, CalculationResult } from './types';

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

export const calculateLoanDetails = (loan: Loan, targetDateStr: string = new Date().toISOString()): CalculationResult => {
  const start = new Date(loan.startDate);
  const end = new Date(targetDateStr);
  
  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      daysElapsed: 0,
      interestAccrued: 0,
      totalAmountDue: loan.principalAmount,
      principal: loan.principalAmount
    };
  }
  
  // Calculate time difference in days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Normalize rate to annual for calculation
  let annualRate = loan.interestRate;
  if (loan.rateFrequency === 'monthly') {
    annualRate = loan.interestRate * 12;
  }
  
  const timeInYears = diffDays / 365;
  const interest = loan.principalAmount * (annualRate / 100) * timeInYears;
  
  return {
    daysElapsed: diffDays,
    interestAccrued: interest,
    totalAmountDue: loan.principalAmount + interest,
    principal: loan.principalAmount
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).slice(2, 9);
};
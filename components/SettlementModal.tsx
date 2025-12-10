import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Calculator, CheckCircle } from 'lucide-react';
import { Loan, CalculationResult } from '../types';
import { calculateLoanDetails, formatCurrency, formatDate } from '../utils';

interface SettlementModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onSettle: (loanId: string) => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({ loan, isOpen, onClose, onSettle }) => {
  const [calculationDate, setCalculationDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (loan && isOpen) {
      setResult(calculateLoanDetails(loan, calculationDate));
    }
  }, [loan, isOpen, calculationDate]);

  if (!isOpen || !loan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Payoff Calculator</h2>
            <p className="text-emerald-100 mt-1">Settling loan for {loan.borrowerName}</p>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Controls */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Settlement Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={calculationDate}
              onChange={(e) => setCalculationDate(e.target.value)}
            />
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                   <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Days Elapsed</p>
                   <p className="text-2xl font-bold text-blue-900 mt-1">{result.daysElapsed} days</p>
                 </div>
                 <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                   <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Interest Rate</p>
                   <p className="text-2xl font-bold text-purple-900 mt-1">
                      {loan.interestRate}% <span className="text-sm font-normal text-purple-700">/{loan.rateFrequency === 'yearly' ? 'yr' : 'mo'}</span>
                   </p>
                 </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                <div className="p-4 flex justify-between items-center">
                  <span className="text-gray-600">Principal Amount</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.principal)}</span>
                </div>
                <div className="p-4 flex justify-between items-center bg-orange-50/50">
                  <span className="text-orange-700 flex items-center gap-2">
                    <Calculator size={16} /> Interest Accrued
                  </span>
                  <span className="font-bold text-orange-700">+{formatCurrency(result.interestAccrued)}</span>
                </div>
                <div className="p-4 flex justify-between items-center bg-emerald-50">
                  <span className="text-emerald-800 font-bold text-lg">Total Payoff Amount</span>
                  <span className="text-emerald-700 font-bold text-2xl">{formatCurrency(result.totalAmountDue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSettle(loan.id);
              onClose();
            }}
            className="flex-[2] px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Mark as Settled
          </button>
        </div>
      </div>
    </div>
  );
};
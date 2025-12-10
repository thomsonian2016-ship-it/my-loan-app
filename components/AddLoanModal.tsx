import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Loan, Frequency } from '../types';
import { generateId } from '../utils';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Loan) => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    borrowerName: '',
    principalAmount: '',
    interestRate: '',
    rateFrequency: 'yearly' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoan: Loan = {
      id: generateId(),
      borrowerName: formData.borrowerName,
      principalAmount: parseFloat(formData.principalAmount),
      interestRate: parseFloat(formData.interestRate),
      rateFrequency: formData.rateFrequency,
      startDate: new Date(formData.startDate).toISOString(),
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      status: 'active',
      notes: formData.notes
    };
    onSave(newLoan);
    onClose();
    // Reset form
    setFormData({
      borrowerName: '',
      principalAmount: '',
      interestRate: '',
      rateFrequency: 'yearly',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add New Loan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Name</label>
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={formData.borrowerName}
              onChange={e => setFormData({...formData, borrowerName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount ($)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={formData.principalAmount}
              onChange={e => setFormData({...formData, principalAmount: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                placeholder="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={formData.interestRate}
                onChange={e => setFormData({...formData, interestRate: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
               <select
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                 value={formData.rateFrequency}
                 onChange={e => setFormData({...formData, rateFrequency: e.target.value as Frequency})}
               >
                 <option value="yearly">Per Year (Annually)</option>
                 <option value="monthly">Per Month</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Borrowed</label>
              <input
                required
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Opt)</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Any details about the loan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Create Loan Record
          </button>
        </form>
      </div>
    </div>
  );
};
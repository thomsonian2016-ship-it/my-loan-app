import React, { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, Users, Search, Trash2, Calculator, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loan } from './types';
import { calculateLoanDetails, formatCurrency, formatDate } from './utils';
import { StatsCard } from './components/StatsCard';
import { AddLoanModal } from './components/AddLoanModal';
import { SettlementModal } from './components/SettlementModal';

const App: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLoanForSettlement, setSelectedLoanForSettlement] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from local storage with error handling
  useEffect(() => {
    try {
      const savedLoans = localStorage.getItem('lendkeeper_loans');
      if (savedLoans) {
        const parsed = JSON.parse(savedLoans);
        if (Array.isArray(parsed)) {
          setLoans(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load loans from local storage:', error);
      // Fallback to empty array is already handled by initial state
    }
  }, []);

  // Save to local storage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('lendkeeper_loans', JSON.stringify(loans));
    } catch (error) {
      console.warn('Failed to save loans to local storage:', error);
    }
  }, [loans]);

  const addLoan = (loan: Loan) => {
    setLoans((prevLoans) => [...prevLoans, loan]);
  };

  const settleLoan = (id: string) => {
    setLoans((prevLoans) => prevLoans.map(l => l.id === id ? { ...l, status: 'settled' } : l));
  };

  const deleteLoan = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setLoans((prevLoans) => prevLoans.filter(l => l.id !== id));
    }
  };

  // Calculations for Dashboard
  const activeLoans = loans.filter(l => l.status === 'active');
  const settledLoans = loans.filter(l => l.status === 'settled');
  
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  
  // Calculate current total interest accrued for all active loans
  const totalInterestAccrued = activeLoans.reduce((sum, l) => {
    const details = calculateLoanDetails(l);
    return sum + details.interestAccrued;
  }, 0);

  const totalOutstanding = totalPrincipal + totalInterestAccrued;

  // Chart Data
  const data = activeLoans.map(loan => ({
    name: loan.borrowerName,
    value: calculateLoanDetails(loan).totalAmountDue
  })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  // Filtered List
  const filteredLoans = activeLoans.filter(loan => 
    loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.notes && loan.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">LendKeeper</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Loan</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Active Principal" 
            value={formatCurrency(totalPrincipal)} 
            icon={Wallet} 
            colorClass="bg-white"
          />
          <StatsCard 
            title="Projected Interest" 
            value={formatCurrency(totalInterestAccrued)} 
            icon={TrendingUp} 
            trend="+ Growing daily"
            colorClass="bg-white"
          />
          <StatsCard 
            title="Total Outstanding" 
            value={formatCurrency(totalOutstanding)} 
            icon={DollarSign} 
            colorClass="bg-emerald-50 border-emerald-100"
          />
          <StatsCard 
            title="Active Borrowers" 
            value={activeLoans.length.toString()} 
            icon={Users} 
            colorClass="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">Active Loans</h2>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input 
                    type="text"
                    placeholder="Search borrowers..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredLoans.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                    <Wallet className="h-full w-full" />
                  </div>
                  <p>No active loans found.</p>
                  <button onClick={() => setIsAddModalOpen(true)} className="text-emerald-600 font-medium hover:underline mt-2">
                    Add your first loan
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredLoans.map((loan) => {
                    const details = calculateLoanDetails(loan);
                    return (
                      <div key={loan.id} className="p-6 hover:bg-gray-50 transition-colors group">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">{loan.borrowerName}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-200">
                                {details.daysElapsed} days
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> {formatDate(loan.startDate)}
                              </span>
                              <span>•</span>
                              <span>{loan.interestRate}% {loan.rateFrequency === 'yearly' ? 'APR' : '/mo'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                             <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Current Due</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(details.totalAmountDue)}</p>
                                <p className="text-xs text-gray-400">Principal: {formatCurrency(loan.principalAmount)}</p>
                             </div>
                             
                             <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => setSelectedLoanForSettlement(loan)}
                                 className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg tooltip"
                                 title="Calculate & Settle"
                               >
                                 <Calculator size={20} />
                               </button>
                               <button 
                                 onClick={() => deleteLoan(loan.id)}
                                 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                 title="Delete"
                               >
                                 <Trash2 size={20} />
                               </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {settledLoans.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-80">
                 <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Settled History</h3>
                 </div>
                 <div className="divide-y divide-gray-100">
                   {settledLoans.map(loan => (
                     <div key={loan.id} className="p-4 flex justify-between items-center text-sm text-gray-500">
                       <span>{loan.borrowerName}</span>
                       <span className="line-through decoration-gray-400">{formatCurrency(loan.principalAmount)}</span>
                       <span className="text-emerald-600 font-medium flex items-center gap-1">
                         <CheckCircle size={14} /> Paid
                       </span>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Distribution</h3>
              {data.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(value as number)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm italic">
                  Not enough data to display chart
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                   <TrendingUp className="h-6 w-6 text-emerald-100" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Tracking Interest</h4>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    Remember, the "Current Due" is calculated daily based on your interest rate settings. Use the calculator icon on a loan to see exact payoff figures for future dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddLoanModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={addLoan} 
      />

      <SettlementModal
        loan={selectedLoanForSettlement}
        isOpen={!!selectedLoanForSettlement}
        onClose={() => setSelectedLoanForSettlement(null)}
        onSettle={settleLoan}
      />
      
    </div>
  );
};

export default App;

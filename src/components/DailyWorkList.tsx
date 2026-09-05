import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { Transaction } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Search,
  Receipt,
  Trash2,
  AlertCircle,
  CheckCircle,
  Banknote,
  CreditCard,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  Filter,
} from 'lucide-react';

export const DailyWorkList: React.FC = () => {
  const { transactions, settleDue, deleteTransaction, setActiveReceipt } = useCafe();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'due'>('all');
  const [settlingTx, setSettlingTx] = useState<Transaction | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const todayStr = new Date().toDateString();

  const filtered = transactions.filter((t) => {
    const isToday = new Date(t.date).toDateString() === todayStr;
    const hasDue = t.dueAmount > 0;

    if (filterMode === 'today' && !isToday) return false;
    if (filterMode === 'due' && !hasDue) return false;

    const s = search.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(s) ||
      t.customerPhone.includes(s) ||
      t.serviceName.toLowerCase().includes(s) ||
      t.tokenNumber.toLowerCase().includes(s)
    );
  });

  // Calculate totals
  const totalEarnedToday = transactions
    .filter((t) => new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const totalCashToday = transactions
    .filter((t) => new Date(t.date).toDateString() === todayStr && t.paymentMode === 'cash')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const totalUpiToday = transactions
    .filter((t) => new Date(t.date).toDateString() === todayStr && t.paymentMode === 'upi')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const totalMarketDue = transactions.reduce((sum, t) => sum + t.dueAmount, 0);
  const totalDueCustomers = transactions.filter((t) => t.dueAmount > 0).length;

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingTx) return;
    const amt = Number(settleAmount);
    if (amt <= 0) return;
    await settleDue(settlingTx.id, amt);
    setSettlingTx(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Collection (আজকের জমা)
            </span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Banknote className="h-5 w-5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{totalEarnedToday}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Today's Cash (আজকের নগদ)
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Banknote className="h-5 w-5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            ₹{totalCashToday}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Today's UPI / Online (অনলাইন)
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CreditCard className="h-5 w-5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
            ₹{totalUpiToday}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Total Due in Market (মোট বাকি)
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight">
            ₹{totalMarketDue}
          </p>
          {totalDueCustomers > 0 && (
            <p className="text-xs font-semibold text-rose-500 mt-1">
              Due from {totalDueCustomers} customers ({totalDueCustomers} জনের বাকি)
            </p>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, phone, service, token... (কাস্টমার বা কাজের নাম)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 pl-12 pr-4 py-3 text-sm sm:text-base border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Works (সব কাজ) ({transactions.length})
          </button>

          <button
            onClick={() => setFilterMode('today')}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
              filterMode === 'today'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today's Works (আজকের কাজ)
          </button>

          <button
            onClick={() => setFilterMode('due')}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
              filterMode === 'due'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Due Khata (শুধু বাকি) ({totalDueCustomers})</span>
          </button>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-slate-700 uppercase text-xs font-black border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="py-4 px-4">Token (টোকেন)</th>
                <th className="py-4 px-4">Date & Time (তারিখ)</th>
                <th className="py-4 px-4">Customer (কাস্টমার)</th>
                <th className="py-4 px-4">Work / Service (কাজের বিবরণ)</th>
                <th className="py-4 px-4 text-right">Total (মোট)</th>
                <th className="py-4 px-4 text-right">Paid (জমা)</th>
                <th className="py-4 px-4 text-center">Due (বাকি)</th>
                <th className="py-4 px-4 text-center">Action (অ্যাকশন)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-indigo-700 text-sm">
                    {t.tokenNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-sm">
                    <div className="font-semibold text-slate-800">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(t.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm sm:text-base">
                      {t.customerName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{t.customerPhone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">
                    {t.items && t.items.length > 1 ? (
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{t.serviceName}</span>
                          <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            {t.items.length} items
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                          {t.items.map((it, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium"
                            >
                              {it.serviceName} (×{it.quantity})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{t.serviceName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {t.quantity} qty × ₹{t.rate} ({t.categoryName})
                        </div>
                      </div>
                    )}
                    {t.notes && (
                      <div className="text-xs text-indigo-600 italic mt-0.5">
                        "{t.notes}"
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-base">
                    ₹{t.totalAmount}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700 font-black text-base">
                    ₹{t.paidAmount}
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      {t.paymentMode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {t.dueAmount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1 text-xs font-black text-rose-700 border border-rose-200">
                        ₹{t.dueAmount} Due (বাকি)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-200/60">
                        Paid (ফুল জমা) ✅
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {t.dueAmount > 0 && (
                        <button
                          onClick={() => {
                            setSettlingTx(t);
                            setSettleAmount(String(t.dueAmount));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                        >
                          Collect (জমা নিন)
                        </button>
                      )}

                      <button
                        onClick={() => setActiveReceipt(t)}
                        title="Print Receipt (রসিদ প্রিন্ট)"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setTxToDelete(t)}
                        title="Delete (মুছুন)"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm font-medium">
              No entries found. Completed bills will automatically appear here. (কোনো এন্ট্রি পাওয়া যায়নি)
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!txToDelete}
        title="Delete this work entry? (এই এন্ট্রি মুছে ফেলতে চান?)"
        itemName={txToDelete ? `${txToDelete.customerName} - ${txToDelete.serviceName} (${txToDelete.tokenNumber})` : undefined}
        warningText="This work entry will be permanently removed from daily accounts and due register. (এটি দৈনিক হিসাব ও বাকি খাতা থেকে সম্পূর্ণ মুছে যাবে।)"
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />

      {/* Settle Due Modal */}
      {settlingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Collect Due Balance (বাকি টাকা জমা নিন)
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Customer (কাস্টমার):{' '}
              <span className="font-bold text-slate-800">{settlingTx.customerName}</span> (
              {settlingTx.customerPhone})
            </p>

            <form onSubmit={handleConfirmSettle} className="space-y-4 text-sm">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex justify-between items-center text-sm font-bold text-rose-800">
                <span>Current Due Balance (বর্তমান বাকি টাকা):</span>
                <span className="text-lg font-black">₹{settlingTx.dueAmount}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Amount Paying Now (এখন কত টাকা দিচ্ছেন? - ₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={settlingTx.dueAmount}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 font-black text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettlingTx(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm"
                >
                  Cancel (বাতিল)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition active:scale-95"
                >
                  Confirm Payment (জমা নিশ্চিত করুন)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

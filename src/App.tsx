import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { Sidebar } from './components/Sidebar';
import { SimpleBilling } from './components/SimpleBilling';
import { DailyWorkList } from './components/DailyWorkList';
import { AdminRateManager } from './components/AdminRateManager';
import { ReceiptSlipModal } from './components/ReceiptSlipModal';
import { PlusCircle, Calendar, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, loading } = useCafe();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'billing':
        return {
          title: 'New Bill & Entry (নতুন বিল ও কাজ)',
          sub: 'Select category and service to generate customer receipt slip (ক্যাটাগরি ও কাজ সিলেক্ট করে দ্রুত কাস্টমার বিল তৈরি করুন)',
        };
      case 'daily':
        return {
          title: 'Daily Work & Due Register (দৈনিক খাতা ও বাকি)',
          sub: "Track daily collection, customer history, and settle dues (আজকের মোট আয়, হিস্ট্রি ও বাকি আদায়)",
        };
      case 'admin':
        return {
          title: 'Rate Master & Shop Settings (ক্যাটাগরি ও রেট মাস্টার)',
          sub: 'Manage service categories, fixed rates, and shop details (ক্যাটাগরি ও সার্ভিসের রেট নির্ধারণ করুন)',
        };
      default:
        return { title: 'Dashboard', sub: '' };
    }
  };

  const currentTab = getTabTitle();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 flex flex-col lg:flex-row selection:bg-indigo-600 selection:text-white antialiased">
      {/* Side Panel - Permanently Fixed on Desktop */}
      <Sidebar />

      {/* Main Content Area - Only this scrolls */}
      <div className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
        {/* Top bar for desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {currentTab.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {currentTab.sub}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>
                {new Date().toLocaleDateString('bn-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {activeTab !== 'billing' && (
              <button
                onClick={() => setActiveTab('billing')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-600/20 transition active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ New Bill (+ নতুন বিল)</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent mb-3" />
              <p className="text-sm font-bold text-slate-600">
                Loading Database... (ডাটাবেস লোড হচ্ছে...)
              </p>
            </div>
          ) : (
            <div className="transition-all duration-200 ease-in-out">
              {activeTab === 'billing' && <SimpleBilling />}
              {activeTab === 'daily' && <DailyWorkList />}
              {activeTab === 'admin' && <AdminRateManager />}
            </div>
          )}
        </main>
      </div>

      <ReceiptSlipModal />
    </div>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <AppContent />
    </CafeProvider>
  );
}

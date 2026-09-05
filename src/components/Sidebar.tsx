import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import {
  PlusCircle,
  ClipboardList,
  Sliders,
  Banknote,
  AlertCircle,
  Menu,
  X,
  Store,
  Phone,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { shop, transactions, activeTab, setActiveTab } = useCafe();
  const [mobileOpen, setMobileOpen] = useState(false);

  const todayStr = new Date().toDateString();
  const todayPaid = transactions
    .filter((t) => new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const totalMarketDue = transactions.reduce((sum, t) => sum + t.dueAmount, 0);
  const totalDueCount = transactions.filter((t) => t.dueAmount > 0).length;

  const navItems = [
    {
      id: 'billing' as const,
      label: 'New Bill Entry (নতুন বিল)',
      sublabel: 'Service Bill & Slip Generation',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'daily' as const,
      label: 'Daily Register (দৈনিক খাতা)',
      sublabel: 'Work History & Due Khata (বাকি)',
      icon: ClipboardList,
      badge: transactions.length > 0 ? transactions.length : null,
    },
    {
      id: 'admin' as const,
      label: 'Rate Master (রেট মাস্টার)',
      sublabel: 'Category & Service Pricing',
      icon: Sliders,
      badge: 'Admin',
    },
  ];

  const handleSelectTab = (tabId: 'billing' | 'daily' | 'admin') => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              {shop.name}
            </h1>
            <p className="text-xs text-indigo-300 font-medium">Cyber Cafe Manager</p>
          </div>
        </div>

        <button
          onClick={() => handleSelectTab('billing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ New Bill (+ নতুন বিল)</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Permanent and Fixed on Desktop, Drawer on Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 h-screen bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800/80 shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-lg text-white shadow-md shadow-indigo-600/30 shrink-0">
                  MM
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-white leading-tight truncate">
                    {shop.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs text-emerald-400 font-semibold tracking-wide truncate">
                      Counter Live (কাউন্টার চালু)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Summary Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Banknote className="h-4 w-4 text-emerald-400 shrink-0" />
                  Today's Collection (আজকের জমা)
                </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ₹{todayPaid}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  Total Due (মোট বাকি)
                </span>
                <span className="text-sm font-black text-rose-400 font-mono">
                  ₹{totalMarketDue}
                  {totalDueCount > 0 && (
                    <span className="text-[11px] font-normal text-slate-400 ml-1">
                      ({totalDueCount})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto no-scrollbar">
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Main Menu (মূল মেন্যু)
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/25'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition shrink-0 ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm leading-tight">{item.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          isActive ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Button */}
          <div className="px-4 py-2 shrink-0">
            <button
              onClick={() => handleSelectTab('billing')}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ New Bill Entry (+ নতুন বিল)</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Shop Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold truncate">
              <Store className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{shop.address || 'Cyber Cafe Counter'}</span>
            </div>
            {shop.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-slate-400">{shop.phone}</span>
              </div>
            )}
            {shop.upiId && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-indigo-300 font-mono font-medium">
                <QrCode className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">UPI: {shop.upiId}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

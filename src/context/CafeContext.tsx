import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, BillItem, Category, Service, ShopInfo, Transaction } from '../types';

interface CafeContextType {
  shop: ShopInfo;
  categories: Category[];
  services: Service[];
  transactions: Transaction[];
  loading: boolean;
  activeReceipt: Transaction | null;
  setActiveReceipt: (tx: Transaction | null) => void;
  activeTab: 'billing' | 'daily' | 'admin';
  setActiveTab: (tab: 'billing' | 'daily' | 'admin') => void;
  refreshData: () => Promise<void>;
  addCategory: (name: string, bengaliName?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addService: (categoryId: string, name: string, rate: number, unit: string) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addTransaction: (txData: {
    customerName: string;
    customerPhone: string;
    items?: BillItem[];
    categoryName?: string;
    serviceName?: string;
    quantity?: number;
    rate?: number;
    totalAmount?: number;
    paidAmount: number;
    dueAmount: number;
    paymentMode: 'cash' | 'upi' | 'due';
    notes?: string;
  }) => Promise<Transaction>;
  settleDue: (id: string, amountToPay: number) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateShop: (shop: Partial<ShopInfo>) => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<ShopInfo>({
    name: 'MM Digital Point',
    phone: '9477900842',
    address: 'Atghara',
    upiId: 'uid1@ybl',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'billing' | 'daily' | 'admin'>('billing');

  const refreshData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data: AppData = await res.json();
        if (data.shop) setShop(data.shop);
        if (data.categories) setCategories(data.categories);
        if (data.services) setServices(data.services);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Failed to load data from server JSON database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addCategory = async (name: string, bengaliName?: string) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bengaliName }),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  const deleteCategory = async (id: string) => {
    // Optimistically remove from state immediately
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setServices((prev) => prev.filter((s) => s.categoryId !== id));
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete category', err);
      await refreshData();
    }
  };

  const addService = async (categoryId: string, name: string, rate: number, unit: string) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, name, rate, unit }),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    // Optimistic update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      await refreshData();
    }
  };

  const deleteService = async (id: string) => {
    // Optimistically remove from state immediately
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete service', err);
      await refreshData();
    }
  };

  const addTransaction = async (txData: {
    customerName: string;
    customerPhone: string;
    items?: BillItem[];
    categoryName?: string;
    serviceName?: string;
    quantity?: number;
    rate?: number;
    totalAmount?: number;
    paidAmount: number;
    dueAmount: number;
    paymentMode: 'cash' | 'upi' | 'due';
    notes?: string;
  }): Promise<Transaction> => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txData),
    });
    const created: Transaction = await res.json();
    await refreshData();
    return created;
  };

  const settleDue = async (id: string, amountToPay: number) => {
    const current = transactions.find((t) => t.id === id);
    if (!current) return;
    const newPaid = current.paidAmount + amountToPay;
    const newDue = Math.max(0, current.totalAmount - newPaid);

    // Optimistic update
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newDue === 0 ? 'completed' : 'due',
            }
          : t
      )
    );

    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newDue === 0 ? 'completed' : 'due',
      }),
    });
    if (!res.ok) {
      await refreshData();
    }
  };

  const deleteTransaction = async (id: string) => {
    // Optimistically remove from state immediately
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete transaction', err);
      await refreshData();
    }
  };

  const updateShop = async (shopData: Partial<ShopInfo>) => {
    const res = await fetch('/api/shop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData),
    });
    if (res.ok) {
      await refreshData();
    }
  };

  return (
    <CafeContext.Provider
      value={{
        shop,
        categories,
        services,
        transactions,
        loading,
        activeReceipt,
        setActiveReceipt,
        activeTab,
        setActiveTab,
        refreshData,
        addCategory,
        deleteCategory,
        addService,
        updateService,
        deleteService,
        addTransaction,
        settleDue,
        deleteTransaction,
        updateShop,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) throw new Error('useCafe must be used within CafeProvider');
  return context;
};

import React, { useState, useEffect } from 'react';
import { useCafe } from '../context/CafeContext';
import { BillItem, Service } from '../types';
import {
  PlusCircle,
  Printer,
  User,
  Phone,
  CheckCircle,
  Layers,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  RotateCcw,
  QrCode,
} from 'lucide-react';

export const SimpleBilling: React.FC = () => {
  const { categories, services, shop, addTransaction, setActiveReceipt, setActiveTab } = useCafe();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [itemAddedToast, setItemAddedToast] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'due'>('cash');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState(false);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Filter services by category
  const categoryServices = services.filter((s) => s.categoryId === selectedCategoryId);

  // Auto-select first service and rate when category changes
  useEffect(() => {
    if (categoryServices.length > 0) {
      setSelectedServiceId(categoryServices[0].id);
      setRate(categoryServices[0].rate);
    } else {
      setSelectedServiceId('');
      setRate(0);
    }
  }, [selectedCategoryId, services]);

  const handleServiceChange = (srvId: string) => {
    setSelectedServiceId(srvId);
    const srv = services.find((s) => s.id === srvId);
    if (srv) {
      setRate(srv.rate);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Subtotal for current selector
  const currentItemSubtotal = Math.max(0, quantity * rate);

  // Add current selected work to multi-item bill
  const handleAddItemToBill = () => {
    if (!selectedService && !selectedServiceId) return;
    const srvName = selectedService?.name || 'General Service';
    const catName = selectedCategory?.name || 'General';
    const unit = selectedService?.unit || 'item';

    // Check if same service is already in the bill
    const existingIndex = billItems.findIndex(
      (item) => item.serviceId === selectedServiceId && item.rate === rate
    );

    if (existingIndex > -1) {
      // Update quantity of existing item
      setBillItems((prev) =>
        prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: newQty,
              amount: newQty * item.rate,
            };
          }
          return item;
        })
      );
    } else {
      // Add as new item
      const newItem: BillItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        categoryId: selectedCategoryId,
        categoryName: catName,
        serviceId: selectedServiceId,
        serviceName: srvName,
        quantity,
        rate,
        amount: quantity * rate,
        unit,
      };
      setBillItems((prev) => [...prev, newItem]);
    }

    // Show temporary toast
    setItemAddedToast(`Added: ${srvName} (×${quantity})`);
    setTimeout(() => setItemAddedToast(null), 2000);

    // Reset quantity back to 1
    setQuantity(1);
  };

  // Quick 1-click preset addition
  const handleQuickAddService = (srv: Service, qty = 1) => {
    const cat = categories.find((c) => c.id === srv.categoryId);
    const newItem: BillItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      categoryId: srv.categoryId,
      categoryName: cat?.name || 'General',
      serviceId: srv.id,
      serviceName: srv.name,
      quantity: qty,
      rate: srv.rate,
      amount: qty * srv.rate,
      unit: srv.unit,
    };
    setBillItems((prev) => [...prev, newItem]);
    setItemAddedToast(`Added: ${srv.name} (×${qty})`);
    setTimeout(() => setItemAddedToast(null), 2000);
  };

  const handleUpdateItemQty = (id: string, delta: number) => {
    setBillItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: newQty,
              amount: newQty * item.rate,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBill = () => {
    setBillItems([]);
  };

  // Grand Total calculation
  const totalAmount =
    billItems.length > 0
      ? billItems.reduce((acc, item) => acc + item.amount, 0)
      : Math.max(0, quantity * rate);

  // Calculate actual paid & due
  let actualPaid = totalAmount;
  if (paymentMode === 'due') {
    actualPaid = 0;
  } else if (paidAmount !== '') {
    actualPaid = Math.min(totalAmount, Math.max(0, Number(paidAmount) || 0));
  }
  const dueAmount = Math.max(0, totalAmount - actualPaid);

  const handleSubmit = async (andPrint = false) => {
    // If no items were explicitly added to billItems, use the currently selected work
    let finalItems: BillItem[] = [];

    if (billItems.length > 0) {
      finalItems = billItems;
    } else {
      if (totalAmount <= 0 && rate <= 0) return;
      finalItems = [
        {
          id: `item-${Date.now()}`,
          categoryId: selectedCategoryId,
          categoryName: selectedCategory?.name || 'General',
          serviceId: selectedServiceId,
          serviceName: selectedService?.name || 'Cyber Cafe Service',
          quantity,
          rate,
          amount: quantity * rate,
          unit: selectedService?.unit || 'item',
        },
      ];
    }

    const primaryService =
      finalItems.length === 1
        ? finalItems[0].serviceName
        : finalItems.map((i) => `${i.serviceName} (×${i.quantity})`).join(', ');

    const primaryCategory =
      finalItems.length === 1 ? finalItems[0].categoryName : 'Multiple (বিবিধ)';

    const totalQty = finalItems.reduce((acc, item) => acc + item.quantity, 0);

    const tx = await addTransaction({
      customerName: customerName.trim() || 'Walk-in Customer (সাধারণ কাস্টমার)',
      customerPhone: customerPhone.trim() || 'N/A',
      items: finalItems,
      categoryName: primaryCategory,
      serviceName: primaryService,
      quantity: totalQty,
      rate: finalItems.length === 1 ? finalItems[0].rate : 0,
      totalAmount,
      paidAmount: actualPaid,
      dueAmount,
      paymentMode,
      notes: notes.trim() || undefined,
    });

    if (andPrint) {
      setActiveReceipt(tx);
    }

    // Reset bill state
    setBillItems([]);
    setQuantity(1);
    setPaidAmount('');
    setNotes('');
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMode('cash');

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 transition-all">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
                <PlusCircle className="h-6 w-6" />
              </span>
              <span>New Bill & Counter Entry (নতুন বিল ও কাজ এন্ট্রি)</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Combine multiple works (Xerox + Photo + Recharge) in one receipt (একই বিলে একাধিক কাজ একসাথে যোগ করে মোট রসিদ বানান).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {billItems.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-bold animate-pulse">
                <ShoppingCart className="h-4 w-4" />
                <span>{billItems.length} items in bill</span>
              </span>
            )}
            <button
              onClick={() => setActiveTab('admin')}
              className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition duration-200"
            >
              ⚙️ Rates (রেট সেটিংস)
            </button>
          </div>
        </div>

        {/* Quick 1-Click Frequent Presets */}
        {services.length > 0 && (
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Quick Add (এক ক্লিকে বিলে যোগ করুন):</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Click to instantly add to bill</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 6).map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleQuickAddService(srv, 1)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold transition shadow-2xs active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="h-3 w-3 text-indigo-600" />
                  <span>{srv.name}</span>
                  <span className="text-slate-400 font-normal">₹{srv.rate}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Select Category (কাজের ক্যাটাগরি বেছে নিন)</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => {
              const isSel = cat.id === selectedCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                    isSel
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90 active:scale-98'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.bengaliName && (
                    <span
                      className={`text-xs font-normal ${
                        isSel ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      ({cat.bengaliName})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Work / Service Selection & Add to Bill */}
        <div className="mb-6 bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/80">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Select Work & Quantity (কাজের নাম ও পরিমাণ)</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Work / Service Name (কাজের নাম)
              </label>
              {categoryServices.length > 0 ? (
                <select
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition shadow-xs"
                >
                  {categoryServices.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — ₹{srv.rate} /{srv.unit}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-amber-800 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                  No services found in this category (এই ক্যাটাগরিতে কোনো কাজ নেই).{' '}
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="font-bold underline ml-1 text-indigo-700"
                  >
                    Add Service in Admin (অ্যাডমিন থেকে সার্ভিস যোগ করুন)
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Rate ₹ (প্রতিটির রেট)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-base font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value) || 0)}
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-8 pr-4 py-3 text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/60 items-center">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-700">
                  Quantity / Copies (পরিমাণ / সংখ্যা)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`text-xs px-2 py-0.5 rounded-md font-bold transition ${
                        quantity === preset
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition active:scale-95"
                  title="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full text-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition active:scale-95"
                  title="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                Subtotal & Add to Bill
              </label>
              <button
                type="button"
                onClick={handleAddItemToBill}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition active:scale-95"
              >
                <Plus className="h-5 w-5" />
                <span>+ Add to Bill (+ বিলে যোগ করুন - ₹{currentItemSubtotal})</span>
              </button>
            </div>
          </div>

          {itemAddedToast && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200 animate-fadeIn">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{itemAddedToast} successfully!</span>
            </div>
          )}
        </div>

        {/* Step 3: Current Multi-Item Bill Summary */}
        <div className="mb-6 rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-black text-white">
                Current Bill Items (এই বিলে যোগ করা কাজের তালিকা)
              </h3>
              <span className="text-xs font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                {billItems.length} {billItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {billItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearBill}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear All (মুছুন)</span>
              </button>
            )}
          </div>

          {billItems.length > 0 ? (
            <div className="space-y-2.5">
              <div className="divide-y divide-slate-800">
                {billItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="py-2.5 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                        <span>{item.serviceName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.categoryName} • ₹{item.rate} each
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(item.id, -1)}
                          className="p-1 rounded-lg text-slate-300 hover:bg-slate-700 active:scale-95"
                          title="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-black text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(item.id, 1)}
                          className="p-1 rounded-lg text-slate-300 hover:bg-slate-700 active:scale-95"
                          title="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-black text-base text-emerald-400 min-w-[65px] text-right">
                        ₹{item.amount}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm sm:text-base">
                <span className="text-slate-300 font-bold">
                  Grand Total (সর্বমোট বিল):
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-slate-400 text-sm">
              <p className="font-medium text-slate-300">
                Current single item: <span className="font-bold text-white">{selectedService?.name || 'General Service'}</span> (×{quantity}) = <span className="font-black text-emerald-400">₹{currentItemSubtotal}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tip: Click <span className="text-indigo-400 font-bold">+ Add to Bill</span> above to combine multiple items (Xerox, Photo, Recharge, etc.) in one receipt. Or simply save now for single-item bill.
              </p>
            </div>
          )}
        </div>

        {/* Step 4: Customer Details & Payment */}
        <div className="space-y-4 mb-7">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>Customer Details & Payment (কাস্টমারের তথ্য ও পেমেন্ট)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Customer Name (কাস্টমারের নাম)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Mondal (রাহুল মন্ডল)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 pl-11 pr-4 py-3 text-sm sm:text-base font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Mobile Number (মোবাইল নম্বর)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="10-digit Mobile Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 pl-11 pr-4 py-3 text-sm sm:text-base font-mono font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Payment Mode (পেমেন্ট মাধ্যম)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('cash');
                  setPaidAmount('');
                }}
                className={`py-3 px-3 rounded-2xl text-sm font-bold border transition-all duration-200 ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 scale-[1.01]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                💵 Cash (নগদ)
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode('upi');
                  setPaidAmount('');
                }}
                className={`py-3 px-3 rounded-2xl text-sm font-bold border transition-all duration-200 ${
                  paymentMode === 'upi'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-[1.01]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📱 UPI / Online (অনলাইন)
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode('due');
                  setPaidAmount('0');
                }}
                className={`py-3 px-3 rounded-2xl text-sm font-bold border transition-all duration-200 ${
                  paymentMode === 'due'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 scale-[1.01]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⚠️ Due (বাকি থাকলো)
              </button>
            </div>
          </div>

          {/* Amount Paid vs Total */}
          {paymentMode !== 'due' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-sm text-slate-700">
                Amount Received (জমা পাওয়া টাকা):
              </span>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-base font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder={String(totalAmount)}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full sm:w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-black text-emerald-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {dueAmount > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 font-bold">
              <span>Due Balance to Khata (বাকি খাতা):</span>
              <span className="text-lg font-black">₹{dueAmount}</span>
            </div>
          )}

          {/* Live QR payment display for counter scanning */}
          {shop.upiId && (paymentMode === 'upi' || dueAmount > 0) && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${encodeURIComponent(
                  shop.upiId
                )}&pn=${encodeURIComponent(shop.name)}&am=${
                  paymentMode === 'upi' ? totalAmount : dueAmount
                }&cu=INR`}
                alt="Counter UPI QR"
                className="h-20 w-20 rounded-xl border border-indigo-200 p-1 bg-white shadow-2xs"
                referrerPolicy="no-referrer"
              />
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-indigo-900">
                  <QrCode className="h-4 w-4 text-indigo-600" />
                  <span>Customer Scan & Pay ({shop.upiId})</span>
                </div>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Customer can scan this QR code directly with PhonePe, Google Pay, or Paytm to pay ₹
                  {paymentMode === 'upi' ? totalAmount : dueAmount}.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Note / Reference (কাজের নোট বা রেফারেন্স - Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 2 copies Xerox + 1 set Photo + Jio recharge"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-98"
          >
            <Printer className="h-5 w-5" />
            <span>Save & Print Slip (সেভ ও রসিদ প্রিন্ট - ₹{totalAmount})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all duration-200 active:scale-98"
          >
            Save Only (শুধু সেভ করুন)
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-bold flex items-center gap-2.5 border border-emerald-200 transition-all animate-fadeIn">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Bill saved successfully! (কাজটি সফলভাবে সেভ হয়েছে)</span>
          </div>
        )}
      </div>
    </div>
  );
};

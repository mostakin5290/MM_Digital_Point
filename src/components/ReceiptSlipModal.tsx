import React from 'react';
import { useCafe } from '../context/CafeContext';
import { Printer, X, CheckCircle, Share2, Smartphone } from 'lucide-react';

export const ReceiptSlipModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, shop } = useCafe();

  if (!activeReceipt) return null;

  const itemsList =
    activeReceipt.items && activeReceipt.items.length > 0
      ? activeReceipt.items
      : [
          {
            id: 'legacy-1',
            categoryName: activeReceipt.categoryName,
            serviceName: activeReceipt.serviceName,
            quantity: activeReceipt.quantity,
            rate: activeReceipt.rate,
            amount: activeReceipt.totalAmount,
          },
        ];

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const itemsLines = itemsList
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.serviceName} (${it.quantity}x) = ₹${it.amount ?? it.quantity * it.rate}`
      )
      .join('\n');

    const text = `*${shop.name}*\n*Receipt:* ${activeReceipt.receiptNumber} (Token: ${activeReceipt.tokenNumber})\n*Customer:* ${activeReceipt.customerName}\n*Phone:* ${activeReceipt.customerPhone}\n\n*Items / কাজ সমূহ:*\n${itemsLines}\n\n*Total Bill:* ₹${activeReceipt.totalAmount}\n*Paid:* ₹${activeReceipt.paidAmount} (${activeReceipt.paymentMode.toUpperCase()})\n*Due:* ₹${activeReceipt.dueAmount}\n\nThank you! Visit again.`;
    const cleanPhone = activeReceipt.customerPhone.replace(/[^0-9]/g, '');
    const url =
      cleanPhone.length === 10
        ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <button
          onClick={() => setActiveReceipt(null)}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-black text-slate-900 mb-3">
          Receipt Slip (বিলের রসিদ স্লিপ)
        </h3>

        {/* Printable Section */}
        <div
          id="printable-receipt-area"
          className="bg-white p-4 border border-dashed border-slate-300 rounded-2xl text-slate-800 text-sm font-mono shadow-xs"
        >
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h3 className="font-black text-base uppercase tracking-wider text-slate-900">
              {shop.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{shop.address}</p>
            {shop.phone && <p className="text-xs text-slate-500 font-mono">Mobile (মোবাইল): {shop.phone}</p>}
          </div>

          <div className="py-2.5 border-b border-dashed border-slate-200 text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Token (টোকেন): {activeReceipt.tokenNumber}</span>
              <span>{activeReceipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>
                Date (তারিখ):{' '}
                {new Date(activeReceipt.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>
                {new Date(activeReceipt.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="text-xs pt-0.5">
              Customer (কাস্টমার): <span className="font-bold text-slate-900">{activeReceipt.customerName}</span> (
              {activeReceipt.customerPhone})
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-200">
            <div className="flex justify-between font-bold text-[11px] text-slate-400 uppercase pb-1.5 border-b border-slate-100">
              <span className="w-1/2">Work (কাজের বিবরণ)</span>
              <span className="w-1/4 text-center">Qty</span>
              <span className="w-1/4 text-right">Amount (টাকা)</span>
            </div>
            <div className="divide-y divide-slate-100/80">
              {itemsList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex justify-between text-xs sm:text-sm py-1.5 font-semibold text-slate-800"
                >
                  <div className="w-1/2 pr-1">
                    <span className="truncate block font-bold text-slate-900 leading-tight">
                      {item.serviceName}
                    </span>
                    {item.categoryName && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.categoryName}
                      </span>
                    )}
                  </div>
                  <span className="w-1/4 text-center text-slate-600 self-center text-xs">
                    {item.quantity} × ₹{item.rate}
                  </span>
                  <span className="w-1/4 text-right font-bold text-slate-900 self-center">
                    ₹{item.amount ?? item.quantity * item.rate}
                  </span>
                </div>
              ))}
            </div>
            {activeReceipt.notes && (
              <div className="text-xs text-slate-500 italic mt-2 pt-1 border-t border-dashed border-slate-100">
                Note (নোট): {activeReceipt.notes}
              </div>
            )}
          </div>

          {/* Payment breakdown */}
          <div className="py-2.5 space-y-1.5 text-sm">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total Bill (মোট বিল):</span>
              <span className="font-black text-base">₹{activeReceipt.totalAmount}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid (জমা - {activeReceipt.paymentMode.toUpperCase()}):</span>
              <span className="font-black">₹{activeReceipt.paidAmount}</span>
            </div>
            {activeReceipt.dueAmount > 0 && (
              <div className="flex justify-between text-rose-700 font-bold text-sm bg-rose-50 p-2 rounded-xl border border-rose-200">
                <span>Due Balance (বাকি টাকা):</span>
                <span className="font-black">₹{activeReceipt.dueAmount}</span>
              </div>
            )}
          </div>

          {/* Counter UPI QR if configured */}
          {shop.upiId && activeReceipt.dueAmount > 0 && (
            <div className="text-center pt-3 border-t border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-1.5">
                Scan to Pay Due ₹{activeReceipt.dueAmount} (বাকি টাকা পেমেন্ট করতে স্ক্যান করুন):
              </p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${encodeURIComponent(
                  shop.upiId
                )}&pn=${encodeURIComponent(shop.name)}&am=${
                  activeReceipt.dueAmount
                }&cu=INR`}
                alt="Pay Due QR"
                className="mx-auto h-20 w-20 rounded-lg border border-slate-200 p-1"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="text-center pt-3 text-xs text-slate-400">
            *** Thank You! Visit Again (ধন্যবাদ! আবার আসবেন) ***
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-2.5 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Print Slip (প্রিন্ট করুন)</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Smartphone className="h-4 w-4" />
            <span>WhatsApp (শেয়ার)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

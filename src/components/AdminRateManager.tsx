import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Plus,
  FolderPlus,
  Edit2,
  Trash2,
  Save,
  CheckCircle,
  Settings,
  Store,
  Layers,
  HelpCircle,
  Database,
  Tag,
} from 'lucide-react';

export const AdminRateManager: React.FC = () => {
  const {
    categories,
    services,
    shop,
    addCategory,
    deleteCategory,
    addService,
    updateService,
    deleteService,
    updateShop,
  } = useCafe();

  // Category modal
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBengali, setNewCatBengali] = useState('');

  // Service / Work modal
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [selectedCatForNewWork, setSelectedCatForNewWork] = useState('');
  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkRate, setNewWorkRate] = useState<number>(10);
  const [newWorkUnit, setNewWorkUnit] = useState('page');

  // Inline editing of rates
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);
  const [editNameValue, setEditNameValue] = useState<string>('');

  // Shop settings state
  const [shopName, setShopName] = useState(shop.name);
  const [shopPhone, setShopPhone] = useState(shop.phone);
  const [shopAddress, setShopAddress] = useState(shop.address);
  const [shopUpi, setShopUpi] = useState(shop.upiId);
  const [shopSaved, setShopSaved] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'service';
    id: string;
    name: string;
  } | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim(), newCatBengali.trim() || undefined);
    setNewCatName('');
    setNewCatBengali('');
    setShowAddCategoryModal(false);
  };

  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkName.trim()) return;
    const catId = selectedCatForNewWork || (categories[0]?.id || '');
    await addService(catId, newWorkName.trim(), Number(newWorkRate) || 0, newWorkUnit);
    setNewWorkName('');
    setNewWorkRate(10);
    setShowAddWorkModal(false);
  };

  const handleStartEdit = (srv: { id: string; name: string; rate: number }) => {
    setEditingServiceId(srv.id);
    setEditRateValue(srv.rate);
    setEditNameValue(srv.name);
  };

  const handleSaveEdit = async (srvId: string) => {
    await updateService(srvId, {
      name: editNameValue.trim(),
      rate: Number(editRateValue) || 0,
    });
    setEditingServiceId(null);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShop({
      name: shopName.trim(),
      phone: shopPhone.trim(),
      address: shopAddress.trim(),
      upiId: shopUpi.trim(),
    });
    setShopSaved(true);
    setTimeout(() => setShopSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-indigo-300 mb-2 border border-slate-700">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Persistent JSON Database Connected (data/db.json)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Rate Master & Settings (ক্যাটাগরি ও কাজের রেট কন্ট্রোল)
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl font-medium">
            Create work categories, pre-define standard service charges, and customize shop counter details (কাজের ক্যাটাগরি তৈরি করুন এবং প্রতিটি কাজের নির্দিষ্ট রেট সেট করুন).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 px-4 py-3 text-sm font-bold shadow transition active:scale-95"
          >
            <FolderPlus className="h-4 w-4 text-indigo-600" />
            <span>+ Add Category (+ নতুন ক্যাটাগরি)</span>
          </button>

          <button
            onClick={() => {
              setSelectedCatForNewWork(categories[0]?.id || '');
              setShowAddWorkModal(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 text-sm font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Work & Rate (+ কাজের রেট যোগ)</span>
          </button>
        </div>
      </div>

      {/* Main Services by Category List */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span>Categories & Service Rates (বর্তমান সব ক্যাটাগরি ও কাজের রেট - {services.length} services)</span>
          </h3>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            Click pencil to edit rates inline (রেট পরিবর্তন করতে পেনসিল বাটনে ক্লিক করুন)
          </span>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const catServices = services.filter((s) => s.categoryId === cat.id);

            return (
              <div
                key={cat.id}
                className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Category Header */}
                <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-indigo-600" />
                    <span className="font-black text-base text-slate-900">
                      {cat.name}
                    </span>
                    {cat.bengaliName && (
                      <span className="text-sm font-semibold text-slate-500">
                        ({cat.bengaliName})
                      </span>
                    )}
                    <span className="ml-2 text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {catServices.length} works ({catServices.length}টি কাজ)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCatForNewWork(cat.id);
                        setShowAddWorkModal(true);
                      }}
                      className="text-sm text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1.5 transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Add Service in this Category (+ কাজ যোগ করুন)</span>
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'category',
                          id: cat.id,
                          name: `${cat.name}${cat.bengaliName ? ` (${cat.bengaliName})` : ''}`,
                        })
                      }
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Category (ক্যাটাগরি মুছুন)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Services Table */}
                <div className="p-4">
                  {catServices.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {catServices.map((srv) => {
                        const isEditing = editingServiceId === srv.id;

                        return (
                          <div
                            key={srv.id}
                            className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-2xl transition"
                          >
                            {isEditing ? (
                              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <input
                                  type="text"
                                  value={editNameValue}
                                  onChange={(e) => setEditNameValue(e.target.value)}
                                  className="w-full sm:flex-1 rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-500">₹</span>
                                  <input
                                    type="number"
                                    value={editRateValue}
                                    onChange={(e) =>
                                      setEditRateValue(Number(e.target.value) || 0)
                                    }
                                    className="w-24 rounded-xl border border-slate-300 p-2.5 text-sm font-black text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <span className="text-xs text-slate-500">/{srv.unit}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveEdit(srv.id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                    <span>Save (সেভ)</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingServiceId(null)}
                                    className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition"
                                  >
                                    Cancel (বাতিল)
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-sm sm:text-base font-bold text-slate-800">
                                    {srv.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="rounded-xl bg-indigo-50 px-3.5 py-1.5 text-sm font-black text-indigo-700 border border-indigo-100">
                                    ₹{srv.rate}{' '}
                                    <span className="text-xs font-medium text-slate-500">
                                      /{srv.unit}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleStartEdit(srv)}
                                      className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                      title="Edit (এডিট)"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteTarget({
                                          type: 'service',
                                          id: srv.id,
                                          name: `${srv.name} (₹${srv.rate}/${srv.unit})`,
                                        })
                                      }
                                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                      title="Delete (মুছুন)"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 p-3 italic">
                      No services in this category yet. Click "+ Add Service" above (এই ক্যাটাগরিতে এখনো কোনো কাজ যোগ করা হয়নি).
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cyber Cafe Shop Settings */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
          <Store className="h-5 w-5 text-indigo-600" />
          <span>Shop Profile & Counter UPI QR Code (দোকানের তথ্য ও কাউন্টার UPI QR কোড)</span>
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          These details are printed on customer receipts and generate the instant QR code for payments (বিলের রসিদে ছাপা হবে এবং কাস্টমার স্ক্যান করে পেমেন্ট করতে পারবে).
        </p>

        <form onSubmit={handleSaveShop} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Shop Name (দোকানের নাম)
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mobile Number (মোবাইল নম্বর)
            </label>
            <input
              type="text"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Shop Address (দোকানের ঠিকানা)
            </label>
            <input
              type="text"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Counter UPI ID (PhonePe / GPay / Paytm / QR)
            </label>
            <input
              type="text"
              placeholder="e.g. cybercafe@okaxis"
              value={shopUpi}
              onChange={(e) => setShopUpi(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 font-bold text-indigo-700 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-3">
            {shopSaved && (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5" />
                Shop profile saved successfully! (দোকানের তথ্য সফলভাবে সেভ হয়েছে)
              </span>
            )}
            <button
              type="submit"
              className="ml-auto rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              Save Shop Details (দোকানের তথ্য সেভ করুন)
            </button>
          </div>
        </form>
      </div>

      {/* Modal 1: Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Create New Category (নতুন ক্যাটাগরি তৈরি করুন)
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              e.g. Xerox, Online Forms, Photo, PVC Card, Certificate (যেমন: জেরক্স, অনলাইন ফর্ম, পাসপোর্ট ছবি)
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lamination & PVC Card"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Bengali Name (বাংলা নাম - Optional)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: স্মার্ট কার্ড ও লেমিনেশন"
                  value={newCatBengali}
                  onChange={(e) => setNewCatBengali(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm"
                >
                  Cancel (বাতিল)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-95"
                >
                  Save Category (ক্যাটাগরি সেভ করুন)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Work / Service */}
      {showAddWorkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Add Work & Rate (নতুন কাজ ও রেট যোগ করুন)
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Pre-define service name and default charge (কাজের নাম ও কত টাকা নেবেন তা সেট করুন).
            </p>

            <form onSubmit={handleCreateWork} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Work Category (কাজের ক্যাটাগরি) *
                </label>
                <select
                  value={selectedCatForNewWork}
                  onChange={(e) => setSelectedCatForNewWork(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.bengaliName ? `(${c.bengaliName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Work / Service Name (কাজের নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A4 Color Print Single Side"
                  value={newWorkName}
                  onChange={(e) => setNewWorkName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Rate ₹ (রেট টাকা) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newWorkRate}
                    onChange={(e) => setNewWorkRate(Number(e.target.value) || 0)}
                    className="w-full rounded-2xl border border-slate-300 p-3 text-base font-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Unit (একক)</label>
                  <select
                    value={newWorkUnit}
                    onChange={(e) => setNewWorkUnit(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="page">page (প্রতি পেজ)</option>
                    <option value="copy">copy (প্রতি কপি)</option>
                    <option value="form">form (প্রতি ফর্ম)</option>
                    <option value="piece">piece (প্রতি পিস)</option>
                    <option value="set">set (প্রতি সেট)</option>
                    <option value="item">item (প্রতিটি)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddWorkModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm"
                >
                  Cancel (বাতিল)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-95"
                >
                  Save Work (কাজটি সেভ করুন)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={
          deleteTarget?.type === 'category'
            ? 'Delete this category? (ক্যাটাগরি মুছে ফেলতে চান?)'
            : 'Delete this service? (কাজের এন্ট্রি মুছে ফেলতে চান?)'
        }
        itemName={deleteTarget?.name}
        warningText={
          deleteTarget?.type === 'category'
            ? 'All services and rate settings under this category will be permanently removed. (এই ক্যাটাগরি এবং এর আওতাধীন সমস্ত কাজের রেট স্থায়ীভাবে মুছে যাবে।)'
            : 'This service will be permanently removed from your price list. (এই কাজটি রেট তালিকা থেকে মুছে যাবে।)'
        }
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'category') {
            deleteCategory(deleteTarget.id);
          } else {
            deleteService(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

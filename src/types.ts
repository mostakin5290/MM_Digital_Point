export interface Category {
  id: string;
  name: string;
  bengaliName?: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  rate: number;
  unit: string;
}

export interface BillItem {
  id: string;
  categoryId?: string;
  categoryName: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  rate: number;
  amount: number;
  unit?: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  tokenNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items?: BillItem[];
  categoryName: string;
  serviceName: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: 'cash' | 'upi' | 'due';
  status: 'completed' | 'due';
  notes?: string;
}

export interface ShopInfo {
  name: string;
  phone: string;
  address: string;
  upiId: string;
}

export interface AppData {
  shop: ShopInfo;
  categories: Category[];
  services: Service[];
  transactions: Transaction[];
}

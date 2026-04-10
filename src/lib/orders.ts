export interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface OrderRecord {
  orderId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: "card" | "upi" | "netbanking" | "wallet" | "cod";
  address: string;
  phone: string;
  orderedAt: string;
}

const ORDER_HISTORY_KEY = "ai-shop-order-history";

export function getOrderHistory(): OrderRecord[] {
  const raw = window.localStorage.getItem(ORDER_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OrderRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendOrder(order: OrderRecord): void {
  const existing = getOrderHistory();
  const updated = [order, ...existing];
  window.localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(updated));
}

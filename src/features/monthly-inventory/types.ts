export interface InventoryItem {
  id: number;
  receipt_id: number;
  name: string;
  brand: string | null;
  quantity: number;
  unit_cost: number;
  category: string;
  status: string;
  storage_condition: string;
  date_purchased: string;
  date_expiry: string | null;
}

export interface MonthlyReceiptInventory {
  id: number;
  store_name: string;
  total_amount: number;
  total_discount: number;
  purchase_date: string;
  bank_statement_linked: boolean;
  created_at: string;
  items: InventoryItem[];
}
import { useState, useEffect } from "react";
import type { MonthlyReceiptInventory } from "../types";

export const useMonthlyInventory = () => {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12 range
  const [year, setYear] = useState<number>(now.getFullYear());
  const [receipts, setReceipts] = useState<MonthlyReceiptInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      const url = `http://localhost:8000/inventory-management/receipts/month?year=${year}&month=${month}`;

      try {
        const res = await fetch(url, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`Inventory server returned status: ${res.status}`);
        
        const data: MonthlyReceiptInventory[] = await res.json();
        setReceipts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory records");
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [month, year]);

  const updateItemStatus = async (
    itemName: string,
    purchaseDate: string,
    newStatus: string,
    receiptId: number,
    itemId: number
  ) => {
    try {
      const response = await fetch("http://localhost:8000/inventory/item/status", {
        method: "PUT",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_name: itemName,
          purchase_date: purchaseDate,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update item status on backend");

      // Update state locally
      setReceipts((prevReceipts) =>
        prevReceipts.map((rec) => {
          if (rec.id !== receiptId) return rec;
          return {
            ...rec,
            items: rec.items.map((item) =>
              item.id === itemId ? { ...item, status: newStatus } : item
            ),
          };
        })
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert("Could not update item status. Please check your connection.");
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  return {
    month,
    year,
    setYear,
    receipts,
    loading,
    error,
    handlePrevMonth,
    handleNextMonth,
    updateItemStatus,
  };
};
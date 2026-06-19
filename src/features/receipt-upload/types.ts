export interface ReceiptUploadResponse {
  status: string;
  receipt_id: number;
  merchant: string;
  linked_to_bank_ledger: boolean;
  message: string;
}
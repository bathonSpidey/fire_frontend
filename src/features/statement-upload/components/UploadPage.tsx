import React from "react";
import { ReceiptUploadSection } from "../../receipt-upload/components/ReceiptUploadSection";
import pageStyles from "../styles/UploadPage.module.css";

// One place for everything: Claude reads each document, decides whether it is a receipt or a
// bank statement, stores it and links it to what is already known.
export const UploadPage: React.FC = () => (
  <div className={pageStyles.container}>
    <ReceiptUploadSection />
  </div>
);

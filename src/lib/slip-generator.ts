import { jsPDF } from "jspdf";

export interface PaymentSlipData {
  paymentId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  gymName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  membershipPlan: string;
  description: string;
  transactionId?: string;
}

export const generatePaymentSlip = (data: PaymentSlipData): string => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Header background
  pdf.setFillColor(13, 108, 242);
  pdf.rect(0, 0, pageWidth, 40, "F");

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("PAYMENT RECEIPT", margin, 25);

  // Gym name
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.gymName, pageWidth - margin, 25, { align: "right" });

  // Receipt details
  let yPosition = 55;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);

  // Receipt ID
  pdf.setFont("helvetica", "bold");
  pdf.text("Receipt #:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.paymentId.slice(0, 12).toUpperCase(), margin + 40, yPosition);
  yPosition += 8;

  // Date
  pdf.setFont("helvetica", "bold");
  pdf.text("Date:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  const formattedDate = new Date(data.paymentDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(formattedDate, margin + 40, yPosition);
  yPosition += 10;

  // Separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Member information
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("MEMBER INFORMATION", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Name: ${data.memberName}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${data.memberEmail}`, margin, yPosition);
  yPosition += 6;
  if (data.memberPhone) {
    pdf.text(`Phone: ${data.memberPhone}`, margin, yPosition);
    yPosition += 6;
  }
  yPosition += 4;

  // Payment details
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("PAYMENT DETAILS", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Plan: ${data.membershipPlan.toUpperCase()}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Description: ${data.description}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Payment Method: ${data.paymentMethod}`, margin, yPosition);
  yPosition += 6;

  if (data.transactionId) {
    pdf.text(`Transaction ID: ${data.transactionId}`, margin, yPosition);
    yPosition += 6;
  }

  yPosition += 6;

  // Amount box
  pdf.setDrawColor(13, 108, 242);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition - 5, pageWidth - margin * 2, 20);

  pdf.setFillColor(13, 108, 242);
  pdf.rect(margin, yPosition - 5, pageWidth - margin * 2, 10, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("AMOUNT DUE", margin + 5, yPosition + 1);

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `${data.currency} ${data.amount.toFixed(2)}`,
    pageWidth - margin - 5,
    yPosition + 8,
    { align: "right" },
  );

  yPosition += 22;

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont("helvetica", "normal");
  pdf.text("Thank you for your payment!", pageWidth / 2, pageHeight - 15, {
    align: "center",
  });

  return pdf.output("dataurlstring");
};

export const downloadPaymentSlip = (
  data: PaymentSlipData,
  filename: string = "payment-receipt.pdf",
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Header background
  pdf.setFillColor(13, 108, 242);
  pdf.rect(0, 0, pageWidth, 40, "F");

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("PAYMENT RECEIPT", margin, 25);

  // Gym name
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.gymName, pageWidth - margin, 25, { align: "right" });

  // Receipt details
  let yPosition = 55;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);

  // Receipt ID
  pdf.setFont("helvetica", "bold");
  pdf.text("Receipt #:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.paymentId.slice(0, 12).toUpperCase(), margin + 40, yPosition);
  yPosition += 8;

  // Date
  pdf.setFont("helvetica", "bold");
  pdf.text("Date:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  const formattedDate = new Date(data.paymentDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(formattedDate, margin + 40, yPosition);
  yPosition += 10;

  // Separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Member information
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("MEMBER INFORMATION", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Name: ${data.memberName}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${data.memberEmail}`, margin, yPosition);
  yPosition += 6;
  if (data.memberPhone) {
    pdf.text(`Phone: ${data.memberPhone}`, margin, yPosition);
    yPosition += 6;
  }
  yPosition += 4;

  // Payment details
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("PAYMENT DETAILS", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Plan: ${data.membershipPlan.toUpperCase()}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Description: ${data.description}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Payment Method: ${data.paymentMethod}`, margin, yPosition);
  yPosition += 6;

  if (data.transactionId) {
    pdf.text(`Transaction ID: ${data.transactionId}`, margin, yPosition);
    yPosition += 6;
  }

  yPosition += 6;

  // Amount box
  pdf.setDrawColor(13, 108, 242);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition - 5, pageWidth - margin * 2, 20);

  pdf.setFillColor(13, 108, 242);
  pdf.rect(margin, yPosition - 5, pageWidth - margin * 2, 10, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("AMOUNT DUE", margin + 5, yPosition + 1);

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `${data.currency} ${data.amount.toFixed(2)}`,
    pageWidth - margin - 5,
    yPosition + 8,
    { align: "right" },
  );

  yPosition += 22;

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont("helvetica", "normal");
  pdf.text("Thank you for your payment!", pageWidth / 2, pageHeight - 15, {
    align: "center",
  });

  pdf.save(filename);
};

import React, { useState } from "react";
import toast from "react-hot-toast";
import { sendPaymentReceipt } from "@/lib/whatsapp-service";
import Button from "@/components/common/Button";

interface ResendPaymentSlipProps {
  gymId: string;
  memberId: string;
  memberName: string;
  paymentId: string;
  pdfUrl: string;
  isCompact?: boolean;
  onSuccess?: () => void;
}

export default function ResendPaymentSlip({
  gymId,
  memberId,
  memberName,
  paymentId,
  pdfUrl,
  isCompact = false,
  onSuccess,
}: ResendPaymentSlipProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);

    try {
      const result = await sendPaymentReceipt(
        gymId,
        memberId,
        pdfUrl,
        memberName,
      );

      if (result.success) {
        toast.success(`Payment receipt sent to ${memberName}`);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to send receipt");
      }
    } catch (error) {
      console.error("Error resending payment slip:", error);
      toast.error("Error sending receipt");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompact) {
    return (
      <button
        onClick={handleResend}
        disabled={isLoading}
        className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Send payment receipt via WhatsApp"
      >
        {isLoading ? "Sending..." : "WhatsApp"}
      </button>
    );
  }

  return (
    <Button
      onClick={handleResend}
      isLoading={isLoading}
      variant="primary"
      size="sm"
    >
      📱 Send Receipt via WhatsApp
    </Button>
  );
}

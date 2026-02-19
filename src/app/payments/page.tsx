"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

export default function PaymentsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <Button variant="primary">+ Record Payment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div>
            <p className="text-gray-600 text-sm mb-2">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-800">$15,420</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-gray-600 text-sm mb-2">Pending Payments</p>
            <p className="text-3xl font-bold text-orange-600">12</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-gray-600 text-sm mb-2">Overdue Payments</p>
            <p className="text-3xl font-bold text-red-600">5</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Payment history will be displayed here
          </p>
          <p className="text-gray-400">Features coming soon...</p>
        </div>
      </Card>
    </div>
  );
}

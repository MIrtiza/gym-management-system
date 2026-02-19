"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

export default function AttendancePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <Button variant="primary">Check In/Out</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Today's Attendance">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Attendance log will be displayed here
            </p>
          </div>
        </Card>
        <Card title="Attendance History">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Historical data will be displayed here
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

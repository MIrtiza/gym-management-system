"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import Link from "next/link";

export default function MembershipsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Memberships</h1>
        <Link href="/memberships/new">
          <Button variant="primary">+ New Membership</Button>
        </Link>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Membership list will be displayed here
          </p>
          <p className="text-gray-400">Features coming soon...</p>
        </div>
      </Card>
    </div>
  );
}

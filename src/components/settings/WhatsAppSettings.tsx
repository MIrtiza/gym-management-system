import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getGymWhatsAppConfig,
  updateGymWhatsAppConfig,
} from "@/lib/whatsapp-service";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

interface WhatsAppSettingsProps {
  gymId: string;
}

export default function WhatsAppSettings({ gymId }: WhatsAppSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    gym_display_name: "", // Used to populate the {{3}} variable in your shared template
    is_whatsapp_enabled: false,
  });

  useEffect(() => {
    loadConfig();
  }, [gymId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const result = await getGymWhatsAppConfig(gymId);
      if (result.success && result.config) {
        setConfig({
          gym_display_name: result.config.gym_display_name || "",
          is_whatsapp_enabled: result.config.is_whatsapp_enabled || false,
        });
      }
    } catch (error) {
      console.error("Error loading WhatsApp config:", error);
      toast.error("Failed to load WhatsApp settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateGymWhatsAppConfig(gymId, config);
      if (result.success) {
        toast.success("WhatsApp alerts updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving WhatsApp config:", error);
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (isLoading) {
    return (
      <Card title="WhatsApp Notifications">
        <div className="text-center py-8">Loading settings...</div>
      </Card>
    );
  }

  return (
    <Card title="WhatsApp Notifications">
      <div className="space-y-6">
        {/* Simplified Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-1">
            Automated Customer Receipts
          </h4>
          <p className="text-sm text-green-800">
            Enable this feature to automatically send payment receipts and
            membership milestones to your members via our verified WhatsApp
            notification channel.
          </p>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Gym Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gym Name in Messages
            </label>
            <input
              type="text"
              name="gym_display_name"
              value={config.gym_display_name}
              onChange={handleInputChange}
              placeholder="e.g., ABC Fitness Studio"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be injected into the automated receipt text
              template.
            </p>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <input
              type="checkbox"
              name="is_whatsapp_enabled"
              checked={config.is_whatsapp_enabled}
              onChange={handleInputChange}
              id="whatsapp_enabled"
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="whatsapp_enabled" className="flex-1 cursor-pointer">
              <span className="font-medium text-gray-900">
                Enable Automated WhatsApp Messages
              </span>
              <p className="text-xs text-gray-600 mt-1">
                When active, adding a payment entry for a member immediately
                messages their phone number.
              </p>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={loadConfig}
            variant="secondary"
            isLoading={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

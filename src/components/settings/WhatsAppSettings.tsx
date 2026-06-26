import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getGymWhatsAppConfig,
  updateGymWhatsAppConfig,
} from "@/lib/whatsapp-service";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

interface WhatsAppSettingsProps {
  gymId: string;
}

export default function WhatsAppSettings({ gymId }: WhatsAppSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    whatsapp_phone_number_id: "",
    whatsapp_waba_id: "",
    whatsapp_access_token: "",
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
          whatsapp_phone_number_id:
            result.config.whatsapp_phone_number_id || "",
          whatsapp_waba_id: result.config.whatsapp_waba_id || "",
          whatsapp_access_token: result.config.whatsapp_access_token || "",
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
        toast.success("WhatsApp settings updated successfully");
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
      <Card title="WhatsApp Configuration">
        <div className="text-center py-8">Loading...</div>
      </Card>
    );
  }

  return (
    <Card title="WhatsApp Configuration">
      <div className="space-y-6">
        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Setup Instructions
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create a WhatsApp Business Account on Meta</li>
            <li>
              Get your Phone Number ID from the WhatsApp Business Dashboard
            </li>
            <li>Generate a permanent access token</li>
            <li>Obtain your WABA (WhatsApp Business Account) ID</li>
            <li>Paste the credentials below and enable WhatsApp</li>
          </ol>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Phone Number ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number ID
            </label>
            <input
              type="text"
              name="whatsapp_phone_number_id"
              value={config.whatsapp_phone_number_id}
              onChange={handleInputChange}
              placeholder="e.g., 1234567890123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in WhatsApp Business Dashboard → Phone Numbers
            </p>
          </div>

          {/* WABA ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Business Account (WABA) ID
            </label>
            <input
              type="text"
              name="whatsapp_waba_id"
              value={config.whatsapp_waba_id}
              onChange={handleInputChange}
              placeholder="e.g., 1234567890123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in WhatsApp Business Dashboard → Settings
            </p>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permanent Access Token
            </label>
            <input
              type="password"
              name="whatsapp_access_token"
              value={config.whatsapp_access_token}
              onChange={handleInputChange}
              placeholder="Enter your permanent access token"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Generate in Meta App Dashboard → Settings → System Users → Token
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
                Enable WhatsApp Integration
              </span>
              <p className="text-xs text-gray-600 mt-1">
                When enabled, payment receipts and membership reminders will be
                sent via WhatsApp
              </p>
            </label>
          </div>
        </div>

        {/* Warning */}
        {config.is_whatsapp_enabled && !config.whatsapp_access_token && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>⚠️ Warning:</strong> WhatsApp is enabled but credentials
              are incomplete. Please provide all required information.
            </p>
          </div>
        )}

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
            Save Settings
          </Button>
        </div>
      </div>
    </Card>
  );
}

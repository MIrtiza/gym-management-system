"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import {
  getGymInfo,
  getGymInfoByOwnerId,
  updateGymInfo,
  type GymData,
  type StaffMember,
} from "@/lib/gym-service";
import { changePassword, updateUserMetadata } from "@/lib/auth-service";
import {
  COUNTRY_PHONE_FORMATS,
  formatPhoneNumber,
  normalizePhoneDigits,
  validatePhoneNumber,
} from "@/lib/utils";
import WhatsAppSettings from "@/components/settings/WhatsAppSettings";

type PhoneCountryCode = keyof typeof COUNTRY_PHONE_FORMATS;

interface GeneralSettings {
  gym_name: string;
  email: string;
  address: string;
  phoneCountry: PhoneCountryCode;
  phone: string;
}

const initialGeneralSettings: GeneralSettings = {
  gym_name: "",
  email: "",
  address: "",
  phoneCountry: "US",
  phone: "",
};

interface BusinessHourSlot {
  label: string;
  from: string;
  to: string;
}

export default function SettingsPage() {
  const { user, refreshAuthUser } = useAuth();
  const gymId = user?.user_metadata?.gym_id;

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(
    initialGeneralSettings,
  );
  const [businessHours, setBusinessHours] = useState<BusinessHourSlot[]>([
    { label: "Mon - Fri", from: "05:00 AM", to: "11:00 PM" },
    { label: "Saturday", from: "07:00 AM", to: "09:00 PM" },
    { label: "Sunday", from: "08:00 AM", to: "06:00 PM" },
  ]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [gym, setGym] = useState<GymData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const businessHoursStorageKey = gymId
    ? `gym-${gymId}-business-hours`
    : "gym-business-hours";

  useEffect(() => {
    if (!businessHoursStorageKey) return;

    const saved = localStorage.getItem(businessHoursStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BusinessHourSlot[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBusinessHours(parsed);
        }
      } catch {
        // ignore malformed storage
      }
    }
  }, [businessHoursStorageKey]);

  useEffect(() => {
    if (!businessHoursStorageKey) return;
    localStorage.setItem(
      businessHoursStorageKey,
      JSON.stringify(businessHours),
    );
  }, [businessHours, businessHoursStorageKey]);

  useEffect(() => {
    if (gymId || user?.id) {
      loadSettings();
    }
  }, [gymId, user?.id]);

  const loadSettings = async () => {
    if (!gymId && !user?.id) return;
    setIsLoading(true);

    try {
      let result = gymId ? await getGymInfo(gymId) : null;

      if (!result?.success && user?.id) {
        result = await getGymInfoByOwnerId(user.id);
      }

      if (result?.success && result.gym) {
        const gymData = result.gym;
        setGym(gymData);

        const normalizedPhone = gymData.phone ?? "";
        const inferredCountry =
          (
            Object.entries(COUNTRY_PHONE_FORMATS) as Array<
              [
                PhoneCountryCode,
                (typeof COUNTRY_PHONE_FORMATS)[PhoneCountryCode],
              ]
            >
          ).find(([_, format]) =>
            normalizedPhone
              .replace(/\D/g, "")
              .startsWith(format.code.replace("+", "")),
          )?.[0] ?? "US";

        let parsedHours = businessHours;
        if (gymData.business_hours) {
          try {
            const parsed =
              typeof gymData.business_hours === "string"
                ? JSON.parse(gymData.business_hours)
                : gymData.business_hours;

            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedHours = parsed;
            }
          } catch {
            // ignore invalid JSON and keep current defaults/local values
          }
        }

        let parsedStaff: StaffMember[] = [];
        if (gymData.staff_members) {
          try {
            const parsed =
              typeof gymData.staff_members === "string"
                ? JSON.parse(gymData.staff_members)
                : gymData.staff_members;

            if (Array.isArray(parsed)) {
              parsedStaff = parsed;
            }
          } catch {
            // ignore invalid JSON and keep empty staff list
          }
        }

        setGeneralSettings({
          gym_name: gymData.gym_name ?? "",
          email: gymData.email ?? "",
          address: gymData.address ?? "",
          phoneCountry: inferredCountry,
          phone: normalizedPhone,
        });
        setBusinessHours(parsedHours);
        setStaffMembers(parsedStaff);
      } else {
        console.error("Gym settings load failed:", result?.error);
        toast.error(result?.error || "Failed to load settings");
      }
    } catch (error) {
      console.error("Error loading gym settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.currentTarget;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setGeneralSettings((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
      return;
    }

    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateBusinessHour = (
    index: number,
    field: keyof BusinessHourSlot,
    value: string,
  ) => {
    setBusinessHours((prev) =>
      prev.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const addBusinessHourSlot = () => {
    setBusinessHours((prev) => [
      ...prev,
      { label: "New Slot", from: "09:00 AM", to: "05:00 PM" },
    ]);
  };

  const removeBusinessHourSlot = (index: number) => {
    setBusinessHours((prev) =>
      prev.filter((_, slotIndex) => slotIndex !== index),
    );
  };

  const updateStaffMember = (
    index: number,
    field: keyof StaffMember,
    value: string,
  ) => {
    setStaffMembers((prev) =>
      prev.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const addStaffMember = () => {
    const newMember: StaffMember = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}`,
      name: "",
      role: "Trainer",
      status: "active",
      avatar_url: null,
    };

    setStaffMembers((prev) => [...prev, newMember]);
  };

  const removeStaffMember = (index: number) => {
    setStaffMembers((prev) =>
      prev.filter((_, memberIndex) => memberIndex !== index),
    );
  };

  const handleSaveStaffMembers = async () => {
    if (!gymId) return;
    setIsSavingStaff(true);

    try {
      const result = await updateGymInfo(gymId, {
        staff_members: staffMembers,
      });

      if (result.success) {
        toast.success("Staff members updated successfully");
        await loadSettings();
      } else {
        toast.error(result.error || "Failed to save staff members");
      }
    } catch (error) {
      console.error("Error saving staff members:", error);
      toast.error("Failed to save staff members");
    } finally {
      setIsSavingStaff(false);
    }
  };

  const handlePasswordInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      const errorMessage = "Current password is required";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!passwordData.newPassword) {
      const errorMessage = "New password is required";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 12) {
      toast.error("New password must be at least 12 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      const successMessage = "Password updated successfully";
      setPasswordSuccess(successMessage);
      toast.success(successMessage);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      const message =
        error?.message || "Failed to update password. Check current password.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    if (!gymId) return;
    setIsSaving(true);

    try {
      const validation = validatePhoneNumber(
        generalSettings.phone,
        generalSettings.phoneCountry,
      );

      if (!validation.valid) {
        toast.error(validation.error || "Invalid phone number");
        setIsSaving(false);
        return;
      }

      const normalizedResult = normalizePhoneDigits(
        generalSettings.phone,
        generalSettings.phoneCountry,
      );

      if (normalizedResult.error) {
        toast.error(normalizedResult.error);
        setIsSaving(false);
        return;
      }

      const normalizedNumber = normalizedResult.normalized;
      const formattedPhone = formatPhoneNumber(
        normalizedNumber,
        generalSettings.phoneCountry,
      );

      const result = await updateGymInfo(gymId, {
        gym_name: generalSettings.gym_name,
        email: generalSettings.email,
        address: generalSettings.address,
        phone: formattedPhone,
        business_hours: businessHours,
      });

      if (result.success) {
        toast.success("General settings updated successfully");

        if (user && generalSettings.gym_name) {
          try {
            await updateUserMetadata({ gym_name: generalSettings.gym_name });
            await refreshAuthUser();
          } catch (metadataError) {
            console.error("Failed to update auth gym name:", metadataError);
          }
        }

        await loadSettings();
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving gym settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* General Settings */}
      <section id="general" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              General Settings
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage core gym identity and operational hours.
            </p>
          </div>
        </div>
        <div className="bg-slate-900/70 dark:bg-slate-900/70 rounded-xl p-8 shadow-lg space-y-8 border border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Gym Name
              </label>
              <input
                type="text"
                name="gym_name"
                value={generalSettings.gym_name}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                placeholder="IronCore Performance Center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={generalSettings.email}
                autoComplete=""
                onChange={handleInputChange}
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                placeholder="ops@ironcoregym.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={generalSettings.address}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                placeholder="742 Powerhouse Ave, Suite 100, Austin, TX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Phone Number
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
                <select
                  name="phoneCountry"
                  value={generalSettings.phoneCountry}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                >
                  {(
                    Object.entries(COUNTRY_PHONE_FORMATS) as Array<
                      [
                        PhoneCountryCode,
                        (typeof COUNTRY_PHONE_FORMATS)[PhoneCountryCode],
                      ]
                    >
                  ).map(([country, config]) => (
                    <option key={country} value={country}>
                      {country} ({config.code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="phone"
                  value={generalSettings.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                  placeholder={`${COUNTRY_PHONE_FORMATS[generalSettings.phoneCountry].code} 555 000 0000`}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60">
            <div className="flex items-center justify-between gap-4 mb-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Business Hours
              </label>
              <button
                type="button"
                onClick={handleSaveGeneralSettings}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving || isLoading}
              >
                {isSaving ? "Saving..." : "Save General Settings"}
              </button>
            </div>
            <div className="space-y-4">
              {businessHours.map((slot, index) => (
                <div
                  key={index}
                  className="bg-slate-900 rounded-lg p-4 border border-slate-800/70"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      type="text"
                      value={slot.label}
                      onChange={(e) =>
                        updateBusinessHour(index, "label", e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                      placeholder="Slot name"
                    />
                    <button
                      type="button"
                      onClick={() => removeBusinessHourSlot(index)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-red-500 hover:text-red-400 transition"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                    <input
                      type="text"
                      value={slot.from}
                      onChange={(e) =>
                        updateBusinessHour(index, "from", e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                      placeholder="From"
                    />
                    <input
                      type="text"
                      value={slot.to}
                      onChange={(e) =>
                        updateBusinessHour(index, "to", e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                      placeholder="To"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addBusinessHourSlot}
                className="w-full rounded-lg border border-dashed border-slate-700 px-4 py-3 text-sm font-semibold text-slate-400 hover:border-primary hover:text-primary transition"
              >
                + Add Slot
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Management */}
      <section id="staff" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Staff Management
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage roles and permissions for your team.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={addStaffMember}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>➕</span>
              Add Staff Member
            </button>
            <button
              type="button"
              onClick={handleSaveStaffMembers}
              className="inline-flex items-center justify-center rounded-lg bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSavingStaff || isLoading}
            >
              {isSavingStaff ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-xl shadow-lg overflow-hidden border border-slate-800/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800/60">
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-8 text-center text-slate-400"
                  >
                    No staff members have been added yet.
                  </td>
                </tr>
              ) : (
                staffMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-800/80 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                          {member.name
                            ? member.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()
                            : "S"}
                        </div>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) =>
                            updateStaffMember(index, "name", e.target.value)
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                          placeholder="Staff name"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateStaffMember(index, "role", e.target.value)
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                      >
                        <option value="Trainer">Trainer</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <select
                        value={member.status}
                        onChange={(e) =>
                          updateStaffMember(index, "status", e.target.value)
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="offline">Offline</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => removeStaffMember(index)}
                        className="text-slate-400 hover:text-white"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="scroll-mt-24 space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Security &amp; Access
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Protect your administrative console.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <div className="bg-slate-900/70 rounded-xl p-8 shadow-lg border border-slate-800/60">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="text-primary">🔒</span>
              Change Password
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                />
                {passwordError && (
                  <small className="text-sm text-rose-400 block mt-1">
                    {passwordError}
                  </small>
                )}
                {passwordSuccess && (
                  <small className="text-sm text-emerald-400 block mt-1">
                    {passwordSuccess}
                  </small>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Min. 12 characters"
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-900 border-none rounded-lg p-3 text-slate-50 focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={isSavingPassword}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Save changes bar (local to page content) */}
        <div className="mt-10 bg-slate-900/90 border border-primary/10 px-6 py-4 rounded-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-2xl">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="text-primary animate-pulse">🔄</span>
            <span>
              Unsaved changes detected in{" "}
              <strong>Membership Configuration</strong>
            </span>
          </div>
          <div className="flex gap-4 justify-end">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">
              Discard
            </button>
            <button className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-xl shadow-primary/25 hover:scale-[1.03] active:scale-95 transition-all">
              Save All Changes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

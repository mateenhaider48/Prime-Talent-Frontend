"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  Lock,
  Eye,
  EyeOff,
  Save,
  MessageCircle,
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFacebook,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const API = {
  // ==========================================================
  // ADMIN PASSWORD
  // ==========================================================

  updatePassword: "/api/auth/change-password",

  // ==========================================================
  // SOCIAL SETTINGS
  // ==========================================================

  getSettings: "/api/settings",

  updateSettings: "/api/settings",
};

// ============================================================
// API HELPER
// ============================================================

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  try {
    // ========================================================
    // MAKE SURE ENDPOINT IS NOT DOUBLE CONCATENATED
    // ========================================================

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,

      credentials: "include",

      headers: {
        Accept: "application/json",

        ...(options.body
          ? {
              "Content-Type": "application/json",
            }
          : {}),

        ...(options.headers || {}),
      },
    });

    // ========================================================
    // READ RESPONSE SAFELY
    // ========================================================

    const text = await response.text();

    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        "Server returned an invalid response.",
      );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed with status ${response.status}.`,
      );
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return data?.data !== undefined
      ? {
          ...data,
          ...(
            data?.data &&
            typeof data.data === "object"
              ? data.data
              : {}
          ),
        }
      : data;
  } catch (error: any) {
    console.error("API Request Error:", error);

    throw new Error(
      error?.message ||
        "Something went wrong. Please try again.",
    );
  }
};

// ============================================================
// MAIN SETTINGS SECTION
// ============================================================

export default function SettingsSection() {
  return (
    <>
      {/* ======================================================
          TOASTER
      ====================================================== */}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* ======================================================
          SETTINGS
      ====================================================== */}

      <div className="space-y-6">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Settings
          </h1>

          <p className="mt-1 text-sm text-blue-200">
            Update your password and manage social media links.
          </p>
        </div>

        {/* ====================================================
            PASSWORD
        ==================================================== */}

        <PasswordCard />

        {/* ====================================================
            SOCIAL LINKS
        ==================================================== */}

        <SocialLinksCard />
      </div>
    </>
  );
}

// ============================================================
// PASSWORD CARD
// ============================================================

function PasswordCard() {
  const router = useRouter();

  // ==========================================================
  // PASSWORD STATES
  // ==========================================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ==========================================================
  // SHOW/HIDE STATES
  // ==========================================================

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // ==========================================================
  // SAVING
  // ==========================================================

  const [saving, setSaving] =
    useState(false);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    // ========================================================
    // CURRENT PASSWORD
    // ========================================================

    if (!currentPassword.trim()) {
      toast.error(
        "Please enter your current password.",
      );

      return;
    }

    // ========================================================
    // NEW PASSWORD
    // ========================================================

    if (!newPassword.trim()) {
      toast.error(
        "Please enter a new password.",
      );

      return;
    }

    // ========================================================
    // CONFIRM PASSWORD
    // ========================================================

    if (!confirmPassword.trim()) {
      toast.error(
        "Please confirm your new password.",
      );

      return;
    }

    // ========================================================
    // PASSWORD LENGTH
    // ========================================================

    if (newPassword.length < 8) {
      toast.error(
        "New password must be at least 8 characters.",
      );

      return;
    }

    // ========================================================
    // PASSWORD MATCH
    // ========================================================

    if (newPassword !== confirmPassword) {
      toast.error(
        "New password and confirm password do not match.",
      );

      return;
    }

    // ========================================================
    // START LOADING
    // ========================================================

    try {
      setSaving(true);

      // ======================================================
      // CHANGE PASSWORD API
      // ======================================================

      const response = await apiRequest(
        API.updatePassword,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      toast.success(
        response?.message ||
          "Password changed successfully.",
      );

      // ======================================================
      // CLEAR FIELDS
      // ======================================================

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      // ======================================================
      // BACKEND CLEARS AUTH COOKIES
      // SO LOGIN AGAIN
      // ======================================================

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (error: any) {
      console.error(
        "Change password error:",
        error,
      );

      toast.error(
        error?.message ||
          "Failed to change password.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
          <Lock size={19} />
        </div>

        <div>
          <h3 className="font-extrabold">
            Change Password
          </h3>

          <p className="mt-0.5 text-xs text-blue-200">
            Update your admin account password.
          </p>
        </div>
      </div>

      {/* ====================================================
          FORM
      ==================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* ==================================================
            CURRENT PASSWORD
        ================================================== */}

        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          setShow={setShowCurrent}
          disabled={saving}
        />

        {/* ==================================================
            NEW PASSWORD
        ================================================== */}

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          setShow={setShowNew}
          disabled={saving}
        />

        {/* ==================================================
            CONFIRM PASSWORD
        ================================================== */}

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          disabled={saving}
        />

        {/* ==================================================
            PASSWORD REQUIREMENT
        ================================================== */}

        <p className="text-xs text-blue-200">
          Password must be at least 8 characters.
        </p>

        {/* ==================================================
            UPDATE BUTTON
        ================================================== */}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#075fc1] shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Spinner />

              Updating...
            </>
          ) : (
            <>
              <Save size={16} />

              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// PASSWORD FIELD
// ============================================================

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div>
      {/* ====================================================
          LABEL
      ==================================================== */}

      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      {/* ====================================================
          INPUT
      ==================================================== */}

      <div className="relative">
        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          disabled={disabled}
          autoComplete={
            label === "Current Password"
              ? "current-password"
              : "new-password"
          }
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-white/10 bg-[#082f68] px-4 pr-12 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
        />

        {/* ==================================================
            SHOW/HIDE
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            setShow(!show)
          }
          disabled={disabled}
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL LINKS CARD
// ============================================================

interface SocialLinks {
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

function SocialLinksCard() {
  // ==========================================================
  // STATES
  // ==========================================================

  const [links, setLinks] =
    useState<SocialLinks>({
      whatsapp: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ==========================================================
  // LOAD EXISTING LINKS
  // ==========================================================

  useEffect(() => {
    const loadLinks = async () => {
      try {
        setLoading(true);

        const response =
          await apiRequest(
            API.getSettings,
          );

        setLinks({
          whatsapp:
            response?.whatsapp ||
            response?.data?.whatsapp ||
            "",

          facebook:
            response?.facebook ||
            response?.data?.facebook ||
            "",

          instagram:
            response?.instagram ||
            response?.data?.instagram ||
            "",

          linkedin:
            response?.linkedin ||
            response?.data?.linkedin ||
            "",
        });
      } catch (error: any) {
        console.error(
          "Load social links error:",
          error,
        );

        toast.error(
          error?.message ||
            "Failed to load social links.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, []);

  // ==========================================================
  // SAVE LINKS
  // ==========================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response =
        await apiRequest(
          API.updateSettings,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              links,
            ),
          },
        );

      toast.success(
        response?.message ||
          "Social links updated successfully.",
      );
    } catch (error: any) {
      console.error(
        "Update social links error:",
        error,
      );

      toast.error(
        error?.message ||
          "Failed to update social links.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const updateField = (
    field: keyof SocialLinks,
    value: string,
  ) => {
    setLinks((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
          <MessageCircle size={19} />
        </div>

        <div>
          <h3 className="font-extrabold">
            Social Media Links
          </h3>

          <p className="mt-0.5 text-xs text-blue-200">
            These links appear on the footer and floating buttons.
          </p>
        </div>
      </div>

      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm font-bold text-blue-200">
          <Spinner />

          <span className="ml-2">
            Loading links...
          </span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* ==================================================
              WHATSAPP
          ================================================== */}

          <SocialField
            icon={
              <MessageCircle
                size={18}
              />
            }
            label="WhatsApp Link"
            placeholder="https://wa.me/923001234567"
            value={links.whatsapp}
            onChange={(value) =>
              updateField(
                "whatsapp",
                value,
              )
            }
            disabled={saving}
          />

          {/* ==================================================
              FACEBOOK
          ================================================== */}

          <SocialField
            icon={
              <FontAwesomeIcon
                icon={faFacebook}
                size="2x"
              />
            }
            label="Facebook Link"
            placeholder="https://facebook.com/yourpage"
            value={links.facebook}
            onChange={(value) =>
              updateField(
                "facebook",
                value,
              )
            }
            disabled={saving}
          />

          {/* ==================================================
              INSTAGRAM
          ================================================== */}

          <SocialField
            icon={
              <FontAwesomeIcon
                icon={faInstagram}
                size="2x"
              />
            }
            label="Instagram Link"
            placeholder="https://instagram.com/yourpage"
            value={links.instagram}
            onChange={(value) =>
              updateField(
                "instagram",
                value,
              )
            }
            disabled={saving}
          />

          {/* ==================================================
              LINKEDIN
          ================================================== */}

          <SocialField
            icon={
              <FontAwesomeIcon
                icon={faLinkedin}
                size="2x"
              />
            }
            label="LinkedIn Link"
            placeholder="https://linkedin.com/company/yourpage"
            value={links.linkedin}
            onChange={(value) =>
              updateField(
                "linkedin",
                value,
              )
            }
            disabled={saving}
          />

          {/* ==================================================
              SAVE BUTTON
          ================================================== */}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#075fc1] shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Spinner />

                Saving...
              </>
            ) : (
              <>
                <Save size={16} />

                Save Social Links
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// ============================================================
// SOCIAL FIELD
// ============================================================

function SocialField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      {/* ====================================================
          LABEL
      ==================================================== */}

      <label className="mb-2 flex items-center gap-2 text-sm font-bold">
        {icon}

        {label}
      </label>

      {/* ====================================================
          INPUT
      ==================================================== */}

      <input
        type="url"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        disabled={disabled}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-white/10 bg-[#082f68] px-4 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
      />
    </div>
  );
}

// ============================================================
// SPINNER
// ============================================================

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
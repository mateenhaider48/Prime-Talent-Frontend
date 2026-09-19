"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { X, Upload, Plus, Trash2, UserRound } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface ProfileLink {
  title: string;
  url: string;
}

interface ProfessionalPromotionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfessionalPromotionModal({
  open,
  onClose,
}: ProfessionalPromotionModalProps) {
  const [loading, setLoading] = useState(false);

  const [completeName, setCompleteName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [writeBioForMe, setWriteBioForMe] = useState(false);

  const [photoOrLogo, setPhotoOrLogo] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [profileLinks, setProfileLinks] = useState<ProfileLink[]>([]);

  if (!open) return null;

  // ============================================================
  // IMAGE
  // ============================================================

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      toast.error("Image must be less than 30MB.");
      return;
    }

    setPhotoOrLogo(file);

    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPhotoOrLogo(null);
    setPreview(null);
  };

  // ============================================================
  // PROFILE LINKS
  // ============================================================

  const addProfileLink = () => {
    if (profileLinks.length >= 5) {
      toast.error("Maximum 5 profile links are allowed.");
      return;
    }

    setProfileLinks([
      ...profileLinks,
      {
        title: "",
        url: "",
      },
    ]);
  };

  const removeProfileLink = (index: number) => {
    setProfileLinks(profileLinks.filter((_, i) => i !== index));
  };

  const updateProfileLink = (
    index: number,
    field: keyof ProfileLink,
    value: string,
  ) => {
    setProfileLinks(
      profileLinks.map((link, i) =>
        i === index
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!completeName.trim()) {
      toast.error("Please enter your complete name.");
      return;
    }

    if (!professionalTitle.trim()) {
      toast.error("Please enter your professional title.");
      return;
    }

    if (!writeBioForMe && !bio.trim()) {
      toast.error("Please enter your bio or select Write Bio For Me.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("type", "professional");

      formData.append("completeName", completeName.trim());

      formData.append("professionalTitle", professionalTitle.trim());

      if (email.trim()) {
        formData.append("email", email.trim());
      }

      formData.append("bio", bio.trim());

      formData.append("writeBioForMe", String(writeBioForMe));

      formData.append("profileLinks", JSON.stringify(profileLinks));

      if (photoOrLogo) {
        formData.append("photoOrLogo", photoOrLogo);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/advertisement/create-request`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      const data = await response.json();

      toast.error(data?.message || "Failed to submit request.");
      

      toast.success("Your professional promotion request has been submitted!");

      onClose();

      // Reset
      setCompleteName("");
      setProfessionalTitle("");
      setEmail("");
      setBio("");
      setWriteBioForMe(false);
      setPhotoOrLogo(null);
      setPreview(null);
      setProfileLinks([]);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
       <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <div className="relative max-h-[92vh] w-full max-w-[700px] overflow-y-auto rounded-[25px] bg-gradient-to-b from-[#0125fc1] to-[#043b86] p-5 text-white shadow-2xl sm:p-8">
        {/* =====================================================
            CLOSE
        ====================================================== */}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <X size={22} />
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-7 pr-10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#075fc1] shadow-lg">
            <UserRound size={24} />
          </div>

          <h2 className="text-lg font-extrabold sm:text-4xl">
            Get Featured as a Professional
          </h2>

          <p className="mt-1 text-sm text-blue-100 sm:text-base">
            Showcase your professional talent and get featured.
          </p>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Complete Name{" "}
              <span className="text-[#AC0000] text-[20px]">*</span>
            </label>

            <input
              type="text"
              value={completeName}
              onChange={(e) => setCompleteName(e.target.value)}
              placeholder="Enter your complete name"
              maxLength={100}
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* PROFESSIONAL TITLE */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Professional Title{" "}
              <span className="text-[#AC0000] text-[20px]">*</span>
            </label>

            <input
              type="text"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              maxLength={100}
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Email <span className="text-[#AC0000] text-[20px]">*</span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* PHOTO */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Photo / Logo <span className="text-[#AC0000] text-[20px]">*</span>
            </label>

            {!preview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-7 text-center transition hover:bg-white/10">
                <Upload size={30} />

                <span className="mt-2 font-bold">Upload Photo or Logo</span>

                <span className="mt-1 text-xs text-blue-100">
                  PNG, JPG, WEBP — Max 30MB
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl bg-black/20 p-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-56 rounded-lg object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* BIO */}

          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-bold">Professional Bio</label>

              <span className="text-xs text-blue-200">{bio.length}/500</span>
            </div>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={writeBioForMe}
              maxLength={500}
              rows={5}
              placeholder={
                writeBioForMe
                  ? "We will write your professional bio."
                  : "Tell us about yourself..."
              }
              className="w-full resize-none rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300 disabled:bg-gray-200"
            />
          </div>

          {/* WRITE BIO */}

        <label className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-inner transition-all duration-300 hover:border-cyan-300/40 hover:bg-white/[0.10]">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
      ✨
    </div>

    <div>
      <p className="text-sm font-extrabold sm:text-base">
        Write Bio For Me
      </p>

      <p className="mt-0.5 text-xs text-blue-100">
        Let us create a professional bio for you.
      </p>
    </div>
  </div>

  {/* Custom Toggle */}
  <div className="relative shrink-0">
    <input
      type="checkbox"
      checked={writeBioForMe}
      onChange={(e) =>
        setWriteBioForMe(e.target.checked)
      }
      className="peer sr-only"
    />

    {/* Toggle Track */}
    <div
      className="
        h-4 w-8
        rounded-full
        bg-white/20
        shadow-inner
        ring-1 ring-white/20
        transition-all duration-300
        peer-checked:bg-cyan-400
        peer-checked:ring-cyan-300/50
      "
    />

    {/* Toggle Knob */}
    <div
      className="
        absolute left-0.5 top-0.5
        h-3 w-3
        rounded-full
        bg-white
        shadow-md
        transition-all duration-300
        peer-checked:translate-x-4
        peer-checked:shadow-[0_0_8px_rgba(103,232,249,0.9)]
      "
    />
  </div>
</label>

          {/* PROFILE LINKS */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-bold">Profile Links</p>

                <p className="text-xs text-blue-100">Add up to 5 links.</p>
              </div>

              <span className="text-xs text-blue-200">
                {profileLinks.length}/5
              </span>
            </div>

            <div className="space-y-3">
              {profileLinks.map((link, index) => (
                <div key={index} className="rounded-xl bg-white/5 p-3">
                  <div className="flex gap-2">
                    <input
                      value={link.title}
                      onChange={(e) =>
                        updateProfileLink(index, "title", e.target.value)
                      }
                      placeholder="e.g. LinkedIn"
                      className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm text-black outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeProfileLink(index)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateProfileLink(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-sm text-black outline-none"
                  />
                </div>
              ))}
            </div>

            {profileLinks.length < 5 && (
              <button
                type="button"
                onClick={addProfileLink}
                className="mt-3 flex w-full text-md items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 py-2 font-bold hover:bg-white/10"
              >
                <Plus size={18} />
                Add Profile Link
              </button>
            )}
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-base bg-white py-3 font-extrabold text-[#075fc1] shadow-xl transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Promotion Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

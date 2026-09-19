"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { X, Upload, Package } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface ProductPromotionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProductPromotionModal({
  open,
  onClose,
}: ProductPromotionModalProps) {
  const [loading, setLoading] = useState(false);

  const [brandBusinessName, setBrandBusinessName] = useState("");
  const [productNameDetails, setProductNameDetails] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [productStoreLink, setProductStoreLink] = useState("");
  const [email, setEmail] = useState("");

  const [productImage, setProductImage] = useState<File | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [wantsToProceed, setWantsToProceed] = useState(false);

  if (!open) return null;

  // ============================================================
  // IMAGE
  // ============================================================

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
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

    setProductImage(file);

    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
  };

  // ============================================================
  // VIDEO
  // ============================================================

  const handleVideoChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be less than 100MB.");
      return;
    }

    setProductVideo(file);

    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setProductVideo(null);
    setVideoPreview(null);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!brandBusinessName.trim()) {
      toast.error("Please enter your brand/business name.");
      return;
    }

    if (!productNameDetails.trim()) {
      toast.error("Please enter your product details.");
      return;
    }

    if (!productSubCategory.trim()) {
      toast.error("Please enter your product sub category.");
      return;
    }

    if (!productStoreLink.trim()) {
      toast.error("Please enter your product store link.");
      return;
    }

    if (!productImage) {
      toast.error("Please upload your product image.");
      return;
    }

    if (!wantsToProceed) {
      toast.error("Please confirm that you want to proceed.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("type", "product");

      formData.append(
        "brandBusinessName",
        brandBusinessName.trim(),
      );

      formData.append(
        "productNameDetails",
        productNameDetails.trim(),
      );

      formData.append(
        "productSubCategory",
        productSubCategory.trim(),
      );

      formData.append(
        "productStoreLink",
        productStoreLink.trim(),
      );

      if (email.trim()) {
        formData.append("email", email.trim());
      }

      formData.append(
        "wantsToProceed",
        String(wantsToProceed),
      );

      if (productImage) {
        formData.append("productImage", productImage);
      }

      if (productVideo) {
        formData.append("productVideo", productVideo);
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

      toast.error(
          data?.message ||
            "Failed to submit request.",
        );
      

      toast.success(
        "Your product promotion request has been submitted!",
      );

      onClose();

      // ========================================================
      // RESET
      // ========================================================

      setBrandBusinessName("");
      setProductNameDetails("");
      setProductSubCategory("");
      setProductStoreLink("");
      setEmail("");

      setProductImage(null);
      setProductVideo(null);

      setImagePreview(null);
      setVideoPreview(null);

      setWantsToProceed(false);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
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
      <div className="relative max-h-[92vh] w-full max-w-[700px] overflow-y-auto rounded-[25px] bg-gradient-to-b from-[#0125fc1] to-[#043b86] p-5 text-white shadow-2xl sm:p-8">
       <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

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
            <Package size={24} />
          </div>

          <h2 className="text-lg font-extrabold sm:text-4xl">
            Free Promotion of Your Best Products
          </h2>

          <p className="mt-1 text-sm text-blue-100 sm:text-base">
            Showcase your product and get free promotion.
          </p>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-2"
        >

          {/* BRAND / BUSINESS */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Brand / Business Name{" "}
              <span className="text-[#AC0000] text-[20px]">
                *
              </span>
            </label>

            <input
              type="text"
              value={brandBusinessName}
              onChange={(e) =>
                setBrandBusinessName(e.target.value)
              }
              placeholder="Enter your brand or business name"
              maxLength={100}
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* PRODUCT NAME / DETAILS */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Product Name & Details{" "}
              <span className="text-[#AC0000] text-[20px]">
                *
              </span>
            </label>

            <textarea
              value={productNameDetails}
              onChange={(e) =>
                setProductNameDetails(e.target.value)
              }
              placeholder="Enter product name and details"
              maxLength={2000}
              rows={5}
              className="w-full resize-none rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />

            <div className="mt-1 text-right text-xs text-blue-200">
              {productNameDetails.length}/2000
            </div>
          </div>

          {/* PRODUCT SUB CATEGORY */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Product Sub Category{" "}
              <span className="text-[#AC0000] text-[20px]">
                *
              </span>
            </label>

            <input
              type="text"
              value={productSubCategory}
              onChange={(e) =>
                setProductSubCategory(e.target.value)
              }
              placeholder="e.g. Mobile Accessories"
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* STORE LINK */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Product Store Link{" "}
              <span className="text-[#AC0000] text-[20px]">
                *
              </span>
            </label>

            <input
              type="url"
              value={productStoreLink}
              onChange={(e) =>
                setProductStoreLink(e.target.value)
              }
              placeholder="https://yourstore.com/product"
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="example@gmail.com"
              className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>

          {/* PRODUCT IMAGE */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Product Image{" "}
              <span className="text-[#AC0000] text-[20px]">
                *
              </span>
            </label>

            {!imagePreview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-7 text-center transition hover:bg-white/10">

                <Upload size={30} />

                <span className="mt-2 font-bold">
                  Upload Product Image
                </span>

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
                  src={imagePreview}
                  alt="Product Preview"
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

          {/* PRODUCT VIDEO */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Product Video
            </label>

            {!videoPreview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-7 text-center transition hover:bg-white/10">

                <Upload size={30} />

                <span className="mt-2 font-bold">
                  Upload Product Video
                </span>

                <span className="mt-1 text-xs text-blue-100">
                  MP4, MOV, WEBM — Max 100MB
                </span>

                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoChange}
                  className="hidden"
                />

              </label>
            ) : (
              <div className="relative rounded-xl bg-black/20 p-3">

                <video
                  src={videoPreview}
                  controls
                  className="mx-auto max-h-64 w-full rounded-lg object-contain"
                />

                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-red-500"
                >
                  <X size={18} />
                </button>

              </div>
            )}
          </div>

          {/* =====================================================
              CONFIRMATION
          ====================================================== */}

          <label className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-inner transition-all duration-300 hover:border-cyan-300/40 hover:bg-white/[0.10]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                ✨
              </div>

              <div>
                <p className="text-sm font-extrabold sm:text-base">
                  Proceed With Promotion
                </p>

                <p className="mt-0.5 text-xs text-blue-100">
                  I want to proceed with free product promotion.
                </p>
              </div>

            </div>

            {/* Custom Toggle */}

            <div className="relative shrink-0">

              <input
                type="checkbox"
                checked={wantsToProceed}
                onChange={(e) =>
                  setWantsToProceed(e.target.checked)
                }
                className="peer sr-only"
              />

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

          {/* =====================================================
              SUBMIT
          ====================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-base bg-white py-3 font-extrabold text-[#075fc1] shadow-xl transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : "Submit Promotion Request"}
          </button>

        </form>
      </div>
    </div>
  );
}
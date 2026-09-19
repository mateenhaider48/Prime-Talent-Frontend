"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ============================================================
   TYPES
   Backend model (VerifiedProduct) ke sath match
============================================================ */

interface VerifiedProduct {
  id: string;
  brandName: string;
  productName: string;
  description: string;
  couponCode?: string;
  discount?: string;
  storeLink: string;
  productImage?: string;
  productVideo?: string;
  isActive: boolean;
}

/* ============================================================
   API CONFIG
============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ACTIVE_PRODUCTS_ENDPOINT = "/api/verfiedProducts/active";

/* ============================================================
   HELPERS
============================================================ */

function extractArray<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.products)) return response.products;
  return [];
}

function normalizeProduct(item: any): VerifiedProduct {
  return {
    id: String(item?.id || item?._id || ""),
    brandName: item?.brandName || "",
    productName: item?.productName || "",
    description: item?.description || "",
    couponCode: item?.couponCode || "",
    discount: item?.discount || "",
    storeLink: item?.storeLink || "#",
    productImage: item?.productImage || "",
    productVideo: item?.productVideo || "",
    isActive: Boolean(item?.isActive),
  };
}

export default function VerifiedProductsPage() {
  const [products, setProducts] = useState<VerifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /* ==========================================================
     FETCH ACTIVE PRODUCTS (PUBLIC — no auth needed)
  ========================================================== */

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  interface SocialLinks {
    whatsapp: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  }
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
  });
  /* ==========================================================
     FETCH SETTINGS (public route)
  ========================================================== */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings`);

        if (!response.ok) return;

        const data = await response.json();

        const settingsData = data?.data || data;

        setSocialLinks({
          whatsapp: settingsData?.whatsapp || "",
          facebook: settingsData?.facebook || "",
          instagram: settingsData?.instagram || "",
          linkedin: settingsData?.linkedin || "",
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}${ACTIVE_PRODUCTS_ENDPOINT}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch verified products.");
        }

        const data = await response.json();
        const rawList = extractArray<any>(data);
        const normalized = rawList.map(normalizeProduct);

        setProducts(normalized);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load verified products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ==========================================================
     COPY COUPON
  ========================================================== */

  const copyCoupon = async (code: string) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Coupon code copied!");

      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch {
      toast.error("Failed to copy coupon code.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#087bd8] via-[#075fc1] to-[#043b83] text-white">
      {/* BACKGROUND GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      <div className="pointer-events-none fixed -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/40 blur-[90px]" />
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/30 blur-[90px]" />
      <div className="pointer-events-none fixed -right-16 -top-16 text-[190px] font-black text-blue-500/50 blur-md">
        ✦
      </div>
      <div className="pointer-events-none fixed -bottom-20 -right-16 text-[180px] font-black text-blue-500/40 blur-md">
        ✦
      </div>

      <div className="relative z-10 mx-auto w-full px-4 py-10 sm:px-6 sm:py-14">
        {/* HEADER */}
        <header className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#075fc1] shadow-xl">
            <Check size={30} strokeWidth={3} />
          </div>

          <h1 className="text-2xl font-extrabold leading-tight tracking-wide drop-shadow-md sm:text-5xl">
            Shop Verified Products
          </h1>

          <h2 className="mt-2 text-lg font-bold sm:text-3xl">
            & Exclusive Discounts
          </h2>

          <p className="mx-auto mt-5 max-w-[650px] text-sm font-medium leading-relaxed text-blue-100 sm:text-lg">
            Discover our hand-claimed collection of trusted products and brands
            backed by <strong className="text-white">Prime Talent PK</strong>. Grab
            your exclusive discounts and coupon codes below!
          </p>
        </header>

        {/* LOADING STATE */}
        {loading ? (
          <div className="mt-14 flex flex-col items-center justify-center gap-3 text-blue-100">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-sm font-bold">Loading verified products...</p>
          </div>
        ) : products.length === 0 ? (
          /* EMPTY STATE */
          <div className="mt-14 rounded-2xl border border-dashed border-white/20 bg-white/[0.05] py-16 text-center">
            <p className="text-lg font-extrabold">
              No verified products available right now.
            </p>
            <p className="mt-2 text-sm text-blue-100">
              Please check back later.
            </p>
          </div>
        ) : (
          /* PRODUCTS GRID */
          <section className="mt-8 grid w-full grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="
                  overflow-hidden
                  rounded-[22px]
                  border-[2px]
                  border-white/20
                  bg-gradient-to-b
                  from-[#073f86]
                  to-[#063571]
                  shadow-[0_0_18px_rgba(83,194,255,0.45),0_8px_12px_rgba(0,0,0,0.35)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-cyan-300/50
                  hover:shadow-[0_0_28px_rgba(83,194,255,0.7),0_10px_15px_rgba(0,0,0,0.4)]
                "
              >
                {/* PRODUCT IMAGE */}
                <div className="relative h-[210px] overflow-hidden sm:h-[280px]">
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.brandName}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/20 text-blue-200">
                      No Image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#063571] via-transparent to-transparent" />
                </div>

                {/* PRODUCT CONTENT */}
                <div className="p-5 sm:p-7">
                  <h3 className="text-xl font-extrabold sm:text-2xl">
                    {product.brandName}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">
                    {product.description}
                  </p>

                  {/* COUPON */}
                  {product.couponCode && (
                    <div className="mt-5 rounded-xl border border-dashed border-cyan-300/50 bg-cyan-400/10 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold text-cyan-200">
                            🎟️ COUPON CODE
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-extrabold tracking-wide text-[#075fc1]">
                              {product.couponCode}
                            </span>

                            <button
                              type="button"
                              onClick={() => copyCoupon(product.couponCode!)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                              title="Copy coupon code"
                            >
                              {copiedCode === product.couponCode ? (
                                <Check size={17} className="text-cyan-300" />
                              ) : (
                                <Copy size={17} />
                              )}
                            </button>
                          </div>
                        </div>

                        {product.discount && (
                          <p className="text-lg font-extrabold text-cyan-300">
                            {product.discount}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VISIT STORE */}

                  <a
                    href={product.storeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-4
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-white
                      py-3
                      px-3
                      text-md
                      font-extrabold
                      text-[#075fc1]
                      shadow-lg
                      transition
                      hover:-translate-y-0.5
                      hover:bg-blue-50
                    "
                  >
                    <ExternalLink size={26} />
                    Visit Store & Claim Discount
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* PARTNER CTA */}
        <section className="mt-8 rounded-[22px] border border-white/20 bg-white/[0.08] p-5 text-center shadow-xl backdrop-blur-sm sm:p-7">
          <p className="text-sm leading-relaxed text-blue-100 sm:text-base">
            Want your brand listed here?
            <br />
            <strong className="text-white">
              Send us a DM on Instagram or WhatsApp
            </strong>{" "}
            to join our verified trusted partners network.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`${socialLinks.instagram}/direct/inbox/`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#075fc1] transition hover:bg-blue-50"
            >
              Instagram DM
            </a>

            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-green-500 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-600"
            >
              WhatsApp
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pb-5 pt-10 text-center">
          <p className="text-sm text-blue-100">Developed by {" "}
                        <a
              href="https://mateen-portfolio.duckdns.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="portfolio"
            >
              M Mateen Haider
            </a></p>
          <p className="mt-1 text-sm text-blue-100">
            © {new Date().getFullYear()} Prime Talent PK. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

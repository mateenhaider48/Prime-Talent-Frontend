"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

import ProfessionalPromotionModal from "./components/ProfessionalPromotionModal";
import ProductPromotionModal from "./components/ProductPromotionModal";
import AdminPage from "./components/AdminDashboard";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";

export default function Home() {
  const router = useRouter();
/* ============================================================
   SETTINGS API
============================================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const [professionalModalOpen, setProfessionalModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false)
  const pathname = usePathname()


  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // jab tak mount na ho, kuch mat karo

    if (!isAuthenticated && pathname !== "/") {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // ⛔ Jab tak mount na ho, kabhi bhi role-based render mat karo
  if (!mounted) {
    return null; // ya ek loading spinner
  }

  if (user?.role === "admin") {
    return <AdminPage />;
  };
  
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#087bd8] via-[#075fc1] to-[#043b83] text-white">
      {/* =====================================================
          PROFESSIONAL PROMOTION MODAL
      ====================================================== */}

      <ProfessionalPromotionModal
        open={professionalModalOpen}
        onClose={() => setProfessionalModalOpen(false)}
      />

      <ProductPromotionModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
      />

      {/* =====================================================
          WHATSAPP FLOATING BUTTON
      ====================================================== */}

      <a
        href={socialLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-[30px]" />
      </a>

      {/* =====================================================
          BACKGROUND GRID
      ====================================================== */}

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      {/* =====================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/40 blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/30 blur-[90px]" />

      {/* Decorative shapes */}

      <div className="pointer-events-none absolute -right-16 -top-16 text-[190px] font-black text-blue-500/50 blur-md">
        ✦
      </div>

      <div className="pointer-events-none absolute -bottom-20 -right-16 text-[180px] font-black text-blue-500/40 blur-md">
        ✦
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[760px] flex-col px-4  sm:px-6">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="text-center">
        <img src={"/images/Landscape Logo.svg"} alt="logo"/>
          <p className="mt-5 text-md font-semibold tracking-wide sm:text-3xl">
            "Prime Talent PK" - Feature &amp; Promotion
          </p>
        </header>

        {/* ===================================================
            INTRO
        ==================================================== */}

        <section className="mt-9 px-1 sm:mt-12">
          <p className="text-lg font-medium leading-[1.48] sm:text-3xl">
            <span className="mr-1 bg-[#063c82] px-2 font-extrabold">
              Welcome!
            </span>{" "}
            Choose an option below to showcase your professional talent grow
            your business with{" "}
            <strong className="font-extrabold">Free Product Promotion</strong>{" "}
            or{" "}
            <strong className="font-extrabold">
              shop our trusted verified brands
            </strong>
          </p>
        </section>

        {/* ===================================================
            OPTIONS
        ==================================================== */}

        <section className="mt-4 flex flex-col gap-3 px-1 sm:mt-10 sm:gap-6">
          {/* =================================================
              PROFESSIONAL
          ================================================== */}

          <button
            type="button"
            onClick={() => setProfessionalModalOpen(true)}
            className="
              group
              relative
              flex
              min-h-[90px]
              w-full
              items-center
              rounded-[20px]
              border-[3px]
              border-black/30
              bg-gradient-to-b
              from-[#073f86]
              to-[#063571]
              px-4
              pr-[75px]
              text-left
              shadow-[0_0_18px_rgba(83,194,255,0.75),0_7px_8px_rgba(0,0,0,0.35)]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-[0_0_28px_rgba(83,194,255,0.95),0_10px_12px_rgba(0,0,0,0.4)]
              active:scale-[0.98]
              sm:min-h-[112px]
              sm:px-6
            "
          >
            <div className="flex flex-col leading-[1.05]">
              <span className="text-md font-extrabold sm:text-xl">
                Get Featured
              </span>

              <span className="text-base font-bold sm:text-xl">
                as a Professional <br />
                <small className="text-sm sm:text-base">(Talent Feature)</small>
              </span>
            </div>

            <div
              className="
                absolute
                right-3
                top-1/2
                flex
                h-[50px]
                w-[50px]
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#075fc1]
                shadow-md
                sm:right-4
                sm:h-[74px]
                sm:w-[74px]
              "
            >
              <Star size={30} fill="currentColor" strokeWidth={0} />
            </div>
          </button>

          {/* =================================================
              PRODUCT PROMOTION
          ================================================== */}

          <button
            type="button"
            onClick={() => setProductModalOpen(true)}
            className="
              group
              relative
              flex
              min-h-[90px]
              w-full
              items-center
              rounded-[20px]
              border-[3px]
              border-black/30
              bg-gradient-to-b
              from-[#073f86]
              to-[#063571]
              px-4
              pr-[75px]
              text-left
              shadow-[0_0_18px_rgba(83,194,255,0.75),0_7px_8px_rgba(0,0,0,0.35)]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-[0_0_28px_rgba(83,194,255,0.95),0_10px_12px_rgba(0,0,0,0.4)]
              active:scale-[0.98]
              sm:min-h-[112px]
              sm:px-6
            "
          >
            <div className="flex flex-col leading-[1.05]">
              <span className="text-md font-extrabold sm:text-xl">
                Free Promotion
              </span>

              <span className="text-base font-bold sm:text-xl">
                of Your Best Products
              </span>
            </div>

            <div
              className="
                absolute
                right-3
                top-1/2
                flex
                h-[50px]
                w-[50px]
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#075fc1]
                shadow-md
                sm:right-4
                sm:h-[74px]
                sm:w-[74px]
              "
            >
              <Star size={30} fill="currentColor" strokeWidth={0} />
            </div>
          </button>

          {/* =================================================
              VERIFIED PRODUCTS
          ================================================== */}

          <button
            type="button"
            onClick={() => router.push("/verified-products")}
            className="
              group
              relative
              flex
              min-h-[90px]
              w-full
              items-center
              rounded-[20px]
              border-[3px]
              border-black/30
              bg-gradient-to-b
              from-[#073f86]
              to-[#063571]
              px-4
              pr-[75px]
              text-left
              shadow-[0_0_18px_rgba(83,194,255,0.75),0_7px_8px_rgba(0,0,0,0.35)]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-[0_0_28px_rgba(83,194,255,0.95),0_10px_12px_rgba(0,0,0,0.4)]
              active:scale-[0.98]
              sm:min-h-[112px]
              sm:px-6
            "
          >
            <div className="flex py-2 flex-col leading-[1.05]">
              <span className="text-md font-extrabold sm:text-xl">
                Shop Verified Products
              </span>

              <span className="text-base font-bold sm:text-lg">
                &amp; Get Exclusive Discounts
              </span>
            </div>

            <div
              className="
                absolute
                right-3
                top-1/2
                flex
                h-[50px]
                w-[50px]
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#075fc1]
                shadow-md
                sm:right-4
                sm:h-[74px]
                sm:w-[74px]
              "
            >
              <Star size={30} fill="currentColor" strokeWidth={0} />
            </div>
          </button>
        </section>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="mt-auto pt-24 text-center">
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            {/* Facebook */}
    {socialLinks && ( <>
         <a
              href={socialLinks.facebook}
              aria-label="Facebook"
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[#2774c7]
                text-white
                shadow-lg
                transition
                hover:-translate-y-1
                sm:h-[62px]
                sm:w-[62px]
              "
            >
              <FontAwesomeIcon icon={faFacebook} size="2x" />
            </a>

            {/* LinkedIn */}

            <a
              href={socialLinks.linkedin}
              aria-label="LinkedIn"
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[#0b51d0]
                text-white
                shadow-lg
                transition
                hover:-translate-y-1
                sm:h-[62px]
                sm:w-[62px]
              "
            >
              <FontAwesomeIcon icon={faLinkedin} size="2x" />
            </a>

            {/* Instagram */}
             
            <a
              href={socialLinks.instagram}
              aria-label="Instagram"
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#405de6]
                via-[#833ab4]
                via-[#fd1d1d]
                to-[#fcb045]
                text-white
                shadow-lg
                transition
                hover:-translate-y-1
                sm:h-[62px]
                sm:w-[62px]
              "
            >
              <FontAwesomeIcon icon={faInstagram} size="2x" />
            </a></>)}
       
              
          </div>

          <p className="mt-5 text-[17px] leading-tight sm:text-xl">
            Developed by <a   href="https://mateen-portfolio.duckdns.org"
              aria-label="portfolio">M Mateen Haider</a>
          </p>

          <p className="text-[17px] leading-tight sm:text-xl">
            © {new Date().getFullYear()} Prime Talent PK
          </p>
        </footer>
      </div>
    </main>
  );
}

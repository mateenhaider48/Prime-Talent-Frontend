"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  UserRound,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";

import toast from "react-hot-toast";
import SettingsSection from "./SettingPage";
import NotificationButton from "./Notification";
import { useDispatch } from "react-redux";
import { useRouter } from "next/dist/client/components/navigation";
import { logout } from "@/app/redux/slices/authSclice";

/* ============================================================
   TYPES
============================================================ */

type RequestType = "professional" | "product";

type RequestStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "completed";

interface ProfileLink {
  title: string;
  url: string;
}

interface AdvertisementRequest {
  id: string;

  type: RequestType;

  email?: string;

  completeName?: string;

  professionalTitle?: string;

  photoOrLogo?: string;

  bio?: string;

  writeBioForMe?: boolean;

  profileLinks?: ProfileLink[];

  brandBusinessName?: string;

  productNameDetails?: string;

  productSubCategory?: string;

  productStoreLink?: string;

  productImage?: string;

  productVideo?: string;

  wantsToProceed?: boolean;

  status: RequestStatus;

  adminNote?: string;

  createdAt: string;
}

interface VerifiedProduct {
  id: string;

  brandName: string;

  description: string;

  couponCode: string;

  discount: string;

  storeLink: string;

  /*
   * Backend upload fields
   */
  productImage: string;

  productVideo?: string;

  isActive: boolean;

  createdAt?: string;
}

type ActiveSection = "dashboard" | "requests" | "products" | "settings";

/* ============================================================
   API
============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API = {
 
  /* Advertisement */

  requests: "/api/advertisement/get-requests",

  requestById: (id: string) => `/api/advertisement/get-advertisements/${id}`,

  updateRequest: (id: string) =>
    `/api/advertisement/update-advertisement/${id}`,

  deleteRequest: (id: string) =>
    `/api/advertisement/delete-advertisement/${id}`,

  /* Verified Products */

  products: "/api/verfiedProducts/get-verifiedProducts",

  productById: (id: string) =>
    `/api/verfiedProducts/get-verifiedProducts/${id}`,

  createProduct: "/api/verfiedProducts/create-verifiedProducts",

  updateProduct: (id: string) =>
    `/api/verfiedProducts/update-verifiedProducts/${id}`,

  toggleProduct: (id: string) => `/api/verfiedProducts/${id}/toggle`,

  deleteProduct: (id: string) =>
    `/api/verfiedProducts/delete-verifiedProducts/${id}`,
};

/* ============================================================
   API HELPER
============================================================ */

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong.");
  }

  return data;
}

/* ============================================================
   RESPONSE ARRAY HELPER
============================================================ */

function extractArray<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.requests)) {
    return response.requests;
  }

  if (Array.isArray(response?.data?.products)) {
    return response.data.products;
  }

  if (Array.isArray(response?.data?.requests)) {
    return response.data.requests;
  }

  return [];
}

//  logout handler

/* ============================================================
   ID NORMALIZER
============================================================ */

function normalizeId(item: any): string {
  return String(item?.id || item?._id || "");
}

/* ============================================================
   PRODUCT NORMALIZER
============================================================ */

function normalizeProduct(item: any): VerifiedProduct {
  return {
    id: normalizeId(item),

    brandName: item?.brandName || "",

    description: item?.description || "",

    couponCode: item?.couponCode || "",

    discount: item?.discount || "",

    storeLink: item?.storeLink || "",

    productImage: item?.productImage || item?.image || "",

    productVideo: item?.productVideo || item?.video || "",

    isActive: Boolean(item?.isActive),

    createdAt: item?.createdAt,
  };
}

/* ============================================================
   REQUEST NORMALIZER
============================================================ */

function normalizeRequest(item: any): AdvertisementRequest {
  return {
    id: normalizeId(item),

    type: item?.type === "product" ? "product" : "professional",

    email: item?.email,

    completeName: item?.completeName,

    professionalTitle: item?.professionalTitle,

    photoOrLogo: item?.photoOrLogo,

    bio: item?.bio,

    writeBioForMe: Boolean(item?.writeBioForMe),

    profileLinks: Array.isArray(item?.profileLinks) ? item.profileLinks : [],

    brandBusinessName: item?.brandBusinessName,

    productNameDetails: item?.productNameDetails,

    productSubCategory: item?.productSubCategory,

    productStoreLink: item?.productStoreLink,

    productImage: item?.productImage,

    productVideo: item?.productVideo,

    wantsToProceed: Boolean(item?.wantsToProceed),

    status: item?.status || "pending",

    adminNote: item?.adminNote,

    createdAt: item?.createdAt || "",
  };
}

/* ============================================================
   STATUS CONFIG
============================================================ */

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    className: string;
    icon: ReactNode;
  }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-400/15 text-yellow-300 border-yellow-300/20",
    icon: <Clock3 size={15} />,
  },

  reviewing: {
    label: "Reviewing",
    className: "bg-blue-400/15 text-blue-200 border-blue-300/20",
    icon: <FileText size={15} />,
  },

  approved: {
    label: "Approved",
    className: "bg-green-400/15 text-green-300 border-green-300/20",
    icon: <CheckCircle2 size={15} />,
  },

  rejected: {
    label: "Rejected",
    className: "bg-red-400/15 text-red-300 border-red-300/20",
    icon: <XCircle size={15} />,
  },

  completed: {
    label: "Completed",
    className: "bg-purple-400/15 text-purple-300 border-purple-300/20",
    icon: <Check size={15} />,
  },
};

/* ============================================================
   MAIN ADMIN PAGE
============================================================ */

export default function AdminPage() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("dashboard");

  const [requests, setRequests] = useState<AdvertisementRequest[]>([]);

  const [products, setProducts] = useState<VerifiedProduct[]>([]);

  const [loadingRequests, setLoadingRequests] = useState(false);

  const [loadingProducts, setLoadingProducts] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  /* ==========================================================
     REQUEST FILTERS
  ========================================================== */

  const [requestSearch, setRequestSearch] = useState("");

  const [requestFilter, setRequestFilter] = useState<"all" | RequestType>(
    "all",
  );

  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>(
    "all",
  );

  /* ==========================================================
     REQUEST MODAL
  ========================================================== */

  const [selectedRequest, setSelectedRequest] =
    useState<AdvertisementRequest | null>(null);

  const [requestStatus, setRequestStatus] = useState<RequestStatus>("pending");

  const [adminNote, setAdminNote] = useState("");

  const [savingRequest, setSavingRequest] = useState(false);

  /* ==========================================================
     PRODUCT MODAL
  ========================================================== */

  const [productModal, setProductModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<VerifiedProduct | null>(
    null,
  );

  const [productLoading, setProductLoading] = useState(false);

  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  const [togglingProductId, setTogglingProductId] = useState<string | null>(
    null,
  );

  const [productForm, setProductForm] = useState({
    brandName: "",
    description: "",
    couponCode: "",
    discount: "",
    storeLink: "",
    productImage: "",
    productVideo: "",
    isActive: true,
  });

  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [productVideoFile, setProductVideoFile] = useState<File | null>(null);
  const dispatch = useDispatch()
  const router = useRouter()
  const handleLogout = () => {
  dispatch(logout());
  router.replace("/");
};


  /* ==========================================================
     LOAD PRODUCTS
  ========================================================== */

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await apiRequest(API.products);

      const rawData = extractArray<any>(response);

      const data = rawData.map(normalizeProduct);

      setProducts(data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  /* ==========================================================
     LOAD REQUESTS
  ========================================================== */

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);

      const response = await apiRequest(API.requests);

      const rawData = extractArray<any>(response);

      const data = rawData.map(normalizeRequest);

      setRequests(data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load advertisement requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadProducts();
    loadRequests();
  }, []);

  /* ==========================================================
     COUNTERS
  ========================================================== */

  const counts = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter((r) => r.status === "pending").length,

      reviewing: requests.filter((r) => r.status === "reviewing").length,

      approved: requests.filter((r) => r.status === "approved").length,

      rejected: requests.filter((r) => r.status === "rejected").length,

      completed: requests.filter((r) => r.status === "completed").length,
    };
  }, [requests]);

  /* ==========================================================
     FILTER REQUESTS
  ========================================================== */

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const search = requestSearch.toLowerCase().trim();

      const searchableText = `
            ${request.completeName || ""}
            ${request.professionalTitle || ""}
            ${request.brandBusinessName || ""}
            ${request.email || ""}
            ${request.id}
          `.toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);

      const matchesType =
        requestFilter === "all" || request.type === requestFilter;

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, requestSearch, requestFilter, statusFilter]);

  /* ==========================================================
     OPEN REQUEST
  ========================================================== */

  const openRequest = (request: AdvertisementRequest) => {
    setSelectedRequest(request);

    setRequestStatus(request.status);

    setAdminNote(request.adminNote || "");
  };

  /* ==========================================================
     UPDATE REQUEST
  ========================================================== */

  const updateRequest = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setSavingRequest(true);

      const response = await apiRequest(API.updateRequest(selectedRequest.id), {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: requestStatus,

          adminNote: adminNote.trim(),
        }),
      });

      toast.success(response?.message || "Request updated successfully.");

      setRequests((previous) =>
        previous.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,

                status: requestStatus,

                adminNote: adminNote.trim(),
              }
            : request,
        ),
      );

      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update request.");
    } finally {
      setSavingRequest(false);
    }
  };

  /* ==========================================================
     DELETE REQUEST
  ========================================================== */

  const deleteRequest = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(API.deleteRequest(id), {
        method: "DELETE",
      });

      toast.success("Request deleted successfully.");

      setRequests((previous) =>
        previous.filter((request) => request.id !== id),
      );

      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete request.");
    }
  };

  /* ==========================================================
     OPEN ADD PRODUCT
  ========================================================== */

  const openAddProduct = () => {
    setEditingProduct(null);

    setProductForm({
      brandName: "",
      description: "",
      couponCode: "",
      discount: "",
      storeLink: "",
      productImage: "",
      productVideo: "",
      isActive: true,
    });

    setProductImageFile(null);

    setProductVideoFile(null);

    setProductModal(true);
  };

  /* ==========================================================
     OPEN EDIT PRODUCT
  ========================================================== */

  const openEditProduct = (product: VerifiedProduct) => {
    setEditingProduct(product);

    setProductForm({
      brandName: product.brandName || "",

      description: product.description || "",

      couponCode: product.couponCode || "",

      discount: product.discount || "",

      storeLink: product.storeLink || "",

      productImage: product.productImage || "",

      productVideo: product.productVideo || "",

      isActive: product.isActive,
    });

    setProductImageFile(null);

    setProductVideoFile(null);

    setProductModal(true);
  };

  /* ==========================================================
     PRODUCT IMAGE CHANGE
  ========================================================== */

  const handleProductImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");

      e.target.value = "";

      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      toast.error("Image must be less than 30MB.");

      e.target.value = "";

      return;
    }

    setProductImageFile(file);

    setProductForm((previous) => ({
      ...previous,

      productImage: URL.createObjectURL(file),
    }));
  };

  /* ==========================================================
     PRODUCT VIDEO CHANGE
  ========================================================== */

  const handleProductVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video.");

      e.target.value = "";

      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be less than 100MB.");

      e.target.value = "";

      return;
    }

    setProductVideoFile(file);

    setProductForm((previous) => ({
      ...previous,

      productVideo: URL.createObjectURL(file),
    }));
  };

  /* ==========================================================
     SAVE PRODUCT
  ========================================================== */

  const saveProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!productForm.brandName.trim()) {
      toast.error("Please enter brand name.");

      return;
    }

    if (!productForm.description.trim()) {
      toast.error("Please enter description.");

      return;
    }

    if (!productForm.couponCode.trim()) {
      toast.error("Please enter coupon code.");

      return;
    }

    if (!productForm.discount.trim()) {
      toast.error("Please enter discount.");

      return;
    }

    if (!productForm.storeLink.trim()) {
      toast.error("Please enter store link.");

      return;
    }

    if (!editingProduct && !productImageFile) {
      toast.error("Please select product image.");

      return;
    }

    try {
      setProductLoading(true);

      const formData = new FormData();

      formData.append("brandName", productForm.brandName.trim());

      formData.append("description", productForm.description.trim());

      formData.append("couponCode", productForm.couponCode.trim());

      formData.append("discount", productForm.discount.trim());

      formData.append("storeLink", productForm.storeLink.trim());

      formData.append("isActive", String(productForm.isActive));

      /*
       * IMPORTANT
       *
       * Backend expects:
       * productImage
       * productVideo
       */

      if (productImageFile) {
        formData.append("productImage", productImageFile);
      }

      if (productVideoFile) {
        formData.append("productVideo", productVideoFile);
      }

      let response;

      /* ======================================================
         UPDATE
      ====================================================== */

      if (editingProduct) {
        response = await apiRequest(API.updateProduct(editingProduct.id), {
          method: "PATCH",

          body: formData,
        });

        toast.success(response?.message || "Product updated successfully.");
      } else {

      /* ======================================================
         CREATE
      ====================================================== */
        response = await apiRequest(API.createProduct, {
          method: "POST",

          body: formData,
        });

        toast.success(response?.message || "Product added successfully.");
      }

      /*
       * Reload actual backend data
       */

      await loadProducts();

      setProductModal(false);

      setEditingProduct(null);

      setProductImageFile(null);

      setProductVideoFile(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save product.");
    } finally {
      setProductLoading(false);
    }
  };

  /* ==========================================================
     DELETE PRODUCT
  ========================================================== */

  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(id);

      const response = await apiRequest(API.deleteProduct(id), {
        method: "DELETE",
      });

      toast.success(response?.message || "Product deleted successfully.");

      setProducts((previous) =>
        previous.filter((product) => product.id !== id),
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  /* ==========================================================
     TOGGLE PRODUCT
  ========================================================== */

  const toggleProduct = async (id: string) => {
    const product = products.find((item) => item.id === id);

    if (!product) {
      return;
    }

    try {
      setTogglingProductId(id);

      const response = await apiRequest(API.toggleProduct(id), {
        method: "PATCH",
      });

      toast.success(response?.message || "Product status updated.");

      setProducts((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,

                isActive: !item.isActive,
              }
            : item,
        ),
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to update product status.");
    } finally {
      setTogglingProductId(null);
    }
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navigate = (section: ActiveSection) => {
    setActiveSection(section);

    setMobileMenu(false);
  };

  /* ==========================================================
     SIDEBAR
  ========================================================== */

  const Sidebar = () => (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        flex
        h-screen
        w-[270px]
        flex-col
        border-r
        border-white/10
        bg-[#032d69]
        shadow-2xl
        transition-transform
        duration-300
        ${mobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex h-[90px] items-center border-b border-white/10 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#075fc1] shadow-lg">
          <LayoutDashboard size={23} />
        </div>

        <div className="ml-3">
          <h1 className="text-lg font-extrabold">Admin Panel</h1>

          <p className="text-xs text-blue-200">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <SidebarButton
          icon={<LayoutDashboard size={19} />}
          label="Dashboard"
          active={activeSection === "dashboard"}
          onClick={() => navigate("dashboard")}
        />

        <SidebarButton
          icon={<FileText size={19} />}
          label="Advertisement Requests"
          active={activeSection === "requests"}
          onClick={() => navigate("requests")}
          badge={counts.pending}
        />

        <SidebarButton
          icon={<ShoppingBag size={19} />}
          label="Verified Products"
          active={activeSection === "products"}
          onClick={() => navigate("products")}
        />
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-white hover:text-[#075fc1] hover:shadow-lg hover:text-blue-100 hover:bg-white/[0.08] hover:text-white"
        >
         
          <LogOut size={19} />
          <span>Logout</span>
        </button>
        <SidebarButton
          icon={<Settings size={19} />}
          label="Settings"
          active={activeSection === "settings"}
          onClick={() => navigate("settings")}
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs font-bold text-blue-200">ADMIN</p>

          <p className="mt-1 truncate text-sm font-extrabold">Administrator</p>

          <p className="mt-0.5 truncate text-xs text-blue-200">
            admin@example.com
          </p>
        </div>
      </div>
    </aside>
  );

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#061a3b] text-white">
      <Sidebar />

      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <div className="min-h-screen lg:ml-[270px]">
        {/* ====================================================
            TOPBAR
        ==================================================== */}

        <header className="sticky top-0 z-30 flex h-[75px] items-center justify-between border-b border-white/10 bg-[#061a3b]/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <h2 className="text-lg font-extrabold sm:text-xl">
                {activeSection === "dashboard" && "Dashboard"}

                {activeSection === "requests" && "Advertisement Requests"}

                {activeSection === "products" && "Verified Products"}
              </h2>

              <p className="hidden text-xs text-blue-200 sm:block">
                Manage your platform from one place
              </p>
            </div>
          </div>

          <NotificationButton pendingCount={counts.pending} />
        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="p-4 sm:p-7">
          {activeSection === "dashboard" && (
            <DashboardSection
              counts={counts}
              requests={requests}
              products={products}
              navigate={navigate}
              openRequest={openRequest}
            />
          )}

          {activeSection === "requests" && (
            <RequestsSection
              requests={filteredRequests}
              totalRequests={requests.length}
              search={requestSearch}
              setSearch={setRequestSearch}
              requestFilter={requestFilter}
              setRequestFilter={setRequestFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              openRequest={openRequest}
              deleteRequest={deleteRequest}
              loading={loadingRequests}
            />
          )}

          {activeSection === "products" && (
            <ProductsSection
              products={products}
              openAddProduct={openAddProduct}
              openEditProduct={openEditProduct}
              deleteProduct={deleteProduct}
              toggleProduct={toggleProduct}
              loading={loadingProducts}
              deletingProductId={deletingProductId}
              togglingProductId={togglingProductId}
            />
          )}

          {activeSection === "settings" && <SettingsSection />}
        </div>
      </div>

      {/* ======================================================
          REQUEST MODAL
      ====================================================== */}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          status={requestStatus}
          setStatus={setRequestStatus}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          onClose={() => setSelectedRequest(null)}
          onSave={updateRequest}
          onDelete={() => deleteRequest(selectedRequest.id)}
          saving={savingRequest}
        />
      )}

      {/* ======================================================
          PRODUCT MODAL
      ====================================================== */}

      {productModal && (
        <ProductModal
          editingProduct={editingProduct}
          form={productForm}
          setForm={setProductForm}
          onImageChange={handleProductImage}
          onVideoChange={handleProductVideo}
          imageFile={productImageFile}
          videoFile={productVideoFile}
          onClose={() => {
            if (!productLoading) {
              setProductModal(false);

              setEditingProduct(null);

              setProductImageFile(null);

              setProductVideoFile(null);
            }
          }}
          onSubmit={saveProduct}
          loading={productLoading}
        />
      )}
    </main>
  );
}

/* ============================================================
   SIDEBAR BUTTON
============================================================ */

function SidebarButton({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-left
        text-sm
        font-bold
        transition-all
        ${
          active
            ? "bg-white text-[#075fc1] shadow-lg"
            : "text-blue-100 hover:bg-white/[0.08] hover:text-white"
        }
      `}
    >
      {icon}

      <span className="flex-1">{label}</span>

      {typeof badge === "number" && badge > 0 && (
        <span
          className={`
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              px-1.5
              text-[10px]
              font-extrabold
              ${active ? "bg-[#075fc1] text-white" : "bg-yellow-400 text-black"}
            `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ============================================================
   DASHBOARD SECTION
============================================================ */

function DashboardSection({
  counts,
  requests,
  products,
  navigate,
  openRequest,
}: {
  counts: {
    total: number;
    pending: number;
    reviewing: number;
    approved: number;
    rejected: number;
    completed: number;
  };

  requests: AdvertisementRequest[];

  products: VerifiedProduct[];

  navigate: (section: ActiveSection) => void;

  openRequest: (request: AdvertisementRequest) => void;
}) {
  const stats = [
    {
      title: "Total Requests",

      value: counts.total,

      icon: <FileText size={21} />,

      className: "from-blue-500/20",
    },

    {
      title: "Pending",

      value: counts.pending,

      icon: <Clock3 size={21} />,

      className: "from-yellow-500/20",
    },

    {
      title: "Reviewing",

      value: counts.reviewing,

      icon: <FileText size={21} />,

      className: "from-cyan-500/20",
    },

    {
      title: "Approved",

      value: counts.approved,

      icon: <CheckCircle2 size={21} />,

      className: "from-green-500/20",
    },

    {
      title: "Rejected",

      value: counts.rejected,

      icon: <XCircle size={21} />,

      className: "from-red-500/20",
    },

    {
      title: "Completed",

      value: counts.completed,

      icon: <Check size={21} />,

      className: "from-purple-500/20",
    },
  ];

  const recentRequests = [...requests].reverse().slice(0, 5);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Welcome back, Admin 👋
        </h1>

        <p className="mt-1 text-sm text-blue-200">
          Here's what's happening on your platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                ${stat.className}
                to-white/[0.03]
                p-4
                shadow-lg
              `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              {stat.icon}
            </div>

            <p className="mt-4 text-2xl font-extrabold">{stat.value}</p>

            <p className="mt-1 text-xs font-semibold text-blue-200">
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h3 className="font-extrabold">Recent Requests</h3>

              <p className="mt-1 text-xs text-blue-200">
                Latest advertisement submissions
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("requests")}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-blue-200">
                No requests found.
              </div>
            ) : (
              recentRequests.map((request) => {
                const title =
                  request.type === "professional"
                    ? request.completeName
                    : request.brandBusinessName;

                return (
                  <button
                    type="button"
                    key={request.id}
                    onClick={() => openRequest(request)}
                    className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[0.04]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                      {request.type === "professional" &&
                      request.photoOrLogo ? (
                        <img
                          src={request.photoOrLogo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : request.type === "product" && request.productImage ? (
                        <img
                          src={request.productImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {title || "Unnamed Request"}
                      </p>

                      <p className="mt-0.5 text-xs text-blue-200">
                        {request.type === "professional"
                          ? "Professional"
                          : "Product Promotion"}
                      </p>
                    </div>

                    <StatusBadge status={request.status} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold">Request Breakdown</h3>

                <p className="mt-1 text-xs text-blue-200">
                  Current status overview
                </p>
              </div>

              <BarChart3 size={20} className="text-cyan-300" />
            </div>

            <div className="mt-5 space-y-4">
              <ProgressRow
                label="Pending"
                value={counts.pending}
                total={counts.total}
              />

              <ProgressRow
                label="Reviewing"
                value={counts.reviewing}
                total={counts.total}
              />

              <ProgressRow
                label="Approved"
                value={counts.approved}
                total={counts.total}
              />

              <ProgressRow
                label="Completed"
                value={counts.completed}
                total={counts.total}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold">Verified Products</h3>

                <p className="mt-1 text-xs text-blue-200">
                  Products currently managed
                </p>
              </div>

              <ShoppingBag size={20} className="text-cyan-300" />
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-extrabold">{products.length}</p>

                <p className="text-xs text-blue-200">Total products</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("products")}
                className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#075fc1]"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PROGRESS ROW
============================================================ */

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-bold">{label}</span>

        <span className="text-blue-200">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   REQUESTS SECTION
============================================================ */

function RequestsSection({
  requests,
  totalRequests,
  search,
  setSearch,
  requestFilter,
  setRequestFilter,
  statusFilter,
  setStatusFilter,
  openRequest,
  deleteRequest,
  loading,
}: {
  requests: AdvertisementRequest[];

  totalRequests: number;

  search: string;

  setSearch: (value: string) => void;

  requestFilter: "all" | RequestType;

  setRequestFilter: (value: "all" | RequestType) => void;

  statusFilter: "all" | RequestStatus;

  setStatusFilter: (value: "all" | RequestStatus) => void;

  openRequest: (request: AdvertisementRequest) => void;

  deleteRequest: (id: string) => void;

  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Advertisement Requests
          </h1>

          <p className="mt-1 text-sm text-blue-200">
            Review, update and manage customer promotion requests.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm">
          <span className="text-blue-200">Showing</span>{" "}
          <strong>{requests.length}</strong>{" "}
          <span className="text-blue-200">of {totalRequests}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, brand, email or request ID..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm outline-none transition placeholder:text-blue-200/60 focus:border-cyan-300/50"
            />
          </div>

          <select
            value={requestFilter}
            onChange={(e) =>
              setRequestFilter(e.target.value as "all" | RequestType)
            }
            className="h-11 rounded-xl border border-white/10 bg-[#0a326f] px-4 text-sm font-bold outline-none"
          >
            <option value="all">All Types</option>

            <option value="professional">Professional</option>

            <option value="product">Product Promotion</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | RequestStatus)
            }
            className="h-11 rounded-xl border border-white/10 bg-[#0a326f] px-4 text-sm font-bold outline-none"
          >
            <option value="all">All Status</option>

            <option value="pending">Pending</option>

            <option value="reviewing">Reviewing</option>

            <option value="approved">Approved</option>

            <option value="rejected">Rejected</option>

            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingBox text="Loading requests..." />
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-16 text-center">
              <Search size={35} className="mx-auto text-blue-200/60" />

              <p className="mt-3 font-bold">No requests found</p>

              <p className="mt-1 text-sm text-blue-200">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                openRequest={openRequest}
                deleteRequest={deleteRequest}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   REQUEST CARD
============================================================ */

function RequestCard({
  request,
  openRequest,
  deleteRequest,
}: {
  request: AdvertisementRequest;

  openRequest: (request: AdvertisementRequest) => void;

  deleteRequest: (id: string) => void;
}) {
  const isProfessional = request.type === "professional";

  const title = isProfessional
    ? request.completeName
    : request.brandBusinessName;

  const subtitle = isProfessional
    ? request.professionalTitle
    : request.productSubCategory;

  const image = isProfessional ? request.photoOrLogo : request.productImage;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : isProfessional ? (
            <UserRound size={25} className="text-blue-200" />
          ) : (
            <Package size={25} className="text-blue-200" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-extrabold">
              {title || "Unnamed Request"}
            </h3>

            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-extrabold uppercase text-blue-100">
              {isProfessional ? "Professional" : "Product"}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-blue-200">
            {subtitle || "No additional information"}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-200">
            <span>
              ID: <strong className="text-white">{request.id}</strong>
            </span>

            {request.email && <span>{request.email}</span>}

            <span>
              {request.createdAt
                ? new Date(request.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>

        <StatusBadge status={request.status} />

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => openRequest(request)}
            className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-extrabold text-[#075fc1] transition hover:bg-blue-50"
          >
            <FileText size={16} />

            <span className="hidden sm:inline">View</span>
          </button>

          <button
            type="button"
            onClick={() => deleteRequest(request.id)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-extrabold
        ${config.className}
      `}
    >
      {config.icon}

      {config.label}
    </span>
  );
}

/* ============================================================
   REQUEST MODAL
============================================================ */

function RequestDetailModal({
  request,
  status,
  setStatus,
  adminNote,
  setAdminNote,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  request: AdvertisementRequest;

  status: RequestStatus;

  setStatus: (status: RequestStatus) => void;

  adminNote: string;

  setAdminNote: (value: string) => void;

  onClose: () => void;

  onSave: () => void;

  onDelete: () => void;

  saving: boolean;
}) {
  const isProfessional = request.type === "professional";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-[850px] overflow-y-auto rounded-[25px] border border-white/10 bg-gradient-to-b from-[#063b7e] to-[#031e4c] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#063b7e]/95 p-5 backdrop-blur-xl sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold">Request Details</h2>

              <StatusBadge status={status} />
            </div>

            <p className="mt-1 text-xs text-blue-200">
              {request.id} •{" "}
              {isProfessional ? "Professional Promotion" : "Product Promotion"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {isProfessional ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                    {request.photoOrLogo ? (
                      <img
                        src={request.photoOrLogo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={40} />
                    )}
                  </div>

                  <div>
                    <p className="text-xl font-extrabold">
                      {request.completeName}
                    </p>

                    <p className="mt-1 font-bold text-cyan-300">
                      {request.professionalTitle}
                    </p>

                    {request.email && (
                      <p className="mt-3 text-sm text-blue-200">
                        {request.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DetailBlock title="Professional Bio">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-100">
                  {request.bio || "No bio provided."}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">
                  <span>Write Bio For Me:</span>

                  <span
                    className={
                      request.writeBioForMe ? "text-cyan-300" : "text-blue-200"
                    }
                  >
                    {request.writeBioForMe ? "Yes" : "No"}
                  </span>
                </div>
              </DetailBlock>

              <DetailBlock title="Profile Links">
                {request.profileLinks && request.profileLinks.length > 0 ? (
                  <div className="space-y-2">
                    {request.profileLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl bg-white/[0.06] p-3 transition hover:bg-white/10"
                      >
                        <span className="text-sm font-bold">{link.title}</span>

                        <ExternalLink size={16} className="text-cyan-300" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-200">No profile links.</p>
                )}
              </DetailBlock>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:w-52">
                    {request.productImage ? (
                      <img
                        src={request.productImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon size={40} />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xl font-extrabold">
                      {request.brandBusinessName}
                    </p>

                    <p className="mt-1 text-sm font-bold text-cyan-300">
                      {request.productSubCategory}
                    </p>

                    {request.email && (
                      <p className="mt-3 text-sm text-blue-200">
                        {request.email}
                      </p>
                    )}

                    {request.productStoreLink && (
                      <a
                        href={request.productStoreLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#075fc1]"
                      >
                        Visit Store
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <DetailBlock title="Product Details">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-100">
                  {request.productNameDetails || "No product details provided."}
                </p>
              </DetailBlock>

              {request.productVideo && (
                <DetailBlock title="Product Video">
                  <video
                    src={request.productVideo}
                    controls
                    className="max-h-72 w-full rounded-xl bg-black"
                  />
                </DetailBlock>
              )}

              <DetailBlock title="Promotion">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold">
                    Wants To Proceed:
                  </span>

                  <span className="font-extrabold text-cyan-300">
                    {request.wantsToProceed ? "Yes" : "No"}
                  </span>
                </div>
              </DetailBlock>
            </>
          )}

          {/* ==================================================
              ADMIN CONTROLS
          ================================================== */}

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.06] p-5">
            <div className="mb-4">
              <h3 className="font-extrabold">Admin Controls</h3>

              <p className="mt-1 text-xs text-blue-200">
                Update request status and add an internal note.
              </p>
            </div>

            <label className="mb-2 block text-sm font-bold">
              Request Status
            </label>

            <div className="relative">
              <select
                value={status}
                disabled={saving}
                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#082f68] px-4 pr-10 text-sm font-bold outline-none focus:border-cyan-300/50 disabled:opacity-50"
              >
                <option value="pending">Pending</option>

                <option value="reviewing">Reviewing</option>

                <option value="approved">Approved</option>

                <option value="rejected">Rejected</option>

                <option value="completed">Completed</option>
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold">Admin Note</label>

              <textarea
                value={adminNote}
                disabled={saving}
                onChange={(e) => setAdminNote(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Write an internal note..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#082f68] px-4 py-3 text-sm outline-none placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
              />

              <p className="mt-1 text-right text-[10px] text-blue-200">
                {adminNote.length}
                /2000
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              disabled={saving}
              onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-5 py-3 text-sm font-extrabold text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              <Trash2 size={17} />
              Delete Request
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="flex-1 rounded-xl bg-white/10 px-5 py-3 text-sm font-extrabold transition hover:bg-white/15 disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#075fc1] shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {saving ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL BLOCK
============================================================ */

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-cyan-300">
        {title}
      </h3>

      {children}
    </div>
  );
}

/* ============================================================
   PRODUCTS SECTION
============================================================ */

function ProductsSection({
  products,
  openAddProduct,
  openEditProduct,
  deleteProduct,
  toggleProduct,
  loading,
  deletingProductId,
  togglingProductId,
}: {
  products: VerifiedProduct[];

  openAddProduct: () => void;

  openEditProduct: (product: VerifiedProduct) => void;

  deleteProduct: (id: string) => void;

  toggleProduct: (id: string) => void;

  loading: boolean;

  deletingProductId: string | null;

  togglingProductId: string | null;
}) {
  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Verified Products
          </h1>

          <p className="mt-1 text-sm text-blue-200">
            Add, edit, activate and manage verified products.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddProduct}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#075fc1] shadow-lg transition hover:bg-blue-50"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* PRODUCTS */}

      {loading ? (
        <LoadingBox text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-20 text-center">
          <ShoppingBag size={42} className="mx-auto text-blue-200/50" />

          <p className="mt-4 font-extrabold">No verified products</p>

          <p className="mt-1 text-sm text-blue-200">
            Add your first verified product.
          </p>

          <button
            type="button"
            onClick={openAddProduct}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#075fc1]"
          >
            <Plus size={17} />
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              openEditProduct={openEditProduct}
              deleteProduct={deleteProduct}
              toggleProduct={toggleProduct}
              deleting={deletingProductId === product.id}
              toggling={togglingProductId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PRODUCT CARD
============================================================ */

function ProductCard({
  product,
  openEditProduct,
  deleteProduct,
  toggleProduct,
  deleting,
  toggling,
}: {
  product: VerifiedProduct;

  openEditProduct: (product: VerifiedProduct) => void;

  deleteProduct: (id: string) => void;

  toggleProduct: (id: string) => void;

  deleting: boolean;

  toggling: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl">
      {/* IMAGE */}

      <div className="relative h-56 w-full bg-black/20">
        {product.productImage ? (
          <img
            src={product.productImage}
            alt={product.brandName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon size={45} className="text-blue-200/50" />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={`
              rounded-full
              border
              px-3
              py-1.5
              text-[10px]
              font-extrabold
              ${
                product.isActive
                  ? "border-green-300/20 bg-green-400/20 text-green-300"
                  : "border-red-300/20 bg-red-400/20 text-red-300"
              }
            `}
          >
            {product.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {product.productVideo && (
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur">
            <Video size={17} />
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold">
              {product.brandName}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-blue-200">
              {product.description}
            </p>
          </div>
        </div>

        {/* DISCOUNT */}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
            <p className="text-[10px] font-bold uppercase text-blue-200">
              Discount
            </p>

            <p className="mt-1 text-sm font-extrabold text-cyan-300">
              {product.discount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
            <p className="text-[10px] font-bold uppercase text-blue-200">
              Coupon
            </p>

            <p className="mt-1 truncate text-sm font-extrabold">
              {product.couponCode}
            </p>
          </div>
        </div>

        {/* STORE */}

        {product.storeLink && (
          <a
            href={product.storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-4 py-3 text-xs font-extrabold transition hover:bg-white/[0.12]"
          >
            Visit Store
            <ExternalLink size={15} />
          </a>
        )}

        {/* ACTIONS */}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => openEditProduct(product)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-500/15 text-xs font-extrabold text-blue-200 transition hover:bg-blue-500 hover:text-white"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            disabled={toggling}
            onClick={() => toggleProduct(product.id)}
            className={`
              flex
              h-10
              items-center
              justify-center
              gap-1.5
              rounded-xl
              text-xs
              font-extrabold
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                product.isActive
                  ? "bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500 hover:text-black"
                  : "bg-green-500/15 text-green-300 hover:bg-green-500 hover:text-white"
              }
            `}
          >
            {toggling ? <Spinner /> : product.isActive ? "Disable" : "Activate"}
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => deleteProduct(product.id)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-red-500/15 text-xs font-extrabold text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Spinner />
            ) : (
              <>
                <Trash2 size={15} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PRODUCT MODAL
============================================================ */

function ProductModal({
  editingProduct,
  form,
  setForm,
  onImageChange,
  onVideoChange,
  imageFile,
  videoFile,
  onClose,
  onSubmit,
  loading,
}: {
  editingProduct: VerifiedProduct | null;

  form: {
    brandName: string;
    description: string;
    couponCode: string;
    discount: string;
    storeLink: string;
    productImage: string;
    productVideo: string;
    isActive: boolean;
  };

  setForm: React.Dispatch<
    React.SetStateAction<{
      brandName: string;
      description: string;
      couponCode: string;
      discount: string;
      storeLink: string;
      productImage: string;
      productVideo: string;
      isActive: boolean;
    }>
  >;

  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;

  onVideoChange: (e: ChangeEvent<HTMLInputElement>) => void;

  imageFile: File | null;

  videoFile: File | null;

  onClose: () => void;

  onSubmit: (e: FormEvent<HTMLFormElement>) => void;

  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          if (!loading) {
            onClose();
          }
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[25px] border border-white/10 bg-gradient-to-b from-[#063b7e] to-[#031e4c] shadow-2xl">
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#063b7e]/95 p-5 backdrop-blur-xl sm:p-6">
          <div>
            <h2 className="text-xl font-extrabold">
              {editingProduct
                ? "Edit Verified Product"
                : "Add Verified Product"}
            </h2>

            <p className="mt-1 text-xs text-blue-200">
              {editingProduct
                ? "Update product information and media."
                : "Create a new verified product."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-7">
          {/* BRAND */}

          <div>
            <label className="mb-2 block text-sm font-bold">Brand Name</label>

            <input
              value={form.brandName}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,

                  brandName: e.target.value,
                }))
              }
              placeholder="Enter brand name"
              disabled={loading}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#082f68] px-4 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-bold">Description</label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,

                  description: e.target.value,
                }))
              }
              placeholder="Enter product description"
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#082f68] px-4 py-3 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
            />
          </div>

          {/* COUPON + DISCOUNT */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">
                Coupon Code
              </label>

              <input
                value={form.couponCode}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,

                    couponCode: e.target.value,
                  }))
                }
                placeholder="e.g. SAVE20"
                disabled={loading}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#082f68] px-4 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Discount</label>

              <input
                value={form.discount}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,

                    discount: e.target.value,
                  }))
                }
                placeholder="e.g. 20% OFF"
                disabled={loading}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#082f68] px-4 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* STORE LINK */}

          <div>
            <label className="mb-2 block text-sm font-bold">Store Link</label>

            <input
              value={form.storeLink}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,

                  storeLink: e.target.value,
                }))
              }
              placeholder="https://example.com"
              type="url"
              disabled={loading}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#082f68] px-4 text-sm outline-none transition placeholder:text-blue-200/50 focus:border-cyan-300/50 disabled:opacity-50"
            />
          </div>

          {/* IMAGE */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <label className="mb-3 block text-sm font-extrabold">
              Product Image
            </label>

            {form.productImage && (
              <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                <img
                  src={form.productImage}
                  alt="Product preview"
                  className="max-h-64 w-full object-contain"
                />
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-300/30 bg-cyan-400/[0.05] px-4 py-5 text-sm font-bold transition hover:bg-cyan-400/[0.1]">
              <ImageIcon size={20} />

              {imageFile
                ? imageFile.name
                : editingProduct
                  ? "Replace Product Image"
                  : "Choose Product Image"}

              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                disabled={loading}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-[11px] text-blue-200">Maximum size: 30MB</p>
          </div>

          {/* VIDEO */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <label className="mb-3 block text-sm font-extrabold">
              Product Video
              <span className="ml-2 text-xs font-normal text-blue-200">
                Optional
              </span>
            </label>

            {form.productVideo && (
              <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                <video
                  src={form.productVideo}
                  controls
                  className="max-h-64 w-full"
                />
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-300/30 bg-cyan-400/[0.05] px-4 py-5 text-sm font-bold transition hover:bg-cyan-400/[0.1]">
              <Video size={20} />

              {videoFile
                ? videoFile.name
                : editingProduct && form.productVideo
                  ? "Replace Product Video"
                  : "Choose Product Video"}

              <input
                type="file"
                accept="video/*"
                onChange={onVideoChange}
                disabled={loading}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-[11px] text-blue-200">
              Maximum size: 100MB
            </p>
          </div>

          {/* ACTIVE */}

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div>
              <p className="text-sm font-extrabold">Product Status</p>

              <p className="mt-1 text-xs text-blue-200">
                Active products can be displayed on the website.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setForm((previous) => ({
                  ...previous,

                  isActive: !previous.isActive,
                }))
              }
              className={`
                relative
                h-7
                w-12
                rounded-full
                transition
                ${form.isActive ? "bg-green-400" : "bg-white/20"}
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow
                  transition-all
                  ${form.isActive ? "left-6" : "left-1"}
                `}
              />
            </button>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl bg-white/10 px-5 py-3 text-sm font-extrabold transition hover:bg-white/15 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#075fc1] shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={17} />

                  {editingProduct ? "Update Product" : "Add Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING BOX
============================================================ */

function LoadingBox({ text }: { text: string }) {
  return (
    <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="flex items-center gap-3 text-sm font-bold text-blue-100">
        <Spinner />

        {text}
      </div>
    </div>
  );
}

/* ============================================================
   SPINNER
============================================================ */

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

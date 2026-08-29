// lib/push.ts

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API = {
  vapidPublicKey: "/api/push/vapid-public-key",
  subscribe: "/api/push/subscribe",
  unsubscribe: "/api/push/unsubscribe",
  test: "/api/push/test",
};

/* ============================================================
   URL BASE64 TO UINT8ARRAY
============================================================ */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
/* ============================================================
   REGISTER SERVICE WORKER
============================================================ */

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  await navigator.serviceWorker.ready;

  return registration;
}

/* ============================================================
   FETCH VAPID PUBLIC KEY
============================================================ */

async function getVapidPublicKey(): Promise<string> {
  const response = await fetch(`${API_URL}${API.vapidPublicKey}`);

  const data = await response.json();

  if (!response.ok || !data?.publicKey) {
    throw new Error(data?.message || "Failed to fetch VAPID public key.");
  }

  return data.publicKey;
}

/* ============================================================
   SUBSCRIBE TO PUSH
   IMPORTANT: backend expects the raw subscription object
   directly in the body — NOT wrapped in { subscription }
============================================================ */

export async function subscribeToPush(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!("Notification" in window)) {
      return {
        success: false,
        message: "This browser does not support notifications.",
      };
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return {
        success: false,
        message: "Notification permission was denied.",
      };
    }

    const registration = await registerServiceWorker();

    const vapidPublicKey = await getVapidPublicKey();

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // toJSON() se { endpoint, expirationTime, keys: { p256dh, auth } } milta hai
    const subscriptionJSON = subscription.toJSON();

    const response = await fetch(`${API_URL}${API.subscribe}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // authCheck cookie/token ke liye zaroori
      body: JSON.stringify(subscriptionJSON),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to subscribe.");
    }

    return {
      success: true,
      message: data?.message || "Subscribed to notifications successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to enable notifications.",
    };
  }
}

/* ============================================================
   UNSUBSCRIBE FROM PUSH
============================================================ */

export async function unsubscribeFromPush(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return { success: false, message: "No active subscription found." };
    }

    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { success: false, message: "No active subscription found." };
    }

    const endpoint = subscription.endpoint;

    await subscription.unsubscribe();

    const response = await fetch(`${API_URL}${API.unsubscribe}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ endpoint }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to unsubscribe.");
    }

    return {
      success: true,
      message: data?.message || "Unsubscribed successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to unsubscribe.",
    };
  }
}

/* ============================================================
   CHECK CURRENT SUBSCRIPTION STATUS
============================================================ */

export async function getPushSubscriptionStatus(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();

    return !!subscription;
  } catch {
    return false;
  }
}

/* ============================================================
   SEND TEST NOTIFICATION (admin only)
============================================================ */

export async function sendTestPush(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_URL}${API.test}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to send test notification.");
    }

    return {
      success: true,
      message: data?.message || "Test notification sent.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to send test notification.",
    };
  }
}

/* ============================================================
   URL BASE64 TO UINT8ARRAY
============================================================ */


"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Send } from "lucide-react";
import toast from "react-hot-toast";
import {
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscriptionStatus,
  sendTestPush,
} from "../../../public/lib/push"
export default function NotificationButton({
  pendingCount = 0,
}: {
  pendingCount?: number;
})  {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getPushSubscriptionStatus().then(setSubscribed);
  }, []);

  const handleToggle = async () => {
    setLoading(true);

    if (subscribed) {
      const result = await unsubscribeFromPush();

      if (result.success) {
        toast.success(result.message);
        setSubscribed(false);
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await subscribeToPush();

      if (result.success) {
        toast.success(result.message);
        setSubscribed(true);
      } else {
        toast.error(result.message);
      }
    }

    setLoading(false);
  };

  const handleTest = async () => {
    setTesting(true);

    const result = await sendTestPush();

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    setTesting(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15 disabled:opacity-50"
        title={subscribed ? "Disable notifications" : "Enable notifications"}
      >
        {subscribed ? (
          <BellRing size={19} className="text-cyan-300" />
        ) : (
          <Bell size={19} />
        )}
      </button>

      {subscribed && (
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold transition hover:bg-white/15 disabled:opacity-50"
          title="Send test notification"
        >
          <Send size={15} />
          <span className="hidden sm:inline">Test</span>
        </button>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AutoRefreshIndicatorProps {
  showManualRefresh?: boolean;
  className?: string;
}

export const AutoRefreshIndicator: React.FC<AutoRefreshIndicatorProps> = ({
  showManualRefresh = true,
  className = "",
}) => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Refresh when back online
  useEffect(() => {
    if (isOnline) {
      queryClient.invalidateQueries();
      setLastRefresh(new Date());
    }
  }, [isOnline, queryClient]);

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, queryClient]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Refreshing Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-xs text-blue-600 font-medium"
          >
            Refreshing...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook for programmatic refresh control
export const useAutoRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const refreshCollection = async (collectionName: string) => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["firestore", collectionName],
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const refreshUserData = async (userId: string) => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: ["userBookings", userId],
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return {
    refreshAll,
    refreshCollection,
    refreshUserData,
    isRefreshing,
  };
};

import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AutoRefreshIndicatorProps {
  showManualRefresh?: boolean;
  className?: string;
}

export const AutoRefreshIndicator: React.FC<AutoRefreshIndicatorProps> = ({
  showManualRefresh = true,
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline) {
      queryClient.invalidateQueries();
      setLastRefresh(new Date());
    }
  }, [isOnline, queryClient]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Auto-refresh every 30 seconds when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, queryClient]);

  return (\n    <div className={`flex items-center gap-2 ${className}`}>\n      {/* Connection Status */}\n      <div className=\"flex items-center gap-1\">\n        {isOnline ? (\n          <Wifi className=\"h-4 w-4 text-green-500\" />\n        ) : (\n          <WifiOff className=\"h-4 w-4 text-red-500\" />\n        )}\n        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>\n          {isOnline ? 'Online' : 'Offline'}\n        </span>\n      </div>\n\n      {/* Last Refresh Time */}\n      <span className=\"text-xs text-gray-500\">\n        Updated: {lastRefresh.toLocaleTimeString()}\n      </span>\n\n      {/* Manual Refresh Button */}\n      {showManualRefresh && (\n        <Button\n          variant=\"ghost\"\n          size=\"sm\"\n          onClick={handleManualRefresh}\n          disabled={isRefreshing || !isOnline}\n          className=\"h-8 w-8 p-0\"\n        >\n          <RefreshCw \n            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} \n          />\n        </Button>\n      )}\n\n      {/* Refreshing Indicator */}\n      <AnimatePresence>\n        {isRefreshing && (\n          <motion.div\n            initial={{ opacity: 0, scale: 0.8 }}\n            animate={{ opacity: 1, scale: 1 }}\n            exit={{ opacity: 0, scale: 0.8 }}\n            className=\"text-xs text-blue-600 font-medium\"\n          >\n            Refreshing...\n          </motion.div>\n        )}\n      </AnimatePresence>\n    </div>\n  );\n};\n\n// Hook for programmatic refresh control\nexport const useAutoRefresh = () => {\n  const queryClient = useQueryClient();\n  const [isRefreshing, setIsRefreshing] = useState(false);\n\n  const refreshAll = async () => {\n    setIsRefreshing(true);\n    await queryClient.invalidateQueries();\n    setTimeout(() => setIsRefreshing(false), 1000);\n  };\n\n  const refreshCollection = async (collectionName: string) => {\n    setIsRefreshing(true);\n    await queryClient.invalidateQueries({ queryKey: ['firestore', collectionName] });\n    setTimeout(() => setIsRefreshing(false), 1000);\n  };\n\n  const refreshUserData = async (userId: string) => {\n    setIsRefreshing(true);\n    await queryClient.invalidateQueries({ queryKey: ['userBookings', userId] });\n    setTimeout(() => setIsRefreshing(false), 1000);\n  };\n\n  return {\n    refreshAll,\n    refreshCollection,\n    refreshUserData,\n    isRefreshing,\n  };\n};
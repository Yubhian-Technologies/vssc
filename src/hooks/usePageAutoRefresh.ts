import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UsePageAutoRefreshOptions {
  interval?: number; // Refresh interval in milliseconds
  enabled?: boolean; // Whether auto-refresh is enabled
  queryKeys?: string[][]; // Specific query keys to refresh
}

export const usePageAutoRefresh = (options: UsePageAutoRefreshOptions = {}) => {
  const queryClient = useQueryClient();
  const { 
    interval = 30000, // 30 seconds default
    enabled = true,
    queryKeys = []
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const refreshData = () => {
      if (queryKeys.length > 0) {
        // Refresh specific query keys
        queryKeys.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      } else {
        // Refresh all queries
        queryClient.invalidateQueries();
      }
    };

    // Set up interval for auto-refresh
    const intervalId = setInterval(refreshData, interval);

    // Refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    // Refresh when user comes back online
    const handleOnline = () => {
      refreshData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient, interval, enabled, JSON.stringify(queryKeys)]);
};

// Specialized hooks for common use cases
export const useUserDataAutoRefresh = (userId?: string) => {
  usePageAutoRefresh({
    enabled: !!userId,
    queryKeys: [
      ['userBookings', userId],
      ['firestore', 'users', userId],
    ].filter(key => key[1]) // Remove undefined userId keys
  });
};

export const useAdminDataAutoRefresh = (adminCollege?: string) => {
  usePageAutoRefresh({
    enabled: !!adminCollege,
    queryKeys: [
      ['dashboardData', adminCollege],
      ['firestore', 'tutoring'],
      ['firestore', 'academicadvising'],
      ['firestore', 'studyworkshop'],
      ['firestore', 'counseling'],
      ['firestore', 'psychologycounseling'],
    ].filter(key => !key.includes(undefined)) // Remove undefined keys
  });
};
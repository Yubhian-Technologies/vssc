import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Prevents data loss in forms during auto-refresh
export const useFormProtection = (isEditing: boolean) => {
  const queryClient = useQueryClient();
  const isEditingRef = useRef(isEditing);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    // Disable auto-refresh when user is editing forms
    if (isEditingRef.current) {
      queryClient.setDefaultOptions({
        queries: {
          refetchInterval: false, // Stop background refresh
          refetchOnWindowFocus: false, // Stop focus refresh
        },
      });
    } else {
      // Re-enable auto-refresh when not editing
      queryClient.setDefaultOptions({
        queries: {
          refetchInterval: 30000,
          refetchOnWindowFocus: true,
        },
      });
    }
  }, [isEditing, queryClient]);
};
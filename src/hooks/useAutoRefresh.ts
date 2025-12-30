import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useEffect } from 'react';

// Auto-refresh hook for Firestore collections
export const useFirestoreCollection = (collectionName: string, options?: { 
  refetchInterval?: number;
  enabled?: boolean;
}) => {
  const queryClient = useQueryClient();
  const queryKey = ['firestore', collectionName];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    refetchInterval: options?.refetchInterval || 30000, // 30 seconds default
    enabled: options?.enabled !== false,
  });

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        queryClient.setQueryData(queryKey, data);
      },
      (error) => {
        console.error(`Error listening to ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [collectionName, queryClient]);

  return { data: data || [], isLoading, error };
};

// Auto-refresh hook for Firestore documents
export const useFirestoreDocument = (collectionName: string, docId: string, options?: {
  refetchInterval?: number;
  enabled?: boolean;
}) => {
  const queryClient = useQueryClient();
  const queryKey = ['firestore', collectionName, docId];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const docRef = doc(db, collectionName, docId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    },
    refetchInterval: options?.refetchInterval || 30000,
    enabled: options?.enabled !== false && !!docId,
  });

  // Set up real-time listener
  useEffect(() => {
    if (!docId) return;

    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (snapshot) => {
        const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        queryClient.setQueryData(queryKey, data);
      },
      (error) => {
        console.error(`Error listening to ${collectionName}/${docId}:`, error);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId, queryClient]);

  return { data, isLoading, error };
};

// Auto-refresh hook for filtered collections
export const useFirestoreQuery = (
  collectionName: string, 
  filters: Array<{ field: string; operator: any; value: any }> = [],
  options?: { refetchInterval?: number; enabled?: boolean }
) => {
  const queryClient = useQueryClient();
  const queryKey = ['firestore', collectionName, 'filtered', JSON.stringify(filters)];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = collection(db, collectionName);
      
      if (filters.length > 0) {
        const queryConstraints = filters.map(filter => 
          where(filter.field, filter.operator, filter.value)
        );
        q = query(q, ...queryConstraints) as any;
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    refetchInterval: options?.refetchInterval || 30000,
    enabled: options?.enabled !== false,
  });

  // Set up real-time listener
  useEffect(() => {
    let q = collection(db, collectionName);
    
    if (filters.length > 0) {
      const queryConstraints = filters.map(filter => 
        where(filter.field, filter.operator, filter.value)
      );
      q = query(q, ...queryConstraints) as any;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        queryClient.setQueryData(queryKey, data);
      },
      (error) => {
        console.error(`Error listening to filtered ${collectionName}:`, error);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters), queryClient]);

  return { data: data || [], isLoading, error };
};

// Global refresh function
export const useGlobalRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['firestore'] });
  };

  const refreshCollection = (collectionName: string) => {
    queryClient.invalidateQueries({ queryKey: ['firestore', collectionName] });
  };

  return { refreshAll, refreshCollection };
};
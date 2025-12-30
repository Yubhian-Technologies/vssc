import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

interface DocType {
  createdBy: string;
  colleges: string[];
  totalDuration: number;
  validated: boolean;
  skills?: string[];
  [key: string]: any;
}

export interface AggregatedData {
  uid: string;
  name: string;
  totalDuration: number;
  sessionCount: number;
  skills: string[];
}

const collections = [
  'tutoring',
  'academicadvising',
  'studyworkshop',
  'counseling',
  'psychologycounseling',
];

export const useDashboardData = (adminCollege: string | null) => {
  const queryClient = useQueryClient();
  const [realTimeData, setRealTimeData] = useState<AggregatedData[]>([]);

  // Set up real-time listeners for all collections
  useEffect(() => {
    if (!adminCollege) return;

    const unsubscribers: Array<() => void> = [];

    // Listen to all service collections
    collections.forEach(collectionName => {
      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        () => {
          // Trigger a refetch when any collection changes
          queryClient.invalidateQueries({ queryKey: ['dashboardData', adminCollege] });
        },
        (error) => {
          console.error(`Error listening to ${collectionName}:`, error);
        }
      );
      unsubscribers.push(unsubscribe);
    });

    // Listen to users collection for name changes
    const usersUnsubscribe = onSnapshot(
      collection(db, 'users'),
      () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardData', adminCollege] });
      },
      (error) => {
        console.error('Error listening to users collection:', error);
      }
    );
    unsubscribers.push(usersUnsubscribe);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [adminCollege, queryClient]);

  // React Query for data fetching with auto-refresh
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData', adminCollege],
    queryFn: async () => {
      if (!adminCollege) return [];

      try {
        // Fetch all collections
        const fetchPromises = collections.map(async (col) => {
          const snapshot = await getDocs(collection(db, col));
          return snapshot.docs.map((d) => d.data() as DocType);
        });

        const results = await Promise.all(fetchPromises);
        const allDocs = results.flat();

        // Filter documents by admin college and validation status
        const filteredDocs = allDocs.filter(
          (doc) =>
            doc.colleges?.includes(adminCollege) && doc.validated === true
        );

        // Aggregate data by creator
        const statsByCreator: Record<
          string,
          { totalDuration: number; sessionCount: number; skills: Set<string> }
        > = {};

        filteredDocs.forEach((doc) => {
          if (doc.createdBy) {
            if (!statsByCreator[doc.createdBy]) {
              statsByCreator[doc.createdBy] = {
                totalDuration: 0,
                sessionCount: 0,
                skills: new Set(),
              };
            }
            statsByCreator[doc.createdBy].totalDuration += doc.totalDuration || 0;
            statsByCreator[doc.createdBy].sessionCount += 1;
            if (Array.isArray(doc.skills)) {
              doc.skills.forEach((skill) =>
                statsByCreator[doc.createdBy].skills.add(skill)
              );
            }
          }
        });

        // Fetch all users to get names
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const uidNameMap: Record<string, string> = {};

        usersSnapshot.docs.forEach((userDoc) => {
          const data = userDoc.data();
          if (data.name) {
            uidNameMap[userDoc.id] = data.name;
          }
        });

        // Build aggregated data
        const aggregatedData: AggregatedData[] = Object.entries(statsByCreator)
          .map(([uid, { totalDuration, sessionCount, skills }]) => {
            const name = uidNameMap[uid];
            if (!name) return null;
            return {
              uid,
              name,
              totalDuration,
              sessionCount,
              skills: Array.from(skills),
            };
          })
          .filter((item): item is AggregatedData => item !== null);

        setRealTimeData(aggregatedData);
        return aggregatedData;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    enabled: !!adminCollege,
    refetchInterval: 30000, // 30 seconds
    staleTime: 10000, // 10 seconds
  });

  return {
    data: data || realTimeData,
    isLoading: isLoading && realTimeData.length === 0,
    error,
  };
};
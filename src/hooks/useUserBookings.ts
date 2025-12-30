import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

// Unified Booking Interface
export interface UnifiedBooking {
  id: string;
  serviceType: 'Tutoring' | 'Academic Advising' | 'Study Workshop' | 'Counseling' | 'Psychology Counseling';
  sessionId: string;
  title: string;
  tutorName: string;
  date: string;
  startTime?: string;
  slotTime?: string;
  type: 'group' | '1-on-1';
  skills: string[];
  colleges: string[];
  description: string;
  expiryDate?: string;
  expiryTime?: string;
  status: 'upcoming' | 'confirmed' | 'expired' | 'cancelled' | 'completed';
}

// Service-to-Collection Mapping
const SERVICE_COLLECTIONS: Record<UnifiedBooking['serviceType'], string> = {
  'Tutoring': 'tutoring',
  'Academic Advising': 'academicadvising',
  'Study Workshop': 'studyworkshop',
  'Counseling': 'counseling',
  'Psychology Counseling': 'psychologycounseling',
} as const;

// Check if a session is expired
const isSessionExpired = (expiryDate?: string, expiryTime?: string): boolean => {
  if (!expiryDate || !expiryTime) return false;
  const [year, month, day] = expiryDate.split('-').map(Number);
  const [hours, minutes] = expiryTime.split(':').map(Number);
  const expiryDateTime = new Date(year, month - 1, day, hours, minutes);
  return new Date() > expiryDateTime;
};

export const useUserBookings = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [realTimeData, setRealTimeData] = useState<UnifiedBooking[]>([]);

  // Set up real-time listeners for all service collections
  useEffect(() => {
    if (!userId) return;

    const unsubscribers: Array<() => void> = [];

    Object.entries(SERVICE_COLLECTIONS).forEach(([serviceType, collectionName]) => {
      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const allSessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as any,
          }));

          const userBookings: UnifiedBooking[] = [];

          allSessions.forEach((session: any) => {
            let isBooked = false;
            let slotTime: string | undefined;

            if (session.isGroup) {
              isBooked = session.participants?.includes(userId) || false;
            } else {
              const bookedSlot = session.bookedSlots?.find(
                (slot: { user?: string; time?: string }) => slot.user === userId
              );
              isBooked = !!bookedSlot;
              if (bookedSlot) slotTime = bookedSlot.time;
            }

            if (isBooked && session.date) {
              let status: UnifiedBooking['status'];
              
              if (session.validated === true && isSessionExpired(session.expiryDate, session.expiryTime)) {
                status = 'expired';
              } else if (session.validated === true) {
                status = 'completed';
              } else if (isSessionExpired(session.expiryDate, session.expiryTime)) {
                status = 'expired';
              } else if (new Date(session.date) > new Date()) {
                status = 'upcoming';
              } else {
                status = 'confirmed';
              }

              userBookings.push({
                id: `${session.id}-${userId}`,
                serviceType: serviceType as UnifiedBooking['serviceType'],
                sessionId: session.id,
                title: session.title || 'Untitled Session',
                tutorName: session.tutorName || 'Unknown Tutor',
                date: session.date,
                startTime: session.startTime,
                slotTime,
                type: session.isGroup ? 'group' : '1-on-1',
                skills: session.skills || [],
                colleges: session.colleges || [],
                description: session.description || '',
                expiryDate: session.expiryDate,
                expiryTime: session.expiryTime,
                status,
              });
            }
          });

          // Update real-time data for this service type
          setRealTimeData(prev => {
            const nonServiceBookings = prev.filter(b => b.serviceType !== serviceType);
            return [...nonServiceBookings, ...userBookings];
          });

          // Update React Query cache
          queryClient.setQueryData(['userBookings', userId], (oldData: UnifiedBooking[] = []) => {
            const nonServiceBookings = oldData.filter(b => b.serviceType !== serviceType);
            return [...nonServiceBookings, ...userBookings];
          });
        },
        (error) => {
          console.error(`Error fetching bookings for ${serviceType}:`, error);
        }
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userId, queryClient]);

  // React Query for initial data and background refetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['userBookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      return realTimeData;
    },
    enabled: !!userId,
    refetchInterval: 30000, // 30 seconds
    initialData: realTimeData,
  });

  return {
    bookings: data || realTimeData,
    isLoading: isLoading && realTimeData.length === 0,
    error,
  };
};
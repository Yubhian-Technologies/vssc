import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { AuthProvider } from "./AuthContext";
import AccountPage from "./pages/AccountPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/AuthPage";
import About from "./pages/About";
import Services from "./pages/Services";
import TourPage from "./pages/TourPage";
import CampusPage from "./pages/CampusPage";
import Tutoring from "./pages/TutoringPage";
import { Toaster as HotToaster } from "react-hot-toast";
import Help from "./pages/Help";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "./ProctectedRoute";
import HeroSection from "./components/HeroSection";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Appointment from "./pages/AppointmentPage";
import Reservations from "./pages/RequestedAppointments ";
import AddAdmin from "./pages/addAdmin";
import Counseling from "./pages/CounselingPage";
import Pyschology from "./pages/PsychologyCounselingPage";
import Academic from "./pages/AcademicAdvisingPage";
import StudyWorkshop from "./pages/StudyWorkshopPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ScrollToTopButton from "./components/ScrollToTopButton";
import LoadingScreen from "./components/LoadingScreen";
import EventsPage from "./pages/EventsPage";
import FindingNemoPage from "./pages/FindingNemoPage";
import TheIncrediblesPage from "./pages/TheIncrediblesPage";
import InsideOutPage from "./pages/InsideOutPage";
import ThePursuitOfHappinessPage from "./pages/ThePursuitOfHappinessPage";
import HappyFeetPage from "./pages/HappyFeetPage";
import HiddenFiguresPage from "./pages/HiddenFiguresPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 30000, // 30 seconds
      staleTime: 10000, // 10 seconds
      retry: 3,
    },
  },
});

const AdminPlusRoute = ({ children }: { children: React.ReactNode }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userData || userData.role !== "admin+") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Hide header and footer only on /auth page
  const hideHeaderFooter = location.pathname === "/auth";

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen></LoadingScreen>;

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tour" element={<TourPage />} />
        <Route path="/campus/:id" element={<CampusPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/Events" element={<EventsPage />} />
        <Route path="/Events/FindingNemo" element={<FindingNemoPage />} />
        <Route path="/Events/TheIncredibles" element={<TheIncrediblesPage />} />
        <Route path="/Events/InsideOut" element={<InsideOutPage />} />
        <Route path="/Events/ThePursuitOfHappiness" element={<ThePursuitOfHappinessPage />} />
        <Route path="/Events/HappyFeet" element={<HappyFeetPage />} />
        <Route path="/Events/HiddenFigures" element={<HiddenFiguresPage />} />

        {/* Auth Routes */}
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
        <Route path="/hero" element={user ? <HeroSection /> : <Navigate to="/auth" replace />} />

        {/* Protected Service Routes */}
        <Route
          path="/services/tutoring"
          element={
            <ProtectedRoute>
              <Tutoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/counseling"
          element={
            <ProtectedRoute>
              <Counseling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/academic-advising"
          element={
            <ProtectedRoute>
              <Academic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/study-workshops"
          element={
            <ProtectedRoute>
              <StudyWorkshop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services/psychology-counseling"
          element={
            <ProtectedRoute>
              <Pyschology />
            </ProtectedRoute>
          }
        />

        {/* Other Protected Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment"
          element={
            <ProtectedRoute>
              <Appointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addAdmin"
          element={
            <ProtectedRoute>
              <AdminPlusRoute>
                <AddAdmin />
              </AdminPlusRoute>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
      <ScrollToTopButton />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

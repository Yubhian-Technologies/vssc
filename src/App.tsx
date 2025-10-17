import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import MyBookingsPage from "./pages/MyBookingsPage"; // ✅ ADD THIS IMPORT
import ScrollToTopButton from "./components/ScrollToTopButton";
import LoadingScreen from "./components/LoadingScreen";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize AOS on app mount
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen></LoadingScreen>

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/tour" element={<TourPage />} />
              <Route path="/campus/:id" element={<CampusPage />} />
              <Route path="/help" element={<Help />} />

              {/* Auth Routes */}
              <Route 
                path="/auth" 
                element={!user ? <Auth /> : <Navigate to="/" replace />} 
              />

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
                    <AddAdmin />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Footer />
            <ScrollToTopButton />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
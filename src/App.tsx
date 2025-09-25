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
import Help from "./pages/Help";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "./ProctectedRoute";
import HeroSection from "./components/HeroSection";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const queryClient = new QueryClient();

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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tour" element={<TourPage />} />
        <Route path="/campus/:id" element={<CampusPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/hero" replace />} />
        <Route path="/hero" element={user ? <HeroSection /> : <Navigate to="/auth" replace />} />
        <Route
          path="/services/tutoring"
          element={
            <ProtectedRoute>
              <Tutoring />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

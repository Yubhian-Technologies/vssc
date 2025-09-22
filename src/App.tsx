import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import AccountPage from "./pages/AccountPage"
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/AuthPage";
import About from "./pages/About";
import Services from "./pages/Services";
import TourPage from "./pages/TourPage";
import Help from "./pages/Help";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import HeroSection from "./components/HeroSection";
import { auth } from "./firebase"; // import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

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
      setLoading(false); // stop loading once state is determined
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tour" element={<TourPage />} />
            <Route path="/help" element={<Help />} />
            <Route path = "/account" element={<AccountPage/>} />
            
            {/* Auth route: redirect to hero if already logged in */}
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/hero" replace />} />

            {/* Hero route: redirect to auth if not logged in */}
            <Route path="/hero" element={user ? <HeroSection /> : <Navigate to="/auth" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

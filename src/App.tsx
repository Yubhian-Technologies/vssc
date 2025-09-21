import { useEffect } from "react"; // <-- import useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import TourPage from "./pages/TourPage";
import Help from "./pages/Help";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


const queryClient = new QueryClient();

const App = () => {
  // Initialize AOS on app mount
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration in ms
      once: true,     // whether animation should happen only once while scrolling down
      easing: "ease-out",
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
       
        <BrowserRouter>
          <Header></Header>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About></About>}></Route>
            <Route path="/services" element={<Services></Services>}></Route>
            <Route path="/tour" element={<TourPage></TourPage>}></Route>
            <Route path="/help" element={<Help></Help>}></Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer></Footer>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

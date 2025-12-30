
import HeroSection from "@/components/HeroSection";
import CoursesSection from "@/components/CoursesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import AboutUs from "@/components/AboutUs";
import ServicesSection from "@/components/ServicesSection";
import { usePageAutoRefresh } from "@/hooks/usePageAutoRefresh";

const Index = () => {
  // Enable auto-refresh for the home page (refreshes testimonials and other dynamic content)
  usePageAutoRefresh({
    interval: 60000, // 1 minute for home page
    queryKeys: [['firestore', 'testimonials']]
  });
  return (
    <div className="min-h-screen bg-background ">
    
      <main>
        <HeroSection />
        <CoursesSection />
        <ServicesSection></ServicesSection>
        <AboutUs></AboutUs>
        <TestimonialsSection />
        <BlogSection />
      </main>
      
    </div>
  );
};

export default Index;

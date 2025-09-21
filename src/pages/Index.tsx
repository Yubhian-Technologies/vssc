
import HeroSection from "@/components/HeroSection";
import CoursesSection from "@/components/CoursesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";

import AboutUs from "@/components/AboutUs";
import ServicesSection from "@/components/ServicesSection";

const Index = () => {
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

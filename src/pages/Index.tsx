import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CoursesSection from "@/components/CoursesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import AboutUs from "@/components/AboutUs";
import ServicesSection from "@/components/ServicesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background ">
      <Header />
      <main>
        <HeroSection />
        <CoursesSection />
        <ServicesSection></ServicesSection>
        <AboutUs></AboutUs>
        <TestimonialsSection />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

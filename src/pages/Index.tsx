import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CoursesSection from "@/components/CoursesSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InstructorSection from "@/components/InstructorSection";
import AppDownloadSection from "@/components/AppDownloadSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import CheckAppointments from "@/components/CheckAppointments";
import AboutUs from "@/components/AboutUs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CoursesSection />
        {/* <FacilitiesSection /> */}
        <AboutUs></AboutUs>
        {/* <CheckAppointments></CheckAppointments> */}
        <TestimonialsSection />
        {/* <InstructorSection /> */}
        {/* <AppDownloadSection /> */}
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

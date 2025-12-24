import React from "react";
import { useNavigate } from "react-router-dom";
import heroStudent from "@/assets/yellow1.png";
import Instructorman from "@/assets/pursuit5.jpg";

const AboutUs = () => {
  const navigate = useNavigate(); // ✅ React Router hook

  const handleExploreClick = () => {
    navigate("/about"); // ✅ Navigate to About page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ Scroll to top after route change
    }, 100);
  };

  return (
    <section data-aos="fade-down" className="py-16 [background-color:hsl(36, 100%, 85%)]">
      <div className="text-center items-center justify-center mb-12 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <span className="text-primary font-semibold uppercase text-2xl mb-2 block">
          About Us
        </span>
      </div>

      <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-12">
        {/* Left side images */}
        <div className="lg:w-1/2 w-full relative " style={{ minHeight: "300px" }}>
          <img
            src={heroStudent}
            alt="About Us"
            className=" w-[80%] sm:w-[65%] rounded-lg shadow-lg "
          />
          <img
            src={Instructorman}
            alt="Instructor"
            className="w-[50%] sm:w-[45%] rounded-lg shadow-lg absolute "
            style={{
              top: "25%",
              left: "32%",
              transform: "translate(33%, 33%)",
            }}
          />
        </div>

        {/* Right side content */}
        <div className="lg:w-1/2 w-full flex flex-col justify-center mt-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            What Does VSSC Offer? <br /> For Your Learning
          </h2>

          <p className="text-gray-600 text-sm mb-8">
            The Vishnu Student Success Centre (VSSC) provides a comprehensive range of
            resources designed to support and enhance every aspect of student development.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-primary text-3xl flex items-center"></div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Our Services</h4>
                <p className="text-gray-600 text-sm">
                  Academic guidance, peer tutoring & mentoring, and career counselling.
                  Build communication, leadership, and corporate-ready skills while focusing
                  on wellness and self-care.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-primary text-3xl flex items-center"></div>
              <div>
                <h6 className="font-semibold text-gray-900 mb-1">Our Mission</h6>
                <p className="text-gray-600 text-sm">
                  To foster a nurturing and inclusive environment that promotes:
                </p>
                <ul className="list-disc ml-5 text-gray-700 text-sm">
                  <li>Academic Excellence</li>
                  <li>Personal Growth</li>
                  <li>Career Readiness</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Explore Button with routing */}
          <button
            onClick={handleExploreClick}
            className="bg-primary text-white px-5 py-2 sm:px-5 sm:py-3 rounded-lg hover:bg-primary-dark transition"
          >
            Explore More About
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

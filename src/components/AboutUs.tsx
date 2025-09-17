import React from "react";
import heroStudent from "@/assets/hero-student.jpg";
import Instructorman from "@/assets/instructor-man.jpg";

const AboutUs = () => {
  return (
    <section className="py-16 bg-white">
  <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-12">
    
    {/* Left Column: Image */}
    <div className="lg:w-1/2 w-full relative" style={{ minHeight: "300px" }}>
  
  <img
    src={heroStudent}
    alt="About Us"
    className="w-[75%] rounded-lg shadow-lg"
  />

  
  <img
    src={Instructorman}
    alt="Instructor"
    className="w-2/4 rounded-lg shadow-lg absolute"
    style={{
      top: "25%",
      left: "25%",
      transform: "translate(33%, 33%)",
    }}
  />
</div>

    {/* Right Column: Text Content */}
    <div className="lg:w-1/2 w-full flex flex-col justify-center">
  {/* About Us Label */}
  <span className="text-primary font-semibold uppercase text-2xl mb-2 ">
    About Us
  </span>

  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
    We are Always the Best Course <br /> For Your Learning
  </h2>

  <p className="text-gray-600 mb-8">
    Far far away, behind the word mountains, far from the Consonantia, there live the blind texts.
    Separated they mark grove right at the coast of the Semantics, a large language ocean.
  </p>

  {/* Features */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
    <div className="flex items-start gap-4">
    <div className="text-primary text-3xl flex items-center">
      {/* Courses Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.002 12.083 12.083 0 015.84 10.578L12 14z" />
      </svg>
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">Expert Courses</h4>
      <p className="text-gray-600 text-sm">High-quality courses taught by experienced instructors to boost your learning and skills.</p>
    </div>
  </div>

  {/* Feature 2 */}
  <div className="flex items-start gap-4">
    <div className="text-primary text-3xl flex items-center">
      {/* Event Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6m2 0H7a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">Event Management</h4>
      <p className="text-gray-600 text-sm">Organize and track college events, workshops, and competitions efficiently with ease.</p>
    </div>
  </div>
  </div>

  <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition">
    Explore More About
  </button>
</div>

  </div>
</section>

  );
};

export default AboutUs;

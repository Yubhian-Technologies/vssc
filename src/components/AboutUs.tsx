import React from "react";
import heroStudent from "@/assets/hero-student.jpg";
import Instructorman from "@/assets/instructor-man.jpg";

const AboutUs = () => {
  return (
    
    <section data-aos="fade-down"  className="py-16 [background-color:hsl(36, 100%, 85%)] ">
       <div className="text-center mb-12 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <span className="text-primary font-semibold uppercase text-2xl mb-2 block">
          About Us
        </span>
      </div>
  <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-12">
    
    
    <div className="lg:w-1/2 w-full relative" style={{ minHeight: "300px" }}>
  
  <img
    src={heroStudent}
    alt="About Us"
    className="w-[75%] rounded-lg shadow-lg "
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

    
    <div className="lg:w-1/2 w-full flex flex-col justify-center">
  
 

  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
     What Does VSSC Offer?   <br /> For Your Learning
  </h2>

  <p className="text-gray-600 mb-8">
    The Vishnu Student Success Centre (VSSC) provides a comprehensive range of resources designed 
    to support and enhance every aspect of student development.
  </p>

  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
    <div className="flex items-start gap-4">
    <div className="text-primary text-3xl flex items-center">
      {/* Courses Icon */}
      
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">Our Services</h4>
      <p className="text-gray-600 text-sm"> 🎓 Academic Advice – Guidance to help you excel in your studies.</p>
      <p className="text-gray-600 text-sm"> 🤝 Peer Tutoring & Mentoring – Learn from and collaborate with fellow students.</p>
      <p className="text-gray-600 text-sm"> 💼 Career Counselling – Prepare for future opportunities with personalised guidance.</p>
      <p className="text-gray-600 text-sm"> 🗣️ Communication Skills – Build confidence in public speaking and interpersonal skills.</p>
      <p className="text-gray-600 text-sm"> 🌱 Personality Development – Improve self-awareness and leadership qualities.</p>
      <p className="text-gray-600 text-sm"> 🏢 Corporate-readiness Workshops – Gain essential workplace skills. </p>
      <p className="text-gray-600 text-sm"> 💆 Self-care Strategies & Wellness Practices – Focus on balance and well-being. </p>







    </div>
  </div>

  
  <div className="flex items-start gap-4">
    <div className="text-primary text-3xl flex items-center">
   
     
    </div>
    <div>
      <h6 className="font-semibold text-gray-900 mb-1">🎯 Our Mission</h6>
      <p className="text-gray-600 text-sm"><h3>To foster a nurturing and inclusive environment that promotes:</h3></p>
      <b><h1>Academic Excellence</h1>
      <h1>Personal Growth</h1>
      <h1>Career Readiness</h1></b>
      
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

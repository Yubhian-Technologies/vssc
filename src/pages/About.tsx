import React from "react";
import heroImage from "@/assets/hero-student.jpg";
import filter21 from "@/assets/filter21.jpg";

const About = () => {
  return (
    <div className="w-full">
      
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={heroImage}
          alt="About Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="max-w-2xl text-lg">
            Learn more about our journey, mission, and vision for the future.
          </p>
        </div>
      </div>

     
      <section className="w-full py-28 px-6 md:px-12 lg:px-20 bg-[hsl(60,100%,95%)]">
        <div className="max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
         
          <h2 className="text-3xl font-bold text-primary text-center md:hidden mb-6">About Us</h2>

          <div className="relative w-full flex justify-center">
            <div className="relative w-[90%] md:w-[80%]">
              <img
                src={heroImage}
                alt="About 1"
                className="w-[70%] sm:w-[75%] md:w-[90%] rounded-2xl shadow-xl border bg-[hsl(60,100%,95%)] relative z-10 mx-auto transform transition-transform duration-700 hover:-translate-y-2"
              />
              <img
                src={filter21}
                alt="About 2"
                className="w-[50%] sm:w-[55%] md:w-[70%] rounded-2xl shadow-lg z-10 border bg-[hsl(60,100%,95%)] absolute bottom-[-20%] left-[40%] md:left-[40%] transform transition-transform duration-700 hover:-translate-y-2"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            <h2 className="hidden md:block text-3xl font-bold text-primary">About Us</h2>
            <p className="text-gray-700 leading-relaxed">
              The Vishnu Student Success Centre is open to all students within the Sri Vishnu Educational Society. Whether you are a first-year student adjusting to college life, a senior preparing for professional life, or anywhere in between, our resources and services are designed to meet your unique needs and help you succeed.
            </p>
          </div>
        </div>
      </section>

    
      <section className="w-full py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 shadow-lg rounded-xl overflow-hidden">
          
          <div className="md:w-1/2 w-full bg-[hsl(60,100%,95%)] text-black p-10 flex flex-col justify-center">
            <h2 className="text-3xl text-primary font-bold mb-6">What Does VSSC Offer?</h2>
            <p className="text-base leading-relaxed">
              We offer a comprehensive range of resources designed to support and enhance all aspects of student development. Our services include personalised tutoring, academic advising, and career counselling, each tailored to individual needs. Additionally, we host a variety of workshops aimed at promoting student wellness, growth, and confidence, ensuring a well-rounded approach to success.
            </p>
          </div>

       
          <div className="md:w-1/2 w-full bg-primary text-white p-10 flex flex-col justify-center rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-lg">
              <li>Academic Advice</li>
              <li>Peer Tutoring</li>
              <li>Career Counselling</li>
              <li>Peer Mentoring</li>
              <li>Communication Skills</li>
              <li>Personality Development</li>
              <li>Corporate-readiness Workshops</li>
              <li>Self-care Strategies</li>
              <li>Wellness Practices</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
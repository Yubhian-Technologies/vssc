import React from "react";
import heroImage from "@/assets/hero-student.jpg";
import filter21 from "@/assets/filter21.jpg";
import {motion} from "framer-motion"
import aboutelement from "@/assets/about-element-1.png"

const About = () => {
  return (
    <div className="w-full">
      
       <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={heroImage}
          alt="About Banner"
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
          className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          VISHNU GALLERY
        </motion.h1>
          <p className="max-w-2xl text-lg">
            Explore the beautiful campuses of the Vishnu Educational Society. Each campus offers world-class facilities, a vibrant student life, and a commitment to academic excellence.
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
  
      {/* Our Mission Section */}
<section className="w-full py-20 px-6 md:px-12 lg:px-20 bg-[hsl(60,100%,95%)]">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">

    {/* Left Side */}
    <div className="md:w-1/2 w-full flex flex-col items-start space-y-4">
      
      <h2 className="text-3xl md:text-4xl font-semibold text-primary">
        Commitment
      </h2>
      <p className="text-gray-700 leading-relaxed  text-xl">
       We are committed to helping students navigate their educational paths, overcome challenges, and achieve their goals through personalised support and guidance.
        
      </p>

      <img
        src={aboutelement}
        alt="We Value"
        className="w-full md:w-4/5 rounded-xl shadow-lg mt-6 hover:scale-[1.02] transition-transform duration-500"
      />
    </div>

    {/* Right Side - Our Mission Box */}
    <div className="md:w-2/3 w-full flex justify-center md:justify-end">
      <div className="w-[90%] md:w-[70%] bg-[#001E6C]  shadow-2xl flex flex-col justify-center items-center text-center py-16 px-6 md:px-8 space-y-10 border-3 border-white">
        
        {/* Heading */}
        <div>
          <h2
            className="text-5xl md:text-6xl font-extrabold text-white leading-tight"
            style={{ fontFamily: '"Rubik Distressed", system-ui', letterSpacing: "2px" }}
          >
            OUR
          </h2>
          <h3
            className="text-4xl md:text-5xl italic font-bold text-white"
            style={{ fontFamily: '"Comic Neue", cursive' }}
          >
            MISSION
          </h3>
        </div>

        {/* Inner white description box */}
        <div className="bg-background text-black p-8 md:p-10 rounded-3xl shadow-xl max-w-[90%] mx-auto">
          <p className="text-lg md:text-xl leading-relaxed font-serif">
            To create a supportive, inclusive, and dynamic environment where every
            student can discover their potential, build essential life skills, and
            confidently shape their future.
          </p>
        </div>
      </div>
    </div>

  </div>
</section>


    </div>
  );
};

export default About;
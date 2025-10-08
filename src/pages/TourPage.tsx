import React from "react";
import { useNavigate } from "react-router-dom";
import Tilt from "react-parallax-tilt";

import filter21 from "../assets/filter21.jpg";
import filter22 from "../assets/filter22.jpg";
import filter23 from "../assets/filter23.jpg";
import filter24 from "../assets/filter24.jpg";
import filter25 from "../assets/filter25.jpg";
import filter26 from "../assets/filter26.jpg";
import Land1 from "../assets/Land1.jpg";

export const campuses = [
  {
    id: 1,
    name: "Vishnu Institute of Technology",
    cover: filter21,
    gallery: [
      { id: "1-1", src: filter21, alt: "Campus front view", description: "Welcome to our beautiful campus entrance." },
      { id: "1-2", src: filter22, alt: "Library", description: "State-of-the-art library with thousands of books." },
    ],
    description: "Explore the beautiful campus of Vishnu Institute of Technology with world-class facilities and vibrant student life.",
  },
  {
    id: 2,
    name: "Vishnu Dental College",
    cover: filter23,
    gallery: [
      { id: "2-1", src: filter23, alt: "Innovation Lab", description: "Where students experiment and innovate." },
      { id: "2-2", src: filter24, alt: "Hostel", description: "Comfortable student hostels with modern amenities." },
    ],
    description: "Experience academic excellence and modern amenities at Vishnu Dental College.",
  },
  {
    id: 3,
    name: "Vishnu Pharmacy",
    cover: filter25,
    gallery: [
      { id: "3-1", src: filter25, alt: "Auditorium", description: "Venue for seminars, events, and cultural programs." },
      { id: "3-2", src: filter26, alt: "Cafeteria", description: "Delicious meals and a friendly atmosphere." },
    ],
    description: "Join a thriving community at Vishnu Pharmacy with top-notch facilities and vibrant student life.",
  },
];

const TourPage: React.FC = () => {
  const navigate = useNavigate();

  const campusBgColors = [
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
  ];

  return (
    <div className="bg-gray-50">
      {/* Banner */}
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img src={Land1} alt="Tour Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[hsl(60,100%,95%)]">
            VISHNU GALLERY
          </h1>
          <p className="text-lg max-w-3xl text-[hsl(60,100%,95%)]">
            Explore the beautiful campuses of the Vishnu Educational Society. Each campus offers world-class facilities, a vibrant student life, and a commitment to academic excellence.
          </p>
        </div>
      </div>

      {/* Campus Section */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="flex flex-col gap-16 px-6 lg:px-16 py-12">
          {campuses.map((campus, index) => (
            <div
              key={campus.id}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              } ${campusBgColors[index % campusBgColors.length]} rounded-xl p-8`}
            >
              {/* Image */}
              <Tilt
                glareEnable
                glareMaxOpacity={0.3}
                scale={1.05}
                className="md:w-1/2 w-full rounded-xl overflow-hidden shadow-lg"
              >
                <img
                  src={campus.cover}
                  alt={campus.name}
                  className="w-full h-64 md:h-80 object-cover"  
                />
              </Tilt>

              {/* Description */}
              <div className="md:w-1/2 w-full flex flex-col gap-4">
                <h2 className="text-2xl font-bold">{campus.name}</h2>
                <p className="text-gray-700">{campus.description}</p>
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                     navigate(`/campus/${campus.id}`);
                  }}
                  className="self-start px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-900 transition"
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-20 py-16 bg-[hsl(60,100%,95%)]">
        
        <div className="w-full md:w-[45%] rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-52 md:h-64 rounded-xl"
            src="https://www.youtube.com/embed/uUIUE1hQ6_s?autoplay=1&mute=1&loop=1&playlist=uUIUE1hQ6_s&controls=1&modestbranding=1"
            title="VSSC Overview"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          ></iframe>


        </div>

        
        <div className="w-full md:w-[45%] flex flex-col gap-3 text-gray-800">
          <h2 className="text-2xl font-bold text-primary">Vishnu Student Success Centre (VSSC)</h2>
          <p className="text-base leading-relaxed">
            The Vishnu Student Support Center (VSSC) is dedicated to guiding and mentoring students in their academic journey.
            It fosters innovation, collaboration, and personal development through regular workshops and counseling sessions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TourPage;

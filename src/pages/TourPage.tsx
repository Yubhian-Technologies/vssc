import React from "react";
import { useNavigate } from "react-router-dom";
import Tilt from "react-parallax-tilt";

import filter21 from "../assets/filter21.jpg";
import filter22 from "../assets/filter22.jpg";
import filter23 from "../assets/filter23.jpg";
import filter24 from "../assets/filter24.jpg";
import filter25 from "../assets/filter25.jpg";
import filter26 from "../assets/filter26.jpg";

export const campuses = [
  {
    id: 1,
    name: " Vishnu Institute of Technology",
    cover: filter21,
    gallery: [
      { id: "1-1", src: filter21, alt: "Campus front view", description: "Welcome to our beautiful campus entrance." },
      { id: "1-2", src: filter22, alt: "Library", description: "State-of-the-art library with thousands of books." },
    ],
    description: "Explore the beautiful campus of Vishnu Institute of Technology with world-class facilities and vibrant student life.",
  },
  {
    id: 2,
    name: " Vishnu Dental College",
    cover: filter23,
    gallery: [
      { id: "2-1", src: filter23, alt: "Innovation Lab", description: "Where students experiment and innovate." },
      { id: "2-2", src: filter24, alt: "Hostel", description: "Comfortable student hostels with modern amenities." },
    ],
    description: "Experience academic excellence and modern amenities at Vishnu Dental College.",
  },
  {
    id: 3,
    name: " Vishnu Pharmacy",
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

  return (
    <div className="bg-gray-50">
      {/* Banner */}
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={filter21}
          alt="Tour Banner"
          className="w-full h-full object-cover"
        />
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

      {/* Flex Row Campuses */}
      <div className="flex flex-col gap-16 px-6 lg:px-16 py-12">
        {campuses.map((campus, index) => (
          <div
            key={campus.id}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              index % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image */}
            <Tilt glareEnable glareMaxOpacity={0.3} scale={1.05} className="md:w-1/2 w-full rounded-xl overflow-hidden shadow-lg">
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
                onClick={() => navigate(`/campus/${campus.id}`)}
                className="self-start px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Explore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourPage;

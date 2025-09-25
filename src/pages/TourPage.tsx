import React from "react";
import { useNavigate } from "react-router-dom";
import Tilt from "react-parallax-tilt";

// Import images
import filter21 from "../assets/filter21.jpg";
import filter22 from "../assets/filter22.jpg";
import filter23 from "../assets/filter23.jpg";
import filter24 from "../assets/filter24.jpg";
import filter25 from "../assets/filter25.jpg";
import filter26 from "../assets/filter26.jpg";


// Campus data
export const campuses = [
  {
    id: 1,
    name: "🏫 Vishnu Institute of Technology",
    cover: filter21,
    gallery: [
      { id: "1-1", src: filter21, alt: "Campus front view", description: "Welcome to our beautiful campus entrance." },
      { id: "1-2", src: filter22, alt: "Library", description: "State-of-the-art library with thousands of books." },
    ],
  },
  {
    id: 2,
    name: "📚 Vishnu Dental College",
    cover: filter23,
    gallery: [
      { id: "2-1", src: filter23, alt: "Innovation Lab", description: "Where students experiment and innovate." },
      { id: "2-2", src: filter24, alt: "Hostel", description: "Comfortable student hostels with modern amenities." },
    ],
  },
  {
    id: 3,
    name: "🎭 Vishnu Pharmacy",
    cover: filter25,
    gallery: [
      { id: "3-1", src: filter25, alt: "Auditorium", description: "Venue for seminars, events, and cultural programs." },
      { id: "3-2", src: filter26, alt: "Cafeteria", description: "Delicious meals and a friendly atmosphere." },
    ],
  },
];

const TourPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <h1 className="text-3xl lg:text-4xl font-bold text-center py-8">
         VISHNU GALLERY
      </h1>

      {/* Full Banner */}
      <div className="w-full">
        <img
          src={filter21}
          alt="Vishnu Campus Banner"
          className="w-full h-22 md:h-[28rem] object-cover"
        />
        <p className="mt-6 text-lg text-gray-700 text-center max-w-3xl mx-auto px-6">
          Explore the beautiful campuses of the Vishnu Educational Society. Each campus offers world-class facilities, a vibrant student life, and a commitment to academic excellence. Click below to explore more.
        </p>
      </div>

      {/* 3 Campuses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 lg:px-16 py-12">
        {campuses.map((campus) => (
          <Tilt key={campus.id} glareEnable glareMaxOpacity={0.3} scale={1.05}>
            <button
              onClick={() => navigate(`/campus/${campus.id}`)}
              className="relative group rounded-xl overflow-hidden shadow-lg w-full h-64"
            >
              <img
                src={campus.cover}
                alt={campus.name}
                className="w-full h-58 object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xl font-semibold transition">
                {campus.name}
              </div>
            </button>
          </Tilt>
        ))}
      </div>
    </div>
  );
};

export default TourPage;

import React from "react";
import { useNavigate } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

import green1 from "@/assets/green1.png";
import green2 from "@/assets/green2.png";
import green3 from "@/assets/green3.png";

import gallery1 from "../assets/gallery1.jpg";
import gallery2 from "../assets/gallery2.jpg";
import gallery3 from "../assets/gallery3.jpg";
import gallery4 from "../assets/gallery4.jpg";
import gallery5 from "../assets/gallery5.jpg";
import gallery6 from "../assets/gallery6.jpg";
import gallery7 from "../assets/gallery7.jpg";
import gallery8 from "../assets/gallery8.jpg";
import gallery9 from "../assets/gallery9.jpg";
import gallery10 from "../assets/gallery10.jpg";
import gallery11 from "../assets/gallery11.jpg";
import gallery12 from "../assets/gallery12.jpg";
import gallery13 from "../assets/gallery13.jpg";
import gallery14 from "../assets/gallery14.jpg";
import gallery15 from "../assets/gallery15.jpg";

import Land1 from "../assets/Land1.jpg";

export const campuses = [
  {
    id: 1,
    name: "Vishnu Institute of Technology",
    cover: green1,
    gallery: [
      {
        id: "1-1",
        src: gallery7,
        alt: "Campus front view",
        description: "Welcome to our beautiful campus entrance.",
      },
      {
        id: "1-2",
        src: gallery10,
        alt: "Library",
        description: "State-of-the-art library with thousands of books.",
      },
      {
        id: "1-3",
        src: gallery12,
        alt: "Computer Lab",
        description: "Modern computer labs with high-speed internet.",
      },
      {
        id: "1-4",
        src: gallery12,
        alt: "Cafeteria",
        description: "Spacious cafeteria offering a variety .",
      },
      {
        id: "1-5",
        src: gallery7,
        alt: "Sports Complex",
        description: "Indoor sports complex for various activities.",
      },
    ],
    description:
      "Explore the beautiful campus of Vishnu Institute of Technology with world-class facilities and vibrant student life.",
  },
  {
    id: 2,
    name: "Vishnu Dental College",
    cover: green2,
    gallery: [
      {
        id: "2-1",
        src: gallery10,
        alt: "Innovation Lab",
        description: "Where students experiment and innovate.",
      },
      {
        id: "2-2",
        src: gallery7,
        alt: "Hostel",
        description: "Comfortable student hostels with modern amenities.",
      },
      {
        id: "2-3",
        src: gallery8,
        alt: "Auditorium",
        description: "Venue for seminars, events, and cultural programs.",
      },
      {
        id: "2-4",
        src: gallery13,
        alt: "Cafeteria",
        description: "Spacious cafeteria offering a variety of cuisines.",
      },
      {
        id: "2-5",
        src: gallery15,
        alt: "Sports Ground",
        description: "Outdoor sports ground for various activities.",
      },
    ],
    description:
      "Experience academic excellence and modern amenities at Vishnu Dental College.",
  },
  {
    id: 3,
    name: "Vishnu Pharmacy",
    cover: green3,
    gallery: [
      {
        id: "3-1",
        src: gallery1,
        alt: "Auditorium",
        description: "Venue for seminars, events, and cultural programs.",
      },
      {
        id: "3-2",
        src: gallery1,
        alt: "Auditorium",
        description: "Venue for seminars. events and culural programs.",
      },
      {
        id: "3-3",
        src: gallery11,
        alt: "Special Class",
        description: "cultural programs and a friendly atmosphere.",
      },
      {
        id: "3-4",
        src: gallery4,
        alt: "Auditorium",
        description: "Venue for seminars, events, and cultural programs.",
      },
      {
        id: "3-5",
        src: gallery6,
        alt: "Special Class",
        description: "Venue for seminars, events, and cultural programs.",
      },
    ],
    description:
      "Join a thriving community at Vishnu Pharmacy with top-notch facilities and vibrant student life.",
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
        <img
          src={Land1}
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
            Explore the beautiful campuses of the Vishnu Educational Society.
            Each campus offers world-class facilities, a vibrant student life,
            and a commitment to academic excellence.
          </p>
        </div>
      </div>

      {/* Campus Section (Updated layout) */}
      <section className="[background-color:hsl(60,100%,95%)] w-full py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-12 px-5">
          {campuses.map((campus, index) => (
            <div
              key={campus.id}
              className={`flex flex-col md:flex-row items-center md:items-stretch
                 w-full  ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className=" flex justify-center bg-background">
                {/* <Tilt
                  glareEnable
                  glareMaxOpacity={0.3}
                  scale={1.05}
                  className="rounded-xl overflow-hidden shadow-lg"
                > */}
                  <img
                    src={campus.cover}
                    alt={campus.name}
                    className="w-full h-full  md:max-w-sm object-cover"
                  />
                {/* </Tilt> */}
              </div>

              {/* Text block */}
              <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 p-10 mt-0 md:mt-0 bg-background">
  <h2
    className="text-xl sm:text-3xl font-extrabold leading-tight"
    style={{ color: "hsl(220, 70%, 20%)" }}
  >
    {campus.name}
  </h2>
  <p className="text-gray-700 text-sm sm:text-lg max-w-md">{campus.description}</p>
  <button
    onClick={() => {
      window.scrollTo(0, 0);
      navigate(`/campus/${campus.id}`);
    }}
    className="mt-4 text-white px-6 py-2 rounded-lg transition"
    style={{
      backgroundColor: "hsl(220, 70%, 20%)",
    }}
    onMouseOver={(e) =>
      (e.currentTarget.style.backgroundColor = "hsl(220, 70%, 15%)")
    }
    onMouseOut={(e) =>
      (e.currentTarget.style.backgroundColor = "hsl(220, 70%, 20%)")
    }
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
          <h2 className="text-2xl font-bold text-primary">
            Vishnu Student Success Centre (VSSC)
          </h2>
          <p className="text-base leading-relaxed">
            The Vishnu Student Support Center (VSSC) is dedicated to guiding and
            mentoring students in their academic journey. It fosters innovation,
            collaboration, and personal development through regular workshops
            and counseling sessions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TourPage;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event5 from "@/assets/event5.png";
import gallery13 from "../assets/gallery13.jpg";
import gallery14 from "../assets/gallery14.jpg";
import gallery15 from "../assets/gallery15.jpg";
import gallery1 from "../assets/gallery1.jpg";

import yellow1 from "@/assets/yellow1.png";
import yellow2 from "@/assets/yellow2.png";
import yellow3 from "@/assets/yellow3.png";
import yellow4 from "@/assets/yellow4.png";
import yellow5 from "@/assets/yellow5.png";

const sessions = [
  {
    id: 1,
    name: "Career Planning Workshop",
    cover: gallery13,
    description: "Create a comprehensive career plan that aligns with your goals, interests, and market opportunities.",
  },
];

const courses = [
  { focus: "Career Assessment Test", desc: "Career Mapping", image: yellow1 },
  { focus: "Project and Internship Guidance", desc: "Career Mapping", image: yellow2 },
  { focus: "Peer-network for Career-Fairs, Job searches, etc.", desc: "Career Mapping", image: yellow3 },
  { focus: "Career Interest Inventories", desc: "Career Mapping", image: yellow4 },
  { focus: "Experiential Learning Opportunities/ Job shadowing", desc: "Career Mapping", image: yellow4 },
  { focus: "Assistance for Higher studies in Foreign Institutions", desc: "Career Mapping", image: yellow5 },
];

const ThePursuitOfHappinessPage: React.FC = () => {
  const navigate = useNavigate();

  const sessionBgColors = [
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
  ];

  return (
    <div className="bg-gray-50">
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="flex flex-col gap-16 px-6 lg:px-16 py-12">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex flex-col md:flex-row items-start gap-8 ${sessionBgColors[0]} rounded-xl p-8`}
            >
              <img
                src={session.cover}
                alt={session.name}
                className="md:w-1/2 w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
              />
              <div className="md:w-1/2 w-full flex flex-col gap-4">
                <h2 className="text-2xl font-bold">{session.name}</h2>
                <p className="text-gray-700">{session.description}</p>
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate(`/session/${session.id}`);
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

      {/* Description Paragraph */}
      <section className="w-full bg-gray-50 py-8 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="container mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Discover the power of connections as we enable you to forge meaningful 
            relationships, expand your professional network, and thrive through collaboration. 
            This is where you unlock your potential and give it wings! Join us and take your 
            personal and academic experience to the next level
          </p>
        </div>
      </section>

      {/* Courses Grid Section */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Course Offerings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="[background-color:hsl(60,100%,90%)] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-2xl">
                <img
                  src={course.image}
                  alt={course.focus}
                  className="w-full h-48 object-contain"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-2">{course.focus}</h3>
                  <p className="text-gray-700 text-sm">{course.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThePursuitOfHappinessPage;
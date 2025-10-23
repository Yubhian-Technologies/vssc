import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event6 from "@/assets/event6.png";
import gallery6 from "../assets/gallery6.jpg";
import gallery7 from "../assets/gallery7.jpg";
import gallery8 from "../assets/gallery8.jpg";
import gallery9 from "../assets/gallery9.jpg";

import hidden1 from "@/assets/hidden1.jpg";
import hidden2 from "@/assets/hidden2.jpg";
import hidden3 from "@/assets/hidden3.jpg";
import hidden4 from "@/assets/hidden4.jpg";
import hidden5 from "@/assets/hidden5.jpg";
import hidden6 from "@/assets/hidden6.jpg";

const sessions = [
  {
    id: 1,
    name: "Professional Skills Development",
    cover: gallery6,
    description: "Develop essential professional skills including communication, presentation, and workplace etiquette.",
  },
];

const courses = [
  { focus: "Understanding Corporate Culture", desc: "Professional Readiness", image: hidden1 },
  { focus: "Honing Interview Skills", desc: "Professional Readiness", image: hidden2 },
  { focus: "Interacting with Industry Experts", desc: "Professional Readiness", image: hidden3 },
  { focus: "Learning Team-Building Techniques", desc: "Professional Readiness", image: hidden4 },
  { focus: "Training for Leadership Roles", desc: "Professional Readiness", image: hidden5 },
  { focus: "Tapping into Constructive Feedback Circuits", desc: "Professional Readiness", image: hidden6 },
];

const HiddenFiguresPage: React.FC = () => {
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

export default HiddenFiguresPage;
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event2 from "@/assets/event2.png";
import gallery5 from "../assets/gallery5.jpg";
import gallery6 from "../assets/gallery6.jpg";
import gallery7 from "../assets/gallery7.jpg";
import gallery8 from "../assets/gallery8.jpg";

import green1 from "@/assets/green1.png";
import green2 from "@/assets/green2.png";
import green3 from "@/assets/green3.png";
import green4 from "@/assets/green4.png";
import green5 from "@/assets/green5.png";

const sessions = [
  {
    id: 1,
    name: "Leadership Development",
    cover: gallery5,
    description: "Develop essential leadership skills and learn how to inspire and motivate others to achieve common goals.",
  },
];

const courses = [
  { focus: "Subject-focused Peer Learning (Maths & Sciences)", desc: "Student Empowerment Support", image: green1 },
  { focus: "Reading groups for Innovation and Research", desc: "Student Empowerment Support", image: green2 },
  { focus: "Student-led Recap Sessions", desc: "Student Empowerment Support", image: green3 },
  { focus: "Critical Thinking Workshops", desc: "Student Empowerment Support", image: green4 },
  { focus: "Language Training and Writing Assistance", desc: "Student Empowerment Support", image: green5 },
  { focus: "Managing Finance and Time", desc: "Student Empowerment Support", image: green1 },
];

const TheIncrediblesPage: React.FC = () => {
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

export default TheIncrediblesPage;
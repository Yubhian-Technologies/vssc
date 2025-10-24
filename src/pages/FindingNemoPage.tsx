import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event1 from "@/assets/event1.png";
import gallery1 from "../assets/gallery1.jpg";
import gallery2 from "../assets/gallery2.jpg";
import gallery3 from "../assets/gallery3.jpg";
import gallery4 from "../assets/gallery4.jpg";

import two from "@/assets/two.png";
import twelve from "@/assets/twelve.png";
import eleven from "@/assets/eleven.png";
import ten from "@/assets/ten.png";
import eight from "@/assets/eight.png";
import nine from "@/assets/nine.png";

const sessions = [
  {
    id: 1,
    name: "Networking Workshop",
    cover: event1,
    description:
      "Learn effective networking strategies to build meaningful professional connections and discover new opportunities in your field.",
  },
];

const courses = [
  {
    focus: "Ice-breaker activities for Interpersonal Exchange",
    desc: "Discover Networks and Opportunities",
    image: two,
  },
  {
    focus: "Finding friends through shared Extra-Curricular Interests",
    desc: "Discover Networks and Opportunities",
    image: eight,
  },
  {
    focus: "Peer Mentoring and Reflection Groups",
    desc: "Discover Networks and Opportunities",
    image: nine,
  },
  {
    focus: "Cultivating a Culture of Innovation and Entrepreneurship",
    desc: "Discover Networks and Opportunities",
    image: ten,
  },
  {
    focus: "Introduction to Academic/Professional Networking",
    desc: "Discover Networks and Opportunities",
    image: twelve,
  },
  {
    focus: "Ideate Collaborative Projects",
    desc: "Discover Networks and Opportunities",
    image: eleven,
  },
];

const FindingNemoPage: React.FC = () => {
  const navigate = useNavigate();

  const sessionBgColors = [
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
  ];

  return (
    <div className="bg-gray-50">
      {/* Sessions Section */}
      <section className="[background-color:hsl(60,100%,90%)] w-full py-8">
        <section className="[background-color:hsl(60,100%,90%)] w-full ">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 px-5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col md:flex-row items-center md:items-stretch w-full gap-6"
              >
                {/* Image */}
                <div className="flex-1 flex justify-center">
                  <img
                    src={session.cover}
                    alt={session.name}
                    className="w-full h-full object-cover max-w-xs md:max-w-sm"
                  />
                </div>

                {/* Text block */}
                <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 p-2 max-h-[300px] mt-20">
                  <h2
                    className="text-4xl font-extrabold leading-tight text-pink-600"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Discover Networks
                    <br />
                    and Opportunities
                  </h2>
                  <h2
                    className="text-4xl font-extrabold leading-tight text-blue-700"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Explore
                    <br />
                    Discern
                    <br />
                    Collaborate
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* Description Paragraph */}
      <section className="w-full bg-gray-50 pt-2 pb-8 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="container mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Discover the power of connections as we enable you to forge
            meaningful relationships, expand your professional network, and
            thrive through collaboration. This is where you unlock your
            potential and give it wings! Join us and take your personal and
            academic experience to the next level
          </p>
        </div>
      </section>

      {/* Courses Grid Section */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Here are some of the areas we focus on
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card
                key={index}
                className="[background-color:hsl(60,100%,95%)]   transition-all duration-300 overflow-hidden "
              >
                <img
                  src={course.image}
                  alt={course.focus}
                  className="w-full h-48 object-contain"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-2">
                    {course.focus}
                  </h3>
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

export default FindingNemoPage;

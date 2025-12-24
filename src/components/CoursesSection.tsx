import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

// IMAGES (unchanged)
import two from "@/assets/two.png";
import twelve from "@/assets/twelve.png";
import eleven from "@/assets/eleven.png";
import ten from "@/assets/ten.png";
import eight from "@/assets/eight.png";
import nine from "@/assets/nine.png";

import green1 from "@/assets/green1.png";
import green2 from "@/assets/green2.png";
import green3 from "@/assets/green3.png";
import green4 from "@/assets/green4.png";
import green5 from "@/assets/green5.png";

import red1 from "@/assets/red1.png";
import red2 from "@/assets/red2.png";
import red3 from "@/assets/red3.png";
import red4 from "@/assets/red4.png";

import yellow1 from "@/assets/yellow1.png";
import yellow2 from "@/assets/yellow2.png";
import yellow3 from "@/assets/yellow3.png";
import yellow4 from "@/assets/yellow4.png";
import yellow5 from "@/assets/yellow5.png";

import maroon1 from "@/assets/maroon1.png";
import maroon2 from "@/assets/maroon2.png";
import maroon3 from "@/assets/maroon3.png";
import maroon4 from "@/assets/maroon4.png";
import maroon5 from "@/assets/maroon5.png";

import hidden1 from "@/assets/hidden1.png";
import hidden2 from "@/assets/hidden2.png";
import hidden3 from "@/assets/hidden3.png";
import hidden4 from "@/assets/hidden4.png";
import hidden5 from "@/assets/hidden5.png";
import hidden6 from "@/assets/hidden6.png"; 

const CoursesSection = () => {
  const [activeCategory, setActiveCategory] = useState("FINDING NEMO");
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    "FINDING NEMO",
    "THE INCREDIBLES",
    "INSIDE OUT",
    "THE PURSUIT OF HAPPINESS",
    "HAPPY FEET",
    "HIDDEN FIGURES",
  ];

  const activeColors: Record<string, string> = {
    "FINDING NEMO": "bg-pink-600 text-white",
    "THE INCREDIBLES": "bg-green-700 text-white",
    "INSIDE OUT": "bg-red-500 text-white",
    "THE PURSUIT OF HAPPINESS": "bg-sky-600 text-white",
    "HAPPY FEET": "bg-pink-800 text-white",
    "HIDDEN FIGURES": "bg-green-400 text-white",
  };

  const courses = {
    // ... (your original courses object - unchanged)
    "FINDING NEMO": [
      { focus: "Ice-breaker activities for Interpersonal Exchange", desc: "Discover Networks and Opportunities", image: two },
      { focus: "Finding friends through shared Extra-Curricular Interests", desc: "Discover Networks and Opportunities", image: eight },
      { focus: "Peer Mentoring and Reflection Groups", desc: "Discover Networks and Opportunities", image: nine },
      { focus: "Cultivating a Culture of Innovation and Entrepreneurship", desc: "Discover Networks and Opportunities", image: ten },
      { focus: "Introduction to Academic/Professional Networking", desc: "Discover Networks and Opportunities", image: twelve },
      { focus: "Ideate Collaborative Projects", desc: "Discover Networks and Opportunities", image: eleven },
    ],
    "THE INCREDIBLES": [
      { focus: "Subject-focused Peer Learning (Maths & Sciences)", desc: "Student Empowerment Support", image: green1 },
      { focus: "Reading groups for Innovation and Research", desc: "Student Empowerment Support", image: green2 },
      { focus: "Student-led Recap Sessions", desc: "Student Empowerment Support", image: green3 },
      { focus: "Critical Thinking Workshops", desc: "Student Empowerment Support", image: green4 },
      { focus: "Language Training and Writing Assistance", desc: "Student Empowerment Support", image: green5 },
      { focus: "Managing Finance and Time", desc: "Student Empowerment Support", image: green1 },
    ],
    "INSIDE OUT": [
      { focus: "Prompt-based Reflective Sessions for self-awareness & life-skills", desc: "Knowing Yourself", image: red1 },
      { focus: "Self-growth through personal vision-boards & goal-setting workshops", desc: "Knowing Yourself", image: red2 },
      { focus: "Access to one-on-one counselling", desc: "Knowing Yourself", image: red3 },
      { focus: "Personality assessments and peer feedback sessions", desc: "Knowing Yourself", image: red4 },
      { focus: "Student-run empathy circle (sharing and problem-solving)", desc: "Knowing Yourself", image: red1 },
      { focus: "Emotional intelligence: Development and Regulation", desc: "Knowing Yourself", image: red2 },
    ],
    "THE PURSUIT OF HAPPINESS": [
      { focus: "Career Assessment Test", desc: "Career Mapping", image: yellow1 },
      { focus: "Project and Internship Guidance", desc: "Career Mapping", image: yellow2 },
      { focus: "Peer-network for Career-Fairs, Job searches, etc.", desc: "Career Mapping", image: yellow3 },
      { focus: "Career Interest Inventories", desc: "Career Mapping", image: yellow4 },
      { focus: "Experiential Learning Opportunities/ Job shadowing", desc: "Career Mapping", image: yellow4 },
      { focus: "Assistance for Higher studies in Foreign Institutions", desc: "Career Mapping", image: yellow5 },
    ],
    "HAPPY FEET": [
      { focus: "Mindfulness and Meditation Sessions", desc: "Wellness & Self-Care", image: maroon1 },
      { focus: "Hacking into physical wellbeing (Yoga, Zumba, etc.)", desc: "Wellness & Self-Care", image: maroon2 },
      { focus: "Peer-driven Fitness Bootcamps", desc: "Wellness & Self-Care", image: maroon3 },
      { focus: "Digital Detox Sessions", desc: "Wellness & Self-Care", image: maroon4 },
      { focus: "Work-life Balance Workshops", desc: "Wellness & Self-Care", image: maroon5 },
      { focus: "Student-led health and hygiene circle to promote peer-awareness", desc: "Wellness & Self-Care", image: maroon1 },
    ],
    "HIDDEN FIGURES": [
      { focus: "Understanding Corporate Culture", desc: "Professional Readiness", image: hidden1 },
      { focus: "Honing Interview Skills", desc: "Professional Readiness", image: hidden2 },
      { focus: "Interacting with Industry Experts", desc: "Professional Readiness", image: hidden3 },
      { focus: "Learning Team-Building Techniques", desc: "Professional Readiness", image: hidden4 },
      { focus: "Training for Leadership Roles", desc: "Professional Readiness", image: hidden5 },
      { focus: "Tapping into Constructive Feedback Circuits", desc: "Professional Readiness", image: hidden6 },
    ],
  };

  // // Manual scroll for course cards
  // const scrollLeft = () => {
  //   scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  // };

  // const scrollRight = () => {
  //   scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  // };

  return (
    <section
      data-aos="fade-down"
      className="py-15 [background-color:hsl(60,100%,90%)] relative"
    >
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 md:py-10">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-md lg:text-4xl font-bold text-gray-900 mt-2 mb-6">
            Explore Our Events by Category
          </h2>

          {/* Category Buttons - Mobile: single row scrollable, Desktop: wrapped as original */}
          <div className="mb-8">
            {/* Mobile-only horizontal scroll container */}
            <div className="md:hidden overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
              <div className="flex gap-3">
                {categories.map((category) => (
                  <Button
                    key={category}
                    className={`flex-shrink-0 px-2 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                      ${
                        activeCategory === category
                          ? `${activeColors[category]} !hover:bg-[inherit] !hover:text-[inherit]`
                          : "bg-white text-black"
                      }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Desktop & larger: original wrapped layout (unchanged) */}
            <div className="hidden md:flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium
                    ${
                      activeCategory === category
                        ? `${activeColors[category]} !hover:bg-[inherit] !hover:text-[inherit]`
                        : "bg-white text-black !hover:bg-white !hover:text-black"
                    }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Cards with Manual Arrows */}
        <div className="relative">
          {/* <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button> */}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-4 scroll-smooth px-10 py-4"
          >
            {[...courses[activeCategory]].map((course, i) => (
              <Card
                key={i}
                className="flex-shrink-0 min-w-[200px] max-w-[220px] [background-color:hsl(60,100%,95%)] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-2xl"
              >
                <img
                  src={course.image}
                  alt={course.focus}
                  className="w-full h-auto max-h-36 object-contain rounded-t-md"
                />
                <CardContent className="p-3 space-y-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.focus}
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm">
                    {course.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default CoursesSection;
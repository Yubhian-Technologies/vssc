import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

// IMAGES
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

import hidden1 from "@/assets/hidden1.jpg";
import hidden2 from "@/assets/hidden2.jpg";
import hidden3 from "@/assets/hidden3.jpg";
import hidden4 from "@/assets/hidden4.jpg";
import hidden5 from "@/assets/hidden5.jpg";
import hidden6 from "@/assets/hidden6.jpg";

const CoursesSection = () => {
  const [activeCategory, setActiveCategory] = useState("FINDING NEMO");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Continuous scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      if (container.scrollLeft >= container.scrollWidth / 2) container.scrollLeft = 0;
      container.scrollBy({ left: 0.5, behavior: "auto" });
    }, 20);
    return () => clearInterval(interval);
  }, [activeCategory]);

  // Manual scroll handlers
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
  };

  return (
    <section data-aos="fade-down" className="py-15 [background-color:hsl(60,100%,90%)] relative">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 md:py-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-6">
            Explore Our Courses by Category
          </h2>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                className={`px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 rounded-full
                  text-xs sm:text-sm md:text-sm font-medium
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

        {/* Scroll Buttons */}
        <div className="relative flex items-center">
          <button
            onClick={scrollLeft}
            className="absolute left-2 z-20 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-black transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Courses Scroll */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-4 scroll-smooth px-10"
          >
            {[...courses[activeCategory], ...courses[activeCategory]].map((course, i) => (
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
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{course.focus}</h3>
                  <p className="text-gray-700 text-xs sm:text-sm">{course.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-2 z-20 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-black transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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

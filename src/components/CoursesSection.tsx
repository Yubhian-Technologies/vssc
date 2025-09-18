import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// === Images ===
import FindingNemo1 from "@/assets/FindingNemo1.jpg";
import FindingNemo2 from "@/assets/FindingNemo2.jpg";
import FindingNemo3 from "@/assets/FindingNemo3.jpg";
import FindingNemo4 from "@/assets/FindingNemo4.jpg";
import FindingNemo5 from "@/assets/FindingNemo5.jpg";
import FindingNemo6 from "@/assets/FindingNemo6.jpg";

import filter21 from "@/assets/filter21.jpg";
import filter22 from "@/assets/filter22.jpg";
import filter23 from "@/assets/filter23.jpg";
import filter24 from "@/assets/filter24.jpg";
import filter25 from "@/assets/filter25.jpg";
import filter26 from "@/assets/filter26.jpg";

import insideout1 from "@/assets/insideout1.jpg";
import insideout2 from "@/assets/insideout2.jpg";
import insideout3 from "@/assets/insideout3.jpg";
import insideout4 from "@/assets/insideout4.jpg";
import insideout5 from "@/assets/insideout5.jpg";
import insideout6 from "@/assets/insideout6.jpg";

import pursuit1 from "@/assets/pursuit1.jpg";
import pursuit2 from "@/assets/pursuit2.jpg";
import pursuit3 from "@/assets/pursuit3.jpg";
import pursuit4 from "@/assets/pursuit4.jpg";
import pursuit5 from "@/assets/pursuit5.jpg";
import pursuit6 from "@/assets/pursuit6.jpg";

import happy1 from "@/assets/happy1.jpg";
import happy2 from "@/assets/happy2.jpg";
import happy3 from "@/assets/happy3.jpg";
import happy4 from "@/assets/happy4.jpg";
import happy5 from "@/assets/happy5.jpg";
import happy6 from "@/assets/happy6.jpg";

import hidden1 from "@/assets/hidden1.jpg";
import hidden2 from "@/assets/hidden2.jpg";
import hidden3 from "@/assets/hidden3.jpg";
import hidden4 from "@/assets/hidden4.jpg";
import hidden5 from "@/assets/hidden5.jpg";
import hidden6 from "@/assets/hidden6.jpg";

const CoursesSection = () => {
  const [activeCategory, setActiveCategory] = useState("FINDING NEMO");

  const categories = [
    "FINDING NEMO",
    "THE INCREDIBLES",
    "INSIDE OUT",
    "THE PURSUIT OF HAPPINESS",
    "HAPPY FEET",
    "HIDDEN FIGURES",
  ];

  const categoryColors: Record<string, string> = {
    "FINDING NEMO": "hover:bg-pink-600 hover:text-white",
    "THE INCREDIBLES": "hover:bg-green-700 hover:text-white",
    "INSIDE OUT": "hover:bg-red-500 hover:text-black",
    "THE PURSUIT OF HAPPINESS": "hover:bg-sky-600 hover:text-white",
    "HAPPY FEET": "hover:bg-pink-800 hover:text-white",
    "HIDDEN FIGURES": "hover:bg-green-400 hover:text-black",
  };

  const activeColors: Record<string, string> = {
    "FINDING NEMO": "bg-pink-600 text-white",
    "THE INCREDIBLES": "bg-green-700 text-white",
    "INSIDE OUT": "bg-red-500 text-black",
    "THE PURSUIT OF HAPPINESS": "bg-sky-600 text-white",
    "HAPPY FEET": "bg-pink-800 text-white",
    "HIDDEN FIGURES": "bg-green-400 text-black",
  };

  const courses = {
    "FINDING NEMO": [
      { focus: "Ice-breaker activities for Interpersonal Exchange", desc: "Discover Networks and Opportunities", image: FindingNemo1 },
      { focus: "Finding friends through shared Extra-Curricular Interests", desc: "Discover Networks and Opportunities", image: FindingNemo2 },
      { focus: "Peer Mentoring and Reflection Groups", desc: "Discover Networks and Opportunities", image: FindingNemo3 },
      { focus: "Cultivating a Culture of Innovation and Entrepreneurship", desc: "Discover Networks and Opportunities", image: FindingNemo4 },
      { focus: "Introduction to Academic/Professional Networking", desc: "Discover Networks and Opportunities", image: FindingNemo5 },
      { focus: "Ideate Collaborative Projects", desc: "Discover Networks and Opportunities", image: FindingNemo6 },
    ],
    "THE INCREDIBLES": [
      { focus: "Subject-focused Peer Learning (Maths & Sciences)", desc: "Student Empowerment Support", image: filter21 },
      { focus: "Reading groups for Innovation and Research", desc: "Student Empowerment Support", image: filter22 },
      { focus: "Student-led Recap Sessions", desc: "Student Empowerment Support", image: filter23 },
      { focus: "Critical Thinking Workshops", desc: "Student Empowerment Support", image: filter24 },
      { focus: "Language Training and Writing Assistance", desc: "Student Empowerment Support", image: filter25 },
      { focus: "Managing Finance and Time", desc: "Student Empowerment Support", image: filter26 },
    ],
    "INSIDE OUT": [
      { focus: "Prompt-based Reflective Sessions for self-awareness & life-skills", desc: "Knowing Yourself", image: insideout1 },
      { focus: "Self-growth through personal vision-boards & goal-setting workshops", desc: "Knowing Yourself", image: insideout2 },
      { focus: "Access to one-on-one counselling", desc: "Knowing Yourself", image: insideout3 },
      { focus: "Personality assessments and peer feedback sessions", desc: "Knowing Yourself", image: insideout4 },
      { focus: "Student-run empathy circle (sharing and problem-solving)", desc: "Knowing Yourself", image: insideout5 },
      { focus: "Emotional intelligence: Development and Regulation", desc: "Knowing Yourself", image: insideout6 },
    ],
    "THE PURSUIT OF HAPPINESS": [
      { focus: "Career Assessment Test", desc: "Career Mapping", image: pursuit1 },
      { focus: "Project and Internship Guidance", desc: "Career Mapping", image: pursuit2 },
      { focus: "Peer-network for Career-Fairs, Job searches, etc.", desc: "Career Mapping", image: pursuit3 },
      { focus: "Career Interest Inventories", desc: "Career Mapping", image: pursuit4 },
      { focus: "Experiential Learning Opportunities/ Job shadowing", desc: "Career Mapping", image: pursuit5 },
      { focus: "Assistance for Higher studies in Foreign Institutions", desc: "Career Mapping", image: pursuit6 },
    ],
    "HAPPY FEET": [
      { focus: "Mindfulness and Meditation Sessions", desc: "Wellness & Self-Care", image: happy1 },
      { focus: "Hacking into physical wellbeing (Yoga, Zumba, etc.)", desc: "Wellness & Self-Care", image: happy2 },
      { focus: "Peer-driven Fitness Bootcamps", desc: "Wellness & Self-Care", image: happy3 },
      { focus: "Digital Detox Sessions", desc: "Wellness & Self-Care", image: happy4 },
      { focus: "Work-life Balance Workshops", desc: "Wellness & Self-Care", image: happy5 },
      { focus: "Student-led health and hygiene circle to promote peer-awareness", desc: "Wellness & Self-Care", image: happy6 },
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

  return (
    <section data-aos="fade-down" className="py-20 [background-color:hsl(60,100%,90%)]">
  <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-8">
        Explore Our Courses by Category
      </h2>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-12">
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className={`px-3 sm:px-5 md:px-6 py-2 rounded-full transition-colors text-sm sm:text-base md:text-base font-medium ${
              activeCategory === category
                ? activeColors[category]
                : `bg-muted text-muted-foreground ${categoryColors[category]}`
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>

    {/* Courses Slider */}
    <div className="overflow-hidden relative">
      <div className="flex animate-scroll gap-4">
        {[...courses[activeCategory], ...courses[activeCategory]].map(
          (course, i) => (
            <Card
              key={i}
              className="[background-color:hsl(60,100%,95%)] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden min-w-[240px] max-w-[260px]"
            >
              <img
                src={course.image}
                alt={course.focus}
                className="w-full h-auto max-h-40 object-contain rounded-t-md"
              />
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 text-base">
                  {course.focus}
                </h3>
                <p className="text-gray-700 text-sm">{course.desc}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  </div>

  {/* Scroll Animation */}
  <style>
    {`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll 120s linear infinite;
        width: max-content;
      }
    `}
  </style>
</section>

  );
};

export default CoursesSection;

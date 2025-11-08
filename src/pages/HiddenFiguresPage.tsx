import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event6 from "@/assets/event6.png";

import hidden1 from "@/assets/hidden1.png";
import hidden2 from "@/assets/hidden2.png";
import hidden3 from "@/assets/hidden3.png";
import hidden4 from "@/assets/hidden4.png";
import hidden5 from "@/assets/hidden5.png";
import hidden6 from "@/assets/hidden6.png";

const sessions = [
  {
    id: 1,
    name: "Professional Skills Development",
    cover: event6,
    description:
      "Develop essential professional skills including communication, presentation, and workplace etiquette.",
  },
];

const courses = [
  {
    focus: "Understanding Corporate Culture",
    desc: "Professional Readiness",
    image: hidden1,
  },
  {
    focus: "Honing Interview Skills",
    desc: "Professional Readiness",
    image: hidden2,
  },
  {
    focus: "Interacting with Industry Experts",
    desc: "Professional Readiness",
    image: hidden3,
  },
  {
    focus: "Learning Team-Building Techniques",
    desc: "Professional Readiness",
    image: hidden4,
  },
  {
    focus: "Training for Leadership Roles",
    desc: "Professional Readiness",
    image: hidden5,
  },
  {
    focus: "Tapping into Constructive Feedback Circuits",
    desc: "Professional Readiness",
    image: hidden6,
  },
];

const HiddenFiguresPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    option: "",
    course: "",
    message: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Registration submitted for ${formData.name} - ${selectedCourse} (${formData.option})`
    );
    setFormData({ name: "", email: "", option: "", course: "", message: "" });
    setShowForm(false);
  };

  const handleCourseClick = (courseName: string) => {
    setSelectedCourse(courseName);
    setFormData({ ...formData, course: courseName });
    setShowForm(true);
  };

  const sessionBgColors = [
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
    "bg-[hsl(60,100%,95%)]",
  ];

  return (
    <div className="bg-gray-50">
      <section className="[background-color:hsl(60,100%,90%)] w-full py-8">
        <section className="[background-color:hsl(60,100%,90%)] w-full">
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
                    className="text-5xl font-extrabold leading-tight text-green-800"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Professional
                    <br />
                    Readiness
                  </h2>
                  <h2
                    className="text-4xl font-extrabold leading-tight text-green-400"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Target
                    <br />
                    Upskill
                    <br />
                    Achieve
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
            Our care and concern for our students is not limited to their
            college experience. It comes with a warm farsight for our budding
            future professionals! Be it corporate readiness or professional
            etiquettes, our goal is to ensure our students have the essential
            skills and confidence for professional excellence. Let us help you
            make a lasting impression
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
                className="flex flex-col [background-color:hsl(60,100%,95%)] transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer"
              >
                <img
                  src={course.image}
                  alt={course.focus}
                  className="w-full h-48 object-contain"
                />
                <CardContent className="flex flex-col flex-1 p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-2">
                    {course.focus}
                  </h3>
                  <p className="text-gray-700 text-sm mb-4">{course.desc}</p>
                  <button
                    onClick={() => handleCourseClick(course.focus)}
                    className="mt-auto w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-900"
                  >
                    Register
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[hsl(60,100%,95%)] p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              Register for {selectedCourse}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              />
              <select
                value={formData.option}
                onChange={(e) =>
                  setFormData({ ...formData, option: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
                <option value="Option 3">Option 3</option>
                <option value="Option 4">Option 4</option>
                <option value="Option 5">Option 5</option>
                <option value="Option 6">Option 6</option>
              </select>
              <textarea
                placeholder="Additional Message (Optional)"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)] h-24 resize-none"
              />
              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiddenFiguresPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event5 from "@/assets/event5.png";

import yellow1 from "@/assets/yellow1.png";
import yellow2 from "@/assets/yellow2.png";
import yellow3 from "@/assets/yellow3.png";
import yellow4 from "@/assets/yellow4.png";
import yellow5 from "@/assets/yellow5.png";

const sessions = [
  {
    id: 1,
    name: "Career Planning Workshop",
    cover: event5,
    description:
      "Create a comprehensive career plan that aligns with your goals, interests, and market opportunities.",
  },
];

const courses = [
  { focus: "Career Assessment Test", desc: "Career Mapping", image: yellow1 },
  {
    focus: "Project and Internship Guidance",
    desc: "Career Mapping",
    image: yellow2,
  },
  {
    focus: "Peer-network for Career-Fairs, Job searches, etc.",
    desc: "Career Mapping",
    image: yellow3,
  },
  {
    focus: "Career Interest Inventories",
    desc: "Career Mapping",
    image: yellow4,
  },
  {
    focus: "Experiential Learning Opportunities/ Job shadowing",
    desc: "Career Mapping",
    image: yellow4,
  },
  {
    focus: "Assistance for Higher studies in Foreign Institutions",
    desc: "Career Mapping",
    image: yellow5,
  },
];

const ThePursuitOfHappinessPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    message: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registration submitted for ${formData.name} - ${selectedCourse}`);
    setFormData({ name: "", email: "", course: "", message: "" });
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
                    className="text-5xl font-extrabold leading-tight text-green-800"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Career
                    <br />
                    Mapping
                  </h2>
                  <h2
                    className="text-4xl font-extrabold leading-tight text-yellow-700"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Evalute
                    <br />
                    Attempt
                    <br />
                    Succeed
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
            We want you to chart your career right. Assess your options, take
            actionable steps, and achieve your professional goals. Join us to
            start building your future today!
          </p>
        </div>
      </section>

      {/* Courses Grid Section */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Here are some of the areas we focus on{" "}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card
                key={index}
                className="[background-color:hsl(60,100%,95%)]  transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => handleCourseClick(course.focus)}
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
              <textarea
                placeholder="Additional Message (Optional)"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)] h-24 resize-none"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
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

export default ThePursuitOfHappinessPage;

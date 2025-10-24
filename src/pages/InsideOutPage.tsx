import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import event4 from "@/assets/event4.png";


import red1 from "@/assets/red1.png";
import red2 from "@/assets/red2.png";
import red3 from "@/assets/red3.png";
import red4 from "@/assets/red4.png";

const sessions = [
  {
    id: 1,
    name: "Self-Discovery Workshop",
    cover: event4,
    description: "Explore your inner self and discover your true passions, values, and strengths through guided self-reflection.",
  },
];

const courses = [
  { focus: "Prompt-based Reflective Sessions for self-awareness & life-skills", desc: "Knowing Yourself", image: red1 },
  { focus: "Self-growth through personal vision-boards & goal-setting workshops", desc: "Knowing Yourself", image: red2 },
  { focus: "Access to one-on-one counselling", desc: "Knowing Yourself", image: red3 },
  { focus: "Personality assessments and peer feedback sessions", desc: "Knowing Yourself", image: red4 },
  { focus: "Student-run empathy circle (sharing and problem-solving)", desc: "Knowing Yourself", image: red1 },
  { focus: "Emotional intelligence: Development and Regulation", desc: "Knowing Yourself", image: red2 },
];

const InsideOutPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '',option:'', course: '', message: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registration submitted for ${formData.name} - ${selectedCourse} (${formData.option})`);
    setFormData({ name: '', email: '',option:'', course: '', message: '' });
    setShowForm(false);
  };

  const handleCourseClick = (courseName: string) => {
    setSelectedCourse(courseName);
    setFormData({...formData, course: courseName});
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
                className="md:w-1/2 w-full h-80 md:h-96 object-contain rounded-xl shadow-lg"
              />
              <div className="md:w-1/2 w-full flex flex-col gap-4">
                <h2 className="text-2xl font-bold">{session.name}</h2>
                <p className="text-gray-700">{session.description}</p>
                
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Description Paragraph */}
      <section className="w-full bg-gray-50 py-8 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="container mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            We are here to help you cut out the hustle and bustle of everyday life. Embark with 
            us on a journey of personal and professional growth through mindful practices. Join 
            us today and seize this moment of self-discovery
          </p>
        </div>
      </section>

      {/* Courses Grid Section */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
  <div className="container mx-auto">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Course Offerings</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <Card 
          key={index} 
          className="flex flex-col [background-color:hsl(60,100%,90%)] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer"
        >
          <img
            src={course.image}
            alt={course.focus}
            className="w-full h-48 object-contain"
          />
          <CardContent className="flex flex-col flex-1 p-4">
            <h3 className="font-semibold text-gray-900 text-base mb-2">{course.focus}</h3>
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
            <h3 className="text-xl font-bold mb-4">Register for {selectedCourse}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              />
              <select
  value={formData.option}
  onChange={(e) => setFormData({ ...formData, option: e.target.value })}
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
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)] h-24 resize-none"
              />
             <div className="flex justify-between gap-4">
                <button type="submit" className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900">
                  Submit
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
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

export default InsideOutPage;
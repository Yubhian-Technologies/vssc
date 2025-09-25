// src/components/FAQAccordion.tsx
import { useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import heroStudent from "@/assets/hero-student.jpg";

const faqs = [
  {
    question: "Where is the Student Success Center located?",
    answer:
      "The center is located in the ‘Fallingwater’ complex/building within our educational institution.",
  },
  {
    question: "What are the hours of operation?",
    answer:
      "Our hours of operation are Monday to Friday, 9:00 AM to 4:00 PM. We also offer limited weekend hours. Please check our website for the most up-to-date schedule.",
  },
  {
    question: "Who can use the services of the Student Success Center?",
    answer:
      "All enrolled students at our institution are welcome to use the services offered by the Student Success Center.",
  },
  {
    question: "What academic support services are available?",
    answer:
      "We offer tutoring, academic advising, study skills workshops, and other resources to help you succeed academically.",
  },
  {
    question: "How do I schedule a tutoring session?",
    answer:
      "You can schedule a tutoring session online through our website or by visiting the center in person.",
  },
  {
    question: "Are there any costs associated with tutoring?",
    answer:
      "No, tutoring services are provided free of charge to all enrolled students.",
  },
  {
    question: "What subjects are available for tutoring?",
    answer:
      "Tutoring is available for a wide range of subjects, including math, science, writing, and more. Please check our website for a complete list of subjects.",
  },
  {
    question: "What personal development resources are offered?",
    answer:
      "We offer workshops and one-on-one coaching on topics such as time management, stress management, and mindfulness.",
  },
  {
    question: "How can I participate in workshops?",
    answer:
      "You can register for workshops through our website or by visiting the center. We offer both in-person and virtual workshops.",
  },
  {
    question: "What career services are provided?",
    answer:
      "We provide career counseling, resume writing assistance, interview preparation, and job search strategies to help you achieve your career goals.",
  },
  {
    question: "How do I make an appointment with a career counselor?",
    answer:
      "Appointments can be made online through our website or by visiting the center in person.",
  },
  {
    question: "Can I get help with financial aid questions?",
    answer:
      "While we do not provide direct financial aid services, we can refer you to the appropriate office and resources to assist with your financial aid questions.",
  },
  {
    question: "Is there any mental health support available?",
    answer:
      "We offer resources and referrals to on-campus counseling services to support your mental health and well-being.",
  },
  {
    question: "How do I provide feedback about the services?",
    answer:
      "We welcome your feedback! You can provide feedback through our website or by filling out a feedback form available at the center.",
  },
  {
    question: "Can I volunteer or work at the Student Success Center?",
    answer:
      "Yes, we offer volunteer and work-study opportunities. Please visit our website or contact the center for more information on available positions.",
  },
  {
    question: "What should I do if I need help but don't know where to start?",
    answer:
      "Visit the Student Success Center in person or contact us through our website. Our staff will be happy to guide you to the appropriate resources and services.",
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="w-full">
      <div className="relative w-full h-64 md:h-80 lg:h-96">
        <img
          src={heroStudent}
          alt="FAQ Banner"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black bg-opacity-70"></div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h2 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="max-w-3xl text-md">
            For a few questions in your mind, you may go through the Frequently
            Asked Questions to resolve your queries.
          </p>
        </div>
      </div>

      <section className="w-full [background-color:hsl(60,100%,95%)] py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl shadow-lg">
            <video
              src="https://www.youtube.com/watch?v=peSUVGUpUdk"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-primary">
              Discover the Student Success Center
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Our Student Success Center is dedicated to empowering every
              student with the tools, guidance, and support they need to excel
              academically and personally. From tutoring and career counseling
              to wellness workshops, we’ve got you covered.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full max-w-5xl mx-auto p-6 divide-y divide-gray-300">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-lg mb-2">
            <button
              className="w-full flex justify-between items-center p-4 focus:outline-none"
              style={{ backgroundColor: "hsl(60,100%,95%)" }}
              onClick={() => toggle(index)}
            >
              <span className="font-medium text-primary">{faq.question}</span>
              {openIndex === index ? <ChevronUp /> : <ChevronDown />}
            </button>

            <div
              ref={(el) => (contentRefs.current[index] = el)}
              style={{
                maxHeight:
                  openIndex === index
                    ? contentRefs.current[index]?.scrollHeight + "px"
                    : "0px",
              }}
              className="overflow-hidden transition-all duration-300 ease-in-out"
            >
              <div
                className="p-4 text-primary"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
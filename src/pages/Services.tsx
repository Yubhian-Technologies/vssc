import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  collectionName: string;
  count: number;
  route: string;
}

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([
    {
      id: "tutoring",
      title: "Tutoring Services",
      description: "Subject-wise tutoring with specialized instructors",
      image: "https://img.icons8.com/color/96/teacher.png",
      collectionName: "tutoring",
      count: 0,
      route: "/services/tutoring",
    },
    {
      id: "advising",
      title: "Academic Advising",
      description: "Educational guidance and career planning",
      image: "https://img.icons8.com/color/96/advice.png",
      collectionName: "academicAdvising",
      count: 0,
      route: "/services/academic-advising",
    },
    {
      id: "workshops",
      title: "Study Skills Workshops",
      description: "Learning technique seminars and training",
      image: "https://img.icons8.com/color/96/classroom.png",
      collectionName: "studyWorkshops",
      count: 0,
      route: "/services/study-workshops",
    },
    {
      id: "counseling",
      title: "Counseling Sessions",
      description: "Academic and personal counseling support",
      image: "https://img.icons8.com/color/96/therapy.png",
      collectionName: "counseling",
      count: 0,
      route: "/services/counseling",
    },
    {
      id: "psychology",
      title: "Psychology Counseling Service",
      description: "Support for emotional well-being and personal growth",
      image: "https://img.icons8.com/color/96/brain.png",
      collectionName: "psychologyCounseling",
      count: 0,
      route: "/services/psychology-counseling",
    },
  ]);

  const [search, setSearch] = useState(""); // For search input
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);

  useEffect(() => {
    const fetchCounts = async () => {
      const updated = await Promise.all(
        services.map(async (service) => {
          try {
            const snapshot = await getDocs(collection(db, service.collectionName));
            return { ...service, count: snapshot.size };
          } catch (err) {
            console.error(`Error fetching ${service.title}:`, err);
            return service;
          }
        })
      );
      setServices(updated);
      setFilteredServices(updated);
    };
    fetchCounts();
  }, []);

  // Filter services based on search input
  useEffect(() => {
    const filtered = services.filter((service) =>
      service.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [search, services]);

  return (
    <div className="relative p-10 min-h-screen [background-color:hsl(60,100%,95%)]">
      {/* Floating gradient background animation */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{ x: [0, 40, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-30"
        />
      </div>

      {/* Heading */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-14 text-primary bg-clip-text drop-shadow-lg"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Student Support Services
      </motion.h1>

      {/* New Section */}
      <section className="w-full py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 shadow-lg rounded-xl overflow-hidden">
          <div className="md:w-1/2 w-full bg-[hsl(60,100%,90%)] text-black p-10 flex flex-col justify-center">
            <h2 className="text-3xl text-primary font-bold mb-6">What Does VSSC Offer?</h2>
            <p className="text-base leading-relaxed">
              We offer a comprehensive range of resources designed to support and enhance all aspects of student development. Our services include personalised tutoring, academic advising, and career counselling, each tailored to individual needs. Additionally, we host a variety of workshops aimed at promoting student wellness, growth, and confidence, ensuring a well-rounded approach to success.
            </p>
          </div>

          <div className="md:w-1/2 w-full bg-primary text-white p-10 flex flex-col justify-center rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-lg">
              <li>Academic Advice</li>
              <li>Peer Tutoring</li>
              <li>Career Counselling</li>
              <li>Peer Mentoring</li>
              <li>Communication Skills</li>
              <li>Personality Development</li>
              <li>Corporate-readiness Workshops</li>
              <li>Self-care Strategies</li>
              <li>Wellness Practices</li>
            </ul>
          </div>
        </div>

        
<div className="max-w-6xl mx-auto mt-10 flex flex-col md:flex-row gap-4">
  <input
    type="text"
    placeholder="Search services..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="p-2 text-sm rounded-lg border border-gray-300 flex-1"
  />
</div>

      </section>

      {/* Services Cards */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            className="group [background-color:hsl(60,100%,90%)] backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg transition-all duration-300 overflow-hidden p-8 flex flex-col items-center text-center cursor-pointer"
            whileHover={{
              scale: 1.05,
              rotate: 1,
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)", // light primary color shadow
            }}
            whileTap={{ scale: 0.97 }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
            onClick={() => navigate(service.route)}
          >
            <motion.img
              src={service.image}
              alt={service.title}
              className="w-24 h-24 mb-5 drop-shadow-lg"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition">
              {service.title}
            </h2>
            <p className="text-gray-600 mt-3 flex-1 leading-relaxed">{service.description}</p>
            <motion.p
              className="mt-6 text-lg font-semibold text-indigo-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Active Sessions: {service.count}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Services;

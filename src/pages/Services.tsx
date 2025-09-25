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
    };

    fetchCounts();
  }, []);

  return (
    <div className="relative p-10 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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

      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-14 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent drop-shadow-lg"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Student Support Services
      </motion.h1>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {services.map((service) => (
          <motion.div
            key={service.id}
            className="group bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden p-8 flex flex-col items-center text-center cursor-pointer"
            whileHover={{ scale: 1.05, rotate: 1 }}
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
            <p className="text-gray-600 mt-3 flex-1 leading-relaxed">
              {service.description}
            </p>
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

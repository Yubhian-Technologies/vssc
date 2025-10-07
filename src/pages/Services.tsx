import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import green1 from "@/assets/green1.png";
import green2 from "@/assets/green2.png";
import green3 from "@/assets/green3.png";
import green4 from "@/assets/green4.png";
import green5 from "@/assets/green5.png";
import filter21 from "@/assets/filter21.jpg"

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
      image: green3,
      collectionName: "tutoring",
      count: 0,
      route: "/services/tutoring",
    },
    {
      id: "advising",
      title: "Academic Advising",
      description: "Educational guidance and career planning",
      image: green4,
      collectionName: "academicAdvising",
      count: 0,
      route: "/services/academic-advising",
    },
    {
      id: "workshops",
      title: "Study Skills Workshops",
      description: "Learning technique seminars and training",
      image: green2,
      collectionName: "studyWorkshops",
      count: 0,
      route: "/services/study-workshops",
    },
    {
      id: "counseling",
      title: "Counseling Sessions",
      description: "Academic and personal counseling support",
      image: green1,
      collectionName: "counseling",
      count: 0,
      route: "/services/counseling",
    },
    {
      id: "psychology",
      title: "Psychology Counseling Service",
      description: "Support for emotional well-being and personal growth",
      image: green5,
      collectionName: "psychologyCounseling",
      count: 0,
      route: "/services/psychology-counseling",
    },
  ]);

  const [search, setSearch] = useState("");
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
    <div className="relative min-h-screen [background-color:hsl(60,100%,95%)] overflow-hidden">
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

      {/* Hero Section  */}
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={green5}
          alt="About Banner"
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
          className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Empowering Students to Learn, Grow, and Succeed!
        </motion.h1>
          <p className="max-w-2xl text-lg">
            Learn more about our journey, mission, and vision for the future.
          </p>
        </div>
      </div>

      {/* New Section */}
      <section className="w-full py-16 px-4 md:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 shadow-lg rounded-xl overflow-hidden">
          <div className="md:w-1/2 w-full bg-[hsl(60,100%,90%)] text-black p-10 flex flex-col justify-center">
            <h2 className="text-3xl text-primary font-bold mb-6">
              What Does VSSC Offer?
            </h2>
            <p className="text-base leading-relaxed">
              We offer a comprehensive range of resources designed to support and enhance all aspects of student development. Our services include personalised tutoring, academic advising, and career counselling, each tailored to individual needs. Additionally, we host a variety of workshops aimed at promoting student wellness, growth, and confidence, ensuring a well-rounded approach to success.
            </p>
          </div>

          <div className="md:w-1/2 w-full bg-primary text-white p-10 flex flex-col justify-center">
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

        
      </section>

      {/* Services Cards */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-10 px-4 md:px-10 lg:px-20 pb-16"
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
            className="group [background-color:hsl(60,100%,90%)] backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
            whileHover={{
              scale: 1.05,
              rotate: 1,
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
            onClick={() => navigate(service.route)}
          >
            <div className="w-full h-40 flex justify-center items-center overflow-hidden bg-background">
              <motion.img
                src={service.image}
                alt={service.title}
                className="max-h-full object-contain"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </div>

            <div className="p-6 flex flex-col items-center text-center">
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
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Services;

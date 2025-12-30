import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";

import event1 from "@/assets/event1.png";
import event2 from "@/assets/event2.png";
import event3 from "@/assets/event3.png";
import event4 from "@/assets/event4.png";
import event5 from "@/assets/event5.png";
import event6 from "@/assets/event6.png";
import eventsbanner from "@/assets/eventsbanner.png";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  collectionName: string;
  count: number;
  route: string;
}

const Events = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [services, setServices] = useState<Service[]>([
    
    {
      id: "nemo",
      title: "FINDING NEMO",
      description: "Discover Networks and Opportunities",
      image: event1,
      collectionName: "FindingNemo",
      count: 0,
      route: "/Events/FindingNemo",
    },
    {
      id: "incredibles",
      title: " THE INCREDIBLES",
      description: "Student Empowerment Support",
      image: event2,
      collectionName: "TheIncredibles",
      count: 0,
      route: "/Events/TheIncredibles",
    },
    {
      id: "inside",
      title: " INSIDE OUT",
      description: " KnowingYourself",
      image: event4,
      collectionName: "InsideOut",
      count: 0,
      route: "/Events/InsideOut",
    },
    {
      id: "pursuit",
      title: " THE PURSUIT OF HAPPINESS",
      description: "Career Mapping",
      image: event5,
      collectionName: "ThePursuitOfHappiness",
      count: 0,
      route: "/Events/ThePursuitOfHappiness",
    },
    {
      id: "happy",
      title: "HAPPY FEET",
      description: "Wellness & Self-Care",
      image: event3,
      collectionName: "HappyFeet",
      count: 0,
      route: "/Events/HappyFeet",
    },
    {
      id: "hidden",
      title: " HIDDEN FIGURES",
      description: "Professional Readiness",
      image: event6,
      collectionName: "HiddenFigures",
      count: 0,
      route: "/Events/HiddenFigures",
    },
    
   
  ]);

  const [search, setSearch] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const userCollege = userData.college;
        const isAdmin = userData.role === "admin" ? true : false;
// check if user is admin

        const updatedServices = await Promise.all(
          services.map(async (service) => {
            try {
              const sessionSnapshot = await getDocs(
                collection(db, service.collectionName)
              );

              const count = sessionSnapshot.docs.filter((sessionDoc) => {
                const sessionData = sessionDoc.data();

                if (isAdmin) {
                  // Admin sees only sessions created by themselves
                  return sessionData.createdBy === currentUser.uid;
                } else {
                  // Regular user sees sessions for their college
                  return sessionData.colleges?.includes(userCollege);
                }
              }).length;

              return { ...service, count };
            } catch (err) {
              console.error(`Error fetching ${service.title}:`, err);
              return service;
            }
          })
        );

        setServices(updatedServices);
        setFilteredServices(updatedServices);
      } catch (err) {
        console.error("Error fetching user or sessions:", err);
      }
    };

    fetchCounts();
  }, [auth.currentUser]);

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

      {/* Hero Section */}
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={eventsbanner}
          alt="About Banner"
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
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

      

      {/* Services Cards */}
      <motion.div
        className="grid grid-cols-3 gap-4 md:gap-10 mt-10 px-4 md:px-10 lg:px-20 pb-16 bg-[hsl(60,100%,95%)]"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        {filteredServices.map((service) => (
          <motion.img
            key={service.id}
            src={service.image}
            alt={service.title}
            className="aspect-square w-full object-contain cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
            onClick={() => navigate(service.route)}
            transition={{ type: "spring", stiffness: 200 }}
          />
        ))
    }
      </motion.div>
    
    </div>
  );
};


export default Events;

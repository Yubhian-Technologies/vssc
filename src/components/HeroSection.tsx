import { Button } from "@/components/ui/button";
import heroStudent from "@/assets/hero-student.jpg";
import { motion } from "framer-motion";

const HeroSection = () => {
  const stats = [
    { icon: "👨‍🏫", title: "FINDING NEMO" },
    { icon: "🏆", title: "THE INCREDIBLES" },
    { icon: "🎓", title: "INSIDE OUT" },
    { icon: "📚", title: "THE PURSUIT OF HAPPINESS" },
    { icon: "📚", title: "HAPPY FEET" },
    { icon: "📚", title: "HIDDEN FIGURES" },
  ];

  const firstPart = "Learn. Grow.";
  const secondPart = " Prosper.";

  const duplicatedstats = [...stats, ...stats,...stats,...stats,...stats];

  return (
    <section
      data-aos="fade-down"
      className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] [background-color:hsl(60,100%,95%)]"
    >
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 pl-2 sm:pl-6 md:pl-8">
            <div className="space-y-2 sm:space-y-3">
              {/* Typing animation for heading */}
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.02 },
                  },
                }}
              >
                {firstPart.split("").map((char, index) => (
                  <motion.span
                    key={`first-${index}`}
                    variants={{
                      hidden: { opacity: 0, y: "0.25em" },
                      visible: { opacity: 1, y: "0em" },
                    }}
                    transition={{ duration: 0.01 }}
                    className={`text-yellow-500 ${char === " " ? "inline-block w-2" : ""}`}
                  >
                    {char}
                  </motion.span>
                ))}
                {secondPart.split("").map((char, index) => (
                  <motion.span
                    key={`second-${index}`}
                    variants={{
                      hidden: { opacity: 0, y: "0.25em" },
                      visible: { opacity: 1, y: "0em" },
                    }}
                    transition={{ duration: 0.01 }}
                    className={`text-primary ${char === " " ? "inline-block w-2" : ""}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg">
                The Vishnu Student Success Centre is dedicated to supporting and empowering students on their academic and personal journeys.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button size="lg" className="bg-primary hover:bg-black text-white px-6 sm:px-8">
                Explore All Courses →
              </Button>
            </div>
          </div>

          {/* Right Content */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.05, rotate: 1 }}
          >
            <img
              src={heroStudent}
              alt="Student learning with Educve"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Stats Marquee */}
        <div className="relative mt-12 sm:mt-16 md:mt-20"> 
          <div className="absolute inset-x-0 bottom-0 bg-black origin-bottom-left rotate-[-3deg] z-20 overflow-hidden translate-y-6 sm:translate-y-10 md:translate-y-12"> 
            <div className="marquee flex gap-2 sm:gap-3 p-2 sm:p-3 md:p-4">
              {duplicatedstats.concat(stats).map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center bg-gray-800 text-white rounded-lg shadow-none 
                             min-w-[80px] sm:min-w-[100px] md:min-w-[120px] flex-shrink-0 
                             p-1 sm:p-1.5 md:p-1.5"
                >
                  <div className="font-semibold text-xs sm:text-sm ">{stat.title}</div>
                  {/* <div className="text-[10px] sm:text-xs md:text-sm text-gray-300">{stat.subtitle}</div> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee {
          display: flex;
          width: fit-content;
          animation: marqueeAnim 50s linear infinite;
        }

        @keyframes marqueeAnim {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

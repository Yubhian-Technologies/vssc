import { Button } from "@/components/ui/button";
import heroStudent from "@/assets/hero-student.jpg";
import { motion } from "framer-motion";

const HeroSection = () => {
  const stats = [
    { icon: "👨‍🏫", title: "Expert Instructor", subtitle: "Professional Expertise" },
    { icon: "🏆", title: "Lifetime Access", subtitle: "Behind the word mountains" },
    { icon: "🎓", title: "Get Certificate", subtitle: "Behind the word mountains" },
    { icon: "📚", title: "30K+ Online Courses", subtitle: "Solid Question Solving & Fresh Topics" },
  ];

  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] md:min-h-[800px] bg-section-gradient">
      <div className="container mx-auto px-4 py-10 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 pl-2 sm:pl-6 md:pl-10">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Build The Skills You Need To Be{" "}
                <span className="text-primary">Successful</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg">
                Far far away, behind the word mountains, far from the countries Vokalia and
                Consonantia, there live the blind texts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-6 sm:px-8">
                Explore All Courses →
              </Button>
            </div>
          </div>

          {/* Right Content (Hero Image with animation) */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.05, rotate: 1 }}
          >
            <motion.img
              src={heroStudent}
              alt="Student learning with Educve"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto drop-shadow-2xl"
              animate={{ y: [0, -10, 0] }} // floating effect
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="relative mt-10 sm:mt-16 md:mt-20">
          <div className="absolute inset-x-0 bottom-0 origin-bottom-left rotate-[-3deg] bg-black z-20 translate-y-16 sm:translate-y-20 md:translate-y-24 overflow-hidden">
            <div className="relative w-[200%] local-marquee flex gap-4 sm:gap-6 p-3 sm:p-4 md:p-6">
              {stats.concat(stats).map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center bg-gray-800 text-white rounded-xl shadow-none min-w-[140px] sm:min-w-[160px] md:min-w-[180px] flex-shrink-0 p-2 sm:p-3 md:p-4"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{stat.icon}</div>
                  <div className="font-semibold text-sm sm:text-base md:text-lg">{stat.title}</div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-300">{stat.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Local marquee animation */}
      <style>{`
        @keyframes local-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .local-marquee {
          display: flex;
          width: max-content;
          animation: local-marquee 15s linear infinite; 
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

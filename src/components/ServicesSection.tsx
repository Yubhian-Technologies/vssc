import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const services = [
  { title: "Academic Advice", icon: "📚" },
  { title: "Peer Tutoring", icon: "👨‍🏫" },
  { title: "Career Counselling", icon: "🏆" },
  { title: "Peer Mentoring", icon: "🤝" },
  { title: "Communication Skills", icon: "🗣️" },
  { title: "Personality Development", icon: "🌟" },
  { title: "Corporate-Readiness Workshops", icon: "💼" },
  { title: "Self-Care Strategies", icon: "🧘‍♀️" },
  { title: "Wellness Practices", icon: "🌿" },
];

const ServicesSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  return (
    <section
      data-aos="fade-down"
      className="py-16 [background-color:hsl(60,100%,95%)]"
    >
      <div className="container mx-auto px-3 sm:px-6 md:px-10">
        <div className="text-center mb-10">
          <span className="font-semibold text-lg sm:text-xl uppercase text-primary">
            SERVICES
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2 text-gray-800">
            What We Offer to Help You Succeed
          </h2>
        </div>

        
        <div className="relative flex items-center">
          <button
            onClick={scrollLeft}
            className="absolute left-2 z-20 bg-primary text-white text-primary p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-6 scroll-smooth px-8"
          >
            {services.map((service, idx) => (
              <Card
                key={idx}
                className="flex-shrink-0 w-[220px] rounded-2xl border border-yellow-200 [background-color:hsl(60,100%,90%)] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <CardContent className="flex flex-col items-center justify-center space-y-3 py-6">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="text-base font-semibold text-gray-700 hover:text-primary transition-colors">
                    {service.title}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>


          <button
            onClick={scrollRight}
            className="absolute right-2 z-20 bg-primary text-white text-primary p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;

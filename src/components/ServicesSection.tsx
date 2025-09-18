import { Card, CardContent } from "@/components/ui/card";


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
  return (
    <section data-aos="fade-down" className="py-16 [background-color:hsl(60,100%,95%)]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        
        <div className="text-center mb-12">
          <span className="font-semibold text-lg sm:text-xl uppercase text-primary">
            SERVICES
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2">
            What We Offer to Help You Succeed
          </h2>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, idx) => (
            <Card
              key={idx}
              className="transition-all duration-300 hover:shadow-lg cursor-pointer"
            >
              <CardContent className="text-center flex flex-col items-center justify-center space-y-2 [background-color:hsl(60,100%,90%)]">
                <span className="text-3xl">{service.icon}</span>
                <span className="text-base font-medium transition-colors duration-300 hover:text-primary hover:font-semibold">
                  {service.title}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

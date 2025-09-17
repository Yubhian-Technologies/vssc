import { Button } from "@/components/ui/button";
import heroStudent from "@/assets/hero-student.jpg";

const HeroSection = () => {
  const stats = [
    { icon: "👨‍🏫", title: "Expert Instructor", subtitle: "Professional Expertise" },
    { icon: "🏆", title: "Lifetime Access", subtitle: "Behind the word mountains" },
    { icon: "🎓", title: "Get Certificate", subtitle: "Behind the word mountains" },
    { icon: "📚", title: "30K+ Online Courses", subtitle: "Solid Question Solving & Fresh Topics" },
  ];

  return (
    <section className="relative min-h-[600px] bg-section-gradient overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Build The Skills You Need To Be{" "}
                <span className="text-primary">Successful</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Far far away, behind the word mountains, far from the countries Vokalia and
                Consonantia, there live the blind texts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                Explore All Courses →
              </Button>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <img
              src={heroStudent}
              alt="Student learning with Educve"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Bottom Stats - Continuous Scrolling, Black & White */}
        <div className="mt-20 overflow-hidden relative bg-black py-8">
          <div className="flex animate-marquee gap-8">
            {stats.concat(stats).map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-4 bg-gray-800 text-white rounded-xl shadow-none min-w-[180px] flex-shrink-0"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="font-semibold">{stat.title}</div>
                <div className="text-sm text-gray-300">{stat.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailwind CSS Marquee Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

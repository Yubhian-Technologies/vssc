import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroStudent from "@/assets/hero-student.jpg";

const FacilitiesSection = () => {
  const facilities = [
    {
      icon: "📚",
      title: "Academic Advice",
      description: "Personalized guidance to help students achieve academic excellence."
    },
    {
      icon: "🤝",
      title: "Peer Tutoring & Mentoring", 
      description: "Support from experienced peers to enhance learning and skill development."
    },
    {
      icon: "🎯",
      title: "Career Counselling",
      description: "Guidance for career planning, corporate readiness, and professional growth."
    },
    {
      icon: "🧘‍♀️",
      title: "Wellness & Self-Care",
      description: "Strategies for personal development, communication, and wellness practices."
    }
  ];

  return (
    <section className="py-20 bg-section-gradient">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Image */}
          <div className="relative">
            <div className="relative">
              <img
                src={heroStudent}
                alt="Our Facilities"
                className="w-full max-w-lg"
              />
            </div>
          </div>

          {/* Right Content - Facilities */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Facilities
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Far far away, behind the word mountains, far from the Conson antia,
                there live the blind texts. Separated they marks
              </p>
            </div>

            <div className="space-y-6">
              {facilities.map((facility, index) => (
                <Card
                  key={index}
                  className="bg-card/50 border-border/50 hover:bg-card transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-xl">{facility.icon}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">
                          {facility.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {facility.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;

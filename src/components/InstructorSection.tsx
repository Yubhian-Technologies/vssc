import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import instructorWoman from "@/assets/instructor-woman.jpg";

const InstructorSection = () => {
  const benefits = [
    {
      icon: "💰",
      title: "Earn Money",
      description: "Far from the Conson antia"
    },
    {
      icon: "🎓",
      title: "Inspired Students", 
      description: "Behind the word mountains, far from Conson"
    },
    {
      icon: "🌟",
      title: "Join Our Community",
      description: "Behind the word mountains, far from Conson"
    }
  ];

  return (
    <section className="py-20 bg-section-gradient">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Instructor Info */}
          <div className="space-y-8">
            <div>
              <span className="text-primary font-semibold text-sm tracking-wide uppercase">
                INSPIRED INSTRUCTOR
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
                Become an Instructor
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Far far away, behind the word mountains, far from the Conson antia, there
                live the blind texts. Separated they marks
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">{benefit.icon}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="bg-primary hover:bg-primary/90 px-8">
              See All Instructors →
            </Button>
          </div>

          {/* Right Content - Instructor Image + Stats */}
          <div className="relative">
            {/* Main instructor image with decorative background */}
            <div className="relative">
              
              <img
                src={instructorWoman}
                alt="Become an Instructor"
                className="relative w-full max-w-md mx-auto rounded-3xl "
              />
            </div>

            {/* Stats Badge */}
           

            {/* Decorative Elements */}
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
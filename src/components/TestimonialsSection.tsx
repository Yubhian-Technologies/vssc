import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import instructorWoman from "@/assets/instructor-woman.jpg";
import instructorMan from "@/assets/instructor-man.jpg";

const TestimonialsSection = () => {
  const testimonials = [
    { id: 1, name: "Antoni Alex", role: "10th Batch Student", rating: 5, content: "Far far away, behind the mountains...", image: instructorMan },
    { id: 2, name: "Revert Alexan", role: "12th Batch Student", rating: 5, content: "Far far away, behind the mountains...", image: instructorWoman },
    { id: 3, name: "Anthonia Alex", role: "10th Batch Student", rating: 4, content: "Far far away, behind the mountains...", image: instructorMan },
    { id: 4, name: "Emily Clark", role: "11th Batch Student", rating: 5, content: "Amazing experience! Learned a lot...", image: instructorWoman },
    { id: 5, name: "Michael Scott", role: "12th Batch Student", rating: 4, content: "Great teaching style and practical knowledge...", image: instructorMan },
    { id: 6, name: "Sophia Turner", role: "10th Batch Student", rating: 5, content: "The sessions are engaging and informative...", image: instructorWoman }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2); 
      else setVisibleCount(3); 
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, visibleCount]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - visibleCount : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev >= testimonials.length - visibleCount ? 0 : prev + 1
    );
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
       
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-wide uppercase">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
            What Our Students Say About<br />
            Our Services
          </h2>
        </div>

        
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
              width: `${(testimonials.length * 100) / visibleCount}%`,
            }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`px-4`}
                style={{ flex: `0 0 ${100 / visibleCount}%` }}
              >
                <Card className="bg-card shadow-card hover:shadow-hover transition-all duration-300 h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic leading-relaxed text-sm">
                      {testimonial.content}
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

       
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground"
            onClick={handleNext}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute top-8 right-8 text-6xl text-primary/20 font-bold">
          "
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

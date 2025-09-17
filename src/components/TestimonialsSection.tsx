import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import instructorWoman from "@/assets/instructor-woman.jpg";
import instructorMan from "@/assets/instructor-man.jpg";

const TestimonialsSection = () => {
  const testimonials = [
    { id: 1, name: "Antoni Alex", role: "10th Batch Students", rating: 5, content: "Far far away, behind the mountains, far from the Conson antia, there live the blind texts. Separated they marks word for a live new.", image: instructorMan },
    { id: 2, name: "Revert Alexan", role: "12th Batch Students", rating: 5, content: "Far far away, behind the mountains, far from the Conson antia, there live the blind texts. Separated they marks word for a live new.", image: instructorWoman },
    { id: 3, name: "Anthonia Alex", role: "10th Batch Students", rating: 4, content: "Far far away, behind the mountains, far from the Conson antia, there live the blind texts. Separated they marks word for a live new.", image: instructorMan },
    { id: 4, name: "Emily Clark", role: "11th Batch Students", rating: 5, content: "Amazing experience! Learned a lot from instructors and peers alike.", image: instructorWoman },
    { id: 5, name: "Michael Scott", role: "12th Batch Students", rating: 4, content: "Great teaching style and practical knowledge, highly recommend.", image: instructorMan },
    { id: 6, name: "Sophia Turner", role: "10th Batch Students", rating: 5, content: "The sessions are engaging and informative. Loved every bit!", image: instructorWoman }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0)); // move one testimonial back
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, testimonials.length - visibleCount)); // move one testimonial forward
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + visibleCount);

  return (
    <section className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-wide uppercase">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
            What Our Students Say About<br />
            Our Services
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {visibleTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card shadow-card hover:shadow-hover transition-all duration-300">
              <CardContent className="p-8 space-y-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic leading-relaxed">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground"
            onClick={handleNext}
            disabled={currentIndex >= testimonials.length - visibleCount}
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

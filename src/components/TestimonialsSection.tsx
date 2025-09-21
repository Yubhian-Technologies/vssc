import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Antoni Alex",
      role: "10th Batch Students",
      rating: 5,
      content: "Far far away, behind the mountains, far from the Conson antia, there live the blind texts. Separated they marks word for a live new.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Revert Alexan",
      role: "12th Batch Students",
      rating: 5,
      content: "Far far away, behind the mountains, far from the Conson antia, there live the blind texts. Separated they marks word for a live new.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Anthonia Alex",
      role: "10th Batch Students",
      rating: 4,
      content: "Far far away, behind the mountains, far from the Conson antia, there live the blind texts. Separated they marks word for a live new.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Maria Santos",
      role: "11th Batch Students",
      rating: 5,
      content: "Excellent learning experience with amazing instructors. The course content was comprehensive and well-structured.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "John Smith",
      role: "9th Batch Students",
      rating: 5,
      content: "Outstanding program that helped me develop practical skills. Highly recommend to anyone looking to advance their career.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Sarah Johnson",
      role: "12th Batch Students",
      rating: 4,
      content: "Great community of learners and supportive environment. The projects were challenging and rewarding.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    }
  ];

  
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section data-aos="fade-down" className="py-20 [background-color:hsl(60,100%,95%)] relative overflow-hidden">
      <div className="container mx-auto px-4">
       
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-2xl tracking-wide uppercase">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
            What Our Students Say About<br />
            Our Services
          </h2>
        </div>

        
        <div className="relative mb-12">
          <div className="overflow-hidden">
            <div className="flex gap-8 animate-marquee hover:pause-marquee">
              {duplicatedTestimonials.map((testimonial, index) => (
                <Card
                  key={`${testimonial.id}-${index}`}
                  className="[background-color:hsl(60,100%,90%)] shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-80"
                >
                  <CardContent className="p-8 space-y-6">
                    
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

                 
                    <p className="text-gray-600 italic leading-relaxed">
                      {testimonial.content}
                    </p>

                   
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r  to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l  to-transparent z-10 pointer-events-none"></div>
        </div>

        
        

 
      </div>

      
      

      <style >{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 50s linear infinite;
        }

        .pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

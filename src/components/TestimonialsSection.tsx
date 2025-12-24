// TestimonialsSection.tsx
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

type Testimonial = {
  id: string;
  name?: string;
  Batch?: string;
  rating?: number;
  review?: string;
  profileUrl?: string;
  createdAt?: any;
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Anonymous",
          Batch: doc.data().Batch || doc.data().role || "Student",
          rating: Number(doc.data().rating) || 0,
          review: doc.data().review || doc.data().content || "",
          profileUrl:
            doc.data().profileUrl ||
            doc.data().profileURL ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          createdAt: doc.data().createdAt,
        }));
        setTestimonials(data);
      },
      (err) => {
        console.error("Testimonials listener error:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  // duplicate testimonials array for seamless marquee
  const duplicated = [...testimonials, ...testimonials];

  // animation duration: base 12s for 1 item, then +4s per item capped
  const durationSec = Math.max(3, Math.min(40, 3+ testimonials.length * 1));

  return (
    <section
      data-aos="fade-down"
      className="py-20 bg-[hsl(60,100%,95%)] relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <h2
            style={{ color: "hsla(221, 74%, 21%, 1.00)" }}
            className="font-semibold text-4xl tracking-wide uppercase text-center"
          >
            TESTIMONIALS
          </h2>
        </div>

        {/* marquee wrapper */}
        <div
          className="relative overflow-hidden"
          ref={containerRef}
          aria-hidden={testimonials.length === 0}
        >
          {testimonials.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500">
              No testimonials yet.
            </div>
          ) : (
            // marquee-track will be animated via CSS keyframes
            <div
              className="marquee-wrapper"
              // inline style to allow dynamic speed
              style={
                {
                  "--marquee-duration": `${durationSec}s`,
                } as React.CSSProperties
              }
            >
              <div className="marquee-track flex gap-6">
                {duplicated.map((t, idx) => (
                  <Card
                    key={`${t.id || "dup"}-${idx}`}
                    className="min-w-[320px] max-w-[320px] flex-shrink-0 bg-[hsl(60,100%,90%)] shadow-lg transition-all"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < (t.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-700 italic text-sm leading-relaxed min-h-[72px]">
                        {t.review}
                      </p>

                      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                        <img
                          src={
                            t.profileUrl ||
                            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          }
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {t.name}
                          </h4>
                          <p className="text-sm text-gray-500">{t.Batch}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style >{`
        /* marquee styles */
        .marquee-wrapper {
          width: 100%;
        }

        .marquee-track {
          display: flex;
          align-items: stretch;
          /* animate translateX: moves full width of the first half (50%) */
          animation: marquee var(--marquee-duration) linear infinite;
        }

        /* pause on hover */
        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* hide scrollbar if present */
        .marquee-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

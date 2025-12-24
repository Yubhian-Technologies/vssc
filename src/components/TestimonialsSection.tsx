// TestimonialsSection.tsx
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [durationSec, setDurationSec] = useState(20);

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
      (err) => console.error("Testimonials listener error:", err)
    );

    return () => unsubscribe();
  }, []);

  // duplicate testimonials for seamless marquee
  const duplicated = [...testimonials, ...testimonials,...testimonials];

  // calculate animation duration dynamically
  useEffect(() => {
    if (!trackRef.current || testimonials.length === 0) return;

    const totalWidth = trackRef.current.scrollWidth / 2;
    const speedPxPerSec = window.innerWidth < 640 ? 60 : 40;

    setDurationSec(totalWidth / speedPxPerSec);
  }, [testimonials]);

  // helpers to pause / resume animation
  const pauseAnimation = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "paused";
    }
  };

  const resumeAnimation = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "running";
    }
  };

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

        <div
          ref={containerRef}
          className="relative"
          aria-hidden={testimonials.length === 0}
        >
          {testimonials.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500">
              No testimonials yet.
            </div>
          ) : (
            <div
              className="marquee-wrapper"
              style={
                {
                  "--marquee-duration": `${durationSec}s`,
                } as React.CSSProperties
              }
              onMouseEnter={pauseAnimation}
              onMouseLeave={resumeAnimation}
              onTouchStart={pauseAnimation}
              onTouchEnd={resumeAnimation}
            >
              <div
                ref={trackRef}
                className="marquee-track flex gap-6"
              >
                {duplicated.map((t, idx) => (
                  <Card
                    key={`${t.id}-${idx}`}
                    className="min-w-[320px] max-w-[320px] flex-shrink-0 bg-[hsl(60,100%,90%)] shadow-lg transition-all"
                  >
                    <CardContent className="p-6 space-y-4">
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

                      <p className="text-gray-700 italic text-sm leading-relaxed min-h-[72px]">
                        {t.review}
                      </p>

                      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                        <img
                          src={t.profileUrl}
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

      <style>{`
        .marquee-wrapper {
          width: 100%;
          overflow:hidden;
          cursor: grab;
          scrollbar-width: none;
        }

        .marquee-wrapper::-webkit-scrollbar {
          display: none;
        }

        .marquee-wrapper:active {
          cursor: grabbing;
        }

        .marquee-track {
  display: flex;
  width: max-content;
  animation: marquee var(--marquee-duration) linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-33.3333%);
  }
}

      `}</style>
    </section>
  );
};

export default TestimonialsSection;

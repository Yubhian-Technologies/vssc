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
  const scrollRef = useRef<HTMLDivElement | null>(null); // ✅ moved ref (required)

  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Anonymous",
        Batch: doc.data().Batch || "Student",
        rating: Number(doc.data().rating) || 0,
        review: doc.data().review || "",
        profileUrl:
          doc.data().profileUrl ||
          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      }));

      setTestimonials(data);
    });

    return () => unsubscribe();
  }, []);

  // duplicate testimonials array for seamless marquee
  const duplicated = [...testimonials, ...testimonials];

  // increased speed (lower duration = faster)
  const durationSec = Math.max(8, 8 + testimonials.length * 2);

  // ✅ Left & Right button functionality
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-[hsl(60,100%,95%)] overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl font-semibold mb-10 text-[hsla(221,74%,21%,1)]">
          TESTIMONIALS
        </h2>

        {/* CONTROLS + MARQUEE */}
        <div className="flex items-center gap-4">
          {/* Left Button */}
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
          >
            <ChevronLeft />
          </button>

          {/* SCROLL CONTAINER (no behavior change, only structural fix) */}
          <div ref={scrollRef} className="overflow-x-auto w-full no-scrollbar">
            {/* MARQUEE TRACK (unchanged animation logic) */}
            <div
              className="marquee-track flex gap-6"
              style={
                {
                  "--marquee-duration": `${durationSec}s`,
                } as React.CSSProperties
              }
            >
              {duplicated.map((t, idx) => (
                <Card
                  key={`${t.id}-${idx}`}
                  className="min-w-[320px] bg-[hsl(60,100%,90%)] shadow-lg"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
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

                    <p className="italic text-gray-700 text-sm">{t.review}</p>

                    <div className="flex items-center gap-3 pt-3 border-t">
                      <img
                        src={t.profileUrl}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="text-sm text-gray-500">{t.Batch}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Button */}
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* MARQUEE ANIMATION (UNCHANGED) */}
      <style jsx>{`
        .marquee-track {
          animation: marquee var(--marquee-duration) linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 🔹 Import fallback blog images
import img1 from "@/assets/yellow1.png";
import img2 from "@/assets/red1.png";
import img5 from "@/assets/green5.png";
import img4 from "@/assets/hidden1.png";
import img6 from "@/assets/hidden2.png";
import img7 from "@/assets/hidden3.png";

interface Campus {
  id: string;
  name: string;
  coverImage: string;
  description: string;
  collegeName?: string;
}

interface FallbackPost {
  id: number;
  title: string;
  description: string;
  img: string;
}

const fallbackPosts: FallbackPost[] = [
  {
    id: 1,
    title: "Tips for Students",
    description:
      "Practical tips for students and recent graduates to achieve academic and professional success.",
    img: img1,
  },
  {
    id: 2,
    title: "Effective Study Techniques",
    description:
      "Discover proven study methods to boost your learning efficiency and retention.",
    img: img5,
  },
  {
    id: 3,
    title: "Career Planning Essentials",
    description:
      "Key strategies for planning your career path and achieving long-term goals.",
    img: img2,
  },
  {
    id: 4,
    title: "Time Management for Success",
    description:
      "Master time management skills to balance academics, work, and personal life.",
    img: img4,
  },
  {
    id: 5,
    title: "Building Professional Networks",
    description:
      "Learn how to create and maintain valuable professional connections for future opportunities.",
    img: img5,
  },
];

const Slide = ({
  item,
  className,
  onClick,
  isCampus,
}: {
  item: Campus | FallbackPost;
  className: string;
  onClick: () => void;
  isCampus: boolean;
}) => {
  const imageUrl = isCampus
    ? (item as Campus).coverImage
    : (item as FallbackPost).img;
  const title = isCampus ? (item as Campus).name : (item as FallbackPost).title;
  const description = isCampus
    ? (item as Campus).description
    : (item as FallbackPost).description;

  return (
    <div className={`${className} cursor-pointer`} onClick={onClick}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-contain rounded-xl"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
        <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
          {title}
        </h1>
        <p className="max-w-2xl mt-4 text-lg">{description}</p>
      </div>
    </div>
  );
};

const BlogPage = () => {
  const navigate = useNavigate();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch campuses from Firestore
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        console.log("Fetching campuses from Firestore...");
        const querySnapshot = await getDocs(collection(db, "campuses"));
        console.log("Query snapshot size:", querySnapshot.size);

        const campusesList: Campus[] = [];
        querySnapshot.forEach((doc) => {
          console.log("Campus doc:", doc.id, doc.data());
          campusesList.push({
            id: doc.id,
            name: doc.data().name,
            coverImage: doc.data().coverImage,
            description: doc.data().description,
            collegeName: doc.data().collegeName,
          } as Campus);
        });

        console.log("Fetched campuses:", campusesList);

        if (campusesList.length === 0) {
          console.log("No campuses found, using fallback");
          setUseFallback(true);
        } else {
          setCampuses(campusesList);
          setUseFallback(false);
        }
      } catch (error) {
        console.error("Error fetching campuses:", error);
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCampuses();
  }, []);

  const displayItems = useFallback ? fallbackPosts : campuses;

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + displayItems.length) % displayItems.length,
      );
      setIsTransitioning(false);
    }, 1500);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
      setIsTransitioning(false);
    }, 1500);
  };

  // 🔹 Enhanced Slideshow with Super 3D Sliding Animation
  useEffect(() => {
    if (displayItems.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % displayItems.length);
        setIsTransitioning(false);
      }, 1500);
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, [displayItems.length]);

  const nextIndex =
    displayItems.length > 0 ? (currentIndex + 1) % displayItems.length : 0;

  const handleSlideClick = () => {
    if (!useFallback && campuses.length > 0) {
      navigate(`/campus/${campuses[currentIndex].id}`);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const handleMoreBlogs = () => {
    navigate("/tour");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <section data-aos="fade-down" className="bg-background">
      <style>{`
        @keyframes slideIn {
          from {
            transform: translate3d(-100%, 0, -400px) rotateY(90deg) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translate3d(0, 0, 0) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translate3d(0, 0, 0) rotateY(0deg) scale(1);
            opacity: 1;
          }
          to {
            transform: translate3d(100%, 0, -400px) rotateY(-90deg) scale(0.8);
            opacity: 0;
          }
        }
        .animate-slideIn {
          animation: slideIn 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-slideOut {
          animation: slideOut 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
      {/* Container for content */}
      <div className="container mx-auto px-3 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-primary font-semibold text-2xl uppercase">
            BLOGS & ARTICLES
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
            Explore Latest Articles
          </h1>
        </div>

        {/* 🔹 Hero Section Slideshow with Enhanced 3D Effect */}
        <div
          className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[28rem] overflow-hidden rounded-xl mb-6 shadow-2xl"
          style={{ perspective: "1500px" }}
        >
          {loading ? (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-xl">
              <p className="text-gray-600">Loading Articles...</p>
            </div>
          ) : displayItems.length > 0 && isTransitioning ? (
            <>
              <Slide
                key={currentIndex}
                item={displayItems[currentIndex]}
                className="absolute inset-0 animate-slideOut preserve-3d backface-hidden"
                onClick={handleSlideClick}
                isCampus={!useFallback}
              />
              <Slide
                key={nextIndex}
                item={displayItems[nextIndex]}
                className="absolute inset-0 animate-slideIn preserve-3d backface-hidden"
                onClick={handleSlideClick}
                isCampus={!useFallback}
              />
            </>
          ) : displayItems.length > 0 ? (
            <Slide
              key={currentIndex}
              item={displayItems[currentIndex]}
              className="absolute inset-0 preserve-3d backface-hidden transition-shadow duration-500 hover:shadow-2xl"
              onClick={handleSlideClick}
              isCampus={!useFallback}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-xl">
              <p className="text-gray-600">No articles available</p>
            </div>
          )}

          {/* Previous Button */}
          {displayItems.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Next Button */}
          {displayItems.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>

        {/* Slideshow Indicators - Display Only */}
        <div className="flex justify-center space-x-2 mb-6">
          {displayItems.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-[#1a3791]" : "bg-gray-400"
              }`}
            ></div>
          ))}
        </div>

        {/* More Blogs Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleMoreBlogs}
            className="text-white bg-[#1a3791] font-semibold border border-primary rounded-lg px-4 py-2 text-sm hover:bg-black transition"
          >
            More Blogs →
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogPage;

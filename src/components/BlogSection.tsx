import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Import slideshow images
import img1 from "@/assets/yellow1.png";
import img2 from "@/assets/red1.png"
import img3 from "@/assets/yellow3.png";
import img4 from "@/assets/hidden1.png";
import img5 from "@/assets/green5.png";
import img6 from "@/assets/hidden2.png";
import img7 from "@/assets/hidden3.png";

const posts = [
  {
    id: 1,
    title: "Tips for Students",
    date: "Jan 23, 2024",
    category: "Education",
    shortDescription:
      "Practical tips for students and recent graduates to achieve academic and professional success.",
    img: img1,
    // bgColor: "bg-yellow-100",
  },
  {
    id: 2,
    title: "Effective Study Techniques",
    date: "Feb 15, 2024",
    category: "Education",
    shortDescription:
      "Discover proven study methods to boost your learning efficiency and retention.",
    img: img5,
    // bgColor: "bg-green-100",
  },
  {
    id: 3,
    title: "Career Planning Essentials",
    date: "Mar 10, 2024",
    category: "Career",
    shortDescription:
      "Key strategies for planning your career path and achieving long-term goals.",
    img: img2,
    // bgColor: "bg-red-100",
  },
  {
    id: 4,
    title: "Time Management for Success",
    date: "Apr 5, 2024",
    category: "Productivity",
    shortDescription:
      "Master time management skills to balance academics, work, and personal life.",
    img: img4,
    // bgColor: "bg-purple-100",
  },
  {
    id: 5,
    title: "Building Professional Networks",
    date: "May 20, 2024",
    category: "Career",
    shortDescription:
      "Learn how to create and maintain valuable professional connections for future opportunities.",
    img: img5,
    // bgColor: "bg-green-200",
  },
  {
    id: 6,
    title: "Overcoming Academic Challenges",
    date: "Jun 12, 2024",
    category: "Education",
    shortDescription:
      "Strategies to tackle common academic obstacles and emerge stronger.",
    img: img6,
    // bgColor: "bg-gray-200",
  },
  {
    id: 7,
    title: "Preparing for Job Interviews",
    date: "Jul 8, 2024",
    category: "Career",
    shortDescription:
      "Essential preparation tips to ace your job interviews and land your dream role.",
    img: img7,
    // bgColor: "bg-pink-100",
  },
];

const Slide = ({ post, className }: { post: typeof posts[0]; className: string }) => (
  <div className={`${className}`}>
    <img
      src={post.img}
      alt={post.title}
      className="w-full h-full object-contain rounded-xl"
    />
    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
      <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
        {post.title}
      </h1>
      <p className="max-w-2xl mt-4 text-lg">
        {post.shortDescription}
      </p>
    </div>
  </div>
);

const BlogPage = () => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 🔹 Enhanced Slideshow with Super 3D Sliding Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setIsTransitioning(false);
      }, 1500); // Increased animation duration for smoother effect
    }, 4000); // Change every 4 seconds for better viewing

    return () => clearInterval(interval);
  }, []);

  const nextIndex = (currentIndex + 1) % posts.length;

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
          {isTransitioning ? (
            <>
              <Slide
                key={currentIndex}
                post={posts[currentIndex]}
                className="absolute inset-0 animate-slideOut preserve-3d backface-hidden"
              />
              <Slide
                key={nextIndex}
                post={posts[nextIndex]}
                className="absolute inset-0 animate-slideIn preserve-3d backface-hidden"
              />
            </>
          ) : (
            <Slide
              key={currentIndex}
              post={posts[currentIndex]}
              className="absolute inset-0 preserve-3d backface-hidden transition-shadow duration-500 hover:shadow-2xl"
            />
          )}
        </div>

        {/* Slideshow Indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {posts.map((_, index) => (
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Import slideshow images
import img1 from "@/assets/yellow1.png";
import img2 from "@/assets/yellow2.png";
import img3 from "@/assets/yellow3.png";
import img4 from "@/assets/yellow4.png";
import img5 from "@/assets/green5.png";
import img6 from "@/assets/green6.png";
import img7 from "@/assets/green7.png";

const blogPost = {
  id: 1,
  title: "Tips for Students",
  date: "Jan 23, 2024",
  category: "Education",
  shortDescription:
    "Practical tips for students and recent graduates to achieve academic and professional success.",
};

const BlogPage = () => {
  const navigate = useNavigate();

  const images = [img1, img2, img3, img4, img5];
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);

  // 🔹 Slideshow with Fade + Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // fade out current image
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        setFade(true); // fade in new image
      }, 500); // duration matches transition
    }, 3000); // change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMoreBlogs = () => {
    navigate("/tour");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <section data-aos="fade-down" className="bg-background">
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

        {/* 🔹 Hero Section Slideshow */}
        <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[28rem] overflow-hidden rounded-xl mb-6 bg-yellow">
          <img
            src={images[currentImage]}
            alt={blogPost.title}
            className={`w-full h-full object-contain rounded-xl
      transform transition-all duration-500
      ${fade ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          />
          {/* Optional dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
          {/* Optional centered text */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
              {blogPost.title}
            </h1>
            <p className="max-w-2xl mt-4 text-lg">
              {blogPost.shortDescription}
            </p>
          </div>
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

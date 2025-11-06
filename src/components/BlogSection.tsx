import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroStudent from "@/assets/hero-student.jpg";
import { useNavigate } from "react-router-dom";

const blogPost = {
  id: 1,
  title: "Tips for Students and Recent Graduates",
  date: "Jan 23, 2024",
  image: heroStudent,
  category: "Education",
  tags: [
    "Student",
    "Tips",
    "Education",
    "Career",
    "Learning",
    "Motivation",
    "Success",
  ],
  shortDescription:
    "Practical tips for students and recent graduates to achieve academic and professional success.",
};

const categories = [
  "Education",
  "Academic",
  "Teaching",
  "Technology",
  "Lifestyle",
];

const popularPosts = [
  { id: 1, title: "5 Ways to Stay Productive", date: "Feb 1, 2024" },
  { id: 2, title: "Top Online Learning Platforms", date: "Mar 10, 2024" },
  { id: 3, title: "Balancing Study and Work", date: "Apr 5, 2024" },
];

const BlogPage = () => {
  const navigate = useNavigate();

  const handleMoreBlogs = () => {
    navigate("/tour");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <section data-aos="fade-down" className="py-8 bg-background">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-primary font-semibold text-2xl uppercase">
            BLOGS & ARTICLES
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
            Explore Latest Articles
          </h1>
        </div>

        {/* Blog + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Main Blog */}
          <div className="lg:w-2/3 flex flex-col gap-2 bg-yellow-50 border border-gray-300 rounded-lg p-3 shadow-sm">
            <img
              src={blogPost.image}
              alt={blogPost.title}
              className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover rounded-md shadow-md"
            />
            <h2 className="text-lg font-bold text-foreground mt-1">
              {blogPost.title}
            </h2>
            <p className="text-muted-foreground text-xs">
              {blogPost.shortDescription}
            </p>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3 flex flex-col gap-3">
            {/* Categories */}
            <div className="bg-yellow-50 border border-gray-300 rounded-lg p-2">
              <h3 className="text-sm font-semibold mb-1">Categories</h3>
              <ul className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <li
                    key={cat}
                    className="text-xs text-foreground cursor-pointer hover:text-primary"
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-yellow-50 border border-gray-300 rounded-lg p-2">
              <h3 className="text-sm font-semibold mb-1">Tags</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {blogPost.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="border border-gray-300 text-xs cursor-pointer hover:bg-[#5371cb] px-1 py-[1px] text-center"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* ✅ New Section: Popular Posts */}
            <div className="bg-yellow-50 border border-gray-300 rounded-lg p-2">
              <h3 className="text-sm font-semibold mb-1">Popular Posts</h3>
              <ul className="flex flex-col gap-1">
                {popularPosts.map((post) => (
                  <li
                    key={post.id}
                    className="text-xs text-foreground hover:text-primary cursor-pointer"
                  >
                    <span className="font-medium">{post.title}</span>
                    <br />
                    <span className="text-[10px] text-muted-foreground">
                      {post.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* More Blogs Button */}
        <div className="text-center">
          <button
            onClick={handleMoreBlogs}
            className="text-white bg-[#1a3791] font-semibold border border-primary rounded px-3 py-1 text-sm hover:bg-black transition"
          >
            More Blogs →
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogPage;

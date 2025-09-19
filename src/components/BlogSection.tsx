import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroStudent from "@/assets/hero-student.jpg";

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
  shortDescription: "Practical tips for students and recent graduates to achieve academic and professional success.",
};

const categories = ["Education", "Academic", "Teaching", "Technology", "Lifestyle"];

const BlogPage = () => {
  return (
    <section data-aos="fade-down" className="py-12 bg-background">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 md:py-10">
       
        <div className="mb-8 text-center">
          <span className="text-primary font-semibold text-sm uppercase">BLOGS & ARTICLES</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-2">
            Explore Latest Articles
          </h1>
        </div>

        
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          
          <div className="lg:w-2/3 flex flex-col gap-3 bg-yellow-50 border border-gray-300 rounded-lg p-4 shadow-sm">
            <img
              src={blogPost.image}
              alt={blogPost.title}
              className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-md shadow-md"
            />
            <h2 className="text-xl font-bold text-foreground mt-1">{blogPost.title}</h2>
            <p className="text-muted-foreground text-sm">{blogPost.shortDescription}</p>
            <span className="text-primary font-medium cursor-pointer hover:underline text-sm">
              Know More →
            </span>
          </div>

        
          <aside className="lg:w-1/3 flex flex-col gap-4">
           
            <div className="bg-yellow-50 border border-gray-300 rounded-lg p-3">
              <h3 className="text-md font-semibold mb-2">Categories</h3>
              <ul className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <li
                    key={cat}
                    className="text-sm text-foreground cursor-pointer hover:text-primary"
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>

           
            <div className="bg-yellow-50 border border-gray-300 rounded-lg p-3 justify-center items-center">
              <h3 className="text-md font-semibold mb-2">Tags</h3>
              <div className="flex flex-col w-1/4  flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="border border-gray-300 text-xs cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>

        
        <div className="text-center">
          <button className="text-white bg-[#1a3791] font-semibold border border-primary rounded px-4 py-2 hover:bg-black transition">
            More Blogs →
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogPage;

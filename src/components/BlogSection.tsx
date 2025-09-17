import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import instructorWoman from "@/assets/instructor-woman.jpg";
import instructorMan from "@/assets/instructor-man.jpg";

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Tips for Students and Recent Graduates",
      description: "Education is a dynamic and evolving field that plays a crucial.",
      author: "Jhon Doe",
      date: "Jan 23, 2024",
      image: instructorWoman,
      category: "Education"
    },
    {
      id: 2,
      title: "Role of Intelligence in good Academic Success",
      description: "Education is a dynamic and evolving field that plays a crucial.",
      author: "Jhon Doe", 
      date: "Jan 20, 2024",
      image: instructorMan,
      category: "Academic"
    },
    {
      id: 3,
      title: "How to Inspire Your Students for life",
      description: "Education is a dynamic and evolving field that plays a crucial.",
      author: "Jhon Doe",
      date: "Jan 18, 2024", 
      image: instructorWoman,
      category: "Teaching"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div className="text-left">
            <span className="text-primary font-semibold text-sm tracking-wide uppercase">
              BLOG & ARTICLES
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-2">
              Explore A Look At The<br />
              Latest Articles
            </h2>
          </div>
          <Button variant="ghost" className="hover:text-primary">
            See All Articles →
          </Button>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-card shadow-card hover:shadow-hover transition-all duration-300 group overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-foreground">
                  {post.category}
                </Badge>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground leading-tight hover:text-primary transition-colors cursor-pointer group-hover:text-primary">
                  {post.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {post.description}
                </p>

                {/* Read More Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto text-primary hover:text-primary/80 font-medium group"
                >
                  <span className="flex items-center gap-1">
                    Read More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const navigationLinks = [
    { title: "Home", href: "#" },
    { title: "About", href: "#" },
    { title: "Contact", href: "#" },
    { title: "Refund", href: "#" },
    { title: "Help Center", href: "#" },
    { title: "Privacy Policy", href: "#" },
  ];

  const courseLinks = [
    { title: "Business Coach", href: "#" },
    { title: "Development Coach", href: "#" },
    { title: "Testimonials", href: "#" },
    { title: "Seo Optimization", href: "#" },
    { title: "Web design", href: "#" },
    { title: "Life Coach", href: "#" },
  ];

  return (
    <footer className="bg-footer-gradient text-white text-[0.9rem]">
      <div className="container mx-auto px-6 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="grid md:grid-cols-2 gap-6">
         
          <div className="p-6 rounded-xl shadow-lg shadow-black/20">
           
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-base">E</span>
                </div>
                <span className="text-xl font-bold">Educve</span>
              </div>
              <p className="text-white/70 leading-relaxed text-sm max-w-sm mb-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero,
                esse. Far far away, behind the word mountains.
              </p>
            </div>

         
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

       
          <div className="p-6 rounded-xl shadow-lg shadow-black/20">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
             
              <div>
                <h3 className="text-base font-semibold mb-3">Navigate</h3>
                <ul className="space-y-1">
                  {navigationLinks.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors text-sm"
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

             
              <div>
                <h3 className="text-base font-semibold mb-3">Courses</h3>
                <ul className="space-y-1">
                  {courseLinks.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors text-sm"
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              
              <div>
                <h3 className="text-base font-semibold mb-3">Subscribe Now</h3>
                <p className="text-white/70 mb-3 text-sm">
                  Get the latest updates directly to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 h-9 text-sm flex-1"
                  />
                  <Button className="bg-white text-primary hover:bg-white/90 font-medium h-9 px-3 text-sm">
                    Go
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

       
        <div className="w-full overflow-hidden bg-primary text-white py-2 mt-10">
          <div className="flex whitespace-nowrap animate-marquee">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mr-10">
              VISHNU STUDENT SUCCESS CENTRE .
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mr-10">
              VISHNU STUDENT SUCCESS CENTRE .
            </p>
          </div>
        </div>

       
        <div className="mt-6 text-center text-white/70 text-sm">
          @ {new Date().getFullYear()} Vishnu Student Success Centre. All rights
          reserved.
        </div>
      </div>

    
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 60s linear infinite;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;

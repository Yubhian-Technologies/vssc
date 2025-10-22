import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import vssc from "@/assets/VSSC LOGO[1].png";

const Footer = () => {
  const navigate = useNavigate();

  const navigationLinks = [
    { title: "Home", href: "#" },
    { title: "About", href: "/About" },
    { title: "Services", href: "/Services" },
    { title: "Tour", href: "/tour" },
    { title: "Help", href: "/Help" },
    { title: "Account", href: "/Account" },
  ];

  const courseLinks = [
    { title: "Academic Advice", href: "/Services" },
    { title: "Peer Tutoring", href: "/Services" },
    { title: "Career Counselling", href: "/Services" },
    { title: "Peer Mentoring", href: "/Services" },
    { title: "Communication Skills", href: "/Services" },
    { title: "Personality Development", href: "/Services" },
    { title: "Corporate-readiness Workshops", href: "/Services" },
    { title: "Self-care Strategies", href: "/Services" },
    { title: "Wellness Practices", href: "/Services" },
  ];

  const socialLinks = [
    {
      Icon: Facebook,
      url: "https://www.facebook.com/srivishnueducationalsocietybhimavaram/",
      external: true,
    },

    {
      Icon: Instagram,
      url: "https://www.instagram.com/vishnueducationalsociety/",
      external: true,
    },
    {
      Icon: Linkedin,
      url: "https://www.linkedin.com/school/vitbhimavaram/posts/?feedView=all",
      external: true,
    },
    { Icon: Twitter, url: "", external: true }, // Disabled because URL is missing
  ];

  return (
    <footer className="bg-primary text-white text-[0.9rem]">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 md:py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl shadow-lg shadow-black/20">
            <div className="mb-6">
              <div className="flex items-center transition-transform">
                <img
                  src={vssc}
                  alt="VSSC Logo"
                  className="w-8 h-8 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <p className="text-white/70 leading-relaxed text-sm max-w-sm mb-4">
                Falling Water, BVRIT Hyderabad Campus, Bachupally, 8-5/4,
                Nizampet Rd, Opposite Rajiv Gandhi Nagar Colony, Hyderabad,
                Telangana 500090
              </p>
            </div>

            {/* Social Buttons */}
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, url, external }, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="icon"
                  aria-label={url ? `Go to ${url}` : "No link available"}
                  className={`w-9 h-9 rounded-full text-white ${
                    url
                      ? "bg-white/10 hover:bg-white/20 cursor-pointer"
                      : "bg-white/20 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (!url) return; // Disabled button does nothing
                    if (external) {
                      window.open(url, "_blank", "noopener,noreferrer");
                    } else {
                      navigate(url);
                    }
                  }}
                  disabled={!url}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation & Services & Subscribe */}
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
                <h3 className="text-base font-semibold mb-3">Services</h3>
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

        {/* Marquee */}
        <div className="w-full overflow-hidden bg-primary py-2 mt-10">
          <div className="flex whitespace-nowrap animate-marquee">
            <p className="text-xl sm:text-20xl md:text-7xl lg:text-10xl font-bold mr-20 opacity-60">
              VISHNU STUDENT SUCCESS CENTRE
            </p>
            <p className="text-xl sm:text-20xl md:text-7xl lg:text-10xl font-bold mr-20 opacity-60">
              VISHNU STUDENT SUCCESS CENTRE
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-white/70 text-sm">
          © {new Date().getFullYear()} Vishnu Student Success Centre. All rights
          reserved.
        </div>
      </div>

      {/* Marquee animation */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 50s linear infinite;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;

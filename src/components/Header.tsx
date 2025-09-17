import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, User } from "lucide-react";
import VSSCLogo from "@/assets/VSSC LOGO[1].png"

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <header className="w-full relative bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        {/* Logo */}
        <div className="flex items-center">
  <img
    src={VSSCLogo} // your logo import
    alt="Educve Logo"
    className="w-16 h-16 object-contain"
  />
</div>



        {/* Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-8">
          <a
            href="#"
            className="flex items-center gap-1 text-foreground hover:text-primary transition-colors relative"
          >
            Home 
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-foreground hover:text-primary transition-colors relative"
          >
            About 
          </a>
          <a
            href="#"
            className="text-foreground hover:text-primary transition-colors relative"
          >
            Services
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-foreground hover:text-primary transition-colors relative"
          >
            Tour 
          </a>
          
          <a
            href="#"
            className="text-foreground hover:text-primary transition-colors relative"
          >
            Help
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 relative">
          {!isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 font-semibold rounded-full border border-primary text-black hover:bg-primary hover:text-white border-white  transition-all shadow-sm"
              onClick={handleLoginToggle}
            >
              Login/Register
            </Button>
          )}

          {isLoggedIn && (
            <>
              <Button
                size="sm"
                className="px-5 py-2 bg-white text-black  border border-white text-white font-semibold rounded-full hover:bg-primary text-black transition-all"
              >
                Apply Now →
              </Button>

              <div className="relative group">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center cursor-pointer shadow hover:shadow-md transition-shadow">
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <div className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100"
                  >
                    Your Reservations
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-gray-100"
                  >
                    Account
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blue strip with left slant */}
      <div className="absolute top-0 right-0 h-full w-64 bg-primary -skew-x-12 origin-top-right"></div>
    </header>
  );
};

export default Header;

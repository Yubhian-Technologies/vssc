import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Menu, X } from "lucide-react";
import VSSCLogo from "@/assets/VSSC LOGO[1].png";
import ButtonGradient from "./ui/ButtonGradient";

const Header = ({ props }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginToggle = () => setIsLoggedIn(!isLoggedIn);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="relative w-full bg-background border-b border-border">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 h-full w-1/4 bg-primary z-0 [clip-path:polygon(20%_0,100%_0,100%_100%,0%_100%)] opacity-90 pointer-events-none"></div>

      <div className="container mx-auto px-0 py-0 flex items-center justify-between relative z-10">
        {/* Logo */}
        <div className="flex items-center hover:scale-105 transition-transform px-2 py-2">
          <img
            src={VSSCLogo}
            alt="VSSC Logo"
            className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {["Home", "About", "Services", "Tour", "Help"].map((link) => (
            <a
              key={link}
              href="#"
              className="relative text-foreground hover:text-primary transition-colors font-semibold
                after:absolute after:left-1/2 after:bottom-[-4px] after:h-[2px] after:w-0 
                after:bg-primary after:transition-all after:duration-300 after:origin-center 
                hover:after:left-0 hover:after:w-full"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4 relative z-20">
          {!isLoggedIn ? (
            <div className="pr-3" onClick={handleLoginToggle}>
              <ButtonGradient name={"Login/Register"} />
            </div>
          ) : (
            <>
              <div className="pr-3">
                <ButtonGradient name={"Apply Now →"} />
              </div>

              {/* Profile Menu */}
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

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md border border-border text-white"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {/* Mobile Menu */}
{isMenuOpen && (
  <div className="lg:hidden absolute top-full left-0 w-full bg-background border-t border-border shadow-md z-[999]">
    <nav className="flex flex-col px-6 py-4 gap-4 justify-end items-center">
      {["Home", "About", "Services", "Tour", "Help"].map((link) => (
        <a
          key={link}
          href="#"
          onClick={() => setIsMenuOpen(false)}
          className="relative text-foreground hover:text-primary transition-colors font-semibold
            after:absolute after:left-1/2 after:bottom-[-2px] after:h-[2px] after:w-0 
            after:bg-primary after:transition-all after:duration-300 after:origin-center 
            hover:after:left-0 hover:after:w-full"
        >
          {link}
        </a>
      ))}

      {!isLoggedIn ? (
        <div className="flex justify-center w-full" onClick={handleLoginToggle}>
          <ButtonGradient name={"Login/Register"} />
        </div>
      ) : (
        <>
          <div className="flex justify-center w-full">
            <ButtonGradient name={"Apply Now →"} />
          </div>
          <a
            href="#"
            onClick={() => setIsMenuOpen(false)}
            className="text-foreground hover:text-primary transition-colors font-semibold"
          >
            Your Reservations
          </a>
          <a
            href="#"
            onClick={() => setIsMenuOpen(false)}
            className="text-foreground hover:text-primary transition-colors font-semibold"
          >
            Account
          </a>
        </>
      )}
    </nav>
  </div>
)}

    </header>
  );
};

export default Header;

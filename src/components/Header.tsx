import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ButtonGradient from "./ui/ButtonGradient";
import VSSCLogo from "@/assets/VSSC LOGO[1].png";
import { doc, getDoc } from "firebase/firestore";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false); // for mobile dropdown

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileUrl(data.profileUrl || null);
        }
      } else {
        setIsLoggedIn(false);
        setProfileUrl(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLoginClick = () => {
    if (!isLoggedIn) navigate("/auth");
    else navigate("/hero");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" }, // dropdown handled separately
    { name: "Tour", path: "/tour" },
    { name: "Help", path: "/help" },
  ];

  return (
    <header className="relative w-full bg-background border-b border-border">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 h-full w-1/4 bg-primary z-0 [clip-path:polygon(20%_0,100%_0,100%_100%,0%_100%)] opacity-90 pointer-events-none"></div>

      <div className="container mx-auto px-0 py-0 flex items-center justify-between relative z-10">
        {/* Logo */}
        <div className="flex items-center hover:scale-105 transition-transform px-2 py-2">
          <Link to="/">
            <img
              src={VSSCLogo}
              alt="VSSC Logo"
              className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.name === "Services" ? (
              <div key={link.name} className="relative group">
                <Link
                  to="/services"
                  className="relative text-foreground hover:text-primary font-semibold cursor-pointer flex items-center gap-1"
                >
                  {link.name} <span>▾</span>
                </Link>

                {/* Desktop Dropdown */}
                <div className="absolute left-0 mt-2 w-64 [background-color:hsl(60,100%,95%)] border border-border rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
                  <Link
                    to="/services/tutoring"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-t-md"
                  >
                    Tutoring Services
                  </Link>
                  <Link
                    to="/services/advising"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Academic Advising
                  </Link>
                  <Link
                    to="/services/workshops"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Study Skills Workshops
                  </Link>
                  <Link
                    to="/services/counseling"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Counseling Sessions
                  </Link>
                  <Link
                    to="/services/psychology"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-b-md"
                  >
                    Psychology Counseling Service
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className="relative text-foreground hover:text-primary font-semibold"
              >
                {link.name}
              </Link>
            )
          )}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4 relative z-20">
          <ButtonGradient
            name={isLoggedIn ? "Apply Now →" : "Login/Register"}
            onClick={handleLoginClick}
          />

          {isLoggedIn && (
            <>
              {/* Profile icon */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary cursor-pointer">
                  {profileUrl ? (
                    <img
                      src={profileUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-white">U</span>
                    </div>
                  )}
                </div>
                <div className="absolute right-0 mt-2 w-44 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
                  <Link
                    to="/reservations"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Your Reservations
                  </Link>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Account
                  </Link>
                </div>
              </div>

              {/* Sign out icon */}
              <button
                onClick={handleSignOut}
                className="ml-3 w-10 h-10 bg-muted rounded-full flex items-center justify-center cursor-pointer shadow hover:shadow-md transition-shadow"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 text-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md border border-border text-white"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background border-t border-border shadow-md z-[999] justify-center items-center">
          <nav className="flex flex-col px-6 py-4 gap-4 justify-center items-center">
            {navLinks.map((link) =>
              link.name === "Services" ? (
                <div key="Services" className="w-full flex flex-col items-center">
                  {/* Services + Triangle aligned side by side */}
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      to="/services"
                      className="text-foreground font-semibold hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Services
                    </Link>

                    {/* Toggle Dropdown */}
                    <button
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      className="text-foreground hover:text-primary"
                    >
                      {isServicesOpen ? "▴" : "▾"}
                    </button>
                  </div>

                  {/* Mobile Dropdown */}
                  {isServicesOpen && (
                    <div className="mt-2 flex flex-col justify-center items-center bg-background rounded-md shadow-md border border-border w-full">
                      <Link
                        to="/services/tutoring"
                        className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-t-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tutoring Services
                      </Link>
                      <Link
                        to="/services/advising"
                        className="px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Academic Advising
                      </Link>
                      <Link
                        to="/services/workshops"
                        className="px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Study Skills Workshops
                      </Link>
                      <Link
                        to="/services/counseling"
                        className="px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Counseling Sessions
                      </Link>
                      <Link
                        to="/services/psychology"
                        className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-b-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Psychology Counseling Service
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground hover:text-primary font-semibold"
                >
                  {link.name}
                </Link>
              )
            )}

            {/* Buttons below menu */}
            <ButtonGradient
              name={isLoggedIn ? "Apply Now →" : "Login/Register"}
              onClick={handleLoginClick}
            />
            {isLoggedIn && (
              <button
                onClick={handleSignOut}
                className="flex justify-center items-center w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
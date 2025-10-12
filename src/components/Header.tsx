import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import ButtonGradient from "./ui/ButtonGradient";
import VSSCLogo from "@/assets/VSSC LOGO[1].png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);

  const isHome = location.pathname === "/";

  const formatPoints = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000)
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        const docRef = doc(db, "users", user.uid);
        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileUrl(data.profileUrl || null);
            setRole(data.role || null);
            setPoints(data.points || 0);
          }
        });
      } else {
        setIsLoggedIn(false);
        setProfileUrl(null);
        setRole(null);
        setPoints(0);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLoginClick = () => {
    if (!isLoggedIn) navigate("/auth");
    else navigate("/appointment");
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
    { name: "Services", path: "/services" },
    { name: "Tour", path: "/tour" },
    { name: "Help", path: "/help" },
    { name: "Account", path: "/account" },
  ];

  const PointsBadge = () => (
    <div
      id="points-section"
      onClick={() => {
        setIsMenuOpen(false);
        navigate("/leaderboard");
      }}
      className="flex items-center gap-2 px-3 py-1 bg-black/80 rounded-full shadow-lg relative overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-yellow-400 to-transparent animate-pulse opacity-60 blur-sm"></div>
      <span className="relative z-10 text-white font-bold text-lg">
        {formatPoints(points)}🔥
      </span>
    </div>
  );

  return (
    <header className="relative w-full bg-background border-b border-border z-[100]">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 h-full w-[300px] md:w-[400px] bg-primary z-0 [clip-path:polygon(20%_0,100%_0,100%_100%,0%_100%)] opacity-90 pointer-events-none"></div>

      {/* Header container */}
      <div className="container mx-auto px-4 sm:px-6 py-2 flex items-center justify-between relative z-20">
        {/* Logo section */}
        <div
          className={`flex items-center transition-all duration-500 ${
            isHome ? "translate-y-4" : ""
          }`}
          style={{ marginLeft: "0.75rem" }} // move logo slightly right
        >
          <Link
            to="/"
            className={`transition-all duration-500 flex items-center ${
              isHome
                ? "scale-[1.7] drop-shadow-[0_0_25px_rgba(255,200,0,0.8)]"
                : "scale-100"
            }`}
          >
            <img
              src={VSSCLogo}
              alt="VSSC Logo"
              className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
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
                <div className="absolute left-0 mt-2 w-64 bg-[hsl(60,100%,95%)] border border-border rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
                  <Link
                    to="/services/tutoring"
                    className="block px-4 py-2 text-sm hover:bg-muted rounded-t-md"
                  >
                    Tutoring Services
                  </Link>
                  <Link
                    to="/services/academic-advising"
                    className="block px-4 py-2 text-sm hover:bg-muted"
                  >
                    Academic Advising
                  </Link>
                  <Link
                    to="/services/study-workshops"
                    className="block px-4 py-2 text-sm hover:bg-muted"
                  >
                    Study Skills Workshops
                  </Link>
                  <Link
                    to="/services/counseling"
                    className="block px-4 py-2 text-sm hover:bg-muted"
                  >
                    Counseling Sessions
                  </Link>
                  <Link
                    to="/services/psychology-counseling"
                    className="block px-4 py-2 text-sm hover:bg-muted rounded-b-md"
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

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-4 relative z-20">
          {isLoggedIn && role === "admin" ? (
            <ButtonGradient name="Appointments →" onClick={handleLoginClick} />
          ) : (
            <ButtonGradient
              name={isLoggedIn ? "Book an Appointment →" : "Login/Register"}
              onClick={handleLoginClick}
            />
          )}

          {isLoggedIn && (
            <>
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
                  {role === "admin+" && (
                    <Link
                      to="/addAdmin"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Add Admins
                    </Link>
                  )}
                </div>
              </div>

              <PointsBadge />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md border border-border text-white relative z-[200]"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background border-t border-border shadow-md z-[150]">
          <nav className="flex flex-col px-6 py-4 gap-4 justify-center items-center">
            {navLinks.map((link) =>
              link.name === "Services" ? (
                <div key="Services" className="w-full flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      to="/services"
                      className="text-foreground font-semibold hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Services
                    </Link>
                    <button
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      className="text-foreground hover:text-primary"
                    >
                      {isServicesOpen ? "▴" : "▾"}
                    </button>
                  </div>
                  {isServicesOpen && (
                    <div className="mt-2 flex flex-col justify-center items-center bg-background rounded-md shadow-md border border-border w-full">
                      <Link
                        to="/services/tutoring"
                        className="px-4 py-2 text-sm hover:bg-muted rounded-t-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tutoring Services
                      </Link>
                      <Link
                        to="/services/advising"
                        className="px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Academic Advising
                      </Link>
                      <Link
                        to="/services/workshops"
                        className="px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Study Skills Workshops
                      </Link>
                      <Link
                        to="/services/counseling"
                        className="px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Counseling Sessions
                      </Link>
                      <Link
                        to="/services/psychology"
                        className="px-4 py-2 text-sm hover:bg-muted rounded-b-md"
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

            {isLoggedIn && role === "admin" ? (
              <ButtonGradient
                name="Appointments →"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLoginClick();
                }}
              />
            ) : (
              <ButtonGradient
                name={isLoggedIn ? "Book an Appointment →" : "Login/Register"}
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLoginClick();
                }}
              />
            )}

            {isLoggedIn && (
              <>
                <PointsBadge />
                <button
                  onClick={handleSignOut}
                  className="flex justify-center items-center w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Add this import
import { 
  motion, 
  AnimatePresence, 
  Variants, 
  Transition 
} from "framer-motion";
import { Crown, Star, Zap, Flame, Trophy, Users, Award, BarChart3, Sparkles } from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type User = {
  uid: string;
  name: string;
  points: number;
};

type LoadingStage = 'logo' | 'loading' | 'revealing' | 'complete';

const formatPoints = (points: number) => {
  if (points >= 1000000) return (points / 1000000).toFixed(1) + "M";
  if (points >= 1000) return (points / 1000).toFixed(1) + "K";
  return points.toString();
};

const LeaderboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('logo');
  const [showAll, setShowAll] = useState(false);
  const { width, height } = useWindowSize();
  const { state } = useLocation(); // Access navigation state
  const showArrow = state?.showArrow || false; // Check for showArrow

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: User[] = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as User),
      }));
      setUsers(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoadingStage('loading');
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLoadingStage('revealing');
      setTimeout(() => setLoadingStage('complete'), 2000);
    };
    sequence();
  }, []);

  // Fixed Variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      } as Transition,
    },
  };

  const podiumVariants: Variants = {
    hidden: { y: 100, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 15,
        delay: 0.3,
      } as Transition,
    },
  };

  // Logo Screen
  if (loadingStage === 'logo') {
    return (
      <div id="leaderboard" className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-100 to-orange-100 flex items-center justify-center overflow-hidden">
        {/* Existing logo screen code unchanged */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`grid-${i}`}
            className="absolute bg-white/15 rounded"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.3, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { 
              type: "spring" as const,
              stiffness: 100, 
              damping: 10,
              delay: 0.5 
            } as Transition
          }}
        >
          <motion.div
            className="absolute inset-0 w-64 h-64 mx-auto bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 rounded-full blur-3xl opacity-60"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.9, 0.6],
              rotate: 360,
            }}
            transition={{
              scale: { duration: 3, repeat: Infinity },
              opacity: { duration: 2, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
          />
          <motion.div
            className="relative bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent drop-shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="text-6xl font-black tracking-tight mb-4 text-amber-600 drop-shadow-2xl">VSSC</h1>
            <div className="flex justify-center gap-2">
              <motion.div
                className="w-3 h-3 bg-amber-200 rounded-full"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="w-3 h-3 bg-amber-200 rounded-full"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-3 bg-amber-200 rounded-full"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </motion.div>
          <motion.p
            className="text-3xl text-amber-800 mt-8 font-bold tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 } as Transition}
          >
            Excellence Platform
          </motion.p>
        </motion.div>
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={`logo-particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, -30, 0],
              x: [-10, 10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    );
  }

  // Loading Screen
  if (loadingStage === 'loading') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center overflow-hidden">
        {/* Existing loading screen code unchanged */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-300/15 to-yellow-300/15"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity } as Transition}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 to-amber-300/15"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -10, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 } as Transition}
          />
        </div>
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 1, type: "spring" as const } as Transition
          }}
        >
          <motion.div
            className="w-40 h-40 mx-auto mb-8 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" } as Transition}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full blur-2xl opacity-40"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity } as Transition}
            />
            <div className="absolute inset-0 w-40 h-40 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
              <Trophy className="w-20 h-20 text-white drop-shadow-2xl" />
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-amber-700 to-orange-500 bg-clip-text text-transparent mb-8 drop-shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" as const } as Transition}
          >
            Leaderboard
          </motion.h1>
          <motion.p
            className="text-md sm:text-2xl text-amber-500 font-bold tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 } as Transition}
          >
            Preparing the Hall of Fame...
          </motion.p>
        </motion.div>
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={`loading-particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, -40, 0],
              x: [-15, 15, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    );
  }

  // Main Leaderboard
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden">
      {/* Add arrow when showArrow is true */}
      {showArrow && (
        <motion.div
          className="absolute top-10 right-10 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}

      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 via-transparent to-yellow-100/50" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #fef3c7 2px, transparent 2px), 
                             radial-gradient(circle at 75% 75%, #fef3c7 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
      
      <motion.header
        className="relative z-10 py-8 px-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 } as Transition}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 } as Transition}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">VSSC Leaderboard</h1>
              <p className="text-sm text-amber-600">Hall of Excellence</p>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        <motion.section
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl font-bold text-center text-amber-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ } as Transition}
          >
            Top Performers
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-end">
            {/* 2nd Place - Mobile: Middle, Desktop: Left */}
            <motion.div 
              variants={podiumVariants} 
              className="text-center group order-2 md:order-none" 
              whileHover={{ y: -8 }}
            >
              {users[1] && (
                <div className="relative">
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-xl opacity-50 md:block hidden" />
                  <motion.div
                    className="relative bg-white rounded-2xl p-6 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300"
                    whileHover={{ backgroundColor: "#f0f9ff" }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 } as Transition}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      2
                    </div>
                    <Award className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-amber-900 mb-2 truncate">{users[1].name}</h3>
                    <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-lg px-3 py-1">
                      <Flame className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-700 font-bold">{formatPoints(users[1].points)}</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* 1st Place - Mobile: Top, Desktop: Middle */}
            <motion.div 
              variants={podiumVariants} 
              className="text-center relative order-1 md:order-none" 
              whileHover={{ y: -8 }}
            >
              {users[0] && (
                <div className="relative">
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full blur-xl opacity-50 md:block hidden" />
                  <motion.div
                    className="relative bg-white rounded-2xl p-6 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300"
                    whileHover={{ backgroundColor: "#fffbeb" }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 } as Transition}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 border-2 border-amber-900 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      1
                    </div>
                    <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-amber-900 mb-2 truncate">{users[0].name}</h3>
                    <div className="flex items-center justify-center gap-2 bg-amber-50 rounded-lg px-3 py-1">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-700 font-bold">{formatPoints(users[0].points)}</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* 3rd Place - Mobile: Bottom, Desktop: Right */}
            <motion.div 
              variants={podiumVariants} 
              className="text-center group order-3 md:order-none" 
              whileHover={{ y: -8 }}
            >
              {users[2] && (
                <div className="relative">
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-xl opacity-50 md:block hidden" />
                  <motion.div
                    className="relative bg-white rounded-2xl p-6 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300"
                    whileHover={{ backgroundColor: "#fef7f7" }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 } as Transition}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      3
                    </div>
                    <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-amber-900 mb-2 truncate">{users[2].name}</h3>
                    <div className="flex items-center justify-center gap-2 bg-orange-50 rounded-lg px-3 py-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-700 font-bold">{formatPoints(users[2].points)}</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Leaderboard Table */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 } as Transition}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100">
              <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                Complete Rankings
              </h3>
            </div>
            
            <div className="divide-y divide-amber-50">
              <AnimatePresence>
                {users.slice(3, showAll ? users.length : 10).map((user, index) => (
                  <motion.div
                    key={user.uid}
                    className="px-6 py-4 hover:bg-amber-50 transition-colors duration-200 flex items-center justify-between group"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: (index + 1) * 0.05 } as Transition}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-sm font-semibold text-amber-700 group-hover:bg-amber-200 transition-colors">
                        {index + 4}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" />
                        <span className="font-medium text-amber-900 truncate max-w-[250px]">
                          {user.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-1 border border-amber-200">
                      <Flame className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
                      <span className="font-semibold text-amber-800">
                        {formatPoints(user.points)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {users.length > 10 && (
              <div className="px-6 py-4 bg-amber-25 border-t border-amber-100">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {showAll ? (
                    <>
                      <Users className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      View More ({users.length - 10} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {loadingStage === 'complete' && users.length >= 3 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
          colors={['#fbbf24', '#f59e0b', '#fed7aa', '#fef3c7', '#fef08a', '#ffffff']}
          gravity={0.1}
        />
      )}
    </div>
  );
};

export default LeaderboardPage;
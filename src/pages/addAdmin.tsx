import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  limit,
  orderBy,
} from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldPlus, Search } from "lucide-react";

const AddAdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false); 

  // Function to load default or full users
  const loadUsers = (showAll: boolean) => {
    const q = showAll
      ? query(collection(db, "users"), orderBy("email")) // 🔹 All users
      : query(collection(db, "users"), orderBy("email"), limit(10)); // 🔹 First 10 users

    return onSnapshot(q, (snapshot) => {
      const results: any[] = [];
      snapshot.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
      setUsers(results);
      setLoading(false);
    });
  };

  // Main effect for search / default
  useEffect(() => {
    let unsubscribe: any;

    if (searchTerm.trim()) {
      setLoading(true);
      const q = query(
        collection(db, "users"),
        where("keywords", "array-contains", searchTerm.toLowerCase())
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const results: any[] = [];
        snapshot.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
        setUsers(results);
        setLoading(false);
      });
    } else {
      // 🔹 Load 10 or all users depending on toggle
      unsubscribe = loadUsers(showAll);
    }

    return () => unsubscribe && unsubscribe();
  }, [searchTerm, showAll]);

  // Update role
  const setRole = async (userId: string, role: string) => {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, { role });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        ⚡ Manage Admin Access
      </h1>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email or name..."
          className="w-full pl-12 pr-4 py-3 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users List */}
      {loading ? (
        <p className="text-center text-gray-500">Searching...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users found</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-5 border rounded-2xl shadow-md bg-white hover:shadow-lg transition"
              >
                {/* User Info */}
                <div>
                  <p className="font-semibold text-lg">
                    {user.name || "Unnamed User"}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Role: {user.role || "student"}
                  </p>
                </div>

                {/* Toggles */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <Switch
                      checked={user.role === "admin"}
                      onCheckedChange={(checked) =>
                        setRole(user.id, checked ? "admin" : "student")
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldPlus className="w-5 h-5 text-purple-600" />
                    <Switch
                      checked={user.role === "admin+"}
                      onCheckedChange={(checked) =>
                        setRole(user.id, checked ? "admin+" : "student")
                      }
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          
          {!searchTerm && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="text-blue-600 hover:underline font-medium"
              >
                {showAll ? "Show Less" : "See More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddAdminPage;

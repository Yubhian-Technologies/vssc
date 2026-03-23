import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/AuthContext";
import AddCampusModal from "@/components/AddCampusModal";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

import Land1 from "../assets/Land1.jpg";

interface GalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  description: string;
}

interface VideoItem {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
}

interface Campus {
  id: string;
  name: string;
  coverImage: string;
  description: string;
  gallery: GalleryItem[];
  videos?: VideoItem[];
  collegeId?: string;
}

const TourPage: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Fetch campuses from Firestore
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "campuses"));
        const campusesList: Campus[] = [];
        querySnapshot.forEach((doc) => {
          campusesList.push({
            id: doc.id,
            ...doc.data(),
          } as Campus);
        });
        setCampuses(campusesList);
      } catch (error) {
        console.error("Error fetching campuses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampuses();
  }, []);

  const handleCampusAdded = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "campuses"));
      const campusesList: Campus[] = [];
      querySnapshot.forEach((doc) => {
        campusesList.push({
          id: doc.id,
          ...doc.data(),
        } as Campus);
      });
      setCampuses(campusesList);
      setEditingCampus(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error refreshing campuses:", error);
    }
  };

  const handleDeleteCampus = async (campusId: string) => {
    if (!window.confirm("Are you sure you want to delete this campus?")) {
      return;
    }

    try {
      toast.loading("Deleting campus...");
      await deleteDoc(doc(db, "campuses", campusId));
      setCampuses(campuses.filter((c) => c.id !== campusId));
      toast.dismiss();
      toast.success("Campus deleted successfully!");
    } catch (error) {
      console.error("Error deleting campus:", error);
      toast.dismiss();
      toast.error("Failed to delete campus");
    }
  };

  const handleEditCampus = (campus: Campus) => {
    setEditingCampus(campus);
    setIsEditModalOpen(true);
  };

  const isAdminPlus = userData?.role === "admin+";

  return (
    <div className="bg-gray-50">
      <AddCampusModal
        isOpen={isModalOpen || isEditModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditModalOpen(false);
          setEditingCampus(null);
        }}
        onCampusAdded={handleCampusAdded}
        editingCampus={editingCampus}
      />

      {/* Banner */}
      <div className="relative w-full h-64 md:h-80 lg:h-96">
        <img
          src={Land1}
          alt="About Banner"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            VISHNU GALLERY
          </motion.h1>
          <p className="max-w-2xl text-base md:text-lg leading-relaxed drop-shadow-md">
            Explore the beautiful campuses of the Vishnu Educational Society.
            Each campus offers world-class facilities, a vibrant student life,
            and a commitment to academic excellence.
          </p>
        </div>
      </div>

      {/* Admin+ Add Button - Only shows for admin+ users */}
      {isAdminPlus && (
        <div className="flex justify-end max-w-6xl mx-auto px-5 py-6">
          <Button
            onClick={() => {
              setEditingCampus(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Add Campus Event
          </Button>
        </div>
      )}

      {/* Campus Section */}
      <section className="[background-color:hsl(60,100%,95%)] w-full py-16 ">
        <div className="max-w-6xl mx-auto flex flex-col gap-16 px-5">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : campuses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No campuses available yet</p>
              {isAdminPlus && (
                <p className="text-gray-500 mt-2">
                  Click "Add Campus Tour" to create one
                </p>
              )}
            </div>
          ) : (
            campuses.map((campus, index) => (
              <div
                key={campus.id}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 p-5 bg-background w-full ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image Container */}
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <div className="w-full aspect-square rounded-lg overflow-hidden p-2 flex items-center justify-center">
                    <img
                      src={campus.coverImage}
                      alt={campus.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Text Container */}
                <div className="w-full md:w-3/5 flex flex-col gap-5">
                  <div>
                    <h2
                      className="text-3xl font-extrabold leading-snug break-words"
                      style={{ color: "hsl(220, 70%, 20%)" }}
                    >
                      {campus.name}
                    </h2>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {campus.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(`/campus/${campus.id}`);
                      }}
                      className="text-white px-6 py-2 rounded-lg font-semibold transition hover:bg-opacity-90"
                      style={{
                        backgroundColor: "hsl(220, 70%, 20%)",
                      }}
                    >
                      Explore
                    </button>

                    {/* Edit Button - Only for admin+ */}
                    {isAdminPlus && (
                      <button
                        onClick={() => handleEditCampus(campus)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                    )}

                    {/* Delete Button - Only for admin+ */}
                    {isAdminPlus && (
                      <button
                        onClick={() => handleDeleteCampus(campus.id)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* VSSC Info Section */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <iframe
            className="w-full h-52 md:h-64 rounded-xl"
            src="https://www.youtube.com/embed/uUIUE1hQ6_s?autoplay=1&mute=1&loop=1&playlist=uUIUE1hQ6_s&controls=1&modestbranding=1"
            title="VSSC Overview"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          ></iframe>
            </div>
            <div className="w-full md:w-1/2">
              <h3
                className="text-3xl font-bold mb-4"
                style={{ color: "hsl(220, 70%, 20%)" }}
              >
                Vishnu Educational Society
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The Vishnu Educational Society is committed to providing quality
                education across multiple campuses. Our state-of-the-art
                facilities and dedicated faculty ensure that students have
                access to the best educational resources available.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourPage;

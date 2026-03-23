import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Loader2 } from "lucide-react";

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
  collegeName?: string;
}

const CampusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampus = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "campuses"),
          where("__name__", "==", id),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const docRef = await getDocs(collection(db, "campuses"));
          const foundCampus = docRef.docs.find((doc) => doc.id === id);
          if (foundCampus) {
            setCampus({
              id: foundCampus.id,
              ...foundCampus.data(),
            } as Campus);
          }
        } else {
          const doc = querySnapshot.docs[0];
          setCampus({
            id: doc.id,
            ...doc.data(),
          } as Campus);
        }
      } catch (error) {
        console.error("Error fetching campus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampus();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!campus) {
    return (
      <p className="text-center mt-20 text-xl text-red-500">
        Campus not found!
      </p>
    );
  }

  return (
    <section className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-10 [background-color:hsl(60,100%,90%)]">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6 bg-primary hover:bg-blue-900 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          ← Back
        </button>

        {/* Campus Title */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6"
          style={{ color: "hsl(220, 70%, 20%)" }}
        >
          {campus.name}
        </h1>

        {/* Campus Description */}
        <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 mb-8 md:mb-12 text-center">
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            {campus.description}
          </p>
        </div>

        {/* Gallery Section */}
        <section className="w-full py-10 md:py-16 px-4 sm:px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-gray-800 text-center">
            Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {campus.gallery && campus.gallery.length > 0 ? (
              campus.gallery.map((img) => (
                <div
                  key={img.id}
                  className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="w-full aspect-square overflow-hidden  p-2  flex items-center justify-center">
                    <img
                      src={img.imageUrl}
                      alt={img.alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-3 sm:p-4 md:p-5">
                    <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide">
                      {campus.collegeName || "College"}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-2">
                      {img.alt}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {img.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-12">
                No gallery images available
              </p>
            )}
          </div>
        </section>

        {/* Videos Section */}
        {campus.videos && campus.videos.length > 0 && (
          <section className="w-full [background-color:hsl(60,100%,95%)] py-10 md:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-gray-800 text-center">
              Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
              {campus.videos.map((video) => (
                <div
                  key={video.id}
                  className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="w-full aspect-square overflow-hidden  p-2  flex items-center justify-center">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    ></video>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5">
                    <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide">
                      {campus.collegeName || "College"}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

export default CampusPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/AuthContext";
import { Loader2, Edit, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "@/utils/cloudinary";

interface GalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  description: string;
  uploadedBy?: string;
}

interface VideoItem {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  uploadedBy?: string;
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
  const { userData } = useAuth();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingMedia, setIsEditingMedia] = useState(false);
  const [editingMediaItem, setEditingMediaItem] = useState<
    GalleryItem | VideoItem | null
  >(null);
  const [editingMediaType, setEditingMediaType] = useState<
    "photo" | "video" | null
  >(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editVideo, setEditVideo] = useState<File | null>(null);
  const [editVideoPreview, setEditVideoPreview] = useState<string>("");

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

  const handleDeleteMedia = async (
    mediaId: string,
    mediaType: "photo" | "video",
  ) => {
    if (!campus || !userData || userData.role !== "admin+") {
      toast.error("Only admin+ can delete media");
      return;
    }

    // Find the media item to verify authorization
    let mediaItem: GalleryItem | VideoItem | undefined;
    if (mediaType === "photo") {
      mediaItem = campus.gallery.find((item) => item.id === mediaId);
    } else {
      mediaItem = campus.videos?.find((item) => item.id === mediaId);
    }

    // Verify that the user's college matches the college that uploaded the media
    if (!mediaItem || mediaItem.uploadedBy !== userData?.college) {
      toast.error("You can only delete media uploaded by your college");
      return;
    }

    try {
      toast.loading("Deleting media...");
      const campusRef = doc(db, "campuses", campus.id);
      const updatedCampus = { ...campus };

      if (mediaType === "photo") {
        updatedCampus.gallery = campus.gallery.filter(
          (item) => item.id !== mediaId,
        );
      } else {
        updatedCampus.videos = (campus.videos || []).filter(
          (item) => item.id !== mediaId,
        );
      }

      await updateDoc(campusRef, {
        gallery: updatedCampus.gallery,
        videos: updatedCampus.videos,
      });

      setCampus(updatedCampus);
      toast.dismiss();
      toast.success("Media deleted successfully!");
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.dismiss();
      toast.error("Failed to delete media");
    }
  };

  const handleOpenEditMedia = (
    media: GalleryItem | VideoItem,
    type: "photo" | "video",
  ) => {
    // Verify authorization before opening edit dialog
    if (!userData || userData.role !== "admin+") {
      toast.error("Only admin+ can edit media");
      return;
    }

    if (media.uploadedBy !== userData.college) {
      toast.error("You can only edit media uploaded by your college");
      return;
    }

    if ("alt" in media) {
      setEditTitle(media.alt);
      setEditDesc(media.description);
    } else {
      setEditTitle(media.title);
      setEditDesc(media.description);
    }
    // Reset file states when opening edit dialog
    setEditImage(null);
    setEditImagePreview("");
    setEditVideo(null);
    setEditVideoPreview("");
    setEditingMediaItem(media);
    setEditingMediaType(type);
    setIsEditingMedia(true);
  };

  const handleSaveMediaEdit = async () => {
    if (!campus || !editingMediaItem || !userData) return;

    // Verify authorization: user's college must match the college that uploaded the media
    if (
      userData.role !== "admin+" ||
      editingMediaItem.uploadedBy !== userData.college
    ) {
      toast.error("You can only edit media uploaded by your college");
      setIsEditingMedia(false);
      return;
    }

    try {
      toast.loading("Updating media...");
      const campusRef = doc(db, "campuses", campus.id);
      const updatedCampus = { ...campus };

      if (editingMediaType === "photo") {
        const photoIndex = campus.gallery.findIndex(
          (item) => item.id === editingMediaItem.id,
        );
        if (photoIndex !== -1) {
          let newImageUrl = (editingMediaItem as GalleryItem).imageUrl;
          // Upload new image if one was selected
          if (editImage) {
            newImageUrl = await uploadToCloudinary(editImage);
          }
          updatedCampus.gallery[photoIndex] = {
            ...updatedCampus.gallery[photoIndex],
            alt: editTitle,
            description: editDesc,
            imageUrl: newImageUrl,
          };
        }
      } else {
        const videoIndex = (campus.videos || []).findIndex(
          (item) => item.id === editingMediaItem.id,
        );
        if (videoIndex !== -1) {
          let newVideoUrl = (editingMediaItem as VideoItem).videoUrl;
          // Upload new video if one was selected
          if (editVideo) {
            newVideoUrl = await uploadVideoToCloudinary(editVideo);
          }
          updatedCampus.videos![videoIndex] = {
            ...updatedCampus.videos![videoIndex],
            title: editTitle,
            description: editDesc,
            videoUrl: newVideoUrl,
          };
        }
      }

      await updateDoc(campusRef, {
        gallery: updatedCampus.gallery,
        videos: updatedCampus.videos,
      });

      setCampus(updatedCampus);
      setIsEditingMedia(false);
      setEditingMediaItem(null);
      setEditImage(null);
      setEditImagePreview("");
      setEditVideo(null);
      setEditVideoPreview("");
      toast.dismiss();
      toast.success("Media updated successfully!");
    } catch (error) {
      console.error("Error updating media:", error);
      toast.dismiss();
      toast.error("Failed to update media");
    }
  };

  const canEditMedia = (media: GalleryItem | VideoItem) => {
    return (
      userData?.role === "admin+" && media.uploadedBy === userData?.college
    );
  };

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
                      {img.uploadedBy || campus.collegeName || "College"}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-2">
                      {img.alt}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {img.description}
                    </p>
                    {canEditMedia(img) && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleOpenEditMedia(img, "photo")}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition text-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(img.id, "photo")}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
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
                      {video.uploadedBy || campus.collegeName || "College"}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {video.description}
                    </p>
                    {canEditMedia(video) && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleOpenEditMedia(video, "video")}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition text-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(video.id, "video")}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Edit Media Modal */}
        {isEditingMedia && editingMediaItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Edit {editingMediaType === "photo" ? "Photo" : "Video"}
              </h2>
              <div className="space-y-4">
                {editingMediaType === "photo" ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Change Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setEditImage(e.target.files[0]);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="edit-image-input"
                      />
                      <label
                        htmlFor="edit-image-input"
                        className="cursor-pointer"
                      >
                        {editImagePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={editImagePreview}
                              alt="Preview"
                              className="max-h-48 rounded"
                            />
                            <p className="mt-2 text-xs text-gray-600">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600">
                              Click to select new image
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Change Video
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setEditVideo(e.target.files[0]);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditVideoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="edit-video-input"
                      />
                      <label
                        htmlFor="edit-video-input"
                        className="cursor-pointer"
                      >
                        {editVideoPreview ? (
                          <div>
                            <video
                              src={editVideoPreview}
                              className="max-h-48 rounded mx-auto"
                              controls
                            ></video>
                            <p className="mt-2 text-xs text-gray-600">
                              Click to change video
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600">
                              Click to select new video
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {editingMediaType === "photo"
                      ? "Alt Text / Title"
                      : "Title"}
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditingMedia(false);
                      setEditingMediaItem(null);
                      setEditImage(null);
                      setEditImagePreview("");
                      setEditVideo(null);
                      setEditVideoPreview("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMediaEdit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampusPage;

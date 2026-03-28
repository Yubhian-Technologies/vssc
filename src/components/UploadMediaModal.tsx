import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "@/utils/cloudinary";
import toast from "react-hot-toast";
import { Loader2, X, Upload } from "lucide-react";
import { useAuth } from "@/AuthContext";

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  campusId: string;
  campusName?: string;
  onMediaAdded?: () => void;
}

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

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  isOpen,
  onClose,
  campusId,
  campusName = "Campus",
  onMediaAdded,
}) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Photo upload states
  const [currentPhotoFile, setCurrentPhotoFile] = useState<File | null>(null);
  const [currentPhotoAlt, setCurrentPhotoAlt] = useState<string>("");
  const [currentPhotoDesc, setCurrentPhotoDesc] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<GalleryItem[]>([]);

  // Video upload states
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>("");
  const [currentVideoDesc, setCurrentVideoDesc] = useState<string>("");
  const [uploadedVideos, setUploadedVideos] = useState<VideoItem[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentPhotoFile(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentVideoFile(file);
    }
  };

  const addPhoto = async () => {
    if (!currentPhotoFile || !currentPhotoAlt || !currentPhotoDesc) {
      toast.error("Please fill all photo fields");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Uploading photo...");
      const imageUrl = await uploadToCloudinary(currentPhotoFile);
      const newPhoto: GalleryItem = {
        id: `gallery-${Date.now()}`,
        imageUrl,
        alt: currentPhotoAlt,
        description: currentPhotoDesc,
        uploadedBy: userData?.college || "College",
      };
      setUploadedPhotos([...uploadedPhotos, newPhoto]);
      setCurrentPhotoFile(null);
      setCurrentPhotoAlt("");
      setCurrentPhotoDesc("");
      toast.dismiss();
      toast.success("Photo added to upload list");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.dismiss();
      toast.error("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const addVideo = async () => {
    if (!currentVideoFile || !currentVideoTitle || !currentVideoDesc) {
      toast.error("Please fill all video fields");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Uploading video...");
      const videoUrl = await uploadVideoToCloudinary(currentVideoFile);
      const newVideo: VideoItem = {
        id: `video-${Date.now()}`,
        videoUrl,
        title: currentVideoTitle,
        description: currentVideoDesc,
        uploadedBy: userData?.college || "College",
      };
      setUploadedVideos([...uploadedVideos, newVideo]);
      setCurrentVideoFile(null);
      setCurrentVideoTitle("");
      setCurrentVideoDesc("");
      toast.dismiss();
      toast.success("Video added to upload list");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.dismiss();
      toast.error("Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos(uploadedPhotos.filter((item) => item.id !== id));
    toast.success("Photo removed");
  };

  const removeVideo = (id: string) => {
    setUploadedVideos(uploadedVideos.filter((item) => item.id !== id));
    toast.success("Video removed");
  };

  const handleSubmit = async () => {
    if (uploadedPhotos.length === 0 && uploadedVideos.length === 0) {
      toast.error("Please add at least one photo or video");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Updating campus media...");

      // Get current campus data
      const campusRef = doc(db, "campuses", campusId);
      const campusSnap = await getDoc(campusRef);

      if (!campusSnap.exists()) {
        toast.dismiss();
        toast.error("Campus not found");
        return;
      }

      const campusData = campusSnap.data();
      const currentGallery = campusData.gallery || [];
      const currentVideos = campusData.videos || [];

      // Merge new media with existing
      const updatedGallery = [...currentGallery, ...uploadedPhotos];
      const updatedVideos = [...currentVideos, ...uploadedVideos];

      // Update campus in Firestore
      await updateDoc(campusRef, {
        gallery: updatedGallery,
        videos: updatedVideos,
        updatedAt: new Date(),
      });

      toast.dismiss();
      toast.success(
        `Media added successfully! (${uploadedPhotos.length} photos, ${uploadedVideos.length} videos)`,
      );

      // Reset form
      setUploadedPhotos([]);
      setUploadedVideos([]);
      setCurrentPhotoFile(null);
      setCurrentPhotoAlt("");
      setCurrentPhotoDesc("");
      setCurrentVideoFile(null);
      setCurrentVideoTitle("");
      setCurrentVideoDesc("");

      if (onMediaAdded) {
        onMediaAdded();
      }
      onClose();
    } catch (error) {
      console.error("Error updating campus media:", error);
      toast.dismiss();
      toast.error("Failed to update campus media");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Upload Media to {campusName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 md:space-y-6">
          {/* Photos Section */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Upload Photos - {uploadedPhotos.length} ready
            </label>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-medium">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {currentPhotoFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {currentPhotoFile.name}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder="Photo title/alt text"
                    value={currentPhotoAlt}
                    onChange={(e) => setCurrentPhotoAlt(e.target.value)}
                  />
                  <Textarea
                    placeholder="Photo description"
                    value={currentPhotoDesc}
                    onChange={(e) => setCurrentPhotoDesc(e.target.value)}
                    rows={2}
                  />
                  <Button
                    onClick={addPhoto}
                    disabled={loading || !currentPhotoFile}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Add Photo
                  </Button>
                </div>
              </div>

              {/* Photos List */}
              <div className="space-y-2">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">Photo {index + 1}</p>
                      <p className="text-xs text-gray-600">{photo.alt}</p>
                    </div>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Videos Section */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Upload Videos - {uploadedVideos.length} ready
            </label>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {currentVideoFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {currentVideoFile.name}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder="Video title"
                    value={currentVideoTitle}
                    onChange={(e) => setCurrentVideoTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Video description"
                    value={currentVideoDesc}
                    onChange={(e) => setCurrentVideoDesc(e.target.value)}
                    rows={2}
                  />
                  <Button
                    onClick={addVideo}
                    disabled={loading || !currentVideoFile}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Add Video
                  </Button>
                </div>
              </div>

              {/* Videos List */}
              <div className="space-y-2">
                {uploadedVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">Video {index + 1}</p>
                      <p className="text-xs text-gray-600">{video.title}</p>
                    </div>
                    <button
                      onClick={() => removeVideo(video.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline" disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                loading ||
                (uploadedPhotos.length === 0 && uploadedVideos.length === 0)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Uploading...
                </>
              ) : (
                `Upload Media (${uploadedPhotos.length + uploadedVideos.length})`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadMediaModal;

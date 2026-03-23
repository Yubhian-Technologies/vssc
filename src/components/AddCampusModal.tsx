import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "@/utils/cloudinary";
import toast from "react-hot-toast";
import { Loader2, X, Upload } from "lucide-react";
import { useAuth } from "@/AuthContext";

interface AddCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampusAdded: () => void;
  editingCampus?: any;
}

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

interface College {
  id: string;
  name: string;
}

const AddCampusModal: React.FC<AddCampusModalProps> = ({
  isOpen,
  onClose,
  onCampusAdded,
  editingCampus,
}) => {
  const { userData } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [customCollege, setCustomCollege] = useState<string>("");
  const [campusName, setCampusName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [currentGalleryImage, setCurrentGalleryImage] = useState<File | null>(
    null,
  );
  const [currentGalleryAlt, setCurrentGalleryAlt] = useState<string>("");
  const [currentGalleryDesc, setCurrentGalleryDesc] = useState<string>("");
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>("");
  const [currentVideoDesc, setCurrentVideoDesc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Auto-set college from logged-in user
  useEffect(() => {
    if (userData?.college) {
      setCustomCollege(userData.college);
    }
  }, [userData]);

  // Initialize form with editing campus data
  useEffect(() => {
    if (editingCampus && isOpen) {
      setCampusName(editingCampus.name || "");
      setDescription(editingCampus.description || "");
      setCoverImagePreview(editingCampus.coverImage || "");
      setGalleryItems(editingCampus.gallery || []);
      setVideoItems(editingCampus.videos || []);
      setCustomCollege(editingCampus.collegeName || userData?.college || "");
    } else if (isOpen) {
      // Reset form for new campus
      setCampusName("");
      setDescription("");
      setCoverImage(null);
      setCoverImagePreview("");
      setGalleryItems([]);
      setVideoItems([]);
      setCoverImage(null);
      setCustomCollege(userData?.college || "");
    }
  }, [editingCampus, isOpen, userData]);

  // Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "colleges"));
        const collegesList: College[] = [];
        querySnapshot.forEach((doc) => {
          collegesList.push({
            id: doc.id,
            name: doc.data().name || "Unknown College",
          });
        });
        console.log("Fetched colleges:", collegesList);
        setColleges(collegesList);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        toast.error(
          "Failed to fetch colleges - you can enter a custom college name",
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchColleges();
    }
  }, [isOpen]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentGalleryImage(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentVideoFile(file);
    }
  };

  const addGalleryItem = async () => {
    if (!currentGalleryImage || !currentGalleryAlt || !currentGalleryDesc) {
      toast.error("Please fill all gallery fields");
      return;
    }

    // Check gallery item limit (max 2 per college)
    if (galleryItems.length >= 2) {
      toast.error("Maximum 2 photos allowed per college");
      return;
    }

    try {
      toast.loading("Uploading gallery image...");
      const imageUrl = await uploadToCloudinary(currentGalleryImage);
      const newItem: GalleryItem = {
        id: `gallery-${Date.now()}`,
        imageUrl,
        alt: currentGalleryAlt,
        description: currentGalleryDesc,
      };
      setGalleryItems([...galleryItems, newItem]);
      setCurrentGalleryImage(null);
      setCurrentGalleryAlt("");
      setCurrentGalleryDesc("");
      toast.dismiss();
      toast.success("Gallery image added");
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      toast.dismiss();
      toast.error("Failed to upload gallery image");
    }
  };

  const addVideoItem = async () => {
    if (!currentVideoFile || !currentVideoTitle || !currentVideoDesc) {
      toast.error("Please fill all video fields");
      return;
    }

    // Check video item limit (max 1 per college)
    if (videoItems.length >= 1) {
      toast.error("Maximum 1 video allowed per college");
      return;
    }

    try {
      toast.loading("Uploading video...");
      const videoUrl = await uploadVideoToCloudinary(currentVideoFile);
      const newItem: VideoItem = {
        id: `video-${Date.now()}`,
        videoUrl,
        title: currentVideoTitle,
        description: currentVideoDesc,
      };
      setVideoItems([...videoItems, newItem]);
      setCurrentVideoFile(null);
      setCurrentVideoTitle("");
      setCurrentVideoDesc("");
      toast.dismiss();
      toast.success("Video added");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.dismiss();
      toast.error("Failed to upload video");
    }
  };

  const removeGalleryItem = (id: string) => {
    setGalleryItems(galleryItems.filter((item) => item.id !== id));
    toast.success("Gallery item removed");
  };

  const removeVideoItem = (id: string) => {
    setVideoItems(videoItems.filter((item) => item.id !== id));
    toast.success("Video removed");
  };

  const handleSubmit = async () => {
    const collegeId = selectedCollege || customCollege;
    const needsCoverImage = !editingCampus || !coverImagePreview;

    if (!collegeId || !campusName || !description) {
      toast.error("Please fill all required fields");
      return;
    }

    if (needsCoverImage && !coverImage) {
      toast.error("Please upload a cover image");
      return;
    }

    if (galleryItems.length === 0) {
      toast.error("Please add at least one gallery item");
      return;
    }

    try {
      setSubmitting(true);

      let coverImageUrl = coverImagePreview;

      // Upload cover image only if new file is selected
      if (coverImage) {
        toast.loading("Uploading image...");
        coverImageUrl = await uploadToCloudinary(coverImage);
      }

      const campusData: any = {
        collegeId: collegeId,
        collegeName: customCollege,
        name: campusName,
        description,
        coverImage: coverImageUrl,
        gallery: galleryItems,
        videos: videoItems,
        updatedAt: new Date(),
      };

      if (editingCampus) {
        // Update existing campus
        toast.loading("Updating campus...");
        await updateDoc(doc(db, "campuses", editingCampus.id), campusData);
        toast.dismiss();
        toast.success("Campus updated successfully!");
      } else {
        // Create new campus
        toast.loading("Creating campus...");
        campusData.createdAt = new Date();
        await addDoc(collection(db, "campuses"), campusData);
        toast.dismiss();
        toast.success("Campus added successfully!");
      }

      // Reset form
      setSelectedCollege("");
      setCustomCollege(userData?.college || "");
      setCampusName("");
      setDescription("");
      setCoverImage(null);
      setCoverImagePreview("");
      setGalleryItems([]);
      setVideoItems([]);

      onCampusAdded();
      onClose();
    } catch (error) {
      console.error("Error saving campus:", error);
      toast.dismiss();
      toast.error(
        editingCampus ? "Failed to update campus" : "Failed to create campus",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            {editingCampus ? "Edit Campus Event" : "Add New Campus Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 md:space-y-6">
          {/* College Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              College
            </label>
            {userData?.college ? (
              <div className="p-3 bg-gray-100 rounded-md text-gray-800 font-medium">
                {userData.college}
              </div>
            ) : colleges.length > 0 ? (
              <Select
                value={selectedCollege}
                onValueChange={setSelectedCollege}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Enter college name"
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
              />
            )}
          </div>

          {/* Campus Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Campus Event Name
            </label>
            <Input
              placeholder="e.g., Green Meadows"
              value={campusName}
              onChange={(e) => setCampusName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              placeholder="Campus description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Cover Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
                id="cover-image-input"
              />
              <label htmlFor="cover-image-input" className="cursor-pointer">
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCoverImage(null);
                        setCoverImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Upload className="mx-auto mb-2 text-gray-400 w-6 h-6 sm:w-8 sm:h-8" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      Click to upload cover image
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Gallery Items */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Gallery Items (Max 2 photos) - {galleryItems.length}/2
            </label>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-medium">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageChange}
                      disabled={galleryItems.length >= 2}
                      className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
                    />
                    {currentGalleryImage && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {currentGalleryImage.name}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder="Image alt text"
                    value={currentGalleryAlt}
                    onChange={(e) => setCurrentGalleryAlt(e.target.value)}
                    disabled={galleryItems.length >= 2}
                  />
                  <Textarea
                    placeholder="Image description"
                    value={currentGalleryDesc}
                    onChange={(e) => setCurrentGalleryDesc(e.target.value)}
                    rows={2}
                    disabled={galleryItems.length >= 2}
                  />
                  <Button
                    onClick={addGalleryItem}
                    disabled={
                      loading ||
                      !currentGalleryImage ||
                      galleryItems.length >= 2
                    }
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {galleryItems.length >= 2
                      ? "Max photos reached"
                      : "Add Gallery Item"}
                  </Button>
                </div>
              </div>

              {/* Gallery Items List */}
              <div className="space-y-2">
                {galleryItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">Photo {index + 1}</p>
                      <p className="text-xs text-gray-600">{item.alt}</p>
                    </div>
                    <button
                      onClick={() => removeGalleryItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Items */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Videos (Max 1 video) - {videoItems.length}/1
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
                      disabled={videoItems.length >= 1}
                      className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
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
                    disabled={videoItems.length >= 1}
                  />
                  <Textarea
                    placeholder="Video description"
                    value={currentVideoDesc}
                    onChange={(e) => setCurrentVideoDesc(e.target.value)}
                    rows={2}
                    disabled={videoItems.length >= 1}
                  />
                  <Button
                    onClick={addVideoItem}
                    disabled={
                      loading || !currentVideoFile || videoItems.length >= 1
                    }
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {videoItems.length >= 1 ? "Max video reached" : "Add Video"}
                  </Button>
                </div>
              </div>

              {/* Videos List */}
              <div className="space-y-2">
                {videoItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">Video</p>
                      <p className="text-xs text-gray-600">{item.title}</p>
                    </div>
                    <button
                      onClick={() => removeVideoItem(item.id)}
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
              disabled={submitting || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Creating...
                </>
              ) : (
                "Create Campus Event"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCampusModal;

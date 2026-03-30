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
  uploadedBy?: string;
}

interface VideoItem {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  uploadedBy?: string;
}

interface College {
  id: string;
  name: string;
}

// Helper function to merge media items from all colleges with updated items from current college
const mergeMediaItems = (
  allItems: any[],
  currentCollegeItems: any[],
  currentCollege?: string,
): any[] => {
  if (!currentCollege) return allItems;

  // Filter out items from current college from allItems
  const otherCollegeItems = allItems.filter(
    (item) => item.uploadedBy && item.uploadedBy !== currentCollege,
  );

  // Merge: other colleges' items + current college's items
  return [...otherCollegeItems, ...currentCollegeItems];
};

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
  const [allGalleryItems, setAllGalleryItems] = useState<GalleryItem[]>([]);
  const [allVideoItems, setAllVideoItems] = useState<VideoItem[]>([]);
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

      // Keep full list of gallery and videos (all colleges' items)
      const fullGallery = editingCampus.gallery || [];
      const fullVideos = editingCampus.videos || [];
      setAllGalleryItems(fullGallery);
      setAllVideoItems(fullVideos);

      // Filter to show ONLY items from CURRENT USER's college (not the campus creator's college)
      const currentUserCollege = userData?.college;
      const filteredGallery = currentUserCollege
        ? fullGallery.filter(
            (item: GalleryItem) =>
              !item.uploadedBy || item.uploadedBy === currentUserCollege,
          )
        : [];
      const filteredVideos = currentUserCollege
        ? fullVideos.filter(
            (item: VideoItem) =>
              !item.uploadedBy || item.uploadedBy === currentUserCollege,
          )
        : [];

      setGalleryItems(filteredGallery);
      setVideoItems(filteredVideos);
      // Set customCollege to CURRENT USER's college, not the campus creator's
      setCustomCollege(userData?.college || "");
    } else if (isOpen) {
      // Reset form for new campus
      setCampusName("");
      setDescription("");
      setCoverImage(null);
      setCoverImagePreview("");
      setGalleryItems([]);
      setVideoItems([]);
      setAllGalleryItems([]);
      setAllVideoItems([]);
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
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(
          `Video file is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 100MB.`,
        );
        return;
      }
      setCurrentVideoFile(file);
      toast.success(
        `File selected: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      );
    }
  };

  const addGalleryItem = async () => {
    if (!currentGalleryImage || !currentGalleryAlt || !currentGalleryDesc) {
      toast.error("Please fill all gallery fields");
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
        uploadedBy: customCollege,
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

    try {
      const fileSizeMB = (currentVideoFile.size / (1024 * 1024)).toFixed(2);
      toast.loading(
        `Uploading video (${fileSizeMB}MB)... This may take a few minutes.`,
      );
      const videoUrl = await uploadVideoToCloudinary(currentVideoFile);
      const newItem: VideoItem = {
        id: `video-${Date.now()}`,
        videoUrl,
        title: currentVideoTitle,
        description: currentVideoDesc,
        uploadedBy: customCollege,
      };
      setVideoItems([...videoItems, newItem]);
      setCurrentVideoFile(null);
      setCurrentVideoTitle("");
      setCurrentVideoDesc("");
      toast.dismiss();
      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload video";
      toast.error(errorMessage);
    }
  };

  const removeGalleryItem = (id: string) => {
    const itemToRemove = galleryItems.find((item) => item.id === id);

    // Only allow deletion if item belongs to THIS college (current user's college)
    if (
      itemToRemove &&
      itemToRemove.uploadedBy &&
      itemToRemove.uploadedBy !== userData?.college
    ) {
      toast.error("You can only delete photos uploaded by your college");
      return;
    }

    setGalleryItems(galleryItems.filter((item) => item.id !== id));
    toast.success("Gallery item removed");
  };

  const removeVideoItem = (id: string) => {
    const itemToRemove = videoItems.find((item) => item.id === id);

    // Only allow deletion if item belongs to THIS college (current user's college)
    if (
      itemToRemove &&
      itemToRemove.uploadedBy &&
      itemToRemove.uploadedBy !== userData?.college
    ) {
      toast.error("You can only delete videos uploaded by your college");
      return;
    }

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
        gallery: editingCampus
          ? mergeMediaItems(allGalleryItems, galleryItems, userData?.college)
          : galleryItems,
        videos: editingCampus
          ? mergeMediaItems(allVideoItems, videoItems, userData?.college)
          : videoItems,
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
                id="cover-image-input"
              />
              <label
                htmlFor="cover-image-input"
                className="cursor-pointer block"
              >
                {coverImagePreview ? (
                  <div className="relative group">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="max-h-48 mx-auto rounded transition group-hover:opacity-75"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-30 rounded">
                      <Upload className="text-white mb-2" size={32} />
                      <p className="text-white text-sm font-medium">
                        Click to change image
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCoverImage(null);
                        setCoverImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition z-10"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 hover:bg-gray-50 rounded transition">
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
              Gallery Photos - {galleryItems.length} added
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
                      className="w-full border border-gray-300 rounded px-3 py-2"
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
                  />
                  <Textarea
                    placeholder="Image description"
                    value={currentGalleryDesc}
                    onChange={(e) => setCurrentGalleryDesc(e.target.value)}
                    rows={2}
                  />
                  <Button
                    onClick={addGalleryItem}
                    disabled={loading || !currentGalleryImage}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Add Photo
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
              Videos - {videoItems.length} added
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
                    onClick={addVideoItem}
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
                {videoItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">Video {index + 1}</p>
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

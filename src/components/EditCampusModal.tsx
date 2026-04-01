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
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { uploadToCloudinary } from "@/utils/cloudinary";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface EditCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampusUpdated: () => void;
  editingCampus?: any;
}

const EditCampusModal: React.FC<EditCampusModalProps> = ({
  isOpen,
  onClose,
  onCampusUpdated,
  editingCampus,
}) => {
  const [campusName, setCampusName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editingCampus && isOpen) {
      setCampusName(editingCampus.name || "");
      setDescription(editingCampus.description || "");
      setCoverImagePreview(editingCampus.coverImage || "");
      setCoverImage(null);
    } else if (isOpen) {
      setCampusName("");
      setDescription("");
      setCoverImage(null);
      setCoverImagePreview("");
    }
  }, [editingCampus, isOpen]);

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

  const handleSubmit = async () => {
    if (!campusName || !description) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editingCampus) {
      toast.error("No campus to edit");
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

      // Update campus in Firestore - only title, description, and cover image
      await updateDoc(doc(db, "campuses", editingCampus.id), {
        name: campusName,
        description,
        coverImage: coverImageUrl,
        updatedAt: new Date(),
      });

      toast.dismiss();
      toast.success("Campus updated successfully!");

      // Reset form
      setCampusName("");
      setDescription("");
      setCoverImage(null);
      setCoverImagePreview("");

      onCampusUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating campus:", error);
      toast.dismiss();
      toast.error("Failed to update campus");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Edit Campus Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 md:space-y-6">
          {/* Campus Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Campus Name
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
                    <p className="text-center text-xs text-gray-500 mt-2">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Or drag and drop
                    </p>
                  </div>
                )}
              </label>
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
                  Updating...
                </>
              ) : (
                "Update Campus"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCampusModal;

import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // adjust path
import { doc, setDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Session {
  id: string;
  proofs?: string[];
  [key: string]: any;
}

interface CompleteSessionButtonProps {
  session: Session;
  collectionName: string;
}

const CompleteSessionButton: React.FC<CompleteSessionButtonProps> = ({ session, collectionName }) => {
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasProofs, setHasProofs] = useState(false); // New state to track existing proofs
  const { toast } = useToast();

  // Check if proofs already exist in Firestore when component mounts
  useEffect(() => {
    const checkProofs = async () => {
      if (!session.id) return;
      try {
        const sessionRef = doc(db, collectionName, session.id);
        const sessionDoc = await getDoc(sessionRef);
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          if (data?.proofs?.length > 0) {
            setHasProofs(true);
            setIsSubmitted(true); // Sync local state with Firestore
          }
        }
      } catch (error) {
        console.error("Error checking proofs:", error);
        toast({ title: "Error checking submission status" });
      }
    };
    checkProofs();
  }, [session.id, collectionName, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || isSubmitted || hasProofs) return;
    const filesArray = Array.from(e.target.files);
    if (images.length + filesArray.length > 2) {
      toast({ title: "Maximum 2 images allowed" });
      return;
    }
    setImages([...images, ...filesArray]);
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting || hasProofs) return;

    setIsSubmitting(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!session.id) {
      toast({ title: "Invalid session ID" });
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      toast({ title: "Please upload at least one image" });
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", uploadPreset);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );

        uploadedUrls.push(response.data.secure_url);
      }

      // Use setDoc with merge: true to create/update dynamically
      const sessionRef = doc(db, collectionName, session.id);
      await setDoc(sessionRef, { proofs: arrayUnion(...uploadedUrls) }, { merge: true });

      setIsSubmitted(true);
      setHasProofs(true); // Update state to reflect submission
      toast({ title: "Proof uploaded successfully!" });
      setImages([]);
      setShowProofDialog(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to upload images" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowProofDialog(true)}
        disabled={hasProofs} // Disable button if proofs exist
        className={`text-green-600 hover:underline cursor-pointer text-sm font-medium ${
          hasProofs ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {hasProofs ? "Session Completed" : "Complete Session"}
      </button>

      {showProofDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Upload Proof Images</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isSubmitted || isSubmitting || hasProofs}
              className={(isSubmitted || isSubmitting || hasProofs) ? "opacity-50 cursor-not-allowed" : ""}
            />
            <p className="text-sm text-gray-500">You can upload up to 2 images.</p>
            <div className="flex gap-2">
              {images.map((img, index) => (
                <span key={index} className="text-xs border px-2 py-1 rounded">{img.name}</span>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowProofDialog(false)}
                className="text-gray-600 hover:underline text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitted || isSubmitting || hasProofs}
                className={`px-4 py-1 rounded text-sm text-white ${
                  isSubmitted || hasProofs
                    ? "bg-gray-400 cursor-not-allowed"
                    : isSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600"
                }`}
              >
                {isSubmitted || hasProofs
                  ? "You uploaded images for validation"
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompleteSessionButton;

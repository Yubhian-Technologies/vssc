import React, { useState } from "react";
import { db } from "../../firebase"; // adjust path
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Session {
  id: string;
  [key: string]: any;
}

interface CompleteSessionButtonProps {
  session: Session;
  collectionName: string; // new prop for dynamic collection
}

const CompleteSessionButton: React.FC<CompleteSessionButtonProps> = ({ session, collectionName }) => {
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    if (images.length + filesArray.length > 2) {
      toast({ title: "Maximum 2 images allowed" });
      return;
    }
    setImages([...images, ...filesArray]);
  };

  const handleSubmit = async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!session.id) {
      toast({ title: "Invalid session ID" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Please upload at least one image" });
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

      toast({ title: "Proof uploaded successfully!" });
      setImages([]);
      setShowProofDialog(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to upload images" });
    }
  };

  return (
    <>
      <button
        onClick={() => setShowProofDialog(true)}
        className="text-green-600 hover:underline cursor-pointer text-sm font-medium"
      >
        Complete Session
      </button>

      {showProofDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Upload Proof Images</h2>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            <p className="text-sm text-gray-500">You can upload up to 2 images.</p>
            <div className="flex gap-2">
              {images.map((img, index) => (
                <span key={index} className="text-xs border px-2 py-1 rounded">{img.name}</span>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowProofDialog(false)} className="text-gray-600 hover:underline text-sm">
                Cancel
              </button>
              <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-1 rounded text-sm">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompleteSessionButton;

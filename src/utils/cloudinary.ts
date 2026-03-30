const CLOUDINARY_UPLOAD_PRESET = "Profile";
const CLOUDINARY_CLOUD_NAME = "dyqdefzy6";
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB limit

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
      timeout: 60000, // 60 second timeout
    },
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

export const uploadVideoToCloudinary = async (file: File): Promise<string> => {
  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(
      `Video file is too large. Maximum size is 100MB, but your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please compress your video or choose a smaller file.`,
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  // Add quality transformation for faster upload
  formData.append("quality", "auto:good");
  formData.append("fetch_format", "auto");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error("Video upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Video upload timed out. Please try with a smaller video file.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

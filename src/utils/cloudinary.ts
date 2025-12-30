const CLOUDINARY_UPLOAD_PRESET = 'Profile';
const CLOUDINARY_CLOUD_NAME = 'dyqdefzy6';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};
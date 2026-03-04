// utils/imageUtils.js
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Please select a valid image (JPEG, PNG, GIF, WebP)');
  }

  if (file.size > maxSize) {
    throw new Error('Image size must be less than 2MB');
  }

  return true;
};
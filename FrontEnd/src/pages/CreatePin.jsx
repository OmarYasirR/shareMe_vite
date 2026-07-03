import { useState, useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdAddPhotoAlternate,
  MdSave,
  MdCancel,
  MdCategory,
  MdTag,
  MdImage,
} from "react-icons/md";
import { useUserContext } from "../hooks/useUserContext";
import { createPin } from "../api";
import Alert from "../components/Alert";
import Loading from "../components/Loader";
import Spinner from "../components/Spinner";
import { usePinsContext } from "../hooks/usePinsContext";

const CreatePin = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { dispatch } = usePinsContext();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    about: "",
    category: "",
    tags: [],
    image: null,
  });
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setImageFile(file);
    setFormData((prev) => ({ ...prev, image: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear any previous errors
    setError(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tags input (comma-separated)
  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTagsInput(value);
    const tagsArray = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    console.log("Parsed tags:", tagsArray);
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!imageFile) {
      setError("Please select an image");
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.category.trim()) {
      setError("Category is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    // Prepare FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("image", imageFile);
    formDataToSend.append("title", formData.title.trim());
    formDataToSend.append("about", formData.about.trim());
    formDataToSend.append("category", formData.category.trim());
    
    // Send tags as JSON string or comma-separated
    if (formData.tags.length > 0) {
      formDataToSend.append("tags", JSON.stringify(formData.tags));
      // Or if your backend expects comma-separated:
      // formDataToSend.append("tags", formData.tags.join(","));
    }

    // Add user ID if needed
    if (user && user._id) {
      formDataToSend.append("userId", user._id);
    }

    try {
      // Simulate upload progress (optional)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await createPin(formDataToSend);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create pin");
      }

        const {data: newPin} = await response.json();
      console.log("Pin created successfully with Cloudinary:", newPin);
      
      // Update context with new pin
      dispatch({ type: "CREATE_PIN", payload: newPin });
      
      // Reset form
      setFormData({
        title: "",
        about: "",
        category: "",
        tags: [],
        image: null,
      });
      setTagsInput("");
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      setSuccess(true);

      // Navigate to the new pin after short delay
      setTimeout(() => {
        navigate(`/pin/${newPin._id}`, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create pin");
      console.error("Error creating pin:", err);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Clear any uploaded files from state
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    navigate(-1);
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <MdArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        {/* Form Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MdAddPhotoAlternate className="w-6 h-6" />
              Create New Pin
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Upload your image and share it with the community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col items-center justify-center w-full">
                {imagePreview ? (
                  <div className="relative w-full max-w-md mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto rounded-xl shadow-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <MdCancel className="w-5 h-5" />
                    </button>
                    {/* Show file info */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {imageFile && `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <MdAddPhotoAlternate className="w-12 h-12 text-gray-400 group-hover:text-red-500 transition-colors mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, WebP up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Beautiful Sunset"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
                disabled={isSubmitting}
                maxLength={100}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {formData.title.length}/100
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us more about this pin..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {formData.about.length}/500
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
              >
                <MdCategory className="w-4 h-4" />
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Photography, Art, Food"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
              >
                <MdTag className="w-4 h-4" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={tagsInput}
                onChange={handleTagsChange}
                placeholder="nature, travel, landscape"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Separate tags with commas
                </p>
                {formData.tags.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {formData.tags.length} tag{formData.tags.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Upload Progress (optional) */}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-red-500 to-rose-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Uploading image... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/25"
              >
                {isSubmitting ? (
                  <>
                    <Spinner color="white" size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <MdSave className="w-5 h-5" />
                    Create Pin
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <MdCancel className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert
          type="success"
          message="Pin created successfully! Redirecting..."
          onClose={() => setSuccess(false)}
          isScreen
          autoClose={1500}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          isScreen
        />
      )}
    </div>
  );
};

export default CreatePin;
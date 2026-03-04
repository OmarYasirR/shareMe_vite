import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MdArrowBack,
  MdSave,
  MdCancel,
  MdEdit,
  MdImage,
  MdCategory,
  MdTag,
  MdAddPhotoAlternate,
} from "react-icons/md";
import { usePinsContext } from "../hooks/usePinsContext";
import { useUserContext } from "../hooks/useUserContext";
import { updatePin } from "../api";
import BufferToDataURL from "../utils/BufferToDataURL";
import UserAvatar from "../components/UserAvatar";
import Alert from "../components/Alert";
import Loading from "../components/Loader";
import Spinner from "../components/Spinner";

const EditPin = () => {
  const { pinId } = useParams();
  const navigate = useNavigate();
  const { getPinById, dispatch } = usePinsContext();
  const { user } = useUserContext();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    about: "",
    category: "",
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState("");
  const [originalPin, setOriginalPin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Image upload state
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  // Fetch pin data
  useEffect(() => {
    const fetchPin = async () => {
      setIsLoading(true);
      try {
        // Try to get from context first
        let pin = getPinById(pinId);
        if (!pin) {
          setError("Pin not found");
          setIsLoading(false);
          return;
        }

        // Check if current user is the creator
        if (user?._id !== pin.createdUser?._id) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setOriginalPin(pin);
        setFormData({
          title: pin.title || "",
          about: pin.about || "",
          category: pin.category || "",
          tags: pin.tags || [],
        });
        setTagsInput(pin.tags ? pin.tags.join(", ") : "");
      } catch (err) {
        setError("Failed to load pin");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (pinId && user) {
      fetchPin();
    } else if (!user) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [pinId, user, getPinById, navigate]);

  // Handle image selection for new image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setNewImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected new image and revert to original
  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview(null);
    // Reset file input value to allow re-selecting the same file
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
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
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Prepare FormData
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("about", formData.about);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("tags", formData.tags);

    // If a new image is selected, append it
    if (newImageFile) {
      formDataToSend.append("image", newImageFile);
    }

    try {
      const response = await updatePin(pinId, formDataToSend);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update pin");
      }

      const updatedPin = await response.json();
      console.log("Pin updated successfully:", updatedPin);
      // Update context
      dispatch({
        type: "UPDATE_PIN",
        payload: updatedPin.pin,
      });
      setFormData({
        title: "",
        about: "",
        category: "",
        tags: [],
      });
      setSuccess(true);

      // Navigate back to pin page after short delay
      setTimeout(() => {
        navigate(`/pin/${pinId}`, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update pin");
      console.error("Error updating pin:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <Loading
        size="lg"
        color="red"
        text="Loading pin details..."
        fullScreen
      />
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <MdEdit className="mx-auto text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Not Authorized
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to edit this pin.
          </p>
          <button
            onClick={() => navigate(`/pin/${pinId}`)}
            className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-2"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Pin
          </button>
        </div>
      </div>
    );
  }

  // Error state (pin not found)
  if (error && !originalPin) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <MdImage className="mx-auto text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pin Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors inline-flex items-center gap-2"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
              <MdEdit className="w-6 h-6" />
              Edit Pin
            </h1>
          </div>

          {/* Image Section */}
          <div className="p-6 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
              <MdImage className="w-4 h-4" />
              Pin Image
            </p>

            {/* Current Image (if no new image selected) */}
            {!newImagePreview && originalPin?.img && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Current Image</p>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={BufferToDataURL(
                      originalPin.img.data,
                      originalPin.img.contentType
                    )}
                    alt={originalPin.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* New Image Preview (if selected) */}
            {newImagePreview && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">New Image (preview)</p>
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={newImagePreview}
                    alt="New preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveNewImage}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove new image"
                  >
                    <MdCancel className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Image Upload Input */}
            <div className="mt-2">
              <label
                htmlFor="image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <MdAddPhotoAlternate className="w-5 h-5" />
                {newImagePreview ? "Change Image" : "Upload New Image"}
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave empty to keep current image. Max size: 5MB.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
              >
                <MdCategory className="w-4 h-4" />
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Photography, Art, Food"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Spinner color="white" size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <MdSave className="w-5 h-5" />
                    Save Changes
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
          message="Pin updated successfully! Redirecting..."
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

export default EditPin;
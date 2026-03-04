import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { set } from "date-fns";


const CreatePin = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const {dispatch} = usePinsContext();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    about: "",
    category: "",
    tags: [],
    image: null,
  });
  const [tagsInput, setTagsInput] = useState();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
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

    setIsSubmitting(true);
    setError(null);

    // Prepare FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("image", imageFile);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("about", formData.about);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("tags", formData.tags)

    try { 
      const response = await createPin(formDataToSend);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create pin");
      }

      const newPin = await response.json();
      console.log("Pin created successfully:", newPin);
      dispatch({ type: "CREATE_PIN", payload: newPin });
      setFormData({
        title: "",
        about: "",
        category: "",
        tags: [],
        image: null,
      });
      setSuccess(true);

      // Navigate to the new pin after short delay
      setTimeout(() => {
        navigate(`/pin/${newPin._id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create pin");
      console.error("Error creating pin:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
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
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <MdCancel className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <MdAddPhotoAlternate className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
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
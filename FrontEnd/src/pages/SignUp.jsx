// Containers/SignUp.jsx
import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiUpload, FiX, FiUser } from "react-icons/fi";
import shareVideo from "../assets/share.mp4";
import logo from "../assets/logowhite.png";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { signUpUser } from "../api";
import { useUserContext } from "../hooks/useUserContext";
import { convertToBase64, validateImage } from "../utils/imageUtils";

const SignUp = () => {
  const { dispatch } = useUserContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const {
    googleLogin,
    loading: googleLoading,
    error: googleError,
  } = useGoogleLogin("signup");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate image
      validateImage(file);

      setSelectedImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (validationError) {
      setError(validationError.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      // Convert image to base64 if selected
      if (selectedImage) {
        try {
          const base64Image = await convertToBase64(selectedImage);
          userData.img = base64Image;
        } catch (convertError) {
          console.warn("Image conversion failed:", convertError);
          // Continue without image if conversion fails
        }
      }

      const res = await signUpUser(userData);
      
      console.log(JSON.stringify(res))
      localStorage.setItem("User", JSON.stringify(res));
      dispatch({ type: "LOGIN", payload: res });
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setError(error.message || "Sign up failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center mb-4">
      {/* Logo */}
      {/* <div className="p-3 bg-red-400 rounded-lg my-4">
        <img src={logo} alt="logo" className="w-29 h-auto" />
      </div> */}

      {/* Header */}
        <div className="text-center my-2">
          <h1 className="text-2xl font-bold text-red-700">Create Account</h1>
          <p className="text-gray-600 text-sm mt-2">Join our community today</p>
        </div>

      {/* SignUp Card */}
      <div className="shadow-2xl bg-white rounded-2xl p-3 m-1">
        

        {/* Profile Image Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Image Preview or Placeholder */}
            <div
              className="w-24 h-24 rounded-full border-2 border-dashed border-red-300 bg-red-50 flex items-center justify-center cursor-pointer hover:border-red-400 transition-all duration-200 overflow-hidden"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Remove Image Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <FiUser className="w-8 h-8 text-red-400 mx-auto mb-1" />
                  <span className="text-xs text-red-600 font-medium">
                    Add Photo
                  </span>
                </div>
              )}
            </div>

            {/* Upload Icon */}
            <div className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-lg">
              <FiUpload size={14} />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
              className="hidden"
            />
          </div>
        </div>

        {/* Image Upload Instructions */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, GIF, WebP (Max 2MB)
          </p>
        </div>

        

        {/* Sign Up Form */}
        <form onSubmit={submitHandler} className="space-y-3">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-red-700">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                placeholder="First name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-red-700">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-red-700">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-red-700">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                placeholder="Min. 6 characters"
                required
                minLength="6"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-red-700">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          {/* Image Upload Info
          {selectedImage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">
                <strong>Selected:</strong> {selectedImage.name}
                <br />
                <span className="text-green-600">
                  ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </p>
            </div>
          )} */}

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
              required
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I agree to the{" "}
              <a
                href="/terms"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Error Messages */}
          {(error || googleError) && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error || googleError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or sign up with google account
            </span>
          </div>
        </div>

        {/* Google Sign Up Button */}
        <div className="mb-1 flex justify-center">
          <button
            className="bg-white border border-gray-300 hover:bg-gray-50 flex justify-center items-center rounded-full p-3 cursor-pointer outline-none transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowede"
            onClick={googleLogin}
            type="button"
            disabled={googleLoading || loading}
          >
            <FcGoogle className="text-xl" />
            {/* <span className="font-medium">
              {googleLoading ? "Signing up..." : "Sign up with Google"}
            </span> */}
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-2 text-center border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

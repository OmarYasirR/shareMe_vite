import React, { useEffect, useState, useRef } from "react";
import { useUserContext } from "../hooks/useUserContext";
import { usePinsContext } from "../hooks/usePinsContext";
import { AiOutlineLogout, AiOutlineCamera } from "react-icons/ai";
import PinsMasonry from "../components/PinsMasonry";
import defaultBanner from "../assets/panner.png";
import defaultAvatar from "../assets/default-avatar.png";
import Loading from "../components/Loader";
import Alert from "../components/Alert";
import {
  getPinsByUser,
  getSavedPinsByUser,
  uploadAvatar,
  uploadBanner,
} from "../api";
import { IoMdArrowBack } from "react-icons/io";
import UserAvatar from "../components/UserAvatar";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, dispatch, loading: userLoading } = useUserContext();
  const { dispatch: pinsDispatch } = usePinsContext();

  const [activeTab, setActiveTab] = useState("created");
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pins, setPins] = useState([]);
  const [createdPins, setCreatedPins] = useState([]);
  const [savedPins, setSavedPins] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pinsLoading, setPinsLoading] = useState(true);
  const [createdHasMore, setCreatedHasMore] = useState(false);
  const [savedHasMore, setSavedHasMore] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingByUser, setLoadingByUser] = useState(false);
  const [fetchingError, setFetchingError] = useState(null);
  const [totalCreatedPins, setTotalCreatedPins] = useState(0);
  const [totalSavedPins, setTotalSavedPins] = useState(0);
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const navigate = useNavigate();

  // Upload avatar image to Cloudinary
  const uploadAvatarImage = async (file) => {
    try {
      const response = await uploadAvatar(user._id, file);
      const data = await response.json();
      console.log("Avatar upload response:", data);

      if (response.status === 200) {
        dispatch({
          type: "LOGIN",
          payload: { ...data.user, token: data.token },
        });
        setError(null);
      } else {
        setError(data.error || "Failed to upload avatar");
      }
    } catch (error) {
      setError(error.message || "Failed to upload avatar");
      console.error("Avatar upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload banner image to Cloudinary
  const uploadBannerImg = async (file) => {
    try {
      setIsEditingBanner(true);
      const formData = new FormData();
      formData.append("banner", file);

      const response = await uploadBanner(user._id, formData);
      const data = await response.json();
      console.log("Banner upload response:", data);

      if (response.status === 200) {
        // Cloudinary returns URL directly
        if (data.user?.banner?.url) {
          setBannerImage(data.user.banner.url);
        }
        dispatch({
          type: "LOGIN",
          payload: { ...data.user, token: data.token },
        });
        setError(null);
      } else {
        setError(data.error || "Failed to upload banner");
      }
    } catch (error) {
      setError(error.message || "Failed to upload banner");
      console.error("Banner upload error:", error);
    } finally {
      setIsEditingBanner(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("User");
    dispatch({ type: "LOGOUT" });
    navigate("/login", { replace: true });
    document.title = "ShareMe - Discover and Share Amazing Pins";
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar size should be less than 2MB");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Uploading avatar image:", file);
    await uploadAvatarImage(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }
    uploadBannerImg(file);
  };

  const loadMoreSaved = async () => {
    setLoadingSaved(true);
    setFetchingError(null);
    try {
      const res = await getSavedPinsByUser(user._id, {
        limit: 10,
        skip: savedPins.length,
      });
      const data = await res.json();
      console.log("Saved pins loaded:", data);
      setSavedPins((prev) => [...prev, ...(data.pins || [])]);
      setSavedHasMore(data.pagination.hasMore);
      setTotalSavedPins(data.pagination.total || 0);
      if (activeTab === "saved") {
        setPins((prev) => [...prev, ...(data.pins || [])]);
      }
      setLoadingSaved(false);
    } catch (error) {
      setFetchingError("Error fetching saved pins");
      setLoadingSaved(false);
      console.error("Load saved pins error:", error);
    }
  };

  const loadMoreUser = async () => {
    setLoadingByUser(true);
    setFetchingError(null);
    try {
      const res = await getPinsByUser(user._id, {
        limit: 10,
        skip: createdPins.length,
      });
      const data = await res.json();
      console.log("User pins loaded:", data);
      setCreatedPins((prev) => [...prev, ...(data.pins || [])]);
      setTotalCreatedPins(data.pagination.total || 0);
      if (activeTab === "created") {
        setPins((prev) => [...prev, ...(data.pins || [])]);
        setPinsLoading(false);
      }
      setCreatedHasMore(data.pagination.hasMore);
      setLoadingByUser(false);
    } catch (error) {
      setFetchingError("Error fetching user pins");
      setLoadingByUser(false);
      console.error("Load user pins error:", error);
    }
  };

  const fetchUserPins = async () => {
    await Promise.all([loadMoreSaved(), loadMoreUser()]);
  };

  // Initialize images from user data (Cloudinary URLs)
  useEffect(() => {
    if (user) {
      // Set banner image from Cloudinary URL
      if (user.banner?.url) {
        setBannerImage(user.banner.url);
      } else if (user.banner?.data) {
        // Fallback for binary data (if still using old format)
        try {
          const bufferToDataURL = (buffer, contentType) => {
            const base64 = btoa(
              new Uint8Array(buffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                "",
              ),
            );
            return `data:${contentType};base64,${base64}`;
          };
          setBannerImage(
            bufferToDataURL(user.banner.data, user.banner.contentType),
          );
        } catch (err) {
          console.error("Error loading banner:", err);
          setBannerImage(defaultBanner);
        }
      } else {
        setBannerImage(defaultBanner);
      }

      fetchUserPins();
    }
  }, [user]);

  // Set document title
  useEffect(() => {
    if (user) {
      document.title = `${user?.firstName || "User"}'s Profile - ShareMe`;
    }
  }, [user]);

  if (userLoading) return <Loading size="xxl" text="Loading your Profile..." />;

  if (!user) {
    return (
      <Alert
        message={"Please login to view your profile."}
        onRetry={() => window.location.replace("/login")}
        Icon={IoMdArrowBack}
        className="h-48 flex flex-col justify-center items-center"
        buttonText="Go to Login"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Display */}
      {error && (
        <Alert message={error} onClose={() => setError(null)} isScreen={true} />
      )}

      {isLoggingOut && (
        <Alert
          type="warning"
          size="lg"
          message="Logging out"
          onClose={() => setIsLoggingOut(false)}
          onConfirm={handleLogout}
          closeText="cancel"
          confirmText="Logout"
          isScreen={true}
        />
      )}

      {/* Profile Header */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-72 md:h-96 lg:h-[420px] overflow-hidden bg-gray-200">
          <img
            src={bannerImage || defaultBanner}
            alt="Profile banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = defaultBanner;
            }}
          />

          {/* Banner Overlay & Edit Button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
            <div className="absolute top-4 right-4">
              {isEditingBanner ? (
                <div className="flex justify-center items-center w-[140px] p-2 rounded-xl shadow-lg transition-all duration-200 bg-white/90">
                  <Loading
                    size="lg"
                    text="uploading..."
                    className="h-[40px]"
                    textPosition="right"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-xl flex items-center space-x-2"
                    title="Change banner"
                  >
                    <AiOutlineCamera className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:inline">
                      Change Banner
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="container mx-auto px-4 -mt-16 relative">
          {/* Logout Button */}
          <button
            onClick={() => setIsLoggingOut(true)}
            className="flex items-center space-x-1 p-1 md:p-2 bg-gray-200 hover:bg-gray-100 text-gray-800 rounded-full sm:rounded-lg transition-all duration-200 absolute top-2 right-6 shadow-md hover:shadow-lg z-10"
          >
            <AiOutlineLogout className="w-5 h-5" />
            <span className="hidden lg:inline font-medium">Logout</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <UserAvatar user={user} size="xxl" border />

                {/* Avatar Edit Button */}
                <div className="rounded-full p-2 shadow-lg transition-all duration-200 absolute bottom-2 right-2 bg-white hover:bg-gray-100 text-red-500">
                  {loading ? (
                    <Loading size="sm" text="" className="w-[20px] !h-[20px]" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className=""
                        title="Change profile picture"
                      >
                        <AiOutlineCamera className="w-5 h-5" />
                      </button>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 capitalize">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 mt-2">{user?.email}</p>

                {/* Stats */}
                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {totalCreatedPins}
                    </div>
                    <div className="text-gray-600 text-sm">Pins Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {totalSavedPins}
                    </div>
                    <div className="text-gray-600 text-sm">Pins Saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pins Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => {
              setActiveTab("created");
              setPins(createdPins);
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeTab === "created"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Created Pins ({totalCreatedPins})
          </button>
          <button
            onClick={() => {
              setActiveTab("saved");
              setPins(savedPins);
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeTab === "saved"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Saved Pins ({totalSavedPins})
          </button>
        </div>

        {pinsLoading && (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-8 w-8"></div>
                      <div className="bg-gray-200 h-3 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pins Grid */}
        <div className="min-h-[400px]">
          {pins.length > 0 ? (
            <PinsMasonry
              pins={pins}
              hasMore={activeTab === "created" ? createdHasMore : savedHasMore}
              loadingMore={
                activeTab === "created" ? loadingByUser : loadingSaved
              }
              loadMore={activeTab === "created" ? loadMoreUser : loadMoreSaved}
            />
          ) : (
            !pinsLoading && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No {activeTab === "created" ? "created" : "saved"} pins yet
                </h3>
                <p className="text-gray-500">
                  {activeTab === "created"
                    ? "Start creating amazing pins to see them here!"
                    : "Save interesting pins to see them here!"}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

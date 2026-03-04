import React, { useEffect, useState, useRef, use } from "react";
import { useUserContext } from "../hooks/useUserContext";
import { usePinsContext } from "../hooks/usePinsContext";
import { AiOutlineLogout, AiOutlineCamera } from "react-icons/ai";
import PinsMasonry from "../components/PinsMasonry";
import BufferToDataURL from "../utils/BufferToDataURL";
import defaultBanner from "../assets/panner.png";
import defaultAvatar from "../assets/default-avatar.png";
import Loading from "../components/Loader";
import Alert from "../components/Alert";
import { getPinsByUser, getSavedPinsByUser, uploadAvatar, uploadBanner } from "../api";
import { IoMdArrowBack } from "react-icons/io";
import UserAvatar from "../components/UserAvatar";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, dispatch, loading: userLoading } = useUserContext();

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
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [loadingByUser, setLoadingByUser] = useState(false)
  const [fetchingError, setFetchingError] = useState(null)
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const navigate = useNavigate();

  // Filter user's pins
  // const createdPins = pins.filter((pin) => pin.creator === user?._id);
  // const savedPins = pins.filter((pin) => pin.save?.includes(user?._id));

  const uploadAvatarImage = async (file) => {
    try {
      const response = await uploadAvatar(user._id, file);
      const data = await response.json();
      console.log(data);
      if (response.status === 200) {

        dispatch({
          type: "LOGIN",
          payload: { ...data.user, token: data.token },
        });
      } else {
        setError(data.error || "Failed to upload avatar");
      }
    } catch (error) {
      setError(error.message || "Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  const uploadBannerImg = async (file) => {
    try {
      setIsEditingBanner(true);
      const response = await uploadBanner(user._id, file);
      const data = await response.json();
      console.log(data);
      if (response.status === 200) {
        setBannerImage(
          BufferToDataURL(data?.banner?.data, data?.banner?.contentType),
        );
        dispatch({
          type: "LOGIN",
          payload: { ...data.user, token: data.token },
        });
      } else {
        setError(data.error || "Failed to upload banner");
      }
    } catch (error) {
      setError(error.message || "Failed to upload banner");
    } finally {
      setIsEditingBanner(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("User");
    dispatch({ type: "LOGOUT" });
    navigate("/login", { replace: true });
    // change page title on logout
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
      // 2MB limit for avatar
      setError("Avatar size should be less than 2MB");
      return;
    }

    setLoading(true);
    setError(null);

    uploadAvatarImage(file);
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
      // 5MB limit
      setError("Image size should be less than 5MB");
      return;
    }
    uploadBannerImg(file);
  };

  const loadMoreSeved = async () => {
    setLoadingSaved(true)
    setFetchingError(null)
    try {
      const res = await getSavedPinsByUser(user._id, {limit: 10, skip: savedPins})
      const data = await res.json()
      console.log(data)
      setSavedPins(prev => [...prev, ...data.pins || []])
      setSavedHasMore(data.hasMore)
      if(activeTab === 'saved'){
        setPins(prev => [...prev, ...data.pins])
      }
      setLoadingSaved(false)
    } catch (error) {
      setFetchingError('Error fetching user pins')
      setLoadingSaved(false)
      console.log(error)
    }
  }

  const loadMoreUser = async () => {
  setLoadingByUser(true)
  setFetchingError(null)
  try {
    const res = await getPinsByUser(user._id, {limit: 10, skip: createdPins.length})
    const data = await res.json()
    console.log(data)
    setCreatedPins(prev => [...prev, ...data.pins || []])
    if(activeTab === 'created'){
      setPins(prev => [...prev, ...data.pins])
      setPinsLoading(false)
    }
    setCreatedHasMore(data.hasMore)
    setLoadingByUser(false)
  } catch (error) {
    setFetchingError('Error fetching user pins')
    setLoadingByUser(false)
      console.log(error)
    }
  }

  useEffect(() => {
    document.title = `${user?.firstName || "User"}'s Profile - ShareMe`;
    console.log(savedPins.length)
    console.log(createdPins.length)
  }, [user]);

  const fetchUserPins = async () => {
    loadMoreSeved()
    loadMoreUser()
  };

  // Initialize images from user data
  useEffect(() => {
    if (user) {
      // Set banner image
      if (user.banner?.data && user.banner.contentType) {
        try {
          const bannerSrc = BufferToDataURL(
            user.banner.data,
            user.banner.contentType,
          );
          setBannerImage(bannerSrc || defaultBanner);
        } catch (err) {
          console.error("Error loading banner:", err);
          setBannerImage(defaultBanner);
        }
      }else{
        setBannerImage(defaultBanner);
      }

      fetchUserPins();
    }
  }, [user]);

  if (userLoading) return <Loading size="xxl" text="Loading your Profile..." />;

  if (!user)
    return (
      <Alert
        message={"Please login to view your profile."}
        onRetry={() => window.location.replace("/login")}
        Icon={IoMdArrowBack}
        className="h-48 flex flex-col justify-center items-center"
        buttonText="Go to Login"
      />
    );

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
        <div className="relative h-72 md:h-96 lg:h-420 overflow-hidden">
          <img
            src={bannerImage}
            alt="Profile banner"
            className="w-full h-full"
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
            className="flex items-center space-x-1 p-1  md:p-2 bg-gray-200 hover:bg-gray-100 text-gray-800 rounded-full sm:rounded-lg transition-all duration-200 absolute top-2 right-6 shadow-md hover:shadow-lg"
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
                    <Loading
                      size="sm"
                      text=""
                      className="w-[20px] !h-[20px]"
                      color="white"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="  "
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
              <div className="flex flex-col items-center md:items-start text-start sm:text-center md:text-left w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 capitalize">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 mt-2">{user?.email}</p>

                {/* Stats */}
                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {createdPins.length}
                    </div>
                    <div className="text-gray-600 text-sm">Pins Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {savedPins.length}
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
              setPinsLoading(loadingByUser)
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeTab === "created"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Created Pins ({createdPins.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("saved");
              setPins(savedPins);
              setLoadingByUser(loadingSaved)
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeTab === "saved"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Saved Pins ({savedPins.length})
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
            <PinsMasonry pins={pins} hasMore={activeTab === 'created'? createdHasMore: savedHasMore} loadingMore={activeTab === 'created'? loadingByUser: loadingSaved} loadMore={activeTab === 'created'? loadMoreUser: loadMoreSeved} />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

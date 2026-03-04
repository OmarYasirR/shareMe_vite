import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdChatBubbleOutline,
  MdShare,
  MdBookmark,
  MdBookmarkBorder,
  MdMoreVert,
  MdFileDownload,
  MdRemoveRedEye,
  MdCalendarToday,
  MdLocationOn,
  MdPerson,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdClose,
  MdArrowDownward,
} from "react-icons/md";
import BufferToDataURL from "../utils/BufferToDataURL";
import UserAvatar from "./UserAvatar";
import { useUserContext } from "../hooks/useUserContext";
import { getPins, likePin, savePin, showMore, unlikePin, unSavePin } from "../api";
import Alert from "./Alert";
import { usePinsContext } from "../hooks/usePinsContext";
import Spinner from "./Spinner";
import formatDate from "../utils/formatDate";

const PinMasonry = ({ pins = [], hasMore, loadingMore, loadMore }) => {
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [hoveredPin, setHoveredPin] = useState(null);
  const { user } = useUserContext();
  const [error, setError] = useState(null);
  const { dispatch } = usePinsContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentPinId, setCurrentPinId] = useState(null);

  // Handle image load
  const handleImageLoad = (pinId) => {
    setImageLoadStatus((prev) => ({ ...prev, [pinId]: true }));
  };

  // Handle image error
  const handleImageError = (pinId) => {
    setImageLoadStatus((prev) => ({ ...prev, [pinId]: "error" }));
  };


  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get image URL from buffer or string
  const getImageUrl = (pin) => {
    return BufferToDataURL(pin.img?.data, pin.img?.contentType);
  }

  // Handle like/unlike
  const handleLike = async (isLiked, pinId) => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentPinId(pinId);
      if (isLiked) {
        setIsLiking(true);
        const res = await unlikePin(pinId, user._id);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to unlike pin");
        }
        dispatch({
          type: "TOGGLE_LIKE",
          payload: { pinId, userId: user._id },
        });
        setIsLiking(false);
      } else {
        console.log(user._id);
        setIsLiking(true);
        const res = await likePin(pinId, user._id);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to like pin");
        }
        dispatch({
          type: "TOGGLE_LIKE",
          payload: { pinId, userId: user._id },
        });
        setIsLiking(false);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to like pin");
      setIsLiking(false);
      setCurrentPinId(null);
    }
  };

  // Handle save/unsave
  const handleSave = async (isSaved, pinId) => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentPinId(pinId);
      if (isSaved) {
        setIsSaving(true);
        await unSavePin(pinId, user._id);
        setIsSaving(false);
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { pinId, userId: user._id },
        });
      } else {
        setIsSaving(true);
        await savePin(pinId, user._id);
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { pinId, userId: user._id },
        });
        setIsSaving(false);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      setError("Failed to save pin");
      setIsSaving(false);
      setCurrentPinId(null);
    }
  };



  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Masonry Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {pins.map((pin) => {
          const isLiked = pin.likes?.includes(user?._id);
          const isSaved = pin.save?.includes(user?._id);

          return (
            <div
              key={pin._id || pin.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              onMouseEnter={() => setHoveredPin(pin._id || pin.id)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              {/* Pin Image */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <Link to={`/pin/${pin._id || pin.id}`} className="block">
                  <div className="aspect-[4/5] w-full relative">
                    {!imageLoadStatus[pin._id || pin.id] && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                    )}
                    <img
                      src={getImageUrl(pin)}
                      alt={pin.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        imageLoadStatus[pin._id || pin.id]
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(pin._id || pin.id)}
                      onError={() => handleImageError(pin._id || pin.id)}
                      loading="lazy"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Save Button - Always visible on hover */}
                      <div className="absolute top-4 right-4">
                        {isSaving && currentPinId === (pin._id || pin.id) ? (
                          <div className="bg-white flex items-center gap-2 justify-center text-red-500 px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                            <Spinner size="sm" color="red" />
                            <span>{isSaved ? "Unsaving..." : "Saving..."}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleSave(isSaved, pin._id || pin.id);
                            }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 ${
                              isSaved
                                ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                                : "bg-white/90 text-gray-700 hover:bg-white"
                            }`}
                          >
                            {isSaved ? (
                              <MdBookmark className="w-4 h-4" />
                            ) : (
                              <MdBookmarkBorder className="w-4 h-4" />
                            )}
                            {isSaved ? "Saved" : "Save"}
                          </button>
                        )}
                      </div>

                      {/* Quick Actions */} 
                      <div className="absolute top-4 left-4 flex gap-2">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md">
                          <MdFileDownload className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md">
                          <MdShare className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      {/* Bottom Actions */}
                      <div className="absolute bottom-4 left-0 right-0 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleLike(isLiked, pin._id || pin.id, isLiked);
                              }}
                              disabled={isLiking}
                              className={`p-2 rounded-full transition-all hover:scale-110 shadow-md flex justify-center items-center ${
                                isLiked
                                  ? "bg-red-50 text-red-500"
                                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500"
                              }`}
                            >
                            {isLiking && currentPinId === (pin._id || pin.id) ? (
                              <Spinner size="sm" color="red" />
                            ) : (
                              <>
                                {isLiked ? (
                                  <MdFavorite className="w-5 h-5" />
                                ) : (
                                  <MdFavoriteBorder className="w-5 h-5" />
                                )}
                              </>
                            )}
                            </button>
                            
                            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md text-gray-700">
                              <MdChatBubbleOutline className="w-5 h-5" />
                            </button>
                          </div>
                          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md">
                            <MdMoreVert className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Pin Content */}
              <div className="p-5">
                {/* Title and Description */}
                <div className="mb-4">
                  <Link to={`/pin/${pin._id || pin.id}`}>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 hover:text-pink-600 transition-colors capitalize">
                      {pin.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {truncateText(pin.about, 120)}
                  </p>
                </div>

                {/* Tags */}
                {pin.tags && pin.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pin.tags.slice(0, 3).map((tag, index) => (
                      <Link
                        key={index}
                        to={`/search?tag=${tag}`}
                        className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors hover:text-pink-600"
                      >
                        #{tag}
                      </Link>
                    ))}
                    {pin.tags.length > 3 && (
                      <span className="px-2.5 py-1 text-gray-400 text-xs">
                        +{pin.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      {isLiked ? (
                        <MdFavorite className="w-4 h-4 text-red-500" />
                      ) : (
                        <MdFavoriteBorder className="w-4 h-4" />
                      )}
                      <span
                        className={isLiked ? "text-red-500 font-medium" : ""}
                      >
                        {pin.likes?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MdChatBubbleOutline className="w-4 h-4" />
                      <span>{pin.comments?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isSaved ? (
                        <MdBookmark className="w-4 h-4 text-amber-500" />
                      ) : (
                        <MdBookmarkBorder className="w-4 h-4" />
                      )}
                      <span
                        className={isSaved ? "text-amber-500 font-medium" : ""}
                      >
                        {pin.save?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <MdCalendarToday className="w-3.5 h-3.5" />
                    <span>{formatDate(pin.createdAt || pin.updatedAt)}</span>
                  </div>
                </div>

                {/* User Info & Category */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/user-profile/${pin.createdUser?._id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <UserAvatar user={pin?.createdUser} />
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {`
                            ${pin.createdUser?.firstName} ${pin.createdUser?.lastName}` ||
                            "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MdLocationOn className="w-3 h-3" />
                          {pin.category}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Category Badge */}
                  <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {pin.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-amber-300 to-amber-400 text-amber-700 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2 border border-amber-200"
            onClick={() => loadMore()}
          >
            {loadingMore ? (
              <>
              <Spinner size="sm" color="red" />
              <span>Loading...</span>
              </>
            ) : (
              <>
                <MdArrowDownward className="w-4 h-4" />
                <span>Load More</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Floating Create Button */}
      <Link to={user ? "/create-pin" : "/login"}>
        <button className="sticky bottom-10 left-[100%] w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-50 group">
          <MdAdd className="w-7 h-7 text-white transition-transform group-hover:rotate-90" />
        </button>
      </Link>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default PinMasonry;

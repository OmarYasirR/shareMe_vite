import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdChatBubbleOutline,
  MdShare,
  MdBookmark,
  MdBookmarkBorder,
  MdMoreVert,
  MdFileDownload,
  MdCalendarToday,
  MdLocationOn,
  MdPerson,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdClose,
  MdArrowDownward,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import UserAvatar from "./UserAvatar";
import { useUserContext } from "../hooks/useUserContext";
import { DeletePin, likePin, savePin, unlikePin, unSavePin } from "../api";
import Alert from "./Alert";
import { usePinsContext } from "../hooks/usePinsContext";
import Spinner from "./Spinner";
import formatDate from "../utils/formatDate";
import Loader from "./Loader";

const PinMasonry = ({ pins = [], hasMore, loadingMore, loadMore }) => {
  const [allPins, setAllPins] = useState(pins);
  const [loading, setLoading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [hoveredPin, setHoveredPin] = useState(null);
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { dispatch } = usePinsContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentPinId, setCurrentPinId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [sureDelete, setSureDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle image load
  const handleImageLoad = (pinId) => {
    setImageLoadStatus((prev) => ({ ...prev, [pinId]: true }));
  };

  // Handle image error
  const handleImageError = (pinId) => {
    setImageLoadStatus((prev) => ({ ...prev, [pinId]: "error" }));
    setImageErrors((prev) => ({ ...prev, [pinId]: true }));
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };


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
        const res = await unlikePin(pinId);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to unlike pin");
        }
        dispatch({
          type: "TOGGLE_LIKE",
          payload: { pinId, userId: user._id },
        })
        // ));
      } else {
        setIsLiking(true);
        const res = await likePin(pinId);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to like pin");
        }
        dispatch({
          type: "TOGGLE_LIKE",
          payload: { pinId, userId: user._id },
        })
      }
      setIsLiking(false);
      setCurrentPinId(null);
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
        const res = await unSavePin(pinId);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to unsave pin");
        }
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { pinId, userId: user._id },
        });
      } else {
        setIsSaving(true);
        const res = await savePin(pinId);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to save pin");
        }
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { pinId, userId: user._id },
        })
      }
      setIsSaving(false);
      setCurrentPinId(null);
    } catch (err) {
      console.error("Error toggling save:", err);
      setError("Failed to save pin");
      setIsSaving(false);
      setCurrentPinId(null);
    }
  };

  // Handle download
  const handleDownload = async (pin) => {
    try {
      const response = await fetch(pin.imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pin.title || "pin"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      setError("Failed to download image");
    }
  };

  // Handle share
  const handleShare = async (pin) => {
    const shareData = {
      title: pin.title || "Check out this pin!",
      text: pin.about || "",
      url: `${window.location.origin}/pin/${pin._id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        setError("Link copied to clipboard!");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        setError("Failed to share");
      }
    }
  };

  // Handle delete
  const handleDelete = async (pinId) => {
    try {
      setIsDeleting(true);
      const res = await DeletePin(pinId);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete pin");
      }
      dispatch({ type: "DELETE_PIN", payload: pinId });
      setShowMenu(false);
      setError(null);
      setCurrentPinId(null);
      setSureDelete(false);
    } catch (error) {
      console.error("Error deleting pin:", error);
      setError("Failed to delete pin");
    } finally {
      setIsDeleting(false);
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Masonry Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pins.map((pin) => {
          const isLiked = pin.likes?.includes(user?._id);
          const isSaved = pin.save?.includes(user?._id);
          const hasError = imageErrors[pin._id || pin.id];

          return (
            <div
              key={pin._id || pin.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              onMouseEnter={() => setHoveredPin(pin._id || pin.id)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              {/* Pin Image */}
              <div className="relative overflow-hidden rounded-t-2xl">
                {/* show spinner if image is deleting */}
                
                <Link to={`/pin/${pin._id || pin.id}`} className="block">
                  <div className="aspect-[4/5] w-full relative bg-gray-100">
                      {isDeleting && currentPinId === (pin._id || pin.id) ? (
                      <Loader fullScreen text={`Deleting ${pin.title ? pin.title.slice(0, 20) : 'pin'}....`} />
                    ) : null}
                      {!imageLoadStatus[pin._id || pin.id] && !hasError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                    )}

                    {pin.imgUrl && !hasError ? (
                      <img
                        src={pin.imgUrl}
                        alt={pin.title || "Pin image"}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          imageLoadStatus[pin._id || pin.id]
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        onLoad={() => handleImageLoad(pin._id || pin.id)}
                        onError={() => handleImageError(pin._id || pin.id)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center text-gray-400">
                          <MdFileDownload className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No Image</span>
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Save Button */}
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
                              e.stopPropagation();
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownload(pin);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md"
                          title="Download"
                        >
                          <MdFileDownload className="w-5 h-5 text-gray-700" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(pin);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md"
                          title="Share"
                        >
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
                                e.stopPropagation();
                                handleLike(isLiked, pin._id || pin.id);
                              }}
                              disabled={isLiking}
                              className={`p-2 rounded-full transition-all hover:scale-110 shadow-md flex justify-center items-center ${
                                isLiked
                                  ? "bg-red-50 text-red-500"
                                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500"
                              }`}
                              title={isLiked ? "Unlike" : "Like"}
                            >
                              {isLiking &&
                              currentPinId === (pin._id || pin.id) ? (
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

                            <Link
                              to={`/pin/${pin._id || pin.id}`}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md text-gray-700"
                              title="Comments"
                            >
                              <MdChatBubbleOutline className="w-5 h-5" />
                            </Link>
                          </div>

                          {/* menu */}
                          {showMenu && (pin._id || pin.id) === currentPinId && (
                            <div className="absolute bottom-12 right-4 bg-white rounded-lg shadow-lg py-2 w-48 z-50">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSureDelete(true);
                                  setCurrentPinId(pin._id || pin.id);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <MdDelete className="w-4 h-4 inline-block mr-2" />
                                Delete
                              </button>

                              {/* edit buttun */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/pin/${pin._id || pin.id}/edit`);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {/* edit icon */}
                                <MdEdit className="w-4 h-4 inline-block mr-2" />
                                Edit
                              </button>
                            </div>
                          )}
                          {user?._id === pin.createdUser?._id && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentPinId(pin._id || pin.id);
                                setShowMenu((prev) => !prev);
                              }}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-md"
                            >
                              <MdMoreVert className="w-5 h-5 text-gray-700" />
                            </button>
                          )}
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
                      {pin.title || "Untitled"}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {truncateText(pin.about || "", 120)}
                  </p>
                </div>

                {/* Tags */}
                {pin.tags && pin.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pin.tags.slice(0, 3).map((tag, index) => (
                      <Link
                        key={index}
                        to={`/search?q=${tag}`}
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
                          {pin.createdUser?.firstName &&
                          pin.createdUser?.lastName
                            ? `${pin.createdUser.firstName} ${pin.createdUser.lastName}`
                            : pin.createdUser?.username || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MdLocationOn className="w-3 h-3" />
                          {pin.category || "Uncategorized"}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Category Badge */}
                  {pin.category && (
                    <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {pin.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-12">
          <button
            className="px-8 py-3 bg-gradient-to-r from-amber-300 to-amber-400 text-amber-700 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2 border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => loadMore && loadMore()}
            disabled={loadingMore}
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

      {/* Empty State */}
      {pins.length === 0 && !loadingMore && (
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
            No pins found
          </h3>
          <p className="text-gray-500">
            Be the first to share something amazing!
          </p>
        </div>
      )}

      {/* Floating Create Button */}
      <Link to={user ? "/create-pin" : "/login"}>
        <button className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-50 group">
          <MdAdd className="w-7 h-7 text-white transition-transform group-hover:rotate-90" />
        </button>
      </Link>

      {/* Error Alert */}
      {error && (
        <Alert
          type={error.includes("copied") ? "success" : "error"}
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Delete Confirmation Alert */}
      {sureDelete && (
        <Alert
          type="warning"
          message="Are you sure you want to delete this pin?"
          isScreen
          confirmText="Delete"
          onConfirm={() => {
            handleDelete(currentPinId);
            console.log("Deleted pin with ID:", currentPinId);
            setSureDelete(false);
            setShowMenu(false);
          }}
          onClose={() => setSureDelete(false)}
        />
      )}
    </div>
  );
};

export default PinMasonry;

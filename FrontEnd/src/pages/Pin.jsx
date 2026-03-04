import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdBookmark,
  MdBookmarkBorder,
  MdShare,
  MdDownload,
  MdArrowBack,
  MdMoreVert,
  MdSend,
  MdDelete,
  MdEdit,
  MdReport,
  MdClose,
  MdPerson,
  MdCalendarToday,
  MdLocationOn,
  MdLink,
  MdPin,
  MdPinEnd,
  MdPinDrop,
  MdBrokenImage,
  MdImageSearch,
} from "react-icons/md";
import { add, formatDistanceToNow, set } from "date-fns";
import {
  AddComment,
  API,
  DeletePin,
  likePin,
  savePin,
  unlikePin,
  unSavePin,
} from "../api";
import { useGetPins } from "../hooks/useGetPins";
import { usePinsContext } from "../hooks/usePinsContext";
import { useUserContext } from "../hooks/useUserContext";
import BufferToDataURL from "../utils/BufferToDataURL";
import UserAvatar from "../components/UserAvatar";
import Comments from "../components/Comments";
import Alert from "../components/Alert";
import Loading from "../components/Loader";
import Spinner from "../components/Spinner";
import formatDate from "../utils/formatDate";

const Pin = () => {
  const { pinId } = useParams();
  const navigate = useNavigate();
  const { getPinById, dispatch, error: err } = usePinsContext();

  const [pin, setPin] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Related pins
  const [relatedPins, setRelatedPins] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch related pins
  const fetchRelatedPins = async (category, currentPinId) => {
    try {
      setLoadingRelated(true);
      const response = await axios.get(
        `/api/pins?category=${category}&limit=6`,
      );
      const filtered = response.data.filter((pin) => pin._id !== currentPinId);
      setRelatedPins(filtered.slice(0, 4));
    } catch (err) {
      console.error("Error fetching related pins:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }
      setIsLiking(true);
      if (isLiked) {
        const res = await unlikePin(pinId, user._id);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to unlike pin");
        }
        dispatch({
          type: "TOGGLE_LIKE",
          payload: { pinId, userId: user._id },
        });
        setPin((prev) => ({
          ...prev,
          likes: prev.likes.filter((id) => id !== user._id),
        }));
        setIsLiked(false);
      } else {
        console.log(user._id);
        const res = await likePin(pinId, user._id);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to like pin");
        }
        dispatch({
          type: "TOGGLE_LIKE",
          payload: { pinId, userId: user._id },
        });
        setPin((prev) => ({
          ...prev,
          likes: [...prev.likes, user._id],
        }));
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to like pin");
    } finally {
      setIsLiking(false);
    }
  };

  // Handle save/unsave
  const handleSave = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }
      setIsSaving(true);
      if (isSaved) {
        const res = await unSavePin(pinId, user._id);
        if(!res.ok){
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to unsave pin");
        }
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { pinId, userId: user._id },
        });
        setPin((prev) => ({
          ...prev,
          save: prev.save.filter((id) => id !== user._id),
        }));
        setIsSaved(false);
      } else {
        const res = await savePin(pinId, user._id);
        if(!res.ok){
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to save pin");
        }
        dispatch({
          type: "TOGGLE_SAVE",
          payload: { pinId, userId: user._id },
        });
        setPin((prev) => ({
          ...prev,
          save: [...prev.save, user._id],
        }));
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Error toggling save:", err);
      setError("Failed to save pin");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      if (!user) {
        navigate("/login");
        return;
      }
      setIsSendingComment(true);
      const response = await AddComment(pinId, commentText);

      const comment = await response.json();

      setIsSendingComment(false);
      console.log("Added comment:", comment);

      dispatch({
        type: "ADD_COMMENT",
        payload: { pinId, comment },
      });

      setPin((prev) => ({
        ...prev,
        comments: [comment, ...prev.comments],
      }));
      setCommentText("");
    } catch (err) {
      setError("Failed to add comment");
      console.error("Error adding comment:", err);
    }
  };

  // Handle download image
  const handleDownload = () => {
    if (!pin?.img?.data) return;

    try {
      const link = document.createElement("a");
      link.href = `data:${pin.img.contentType};base64,${pin.img.data}`;
      link.download = `${pin.title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      setError("Failed to download image");
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: pin.title,
          text: pin.about,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      setError("Failed to share pin");
    }
  };

  // Handle delete pin
  const handleDelete = async () => {
    setIsDelete(false);
    setIsDeleting(true);
    try {
      const res = await DeletePin(pinId);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete pin");
      }
      navigate("/");
    } catch (err) {
      setError("Failed to delete pin");
      console.error("Error deleting pin:", err);
    } finally { setIsDeleting(false);}
  };


  // Fetch pin data
  useEffect(() => {
    if (pinId) {
      setIsLoading(true);
      const fetchedPin = getPinById(pinId);
      if (fetchedPin) {
        setPin(fetchedPin);
        setIsLiked(user ? fetchedPin.likes.includes(user._id) : false);
        setIsSaved(user ? fetchedPin.save.includes(user._id) : false);
      }
      setIsLoading(false);
    }
  }, [pin, getPinById]);

  // Loading state
  if (isLoading && !pin) {
    return (
      <Loading size="lg" color="red" text="Loading pin details..." fullScreen />
    );
  }

  // Error state
  if (err || !pin) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <MdImageSearch className="mx-auto text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pin Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {err || "The pin you are looking for does not exist."}
          </p>
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
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <MdArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col gap-8">
          <div className="">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <div className="relative">
                <div className="relative w-full aspect-[3/2] md:aspect-[4/3] lg:aspect-[16/10] xl:aspect-[16/9] flex items-center justify-center bg-gray-50">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner size="lg" />
                    </div>
                  )}
                  <img
                    src={BufferToDataURL(pin.img?.data, pin.img?.contentType)}
                    alt={pin.title}
                    className={`w-auto h-auto max-w-[95%] max-h-[95%] object-contain transition-all duration-500 ${
                      imageLoaded
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageLoaded(true);
                      // You might want to show a fallback image here
                    }}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Image Overlay Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg"
                      title="Download"
                    >
                      <MdDownload className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg"
                      title="Share"
                    >
                      <MdShare className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Pins */}
            {relatedPins.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  More like this
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedPins.map((relatedPin) => (
                    <Link
                      key={relatedPin._id}
                      to={`/pin/${relatedPin._id}`}
                      className="group block"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                        <img
                          src={
                            relatedPin.img?.url ||
                            `data:${relatedPin.img?.contentType};base64,${relatedPin.img?.data}`
                          }
                          alt={relatedPin.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                        {relatedPin.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pin Details */}
          <div>
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                    {pin.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MdCalendarToday className="w-4 h-4" />
                    <span>{formatDate(pin.createdAt)}</span>
                    {pin.category && (
                      <>
                        <span>•</span>
                        <MdLocationOn className="w-4 h-4" />
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {pin.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* More Menu */}
                {user?._id === pin.createdUser?._id && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MdMoreVert className="w-5 h-5 text-gray-600" />
                    </button>

                    {showMoreMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            navigate(`/pin/${pinId}/edit`);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <MdEdit className="w-4 h-4" />
                          Edit Pin
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            setIsDelete(true);
                          }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <MdDelete className="w-4 h-4" />
                          Delete Pin
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <p
                  className={`text-gray-600 ${
                    showFullDescription ? "" : "line-clamp-3"
                  }`}
                >
                  {pin.about}
                </p>
                {pin?.about?.length > 150 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-red-500 hover:text-red-600 font-medium text-sm"
                  >
                    {showFullDescription ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Tags */}
              {pin.tags && pin.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {pin.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/search?q=${tag}`}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {pin.likes?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {pin.save?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Saves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {pin.comments?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Comments</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    isLiked
                      ? "bg-red-50 text-red-500 hover:bg-red-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } flex items-center justify-center gap-2`}
                >
                  {isLiking ? (
                    <div className="flex items-center gap-2 justify-center font-semibold">
                      <Spinner color="red" />
                      <span>{isLiked ? "Unliking..." : "Liking..."}</span>
                    </div>
                  ) : (
                    <>
                      {isLiked ? (
                        <MdFavorite className="w-5 h-5" />
                      ) : (
                        <MdFavoriteBorder className="w-5 h-5" />
                      )}
                      {isLiked ? "Liked" : "Like"}
                    </>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    isSaved
                      ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } flex items-center justify-center gap-2`}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2 justify-center rounded-full font-semibold">
                      <Spinner color="amber" />
                      <span>{isSaved ? "Unsaving..." : "Saving..."}</span>
                    </div>
                  ) : (
                    <>
                      {isSaved ? (
                        <MdBookmark className="w-5 h-5" />
                      ) : (
                        <MdBookmarkBorder className="w-5 h-5" />
                      )}
                      {isSaved ? "Saved" : "Save"}
                    </>
                  )}
                </button>
              </div>

              {/* Creator Info */}
              <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <UserAvatar user={pin.createdUser} size="md" />
                  <div className="flex-1">
                    <Link
                      to={`/user-profile/${pin.createdUser?._id}`}
                      className="font-semibold text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {pin.createdUser?.firstName +
                        " " +
                        pin.createdUser.lastName || "Unknown User"}
                    </Link>
                    <p className="text-sm text-gray-500">Creator</p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comments ({pin.comments?.length || 0})
                </h3>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSendingComment}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        commentText.trim()
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isSendingComment ? (
                        <Spinner color="white" size="sm" />
                      ) : (
                        <MdSend className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <Comments pin={pin} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          isScreen
        />
      )}

      {isDelete && (
        <Alert
          type="error"
          message="Are you sure you want to delete this pin?"
          onClose={() => setIsDelete(false)}
          closeText="Cancel"
          confirmText="Delete"
          onConfirm={handleDelete}
          isScreen
        />
      )}

      {isDeleting && (
        <Loading
          size="lg"
          color="red"
          text="Deleting pin..."
          overlay
        />
      )}
    </div>
  );
};

export default Pin;

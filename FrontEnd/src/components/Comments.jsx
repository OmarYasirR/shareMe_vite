import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdEdit,
  MdDelete,
  MdCheck,
  MdClose,
  MdMoreVert,
  MdPerson,
} from "react-icons/md";
import { useUserContext } from "../hooks/useUserContext";
import UserAvatar from "./UserAvatar";
import { DeleteComment, EditComment } from "../api";
import { usePinsContext } from "../hooks/usePinsContext";
import { formatDistanceToNow } from "date-fns";
import Alert from "./Alert";

const Comments = ({ pin }) => {
  const { user } = useUserContext();
  const { dispatch } = usePinsContext();
  const [showMenuId, setShowMenuId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isSendingComnt, setIsSendingComnt] = useState(false);
  const menuRefs = useRef({});
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [modle, setModle] = useState({
    title: "",
    show: false,
    message: "",
    onConfirm: null,
    onClose: null,
    confirmText: "",
    cancelText: "",
    type: "",
  });

  const isPinOwner = pin?.createdUser?._id === user?._id;

  // Handle edit comment
  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
    setShowMenuId(null); // Close menu when editing
  };

  // Handle save edited comment
  const handleSaveEditedComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      setIsSendingComnt(true);
      const response = await EditComment(pin._id, commentId, editText.trim());
      if (!response.ok) return;

      dispatch({
        type: "UPDATE_COMMENT",
        payload: { pinId: pin._id, commentId, comment: editText },
      });
      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating comment:", err);
    } finally {
      setIsSendingComnt(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  // Handle cancel delete
  const handleHideModle = () => {
    setShowMenuId(null);
    setModle({
      title: "",
      show: false,
      message: "",
      onConfirm: null,
      onClose: null,
      confirmText: "",
      cancelText: "", 
    });
  };

  // Handle delete comment
  const handleDeleteComment = async () => {
    setDeletingCommentId(showMenuId);
    handleHideModle(); // Close confirmation modle immediately
    console.log("comment ID:", showMenuId);
    console.log("Pin ID:", pin._id);
    try {
      const res = await DeleteComment(pin._id, showMenuId);
      if (!res.ok){
        console.log('Failed to delete comment:', res.error || 'Unknown error');
        setModle({
          title: "Error",
          show: true,
          message: res.error || "Failed to delete comment",
          type: "error",
          onClose: handleHideModle,
          confirmText: "Dismiss",
        });
        return;
      }
      console.log('Comment deleted successfully')
      setDeletingCommentId(null);
      dispatch({
        type: "DELETE_COMMENT",
        payload: { pinId: pin._id, commentId: showMenuId },
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      setDeletingCommentId(null);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside all menu buttons
      const isOutside = Object.values(menuRefs.current).every(
        (ref) => ref && !ref.contains(event.target)
      );

      if (isOutside) {
        setShowMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Render individual comment
  const renderComment = (comment) => {
    const isCommentOwner = comment?.user?._id === user?._id;
    const canEdit = isCommentOwner;
    const canDelete = isCommentOwner || isPinOwner;
    const isEditing = editingCommentId === comment._id;

    if (isEditing) {
      return (
        <div
          key={comment._id}
          className="p-3 bg-gray-50 rounded-xl border border-gray-200"
        >
          <div className="flex gap-3">
            <UserAvatar user={comment.user} size="sm" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900 text-sm capitalize">
                  {`${comment.user?.firstName} ${comment.user?.lastName}` ||
                    "You"}
                </span>
                <span className="text-xs text-gray-400">Editing...</span>
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm resize-none"
                rows="2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEditedComment(comment._id);
                  }
                  if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                >
                  <MdClose className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEditedComment(comment._id)}
                  disabled={!editText.trim()}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1 ${
                    editText.trim()
                      ? "bg-pink-500 text-white hover:bg-pink-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSendingComnt ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  ) : (
                    <MdCheck className="w-4 h-4" />
                  )}
                  {isSendingComnt ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={comment._id}
        className={"p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group " + (comment._id === deletingCommentId ? "opacity-30" : "")}
      >
        <div className="flex gap-3">
          <UserAvatar user={comment.user} size="sm" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Link
                  to={`/user/${comment.user?._id}`}
                  className="font-medium text-gray-900 hover:text-pink-600 transition-colors text-sm capitalize"
                >
                  {`${comment.user?.firstName} ${comment.user?.lastName}` ||
                    "Anonymous"}
                </Link>
                {comment.editedAt && (
                  <span
                    className="text-xs text-gray-400"
                    title={`Edited ${formatDate(comment.editedAt)}`}
                  >
                    (edited)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>

                {(canEdit || canDelete) && (
                  <div
                    className="relative"
                    ref={(el) => (menuRefs.current[comment._id] = el)}
                  >
                    <button
                      onClick={() =>
                        setShowMenuId(comment._id)
                      }
                      className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MdMoreVert className="w-4 h-4" />
                    </button>

                    {showMenuId === comment._id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                        {canEdit && (
                          <button
                            onClick={() => {
                              handleEditComment(comment._id, comment.comment);
                            }}
                            className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <MdEdit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() =>
                              setModle({
                                type: 'warning',
                                show: true,
                                message:
                                  "Are you sure you want to delete this comment?",
                                title: "Deleting Comment",
                                onClose: handleHideModle,
                                onConfirm: handleDeleteComment,
                                confirmText: "Delete",
                              })
                            }
                            className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                          >
                            <MdDelete className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
              {comment.comment}
            </p>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="relative">
      <div className="space-y-4 min-h-52 max-h-[300px] overflow-y-auto pr-2">
        {pin?.comments?.length > 0 ? (
          pin.comments.slice().reverse().map(renderComment)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MdPerson className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
      {modle.show && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="mx-5">
            <Alert
              message={modle.message}
              onClose={modle.onClose}
              title={modle.title}
              type={modle.type}
              confirmText={modle.confirmText}
              onConfirm={modle.onConfirm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;

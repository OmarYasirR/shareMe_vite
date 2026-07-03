import defaultAvatar from "../assets/default-avatar.png";

const UserAvatar = ({ user, size = "md", border = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    xxl: "w-24 h-24",
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-2",
    lg: "border-4",
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (!user) return defaultAvatar;

    // Cloudinary URL format (new)
    if (user.img?.url) {
      return user.img.url;
    }

    // Cloudinary URL format (alternative field name)
    if (user.avatar?.url) {
      return user.avatar.url;
    }

    // Legacy binary data format (backward compatibility)
    if (user.img?.data) {
      try {
        const base64 = btoa(
          new Uint8Array(user.img.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        return `data:${user.img.contentType || 'image/jpeg'};base64,${base64}`;
      } catch (error) {
        console.error("Error converting avatar data:", error);
        return defaultAvatar;
      }
    }

    // Legacy avatar format
    if (user.avatar?.data) {
      try {
        const base64 = btoa(
          new Uint8Array(user.avatar.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        return `data:${user.avatar.contentType || 'image/jpeg'};base64,${base64}`;
      } catch (error) {
        console.error("Error converting avatar data:", error);
        return defaultAvatar;
      }
    }

    // No avatar found
    return defaultAvatar;
  };

  // Get user's full name or username for alt text
  const getUserName = () => {
    if (!user) return "User Avatar";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.firstName || "User Avatar";
  };

  const avatarUrl = getAvatarUrl();
  const userName = getUserName();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-red-400 shadow-sm ${
        border ? borderClasses[size] : ""
      }`}
    >
      <img
        src={avatarUrl}
        alt={userName}
        className="w-full h-full object-cover"
        onError={(e) => {
          // If image fails to load, fallback to default avatar
          e.target.src = defaultAvatar;
        }}
      />
    </div>
  );
};

export default UserAvatar;
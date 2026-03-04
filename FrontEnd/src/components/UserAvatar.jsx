import BufferToDataURL from "../utils/BufferToDataURL";
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

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-red-400 shadow-sm ${border && borderClasses[size]}`}
    >
      {user?.img?.data || user?.img?.contentType ? (
        <img
          src={BufferToDataURL(user.img.data, user.img.contentType)}
          alt={user.firstName || "User Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={defaultAvatar}
          alt="Default Avatar"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default UserAvatar;

import { FiAlertCircle, FiX, FiRefreshCw, FiInfo } from "react-icons/fi";
import { MdCheck } from "react-icons/md";

const Alert = ({
  message,
  onRetry,
  onClose,
  onConfirm,
  type = "error",
  showIcon = true,
  className = "",
  Icon = FiRefreshCw,
  buttonText,
  closeText = "Dismiss",
  confirmText = 'Ok',
  isScreen = false
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-red-50 border-red-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      case "success":
        return "text-green-800";
      default:
        return "text-red-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <FiAlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <FiInfo className="w-5 h-5 text-blue-600" />;
      case "success":
        return <FiAlertCircle className="w-5 h-5 text-green-600" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
      case "success":
        return "bg-green-600 hover:bg-green-700";
      default:
        return "bg-red-600 hover:bg-red-700";
    }
  };

  const ButtonIcon = ({ icon: Icon, className = "", ...props }) => {
    if (!Icon) return null;

    return <Icon className={className} {...props} />;
  };

  const content = (
    <div className={`flex justify-center items-center h-[400px]`}>
      <div
        className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}
      >
        <div className="flex items-start">
          {showIcon && <div className="flex-shrink-0 mr-3">{getIcon()}</div>}

          <div className="flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>{message}</p>

            {/* Action Buttons */}
            <div className="mt-3 flex space-x-3 justify-center">
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry()}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${getButtonColor()} focus:outline-none  transition-colors`}
                >
                  <ButtonIcon icon={Icon} className="w-5 h-5 mr-2" />
                  {buttonText || "Retry"}
                </button>
              )}

              {onConfirm && (
                <button
                  type="button"
                  onClick={() => onConfirm()}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md ${getTextColor()} transition-colors`}
                >
                  <MdCheck className="w-4 h-4  mr-2" />
                  {confirmText}
                </button>
              )}
              {onClose && (
                <button
                  type="button" 
                  onClick={onClose}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  <span>{closeText}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (isScreen) {
    return (
      <div className="fixed translate-y-[-50%]  translate-x-[-50%] md:translate-x-[-65%] top-1/2 left-1/2 md:left-[65%] z-40 inset-0 bg-opacity-90 flex items-center justify-center">
        {content}
      </div>
    );
  }
  return content;
};

export default Alert;

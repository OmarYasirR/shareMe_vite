import Spinner from './Spinner';

const Loader = ({
  size = 'md',
  color = 'red',
  text = 'loader...',
  textPosition = 'bottom',
  overlay = false,
  fullScreen = false,
  className = ''
}) => {
  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      case 'xxl': return 'text-xl';
      default: return 'text-sm';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'purple': return 'text-purple-600';
      case 'white': return 'text-white';
      case 'gray': return 'text-gray-600';
      default: return 'text-red-600';
    }
  };

  const content = (
    <div className={`flex ${
      textPosition === 'right' || textPosition === 'left' 
        ? 'flex-row items-center' 
        : 'flex-col items-center'
    } justify-center h-[400px] ${className}`}>
      {(textPosition === 'left' || textPosition === 'top') && text && (
        <span className={`${getTextSize()} ${getTextColor()} ${
          textPosition === 'left' ? 'mr-2' : 'mb-2'
        }`}>
          {text}
        </span>
      )}
      
      <Spinner size={size} color={color} />
      
      {(textPosition === 'right' || textPosition === 'bottom') && text && (
        <span className={`${getTextSize()} ${getTextColor()} ${
          textPosition === 'right' ? 'ml-2' : 'mt-2'
        }`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-gray-300 bg-opacity-80 flex items-center justify-center rounded-lg translate-y-[-50%]  translate-x-[-50%] md:translate-x-[-65%] top-1/2 left-1/2 md:left-[65%] z-40  w-[300px] md:w-[400px]">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
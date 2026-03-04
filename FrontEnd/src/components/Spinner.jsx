const Spinner = ({ 
  size = 'md',
  color = 'red',
  className = '' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      case 'xl': return 'w-12 h-12';
      case 'xxl': return 'w-16 h-16';
      default: return 'w-6 h-6';
    }
  };

  const getColor = () => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'purple': return 'text-purple-600';
      case 'white': return 'text-white';
      case 'gray': return 'text-gray-600';
      case 'amber': return 'text-amber-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className={`inline-block ${getSize()} ${getColor()} ${className}`}>
      <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export default Spinner;

const DefaultAvater = () => {
  return (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 20.25a7.5 7.5 0 0115 0"
        />
      </svg>
    </div>
  );
};

export default DefaultAvater;

const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  const colors = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400',
    green: 'text-green-600',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size] || sizes.md} ${colors[color] || colors.blue} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-64 gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
    <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className={`h-3 bg-gray-100 rounded-lg ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3 animate-pulse">
    <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="h-6 w-16 bg-gray-100 rounded-full" />
  </div>
);

export default Spinner;

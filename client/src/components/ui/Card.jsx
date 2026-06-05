const Card = ({ children, className = '', padding = true, hover = false, onClick, ...props }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${padding ? 'p-5' : ''} ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Header = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-4 mb-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`font-semibold text-gray-900 text-base ${className}`}>{children}</h3>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`pt-4 mt-4 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);

export default Card;

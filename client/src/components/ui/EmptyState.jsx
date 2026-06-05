import Button from './Button';

const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
    {icon && (
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-3xl">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>}
    {(action || (actionLabel && onAction)) && (
      <Button variant="primary" size="md" onClick={onAction}>
        {actionLabel || action}
      </Button>
    )}
  </div>
);

export default EmptyState;

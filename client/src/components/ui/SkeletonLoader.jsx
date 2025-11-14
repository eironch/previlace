function SkeletonLoader({ className = "", variant = "default" }) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  const variants = {
    default: "h-4 w-full",
    title: "h-8 w-3/4",
    button: "h-12 w-full rounded-lg",
    circle: "h-16 w-16 rounded-full",
    card: "h-48 w-full rounded-lg",
    text: "h-4 w-full",
    avatar: "h-10 w-10 rounded-full",
  };

  return (
    <div className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}></div>
  );
}

export default SkeletonLoader;

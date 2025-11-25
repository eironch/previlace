import { forwardRef } from "react";

const Card = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

const CardDescription = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-600 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

const CardContent = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };

function Card({ children, className = "" }) {
  return (
    <div className={`border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`font-semibold text-black mb-2 ${className}`}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

function CardContent({ children, className = "" }) {
  return (
    <div className={`px-6 pb-6 ${className}`}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
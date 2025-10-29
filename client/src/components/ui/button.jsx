import { forwardRef } from "react";

const Button = forwardRef(({ 
	children, 
	variant = "primary", 
	size = "md",
	disabled = false,
	className = "",
	...props 
}, ref) => {
	const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
	
	const variants = {
		primary: "bg-black text-white hover:bg-gray-800 focus:ring-gray-500",
		ghost: "bg-transparent text-black hover:bg-gray-100 focus:ring-gray-300",
		outline: "border border-black text-black bg-white hover:bg-gray-50 focus:ring-gray-300",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm rounded-md",
		md: "px-4 py-2 text-sm rounded-lg",
		lg: "px-6 py-3 text-base rounded-lg",
	};

	const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

	return (
		<button
			ref={ref}
			disabled={disabled}
			className={classes}
			{...props}
		>
			{children}
		</button>
	);
});

Button.displayName = "Button";

export default Button;

import { forwardRef } from "react";

const TextArea = forwardRef(({ 
	label,
	error,
	className = "",
	rows = 4,
	...props 
}, ref) => {
	const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-vertical";
	const errorClasses = error ? "border-red-300 focus:ring-red-500" : "";
	
	return (
		<div className="space-y-1">
			{label && (
				<label className="block text-sm font-medium text-black">
					{label}
				</label>
			)}
			<textarea
				ref={ref}
				rows={rows}
				className={`${baseClasses} ${errorClasses} ${className}`}
				{...props}
			/>
			{error && (
				<p className="text-sm text-red-600">{error}</p>
			)}
		</div>
	);
});

TextArea.displayName = "TextArea";

export default TextArea;

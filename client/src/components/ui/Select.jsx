import { forwardRef } from "react";

const Select = forwardRef(({ 
	label,
	error,
	options = [],
	placeholder,
	className = "",
	...props 
}, ref) => {
	const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors bg-white";
	const errorClasses = error ? "border-red-300 focus:ring-red-500" : "";
	
	return (
		<div className="space-y-1">
			{label && (
				<label className="block text-sm font-medium text-black">
					{label}
				</label>
			)}
			<select
				ref={ref}
				className={`${baseClasses} ${errorClasses} ${className}`}
				{...props}
			>
				{placeholder && !props.value && (
					<option value="" disabled>
						{placeholder}
					</option>
				)}
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && (
				<p className="text-sm text-red-600">{error}</p>
			)}
		</div>
	);
});

Select.displayName = "Select";

export default Select;

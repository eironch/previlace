import { useEffect, useRef, useState } from "react";
import { mathLibraryService } from "../../services/mathLibraryService";

function MathInput({ value = "", onChange, placeholder = "Enter mathematical expression..." }) {
	const containerRef = useRef(null);
	const mathFieldRef = useRef(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadMathQuill();
	}, []);

	useEffect(() => {
		if (isLoaded && mathFieldRef.current && value !== mathFieldRef.current.latex()) {
			mathFieldRef.current.latex(value);
		}
	}, [value, isLoaded]);

	async function loadMathQuill() {
		try {
			const loaded = await mathLibraryService.loadMathQuill();
			if (loaded) {
				initializeMathQuill();
			} else {
				setError("Failed to load mathematical input library");
			}
		} catch (err) {
			setError("Failed to initialize math input");
		}
	}

	function initializeMathQuill() {
		if (!containerRef.current || typeof window.MathQuill === "undefined") return;

		try {
			const MQ = window.MathQuill.getInterface(2);
			
			mathFieldRef.current = MQ.MathField(containerRef.current, {
				spaceBehavesLikeTab: true,
				leftRightIntoCmdGoes: "up",
				restrictMismatchedBrackets: true,
				sumStartsWithNEquals: true,
				supSubsRequireOperand: true,
				charsThatBreakOutOfSupSub: "+-=<>",
				autoSubscriptNumerals: true,
				autoCommands: "pi theta sqrt sum prod alpha beta gamma delta epsilon zeta eta iota kappa lambda mu nu xi omicron rho sigma tau upsilon phi chi psi omega",
				autoOperatorNames: "sin cos tan sec csc cot sinh cosh tanh log ln exp lim max min",
				handlers: {
					edit: function() {
						const latex = mathFieldRef.current.latex();
						if (onChange) {
							onChange(latex);
						}
					}
				}
			});

			if (value) {
				mathFieldRef.current.latex(value);
			}

			setIsLoaded(true);
		} catch (err) {
			setError("Failed to create math field");
		}
	}

	if (error) {
		return (
			<div className="space-y-2">
				<textarea
					className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-vertical"
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange && onChange(e.target.value)}
					rows={2}
				/>
				<p className="text-xs text-red-600">Math input temporarily unavailable. Using text input.</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div
				ref={containerRef}
				className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors min-h-[40px] bg-white"
				style={{ fontSize: "18px" }}
			/>
			{placeholder && !isLoaded && (
				<p className="text-sm text-gray-500">{placeholder}</p>
			)}
			{value && (
				<div className="text-xs text-gray-600">
					<strong>LaTeX:</strong> <code className="bg-gray-100 px-1 rounded">{value}</code>
				</div>
			)}
		</div>
	);
}

export default MathInput;

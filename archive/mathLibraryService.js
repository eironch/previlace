let isMathQuillLoaded = false;

export const mathLibraryService = {
	async loadMathQuill() {
		if (isMathQuillLoaded || typeof window.MathQuill !== "undefined") {
			isMathQuillLoaded = true;
			return true;
		}

		return new Promise((resolve, reject) => {
			if (typeof window.jQuery === "undefined") {
				const jqueryScript = document.createElement("script");
				jqueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js";
				
				jqueryScript.onload = () => {
					this.loadMathQuillLibrary().then(resolve).catch(reject);
				};
				
				jqueryScript.onerror = () => reject(new Error("Failed to load jQuery"));
				document.head.appendChild(jqueryScript);
			} else {
				this.loadMathQuillLibrary().then(resolve).catch(reject);
			}
		});
	},

	loadMathQuillLibrary() {
		return new Promise((resolve, reject) => {
			const mathQuillCSS = document.createElement("link");
			mathQuillCSS.rel = "stylesheet";
			mathQuillCSS.href = "https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.css";
			
			const mathQuillScript = document.createElement("script");
			mathQuillScript.src = "https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js";
			
			mathQuillScript.onload = () => {
				isMathQuillLoaded = true;
				resolve(true);
			};
			
			mathQuillScript.onerror = () => {
				reject(new Error("Failed to load MathQuill"));
			};
			
			document.head.appendChild(mathQuillCSS);
			document.head.appendChild(mathQuillScript);
		});
	},

	renderLatexAsText(latex) {
		if (!latex) return null;
		return latex;
	},

	isMathQuillLoaded() {
		return isMathQuillLoaded;
	},

	async initializeMathLibraries() {
		try {
			await this.loadMathQuill();
			return true;
		} catch (error) {
			return false;
		}
	},
};

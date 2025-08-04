// Re-export the utility function for direct use
const loadedFonts = new Set<string>()

export function useGoogleFont(fontFamily: string) {
	const fontId = fontFamily.replace(/\s+/g, '+')

	if (!loadedFonts.has(fontId) && typeof document !== 'undefined') {
		// Create and append link element
		const link = document.createElement('link')
		link.href = `https://fonts.googleapis.com/css2?family=${fontId}:wght@300;400;500;600;700&display=swap`
		link.rel = 'stylesheet'
		document.head.appendChild(link)
		loadedFonts.add(fontId)
	}

	// Return the CSS font-family value
	return `"${fontFamily}", sans-serif`
}

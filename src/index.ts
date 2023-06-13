import $ from 'jquery';

/**
 * Extracts all the elements visible in the body of the page that have text directly in them
 * @returns {JQuery<HTMLElement>} A list of elements that have text inside of them
 */
function extractElementsToTranslate() {
	const elements = $('body *:visible').filter((_, element) => {
		const clone = $(element).clone();
		clone.children().remove();
		return clone.text().trim().length > 0;
	});
	return elements;
}

const elements = extractElementsToTranslate();

let charCount = 0;

elements.each((_, element) => {
	const clone = $(element).clone();
	const children = clone.children().clone();

	// Remove all children
	clone.children().remove();

	// overwrite text in clone
	clone.text('Ass');

	charCount += clone.text().length;

	// append children back to clone
	clone.append(children);

	// replace original element with clone
	$(element).replaceWith(clone);
});

console.log(charCount);

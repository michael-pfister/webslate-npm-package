import $ from 'jquery';
import axios from 'axios';

/**
 * Extracts all the elements visible in the body of the page that have text directly in them
 * @param {boolean} ignoreTranslatedElements (optional) Whether or not to ignore elements that have already been translated
 * @returns {JQuery<HTMLElement>} A list of elements that have text inside of them
 */
function extractElementsToTranslate(ignoreTranslatedElements?: boolean) {
	// get all elements that are visible in the body of the page
	const elements = $('body *:visible').filter((_, element) => {
		// check if element has direct text in it
		const hasText = $(element).is('input')
			? !!$(element).attr('placeholder')?.trim()
			: $(element).clone().children().remove().end().text().trim().length > 0;

		// check if element has already been translated
		return ignoreTranslatedElements
			? hasText
			: !$(element).is('[data-translated]') && hasText;
	});

	return elements;
}

/**
 * Translates a list of elements
 * @param {JQuery<HTMLElement>} elements A list of JQuery HTMLelements to translate
 * @returns {Promise<void>} A promise that resolves when all elements have been translated
 */
async function translateElements(elements: JQuery<HTMLElement>) {
	const promises = elements
		.filter((_, element) => !$(element).attr('data-translated'))
		.map((_, element) => {
			return axios
				.get('http://localhost:3000/api/translate', {
					params: {
						text: $(element).attr('placeholder') || $(element).text(),
					},
				})
				.then((res) => {
					if ($(element).is('input')) {
						$(element).attr('placeholder', res.data.translation);
					} else {
						const clone = $(element).clone();
						const children = clone.children().clone();

						// Remove all children
						clone.children().remove();

						// overwrite text in clone
						clone.text(res.data.translation);

						// append children back to clone
						clone.append(children);

						// mark element as translated
						clone.attr('data-translated', 'true');

						// replace original element with clone
						$(element).replaceWith(clone);
					}
				});
		})
		.get();

	return Promise.all(promises);
}

/**
 * Listens for changes in the DOM and translates elements that are added
 * @returns {void}
 */
function listenForDOMChanges() {
	const target = document.body;
	const config = {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['style'],
	};
	const observer = new MutationObserver(() => {
		console.log('DOM changed');

		observer.disconnect();

		const elements = extractElementsToTranslate();
		translateElements(elements).then(() => {
			observer.observe(target, config);
		});
	});

	observer.observe(target, config);
}

/**
 * Initializes the package
 * @returns {void}
 */
function init() {
	// translate all elements for the first time
	const elements = extractElementsToTranslate();

	translateElements(elements).then(() => {
		// listen for changes in the DOM
		listenForDOMChanges();
	});
}

// initialize when page is loaded
$(window).on('load', () => {
	console.clear();
	init();
});

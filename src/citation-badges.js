// src/citation-badges.js
//
// Pure functions for computing the two article-level badges (gold "Sources
// cited," green "Reviewer confirmed"). No `document`/`mw`/`fetch` here — see
// citation-badges.bootstrap.js for the DOM wiring. Kept separate so this file
// is unit-testable with plain Node, mirroring discovery-rail.js's split.

function countCitations(citationElements) {
	return citationElements.length;
}

function hasReviewedCategory(categoryLinkTitles) {
	return categoryLinkTitles.some( function ( title ) {
		return title.indexOf( 'Category:Reviewed' ) !== -1;
	} );
}

function buildBadgeHtml( state ) {
	var html = '';

	if ( state.hasSources ) {
		html += '<span class="bhf-badge--verified">Sources cited</span>';
	}

	if ( state.isReviewed ) {
		html += '<span class="bhf-badge--reviewed">Reviewer confirmed</span>';
	}

	return html;
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = { countCitations, hasReviewedCategory, buildBadgeHtml };
}

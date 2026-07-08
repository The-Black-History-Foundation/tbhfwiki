//
// Pure functions for computing contributor profile stats. No `document`/
// `mw`/`fetch` here — see contributor-stats.bootstrap.js for the API wiring.
// Kept separate so this file is unit-testable with plain Node, mirroring
// discovery-rail.js's and citation-badges.js's split.

function countDistinctArticles(contributions) {
	const titles = new Set( contributions.map( ( c ) => c.title ) );
	return titles.size;
}

function lastActiveDate(contributions) {
	if ( contributions.length === 0 ) {
		return null;
	}

	return contributions.reduce( ( latest, c ) => {
		return c.timestamp > latest ? c.timestamp : latest;
	}, contributions[ 0 ].timestamp );
}

function countCitationTemplateUsages(wikitext) {
	const matches = wikitext.match( /\{\{\s*Citation[|}]/gi );
	return matches ? matches.length : 0;
}

function sumCitationCounts(perPageCounts) {
	return perPageCounts.reduce( ( sum, count ) => sum + count, 0 );
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = {
		countDistinctArticles,
		lastActiveDate,
		countCitationTemplateUsages,
		sumCitationCounts,
	};
}

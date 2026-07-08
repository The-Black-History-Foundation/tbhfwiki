//
// Pure functions for the research-leads board: grouping open leads by what
// they need, and rendering each lead as a card. No `document`/`mw`/`fetch`
// here — see research-leads.bootstrap.js for the API wiring. Defines its own
// titleToUrl/escapeHtml (rather than reusing discovery-rail.js's) so this
// file has no load-order dependency on any other feature file when
// concatenated onto MediaWiki:Citizen.js.

const NEED_TYPES = [ 'archival', 'translation', 'fieldwork', 'funding', 'expertise', 'digitization' ];

function titleToUrl(title) {
	return '/wiki/' + encodeURIComponent( title.replace( / /g, '_' ) );
}

function escapeHtml(str) {
	return String( str )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

function groupLeadsByNeed(openTitles, needMemberships) {
	const openSet = new Set( openTitles );
	const grouped = {};

	NEED_TYPES.forEach( ( needType ) => {
		const members = needMemberships[ needType ] || [];
		grouped[ needType ] = members.filter( ( title ) => openSet.has( title ) );
	} );

	return grouped;
}

function renderLeadCard(lead) {
	return (
		'<a class="bhf-lead-card" href="' + escapeHtml( lead.url ) + '">' +
		'<span class="bhf-lead-card__title">' + escapeHtml( lead.title ) + '</span>' +
		( lead.extract ?
			'<span class="bhf-lead-card__excerpt">' + escapeHtml( lead.extract ) + '</span>' :
			'' ) +
		'</a>'
	);
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = { NEED_TYPES, titleToUrl, escapeHtml, groupLeadsByNeed, renderLeadCard };
}

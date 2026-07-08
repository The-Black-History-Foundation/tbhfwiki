/**
 * Pure transform/render functions for the homepage discovery rail.
 * No `mw` or `fetch` dependency here — see discovery-rail.bootstrap.js for
 * the MediaWiki API wiring. Kept separate so this file is unit-testable
 * with plain Node.
 */

function titleToUrl(title) {
	return '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
}

function escapeHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function transformRecentChanges(apiResponse) {
	const changes = ( apiResponse.query && apiResponse.query.recentchanges ) || [];

	return changes.map( ( change ) => ( {
		title: change.title,
		timestamp: change.timestamp,
		user: change.user,
		url: titleToUrl( change.title ),
		userUrl: titleToUrl( 'User:' + change.user ),
	} ) );
}

function renderCard(item) {
	const userHtml = item.userUrl ?
		'<a class="bhf-rail-card__user-link" href="' + escapeHtml( item.userUrl ) + '">' + escapeHtml( item.user ) + '</a>' :
		escapeHtml( item.user );

	return (
		'<div class="bhf-rail-card">' +
		'<a class="bhf-rail-card__title" href="' + escapeHtml( item.url ) + '">' + escapeHtml( item.title ) + '</a>' +
		'<span class="bhf-rail-card__meta">' + userHtml +
			( item.timestamp ? ' &middot; ' + escapeHtml( item.timestamp ) : '' ) +
		'</span>' +
		'</div>'
	);
}

function transformMostViewed(apiResponse) {
	const rows = apiResponse.query && apiResponse.query.mostviewed;

	if ( !rows ) {
		return null;
	}

	return rows.map( ( row ) => ( {
		title: row.title,
		views: row.count,
		url: titleToUrl( row.title ),
	} ) );
}

function isPageViewInfoUnavailable(apiResponse) {
	return Boolean( apiResponse.error && apiResponse.error.code === 'unknown_action' );
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = {
		transformRecentChanges,
		renderCard,
		titleToUrl,
		escapeHtml,
		transformMostViewed,
		isPageViewInfoUnavailable,
	};
}

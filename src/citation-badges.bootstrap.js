// src/citation-badges.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly AFTER
// citation-badges.js's contents (both share one flat global scope on the real
// page — no require()/import there). Order relative to discovery-rail.js/
// discovery-rail.bootstrap.js from the base theme doesn't matter, as long as
// citation-badges.js precedes this file.

( function () {
	'use strict';

	function mountBadges() {
		var mount = document.getElementById( 'bhf-citation-badges' );

		if ( !mount ) {
			return;
		}

		var evidenceElements = document.querySelectorAll( '.bhf-evidence-entry' );
		var catlinks = document.getElementById( 'catlinks' );
		var categoryLinkTitles = catlinks ?
			Array.prototype.map.call( catlinks.querySelectorAll( 'a' ), function ( a ) {
				return a.getAttribute( 'title' ) || '';
			} ) :
			[];

		mount.innerHTML = buildBadgeHtml( {
			hasSources: countEvidenceEntries( evidenceElements ) > 0,
			isReviewed: hasReviewedCategory( categoryLinkTitles )
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', mountBadges );
	} else {
		mountBadges();
	}
}() );

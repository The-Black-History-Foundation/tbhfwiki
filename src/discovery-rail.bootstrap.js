// src/discovery-rail.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js.
// Depends on transformRecentChanges/transformMostViewed/isPageViewInfoUnavailable/
// renderCard, which must ALSO be pasted in above this block (MediaWiki:Citizen.js is
// a single flat script — there is no require()/import here). discovery-rail.js's
// guarded `if (typeof module !== 'undefined')` export block makes it safe to paste
// verbatim, unmodified, ahead of this file.

( function () {
	'use strict';

	function mountRail() {
		var container = document.getElementById( 'bhf-discovery-rail' );

		if ( !container ) {
			return;
		}

		container.innerHTML =
			'<div class="bhf-rail">' +
			'<section class="bhf-rail__column">' +
			'<h2>Recently Added</h2>' +
			'<div id="bhf-rail-recent" class="bhf-rail__cards"></div>' +
			'</section>' +
			'<section id="bhf-rail-trending-section" class="bhf-rail__column">' +
			'<h2>Trending</h2>' +
			'<div id="bhf-rail-trending" class="bhf-rail__cards"></div>' +
			'</section>' +
			'</div>';

		var api = new mw.Api();

		api.get( {
			action: 'query',
			list: 'recentchanges',
			rcnamespace: 0,
			rctype: 'new',
			rclimit: 10,
			rcprop: 'title|timestamp|user'
		} ).done( function ( data ) {
			var items = transformRecentChanges( data );
			document.getElementById( 'bhf-rail-recent' ).innerHTML =
				items.map( renderCard ).join( '' );
		} );

		api.get( {
			action: 'query',
			list: 'mostviewed',
			pvimlimit: 10
		} ).done( function ( data ) {
			var items = transformMostViewed( data );

			if ( items === null ) {
				document.getElementById( 'bhf-rail-trending-section' ).style.display = 'none';
				return;
			}

			document.getElementById( 'bhf-rail-trending' ).innerHTML = items
				.map( function ( item ) {
					return renderCard( {
						title: item.title,
						user: item.views + ' views',
						url: item.url
					} );
				} )
				.join( '' );
		} ).fail( function ( code, data ) {
			if ( isPageViewInfoUnavailable( data ) ) {
				document.getElementById( 'bhf-rail-trending-section' ).style.display = 'none';
			}
		} );
	}

	mw.loader.using( 'mediawiki.api' ).then( function () {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', mountRail );
		} else {
			mountRail();
		}
	} );
}() );

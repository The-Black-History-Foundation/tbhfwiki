// src/research-leads.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly
// AFTER research-leads.js's contents (both share one flat global scope on
// the real page — no require()/import there). Order relative to other
// features' files doesn't matter, as long as research-leads.js precedes
// this file.

( function () {
	'use strict';

	var NEED_CATEGORY_TITLES = {
		archival: 'Needs Archival Access',
		translation: 'Needs Translation',
		fieldwork: 'Needs Fieldwork',
		funding: 'Needs Funding',
		expertise: 'Needs Expertise',
		digitization: 'Needs Digitization'
	};

	function mountBoard() {
		var mount = document.getElementById( 'bhf-leads-board' );

		if ( !mount ) {
			return;
		}

		var api = new mw.Api();

		api.get( {
			action: 'query',
			generator: 'categorymembers',
			gcmtitle: 'Category:Lead Status Open',
			gcmlimit: 50,
			prop: 'extracts',
			exintro: 1,
			explaintext: 1,
			exsentences: 1
		} ).done( function ( openData ) {
			var pages = ( openData.query && openData.query.pages ) || {};
			var openTitles = [];
			var extractsByTitle = {};

			Object.keys( pages ).forEach( function ( pageId ) {
				var page = pages[ pageId ];
				openTitles.push( page.title );
				extractsByTitle[ page.title ] = page.extract || '';
			} );

			if ( openTitles.length === 0 ) {
				return;
			}

			var needCalls = NEED_TYPES.map( function ( needType ) {
				return api.get( {
					action: 'query',
					list: 'categorymembers',
					cmtitle: 'Category:' + NEED_CATEGORY_TITLES[ needType ],
					cmlimit: 50,
					cmprop: 'title'
				} );
			} );

			// $.when with more than one promise passes one argument PER
			// promise to .done(), and since mw.Api().get() resolves with
			// (data, jqXHR) — two values — each argument here is itself an
			// array [data, jqXHR]. NEED_TYPES always has 6 entries (fixed),
			// so this always takes the "multiple promises" branch, never
			// jQuery's single-promise special case.
			$.when.apply( $, needCalls ).done( function () {
				var responses = Array.prototype.slice.call( arguments ).map( function ( argsForOneCall ) {
					return argsForOneCall[ 0 ];
				} );
				var needMemberships = {};

				NEED_TYPES.forEach( function ( needType, index ) {
					var data = responses[ index ];
					var members = ( data.query && data.query.categorymembers ) || [];
					needMemberships[ needType ] = members.map( function ( m ) { return m.title; } );
				} );

				var grouped = groupLeadsByNeed( openTitles, needMemberships );
				var html = '';

				NEED_TYPES.forEach( function ( needType ) {
					var titles = grouped[ needType ];

					if ( titles.length === 0 ) {
						return;
					}

					html += '<section class="bhf-leads-group">' +
						'<h2>' + NEED_CATEGORY_TITLES[ needType ] + '</h2>' +
						'<div class="bhf-leads-group__cards">' +
						titles.map( function ( title ) {
							return renderLeadCard( {
								title: title,
								url: titleToUrl( title ),
								extract: extractsByTitle[ title ] || ''
							} );
						} ).join( '' ) +
						'</div>' +
						'</section>';
				} );

				mount.innerHTML = html;
			} ).fail( function () {
				mw.log.warn( 'research-leads: failed to fetch need-category memberships' );
			} );
		} ).fail( function () {
			mw.log.warn( 'research-leads: failed to fetch open leads' );
		} );
	}

	mw.loader.using( 'mediawiki.api' ).then( function () {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', mountBoard );
		} else {
			mountBoard();
		}
	} );
}() );

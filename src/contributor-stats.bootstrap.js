// src/contributor-stats.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly AFTER
// contributor-stats.js's contents (both share one flat global scope on the
// real page — no require()/import there). Order relative to the discovery
// rail's and citation badges' files doesn't matter, as long as
// contributor-stats.js precedes this file.

( function () {
	'use strict';

	function mountStats() {
		var mount = document.getElementById( 'bhf-contributor-stats' );
		var username = mw.config.get( 'wgRelevantUserName' );

		if ( !mount || !username ) {
			return;
		}

		var api = new mw.Api();

		api.get( {
			action: 'query',
			list: 'usercontribs',
			ucuser: username,
			ucnamespace: 0,
			uclimit: 50,
			ucprop: 'title|timestamp'
		} ).done( function ( data ) {
			var rows = ( data.query && data.query.usercontribs ) || [];
			var contributions = rows.map( function ( row ) {
				return { title: row.title, timestamp: row.timestamp };
			} );

			if ( contributions.length === 0 ) {
				return;
			}

			var lastActive = lastActiveDate( contributions );
			var seen = {};
			var distinctTitles = [];

			contributions.forEach( function ( c ) {
				if ( !seen[ c.title ] ) {
					seen[ c.title ] = true;
					distinctTitles.push( c.title );
				}
			} );

			var articleCount = distinctTitles.length;

			// usercontribs is already capped at 50 (uclimit above), so
			// distinctTitles.length is at most 50 — no separate cap needed
			// here. All distinct titles are fetched in ONE batched API call
			// (MediaWiki's prop=revisions accepts multiple `|`-joined
			// titles), not one call per page.
			api.get( {
				action: 'query',
				prop: 'revisions',
				titles: distinctTitles.join( '|' ),
				rvprop: 'content',
				rvslots: 'main'
			} ).done( function ( pageData ) {
				var pages = ( pageData.query && pageData.query.pages ) || {};
				var perPageCounts = Object.keys( pages ).map( function ( pageId ) {
					var page = pages[ pageId ];
					var revision = page.revisions && page.revisions[ 0 ];
					var content = revision && revision.slots && revision.slots.main &&
						revision.slots.main[ '*' ];
					return content ? countEvidenceTemplateUsages( content ) : 0;
				} );
				var evidenceCount = sumEvidenceCounts( perPageCounts );

				mount.textContent = articleCount + ' distinct article' +
					( articleCount === 1 ? '' : 's' ) + ' among your last ' +
					contributions.length + ' edit' + ( contributions.length === 1 ? '' : 's' ) +
					' · ' + evidenceCount + ' evidence entries across your ' + distinctTitles.length +
					' most recently edited articles · last active ' + lastActive;
			} ).fail( function ( code, errorData ) {
				mw.log.warn( 'bhf-contributor-stats: revisions query failed', code, errorData );
			} );
		} ).fail( function ( code, errorData ) {
			mw.log.warn( 'bhf-contributor-stats: usercontribs query failed', code, errorData );
		} );
	}

	mw.loader.using( 'mediawiki.api' ).then( function () {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', mountStats );
		} else {
			mountStats();
		}
	} );
}() );

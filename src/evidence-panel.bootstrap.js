// src/evidence-panel.bootstrap.js
// Paste this entire file's contents into MediaWiki:Citizen.js, directly AFTER
// evidence-panel.js's contents (both share one flat global scope on the real
// page — no require()/import there).

( function () {
	'use strict';

	function extractEntryData(el) {
		return {
			title: el.getAttribute( 'data-evidence-title' ) || '',
			type: el.getAttribute( 'data-evidence-type' ) || '',
			date: el.getAttribute( 'data-evidence-date' ) || '',
			repository: el.getAttribute( 'data-evidence-repository' ) || '',
			reliability: el.getAttribute( 'data-evidence-reliability' ) || '',
			citation: el.getAttribute( 'data-evidence-citation' ) || ''
		};
	}

	function mountEvidencePanel() {
		var mount = document.getElementById( 'bhf-evidence-panel' );

		if ( !mount ) {
			return;
		}

		var entryElements = Array.prototype.slice.call(
			document.querySelectorAll( '.bhf-evidence-entry' )
		);

		if ( entryElements.length === 0 ) {
			return;
		}

		var entries = entryElements.map( extractEntryData );
		var groups = groupEvidenceByCategory( entries );
		var total = countEvidenceEntries( entries );

		mount.innerHTML = renderEvidencePanel( groups, total );

		// Hide the original inline entries now that the organized panel is
		// showing — a JS-enabled reader should see each source exactly once.
		// A JS-disabled reader keeps seeing them (this code never ran).
		entryElements.forEach( function ( el ) {
			el.style.display = 'none';
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', mountEvidencePanel );
	} else {
		mountEvidencePanel();
	}
}() );

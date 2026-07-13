//
// Pure functions for the Evidence Explorer panel: grouping evidence entries
// by category, rendering the collapsible panel, and counting entries (also
// reused by citation-badges.js for its "Sources cited" badge). No
// `document`/`mw`/`fetch` here — see evidence-panel.bootstrap.js for the DOM
// wiring. Defines its own escapeHtml (rather than reusing discovery-rail.js's
// or research-leads.js's) so this file has no load-order dependency on any
// other feature file when concatenated onto MediaWiki:Citizen.js.

const EVIDENCE_HIERARCHY = [
	{
		category: 'Primary Documents',
		children: [ 'Government Records', 'Land Records', 'Military Records', 'Maps', 'Letters' ]
	},
	{ category: 'Newspapers', children: [] },
	{ category: 'Books', children: [] },
	{ category: 'Academic Papers', children: [] },
	{ category: 'Oral Histories', children: [] },
	{ category: 'DNA Studies', children: [] },
	{ category: 'Archaeology', children: [] }
];

function escapeHtml(str) {
	return String( str )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

function countEvidenceEntries(entries) {
	return entries.length;
}

function groupEvidenceByCategory(entries) {
	const groups = [];

	EVIDENCE_HIERARCHY.forEach( ( def ) => {
		const directEntries = entries.filter( ( entry ) => entry.type === def.category );
		const subgroups = [];

		def.children.forEach( ( childCategory ) => {
			const childEntries = entries.filter( ( entry ) => entry.type === childCategory );
			if ( childEntries.length > 0 ) {
				subgroups.push( { category: childCategory, entries: childEntries } );
			}
		} );

		if ( directEntries.length > 0 || subgroups.length > 0 ) {
			const group = { category: def.category, entries: directEntries };
			if ( def.children.length > 0 ) {
				group.subgroups = subgroups;
			}
			groups.push( group );
		}
	} );

	return groups;
}

function renderEvidenceEntryHtml(entry) {
	let meta = escapeHtml( entry.type );
	if ( entry.date ) {
		meta += ' &middot; ' + escapeHtml( entry.date );
	}
	if ( entry.repository ) {
		meta += ' &middot; ' + escapeHtml( entry.repository );
	}

	let html = '<div class="bhf-evidence-entry">';
	html += '<span class="bhf-evidence-entry__title">' + escapeHtml( entry.title ) + '</span>';
	html += '<span class="bhf-evidence-entry__meta">' + meta + '</span>';
	html += '<span class="bhf-evidence-entry__reliability bhf-evidence-entry__reliability--' +
		escapeHtml( entry.reliability ) + '">' + escapeHtml( entry.reliability ) + '</span>';
	if ( entry.citation ) {
		html += '<div class="bhf-evidence-entry__citation">' + escapeHtml( entry.citation ) + '</div>';
	}
	html += '</div>';
	return html;
}

function renderEvidencePanel(groups, totalCount) {
	let html = '<details class="bhf-evidence-panel">';
	html += '<summary class="bhf-evidence-panel__summary">Evidence (' + totalCount +
		( totalCount === 1 ? ' source' : ' sources' ) + ')</summary>';

	groups.forEach( ( group ) => {
		const subgroupCount = group.subgroups ?
			group.subgroups.reduce( ( sum, sg ) => sum + sg.entries.length, 0 ) :
			0;
		const groupCount = group.entries.length + subgroupCount;

		html += '<div class="bhf-evidence-panel__category">' + escapeHtml( group.category ) +
			' (' + groupCount + ')</div>';

		group.entries.forEach( ( entry ) => {
			html += renderEvidenceEntryHtml( entry );
		} );

		if ( group.subgroups ) {
			group.subgroups.forEach( ( subgroup ) => {
				html += '<div class="bhf-evidence-panel__subcategory">' + escapeHtml( subgroup.category ) +
					' (' + subgroup.entries.length + ')</div>';
				subgroup.entries.forEach( ( entry ) => {
					html += renderEvidenceEntryHtml( entry );
				} );
			} );
		}
	} );

	html += '</details>';
	return html;
}

// Guarded so this file can be pasted as-is into MediaWiki:Citizen.js (a plain
// browser script where `module` does not exist) without throwing a
// ReferenceError, while still being require()-able from Node tests.
if ( typeof module !== 'undefined' ) {
	module.exports = {
		EVIDENCE_HIERARCHY,
		escapeHtml,
		countEvidenceEntries,
		groupEvidenceByCategory,
		renderEvidencePanel
	};
}

<?php
// LocalSettings-snippet.php — append to your wiki's LocalSettings.php.
// Requires the logo files from assets/logos/ to be uploaded to the paths
// below first (see assets/README.md).

// Required by the homepage's hero search box (src/templates/MainPage.wikitext
// uses the <inputbox> tag) -- MediaWiki's Sanitizer does not allow raw
// <form>/<input>/<button> tags in wikitext content, so a plain HTML form
// there would render as escaped, non-functional text. InputBox is bundled
// with core MediaWiki downloads; this just enables it.
wfLoadExtension( 'InputBox' );

$wgCitizenThemeDefault = 'light';

$wgLogos = [
	'1x' => '$wgResourceBasePath/resources/assets/TBHF_Main_Text.png',
	'icon' => '$wgResourceBasePath/resources/assets/TBHF_Main_Icon.png',
];

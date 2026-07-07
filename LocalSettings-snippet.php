<?php
// LocalSettings-snippet.php — append to your wiki's LocalSettings.php.
// Requires the logo image files to exist at the paths below; supply your
// own tbhfdn.org-branded assets (this repo does not include image assets).

$wgCitizenThemeDefault = 'light';

$wgLogos = [
	'1x' => '$wgResourceBasePath/resources/assets/tbhfdn-wordmark.svg',
	'icon' => '$wgResourceBasePath/resources/assets/tbhfdn-icon.svg',
];

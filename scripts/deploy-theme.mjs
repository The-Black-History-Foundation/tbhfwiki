#!/usr/bin/env node
/**
 * Deploy tbhfwiki theme files to a live MediaWiki instance via the API.
 *
 * Required environment variables:
 *   MW_API_URL      — e.g. https://your-wiki.up.railway.app/w/api.php
 *   MW_BOT_USER     — bot or admin username (e.g. tech@tbhfdn.org)
 *   MW_BOT_PASSWORD — password
 *
 * Usage: node scripts/deploy-theme.mjs
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

const JS_BUNDLE = [
	'src/discovery-rail.js',
	'src/discovery-rail.bootstrap.js',
	'src/citation-badges.js',
	'src/citation-badges.bootstrap.js',
	'src/contributor-stats.js',
	'src/contributor-stats.bootstrap.js',
	'src/research-leads.js',
	'src/research-leads.bootstrap.js',
];

const TEMPLATE_MAP = {
	'src/templates/MainPage.wikitext': 'Main Page',
	'src/templates/Infobox.wikitext': 'Template:Infobox',
	'src/templates/ArticleBreadcrumb.wikitext': 'Template:ArticleBreadcrumb',
	'src/templates/RelatedPages.wikitext': 'Template:RelatedPages',
	'src/templates/Quote.wikitext': 'Template:Quote',
	'src/templates/ContributeFooter.wikitext': 'Template:ContributeFooter',
	'src/templates/Citation.wikitext': 'Template:Citation',
	'src/templates/ContributorProfile.wikitext': 'Template:ContributorProfile',
	'src/templates/ResearchLead.wikitext': 'Template:ResearchLead',
	'src/templates/AboutProject.wikitext': 'About This Wiki',
	'src/templates/TermsOfUse.wikitext': 'Terms of Use',
	'src/templates/HelpContributing.wikitext': 'Help:Contributing',
	'src/Sidebar.wikitext': 'MediaWiki:Sidebar',
	'src/Explore-the-archive.wikitext': 'MediaWiki:Explore-the-archive',
	'src/About-and-contribute.wikitext': 'MediaWiki:About-and-contribute',
};

function read(relPath) {
	return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function requireEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

async function apiRequest(params) {
	const apiUrl = requireEnv('MW_API_URL');
	const body = new URLSearchParams(params);
	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	});
	const json = await response.json();
	if (json.error) {
		throw new Error(`MediaWiki API error: ${json.error.info || JSON.stringify(json.error)}`);
	}
	return json;
}

async function login() {
	const user = requireEnv('MW_BOT_USER');
	const password = requireEnv('MW_BOT_PASSWORD');
	const tokenResp = await apiRequest({
		action: 'query',
		meta: 'tokens',
		type: 'login',
		format: 'json',
	});
	const loginToken = tokenResp.query.tokens.logintoken;
	const loginResp = await apiRequest({
		action: 'login',
		lgname: user,
		lgpassword: password,
		lgtoken: loginToken,
		format: 'json',
	});
	if (loginResp.login?.result !== 'Success') {
		throw new Error(`Login failed: ${loginResp.login?.result || 'unknown'}`);
	}
	const csrfResp = await apiRequest({
		action: 'query',
		meta: 'tokens',
		type: 'csrf',
		format: 'json',
	});
	return csrfResp.query.tokens.csrftoken;
}

async function editPage(title, text, csrfToken, summary) {
	const resp = await apiRequest({
		action: 'edit',
		title,
		text,
		summary,
		token: csrfToken,
		format: 'json',
	});
	if (resp.edit?.result !== 'Success') {
		throw new Error(`Edit failed for ${title}: ${JSON.stringify(resp)}`);
	}
	console.log(`Updated: ${title}`);
}

async function main() {
	const csrfToken = await login();
	const css = read('src/citizen-theme.css');
	await editPage('MediaWiki:Citizen.css', css, csrfToken, 'Deploy TBHF Citizen theme CSS');

	const jsParts = JS_BUNDLE.map((file) => read(file));
	await editPage(
		'MediaWiki:Citizen.js',
		jsParts.join('\n\n'),
		csrfToken,
		'Deploy TBHF Citizen theme JS'
	);

	const prefs = read('src/Citizen-preferences.json');
	await editPage(
		'MediaWiki:Citizen-preferences.json',
		prefs,
		csrfToken,
		'Deploy TBHF Citizen preferences'
	);

	for (const [file, title] of Object.entries(TEMPLATE_MAP)) {
		const text = read(file);
		await editPage(title, text, csrfToken, `Deploy ${path.basename(file)}`);
	}

	console.log('Theme deploy complete.');
}

main().catch((err) => {
	console.error(err.message || err);
	process.exit(1);
});

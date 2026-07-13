/**
 * Shared TBHF main-site URLs for wiki templates and deploy tooling.
 * Matches routes on https://tbhfdn.org (TBHF-1 Next.js site).
 */
const TBHF_MAIN_SITE = 'https://tbhfdn.org';

const TBHF_LINKS = {
	main: TBHF_MAIN_SITE,
	about: `${TBHF_MAIN_SITE}/about`,
	volunteer: `${TBHF_MAIN_SITE}/volunteer`,
	donate: `${TBHF_MAIN_SITE}/donate`,
	educational: `${TBHF_MAIN_SITE}/educational`,
	contact: `${TBHF_MAIN_SITE}/contact`,
	terms: `${TBHF_MAIN_SITE}/terms-of-use`,
	privacy: `${TBHF_MAIN_SITE}/privacy-policy`,
};

module.exports = { TBHF_MAIN_SITE, TBHF_LINKS };

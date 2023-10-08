(() => {
const PSU = PLOPGG_SCRAPING_UTIL;

const url = document.URL;
if (PSU.isTeamUrl(url)) return PSU.getRosterNamesFromTeamPage();
if (PSU.isMatchUrl(url)) return PSU.getLineupNamesFromMatchPage();
return undefined;
})();

(() => {
const PSU = PLOPGG_SCRAPING_UTIL;

const url = document.URL;
if (PSU.isActiveTeamUrl(url)) return PSU.getRosterNamesFromTeamPage();
if (PSU.isMatchUrl(url)) return PSU.getLineupNamesFromMatchPage();
return undefined;
})();

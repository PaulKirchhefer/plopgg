const PLOPGG_SCRAPING_UTIL = (() => {
    const PL_URL_PREFIX = "https://www.primeleague.gg/leagues"
    const TEAMS_INFIX = "/teams/";
    const MAIN_TEAM_URL_PREFIX = `${PL_URL_PREFIX}${TEAMS_INFIX}`;
    const ACTIVE_TEAM_URL_PREFIX = `${PL_URL_PREFIX}/prm/`;
    const TEAM_URL_POSTFIX_REGEX = /\/teams\/[^\/]+$/;
    const MATCH_URL_PREFIX = `${PL_URL_PREFIX}/matches/`;

    function isMainTeamUrl(url) {
        return !!url && url.startsWith(MAIN_TEAM_URL_PREFIX) && !!url.match(TEAM_URL_POSTFIX_REGEX);
    }

    function isActiveTeamUrl(url) {
        return !!url && url.startsWith(ACTIVE_TEAM_URL_PREFIX) && !!url.match(TEAM_URL_POSTFIX_REGEX);
    }

    function isAnyTeamUrl(url) {
        return isMainTeamUrl(url) || isActiveTeamUrl(url);
    }

    function isMatchUrl(url) {
        return !!url && url.startsWith(MATCH_URL_PREFIX);
    }

    function getTeamNameFromTeamUrl(url) {
        if (!isAnyTeamUrl(url)) return undefined;

        const from = url.lastIndexOf(TEAMS_INFIX);
        const id = from < 0 ? undefined : url.substring(from + TEAMS_INFIX.length);

        return getTeamNameFromId(id);
    }

    function getTeamNameFromId(id) {
        const from = id?.indexOf("-") ?? -1;

        return from < 0 ? undefined : id.substring(from + 1);
    }

    function getSingleElement(queryResult) {
        return queryResult?.length == 1 ? queryResult[0] : undefined;
    }

    function getOwnTeam() {
        const myTeamLink = document?.querySelector('#sidebar')?.querySelector(`[href*="${MAIN_TEAM_URL_PREFIX}"]`)?.getAttribute("href");

        return getTeamNameFromTeamUrl(myTeamLink);
    }
    
    function getMatchVsString() {
        const url = document.URL;
        if (!isMatchUrl(url)) return undefined;
        
        const from = url.indexOf("-", MATCH_URL_PREFIX.length);

        if (from < 0) return undefined;

        const vsString = url.substring(from + 1);
        
        return vsString.indexOf('-vs-') < 0 ? undefined : vsString;
    }

    function getRosterNamesFromTeamPage() {
        const url = document.URL;
        if (!isActiveTeamUrl(url)) return undefined;

        const members = document?.querySelectorAll('li:has([title*="Summoner Name"])');
        const names = [];
        for (let i = 0; i < members?.length; i++) {
            const memberItem = members[i];
            const memberName = getSingleElement(memberItem.querySelectorAll('[title*="Summoner Name"]'))?.innerText;
            if (!!memberName) {
                const confirmed = memberItem.querySelectorAll('.txt-status-positive').length == 1;
                names.push({ name: memberName, confirmed: confirmed });
            }
        }
        return { roster: names };
    }
    
    function getLineupNames(lineupElement) {
        const playerElements = lineupElement?.querySelectorAll('li');
        const summonerNames = [];
        for (let i = 0; i < playerElements?.length; i++) {
            const playerElement = playerElements[i];
            const textElements = playerElement?.querySelectorAll('.txt-info');
            const summonerName = textElements?.length == 2 ? textElements[1]?.innerText : undefined;

            if (!!summonerName) summonerNames.push(summonerName);
        }
        
        return summonerNames;
    }

    function getLineupNamesFromMatchPage() {
        const lineup1 = getLineupNames(document.querySelector('#league-match-lineup1'));
        const lineup2 = getLineupNames(document.querySelector('#league-match-lineup2'));

        const ownTeam = getOwnTeam();
        const vsString = getMatchVsString();

        return {lineup1: lineup1, lineup2: lineup2, ownTeam, vsString};
    }

    return Object.freeze({
        isMainTeamUrl,
        isActiveTeamUrl,
        isAnyTeamUrl,
        isMatchUrl,
        getTeamNameFromTeamUrl,
        getRosterNamesFromTeamPage,
        getLineupNamesFromMatchPage
    });
})();
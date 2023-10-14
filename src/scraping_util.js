const PLOPGG_SCRAPING_UTIL = (() => {
    const TEAM_URL_PREFIX = "https://www.primeleague.gg/leagues/teams/";
    const MATCH_URL_PREFIX = "https://www.primeleague.gg/leagues/matches/";

    function isTeamUrl(url) {
        return !!url && url.startsWith(TEAM_URL_PREFIX);
    }

    function isMatchUrl(url) {
        return !!url && url.startsWith(MATCH_URL_PREFIX);
    }

    function getSingleElement(queryResult) {
        return queryResult?.length == 1 ? queryResult[0] : undefined;
    }

    function getOwnTeam() {
        const myTeamLink = document?.querySelector('#sidebar')?.querySelector(`[href*="${TEAM_URL_PREFIX}"]`)?.getAttribute("href");

        const from = myTeamLink?.indexOf("-", TEAM_URL_PREFIX.length) ?? -1;

        return from < 0 ? undefined : myTeamLink.substring(from + 1) ?? undefined;
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
        if (!isTeamUrl(url)) return undefined;

        const members = document?.querySelector('.league-team-members')?.querySelectorAll('li');
        const names = [];
        for (let i = 0; i < members.length; i++) {
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

        const isLeftTeam = !!vsString && !!ownTeam && vsString.startsWith(ownTeam);
        const isRightTeam = !!vsString && !!ownTeam && vsString.endsWith(ownTeam);

        const ownTeamIndex = isLeftTeam != isRightTeam ? 1+isRightTeam : -1;

        return {lineup1: lineup1, lineup2: lineup2, ownTeam: ownTeamIndex};
    }

    return Object.freeze({
        isTeamUrl,
        isMatchUrl,
        getRosterNamesFromTeamPage,
        getLineupNamesFromMatchPage
    });
})();
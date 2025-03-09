const PLOPGG_SCRAPING_UTIL = (() => {
    const PL_URL_PREFIX = "https://www.primeleague.gg/";
    const TEAMS_INFIX = "/teams/";
    const MAIN_TEAM_URL_REGEX =
        /^https:\/\/www\.primeleague\.gg\/[^\/]+\/leagues\/teams\/[^\/]+([#\?].*)?$/;
    const ACTIVE_TEAM_URL_REGEX =
        /^https:\/\/www\.primeleague\.gg\/[^\/]+\/leagues\/prm\/[^\/]+\/teams\/[^\/]+([#\?].*)?$/;
    const MATCH_URL_PREFIX_REGEX =
        /^https:\/\/www\.primeleague\.gg\/[^\/]+\/leagues\/matches\//;
    const URL_PARAMS_POSTFIX_REGEX = /([#\?].*)?$/;

    function isMainTeamUrl(url) {
        return !!url && !!url.match(MAIN_TEAM_URL_REGEX);
    }

    function isActiveTeamUrl(url) {
        return !!url && !!url.match(ACTIVE_TEAM_URL_REGEX);
    }

    function isAnyTeamUrl(url) {
        return isMainTeamUrl(url) || isActiveTeamUrl(url);
    }

    function isMatchUrl(url) {
        return !!url && !!url.match(MATCH_URL_PREFIX_REGEX);
    }

    function getTeamNameFromTeamUrl(url) {
        if (!isAnyTeamUrl(url)) return undefined;

        const urlWithoutParams = url.replace(URL_PARAMS_POSTFIX_REGEX, "");
        const from = urlWithoutParams.lastIndexOf(TEAMS_INFIX);
        const id = from < 0 ? undefined : urlWithoutParams.substring(from + TEAMS_INFIX.length);

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
        const linkNodes = document?.querySelector('#sidebar')?.querySelectorAll(`[href*="${PL_URL_PREFIX}"]`);

        for (let i = 0; i < linkNodes?.length; i++) {
            const link = linkNodes[i].getAttribute("href");
            if (!!link.match(MAIN_TEAM_URL_REGEX))
                return getTeamNameFromTeamUrl(link);
        }


        return undefined;
    }
    
    function getMatchVsString() {
        const url = document.URL;
        if (!isMatchUrl(url)) return undefined;

        const urlWithoutParams = url.replace(URL_PARAMS_POSTFIX_REGEX, "");
        const prefix = urlWithoutParams.match(MATCH_URL_PREFIX_REGEX)[0];
        const from = urlWithoutParams.indexOf("-", prefix.length);

        if (from < 0) return undefined;

        const vsString = urlWithoutParams.substring(from + 1);
        
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
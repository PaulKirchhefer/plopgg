(() => {
const PSU = PLOPGG_SCRAPING_UTIL;
const POU = PLOPGG_OPTIONS_UTIL;
const OP_GG_BASE_URL = "https://www.op.gg/multisearch/euw?summoners=";

const TEAM_1_MENU_ID = "team-1-menu-item";
const TEAM_2_MENU_ID = "team-2-menu-item";
const MORE_MENU_ID = "more-menu-item";

const MENU_ITEM = {
    contexts: ["page_action"]
};

const TEAM_MAIN_MENU_ITEM = {
    ...MENU_ITEM,
    icons: {
        16: "icons/plopgg.svg"
      }
};

function isTeamPage(tab) {
    return PSU.isActiveTeamUrl(tab?.url);
}

function isMatchPage(tab) {
    return PSU.isMatchUrl(tab?.url);
}

function onPlopgg(tab, teamNumber, action, filter) {
    browser.tabs.executeScript(tab.id,{
        file: "content_parser.js"
    }).then(results => {
        const result = results?.[0];
        let names = undefined;
        if (isTeamPage(tab)) {
            names = result?.roster.map(r => r?.name).filter(n => !!n);
        }
        else if (isMatchPage(tab)) {
            const names1 = result?.lineup1;
            const names2 = result?.lineup2;

            if (teamNumber == 1) {
                names = names1;
            }
            else if (teamNumber == 2) {
                names = names2;
            }
            else {
            const ownTeam = result?.ownTeam;
            const vsString = result?.vsString;

            names = getMatchPageNames(names1, names2, ownTeam, vsString, filter);
            }
        }
        console.log("Extracted: ", result, "\nMapped to names: ", names);

        if (!!names?.length) {
            copyToClipboard(names, action);
            loadUrls(tab, names, action);
        }
    });
}

function getMatchPageNames(lineup1, lineup2, ownTeam, vsString, filter) {
    if (!lineup1?.length) return lineup2 ?? [];
    if (!lineup2?.length) return lineup1;

    if (!!filter?.auto && !!ownTeam && !!vsString) {
        if (vsString.startsWith(ownTeam)) return lineup2;
        if (vsString.endsWith(ownTeam)) return lineup1;
    }

    if (!!filter?.specified && !!filter.specifiedTeams && !!vsString) {
        const startsWithAny = filter.specifiedTeams.some(vsString.startsWith);
        const endsWithAny = filter.specifiedTeams.some(vsString.endsWith);

        if (startsWithAny && !endsWithAny) return lineup2;
        if (endsWithAny && !startsWithAny) return lineup1;
    }

    return [...lineup1, ...lineup2];
}

function loadUrls(tab, names, action) {
    if (!action?.loadUrl) return;

    action.urls
        ?.map(baseUrl => buildUrl(baseUrl, names, action.encoding))
        .filter(url => !!url)
        .forEach((url,i) => open(tab, url, (i==0) && action.newTab, (i==0) && action.newTab));
}

function buildUrl(baseUrl, names, encoding) {
    if (!baseUrl || !encoding) return undefined;

    const encoder = POU.encode[encoding];
    if (!encoder) return undefined;

    const encodedNames = encoder(names);

    return baseUrl + encodedNames;
}

function open(tab, url, inNewTab, focus) {
    if(!tab?.id || !url) return;

    if (!URL.canParse(url)) {
        console.log("Failed to parse: " + url);
        return;
    }

    browser.tabs.executeScript(tab.id,{
        code: `window?.open('${url}'${inNewTab ? ", '_blank'" : ""})${focus ? "?.focus()" : ""}`
    });
}

function copyToClipboard(names, action) {
    const copyToClipboard = action?.copyToClipboard;

    if (copyToClipboard == "URL") {
        const firstUrl = action.urls
            ?.map(baseUrl => buildUrl(baseUrl, names, action.encoding))
            .filter(url => !!url)[0];
        if (!firstUrl) {
            navigator?.clipboard?.writeText(firstUrl);
        }
    }
    else if (copyToClipboard == "NAMES") {
        navigator?.clipboard?.writeText(names.join(","));
    }
}

function initPlopggButton(tab) {
    if (!tab) return;

    const tabId = tab.id;

    POU.getOptionsFromStorage(options => {
        const plopggPageAction = browser.pageAction;

        const mainAction = options.actions[0];
        plopggPageAction.setIcon({tabId: tabId, path: "icons/plopgg.svg"});
        plopggPageAction.setTitle({tabId: tabId, title: mainAction.label});
        onMainPlopgg = tab_ => onPlopgg(tab_, undefined, mainAction, options.filter);

        const teamPage = isTeamPage(tab);
        const matchPage = isMatchPage(tab);
        const shouldShow = teamPage || matchPage;

        const menus = browser.menus;
        if (!menus) return;
        menus.removeAll();
        let availableMenuItems = menus.ACTION_MENU_TOP_LEVEL_LIMIT;

        if (matchPage) {
            menus.create({...MENU_ITEM, id: TEAM_1_MENU_ID, title: "Team 1",
                onclick: () => onPlopgg(tab, 1, options.actions[0], options.filter)});
            menus.create({...MENU_ITEM, id: TEAM_2_MENU_ID, title: "Team 2",
                onclick: () => onPlopgg(tab, 2, options.actions[0], options.filter)});

            menus.create({...MENU_ITEM, type: "separator"});
            availableMenuItems -= 3;

            addCustomButtons(tab, options, 1, TEAM_1_MENU_ID);
            addCustomButtons(tab, options, 2, TEAM_2_MENU_ID);
        }

        addCustomButtons(tab, options, undefined, undefined, availableMenuItems);

        if (shouldShow) {
            plopggPageAction.show(tabId);
        }
        else {
            plopggPageAction.hide(tabId);
        }
    });
}

function addCustomButtons(tab, options, teamNumber, parentMenuId, availableMenuItems) {
    const menus = browser.menus;
    const subMenuRequired = availableMenuItems < options.actions.length - 1;

    options?.actions?.forEach((action, i) => {
        if (i == 0 && !teamNumber) return;
        let parentId = parentMenuId;
        if (!parentId && i >= availableMenuItems && subMenuRequired) {
            parentId = MORE_MENU_ID;
            if (i == availableMenuItems) {
                menus?.create({...MENU_ITEM, id: MORE_MENU_ID, title: "more"});
            }
        }
        menus.create({...(i == 0 ? TEAM_MAIN_MENU_ITEM : MENU_ITEM), parentId, title: action.label,
            onclick: () => onPlopgg(tab, teamNumber, action, options.filter)});
    });
}

let onMainPlopgg = undefined;

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => initPlopggButton(tab), {properties: ['url', 'status']});

browser.tabs.onActivated.addListener(({tabId}) => browser.tabs.get(tabId).then(initPlopggButton));

browser.windows.onFocusChanged.addListener(windowId => {
    if (windowId == browser.windows.WINDOW_ID_NONE) return;

    browser.tabs.query({active: true, windowId: windowId}).then(tabs => initPlopggButton(tabs?.[0]));
});

browser.pageAction.onClicked.addListener(tab => !!onMainPlopgg && onMainPlopgg(tab));
browser.menus.onClicked.addListener((info, tab) => console.log(info, tab));
})();
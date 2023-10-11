(() => {
const PSU = PLOPGG_SCRAPING_UTIL;
const OP_GG_BASE_URL = "https://www.op.gg/multisearch/euw?summoners=";

const TEAM_1_MENU_ID = "team-1-menu-item";
const TEAM_2_MENU_ID = "team-2-menu-item";

const TEAM_MENU_ITEM = {
    contexts: ["page_action"]
};

function hasPrefix(toCheck, prefix) {
    return !!toCheck && toCheck.startsWith(prefix) && toCheck.length > prefix.length;
}

function isTeamPage(tab) {
    return PSU.isTeamUrl(tab?.url);
}

function isMatchPage(tab) {
    return PSU.isMatchUrl(tab?.url);
}

function getOpggUrl(names) {
    return OP_GG_BASE_URL + encodeURIComponent(names.join(", "));
}

function openInNewTab(tab, url) {
    if(!tab?.id || !url) return;

    browser.tabs.executeScript(tab.id,{
        code: `window?.open('${url}', '_blank')?.focus()`
    });
}

function onPlopgg(tab, teamNumber) {
    browser.tabs.executeScript(tab.id,{
        file: "content_parser.js"
    }).then(results => {
        const result = results?.[0];
        let names = undefined;
        if (isTeamPage(tab)) {
            names = result?.roster;
        }
        else if (isMatchPage(tab)) {
            const names1 = result?.lineup1;
            const names2 = result?.lineup2;
            const ownTeam = result?.ownTeam;

            if (teamNumber == 1 || !names2 || names2.length == 0) {
                names = names1;
            }
            else if (teamNumber == 2 || !names1 || names1.length == 0){
                names = names2;
            }
            else {
                if (ownTeam == 1) {
                    names = names2;
                }
                else if (ownTeam == 2) {
                    names = names1;
                }
                else {
                    names = [...names1, ...names2];
                }
            }
        }
        console.log("Extracted: ", result, "\nMapped to names: ", names);

        if (names?.length > 0) {
            const opggUrl = getOpggUrl(names);
            navigator?.clipboard?.writeText(opggUrl);
            openInNewTab(tab, opggUrl);
        }
    });
}

function initPlopggButton(tab) {
    if (!tab) return;

    const tabId = tab.id;

    const plopggPageAction = browser.pageAction;

    plopggPageAction.setIcon({tabId: tabId, path: "icons/plopgg.svg"});
    plopggPageAction.setTitle({tabId: tabId, title: "Open in op.gg"});

    const teamPage = isTeamPage(tab);
    const matchPage = isMatchPage(tab);
    const shouldShow = teamPage || matchPage;

    const menus = browser.menus;
    menus?.remove(TEAM_1_MENU_ID);
    menus?.remove(TEAM_2_MENU_ID);

    if (matchPage) {
        menus?.create({...TEAM_MENU_ITEM, id: TEAM_1_MENU_ID, title: "Team 1", onclick: () => onPlopgg(tab, 1)});
        menus?.create({...TEAM_MENU_ITEM, id: TEAM_2_MENU_ID, title: "Team 2", onclick: () => onPlopgg(tab, 2)});
    }

    if (shouldShow) {
        plopggPageAction.show(tabId);
    }
    else {
        plopggPageAction.hide(tabId);
    }
}

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => initPlopggButton(tab), {properties: ['url', 'status']});

browser.tabs.onActivated.addListener(({tabId}) => browser.tabs.get(tabId).then(initPlopggButton));

browser.windows.onFocusChanged.addListener(windowId => {
    if (windowId == browser.windows.WINDOW_ID_NONE) return;

    browser.tabs.query({active: true, windowId: windowId}).then(tabs => initPlopggButton(tabs?.[0]));
});

browser.pageAction.onClicked.addListener(onPlopgg);
})();
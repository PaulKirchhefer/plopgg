const PLOPGG_OPTIONS_UTIL = (() => {
    const CLIPBOARD_OPTION_URL = "URL";
    const CLIPBOARD_OPTION_NAMES = "NAMES";

    const ENCODING_OPTION_FULL = "FULL";
    const ENCODING_OPTION_REPLACE = "REPLACE";

    const DEFAULT_OPTIONS = Object.freeze({
        version: 1,
        actions: [
            {
                label: "op.gg",
                loadUrl: true,
                urls: ["https://www.op.gg/multisearch/euw?summoners="],
                encoding: ENCODING_OPTION_FULL,
                newTab: true,
                copyToClipboard: CLIPBOARD_OPTION_URL
            },
            {
                label: "u.gg",
                loadUrl: true,
                urls: ["https://u.gg/multisearch?region=euw1&summoners="],
                encoding: ENCODING_OPTION_REPLACE,
                newTab: true,
                copyToClipboard: CLIPBOARD_OPTION_URL
            },
            {
                label: "deeplol.gg",
                loadUrl: true,
                urls: ["https://www.deeplol.gg/multi/EUW/"],
                encoding: ENCODING_OPTION_FULL,
                newTab: true,
                copyToClipboard: CLIPBOARD_OPTION_URL
            },
            {
                label: "Copy Summoner Names",
                loadUrl: false,
                copyToClipboard: CLIPBOARD_OPTION_NAMES
            }
        ],
        filter: {
            auto: true,
            specified: false,
            specifiedTeams: []
        }
    });

    const ENCODE = Object.freeze({
        [ENCODING_OPTION_FULL]: (summoners) => encodeURIComponent(summoners.join(",")),
        [ENCODING_OPTION_REPLACE]: (summoners) => summoners.map(summoner => {
            const postfixIndex = summoner.lastIndexOf('#');
            const postfixExistsAndValid = postfixIndex > 0 && postfixIndex < summoner.length - 1;

            const prefix = encodeURIComponent(postfixExistsAndValid ? summoner.substring(0, postfixIndex) : summoner);
            const postfix = postfixExistsAndValid ? "-" + encodeURIComponent(summoner.substring(postfixIndex + 1)) : "";

            return prefix + postfix;
        })
    });

    function getOptionsFromStorage(callback) {
        if (typeof browser === 'undefined') return;

        const optionsPromise = browser.storage?.local?.get("options");
        if (!optionsPromise) callback(DEFAULT_OPTIONS);
        else optionsPromise.then(stored => callback(stored?.options ?? DEFAULT_OPTIONS), err => { console.log("Failed to load options.", err); callback(DEFAULT_OPTIONS); });
    }

    function saveOptionsToStorage(options) {
        if (typeof browser === 'undefined') return;

        const savePromise = browser.storage?.local?.set({ options });
        if (!savePromise) console.log("Failed to save options. No access to storage?");
        else savePromise.then(undefined, (err) => console.log("Failed to save options", err));
    }

    return Object.freeze({
        defaultOptions: DEFAULT_OPTIONS,
        encode: ENCODE,
        getOptionsFromStorage,
        saveOptionsToStorage
    });
})();
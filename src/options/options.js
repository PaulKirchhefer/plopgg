const POU = PLOPGG_OPTIONS_UTIL;
const BUTTON_TEMPLATE = `
        <div class="buttonHeader">
            <div><label for="buttonLabel$$$BNR$$$">Label: </label><input id="buttonLabel$$$BNR$$$" type="text"/></div>
            <div>
                <button id="buttonMain$$$BNR$$$" class="iconButton"><img src="../icons/plopgg.svg" /></button>
                <button id="buttonUp$$$BNR$$$" class="iconButton"><img src="../icons/up.svg" /></button>
                <button id="buttonDown$$$BNR$$$" class="iconButton"><img src="../icons/down.svg" /></button>
                <button id="buttonDelete$$$BNR$$$" class="iconButton"><img src="../icons/delete.svg" /></button>
            </div>
        </div>
        <div><input id="buttonOpenLink$$$BNR$$$" type="checkbox"
        /><label for="buttonOpenLink$$$BNR$$$">When the button is pressed and summoner names are extracted, load the following
            page with them:</label></div>
        <div class="tabbedOnce"><input id="buttonOpenInNewTab$$$BNR$$$" type="checkbox"
        /><label for="buttonOpenInNewTab$$$BNR$$$">Open in a new tab</label></div>
        <input id="buttonUrl$$$BNR$$$" class="tabbedOnce" type="text"/>
        <div class="tabbedOnce">Encoding: <select name="buttonEncoding$$$BNR$$$" id="buttonEncoding$$$BNR$$$">
            <option value="FULL">full</option>
            <option value="REPLACE">mixed</option>
        </select>
        <span id="buttonExampleLabel$$$BNR$$$">Example: </span><a id="buttonExampleUrl$$$BNR$$$" href="" target="_blank"></a>
        </div>
        <div><input id="buttonUseClipboard$$$BNR$$$" type="checkbox"
        /><label for="buttonUseClipboard$$$BNR$$$">When the button is pressed and summoner names are extracted, copy the
            following to the clipboard:</label></div>
        <div class="tabbedOnce"><input id="buttonCopyLink$$$BNR$$$" type="radio" name="buttonClipboardOption$$$BNR$$$" value="URL" checked="checked"
        /><label for="buttonCopyLink$$$BNR$$$">the constructed URL</label>
            <input id="buttonCopyNames$$$BNR$$$" type="radio" name="buttonClipboardOption$$$BNR$$$" value="NAMES"
            /><label for="buttonCopyNames$$$BNR$$$">the extracted summoner names</label></div>
`;

const EXAMPLE_SUMMONERS = ["ExampleSummoner#EUW", "Test#test"];

let NEXT_BUTTON_NR = 1;
let INDICES = {};
let NRS = [];

function createButtonContainer(bnr) {
    const container = document.createElement("div");
    container.setAttribute("id", containerId(bnr));
    container.setAttribute("class", "buttonContainer");

    const htmlContent = BUTTON_TEMPLATE.replaceAll("$$$BNR$$$", bnr);
    container.innerHTML = htmlContent;

    return container;
}

function containerId(bnr) {
    return `buttonContainer${bnr}`;
}

function setUpListeners(bnr) {
    document.getElementById(`buttonMain${bnr}`)
        .addEventListener("click", () => onMainClick(bnr));
    document.getElementById(`buttonUp${bnr}`)
        .addEventListener("click", () => onUpClick(bnr));
    document.getElementById(`buttonDown${bnr}`)
        .addEventListener("click", () => onDownClick(bnr));
    document.getElementById(`buttonDelete${bnr}`)
        .addEventListener("click", () => onDeleteClick(bnr));
    document.getElementById(`buttonOpenLink${bnr}`)
        .addEventListener("input", () => onOpenChange(bnr));
    document.getElementById(`buttonUrl${bnr}`)
        .addEventListener("input", () => onUrlOrEncodingChange(bnr));
    document.getElementById(`buttonEncoding${bnr}`)
        .addEventListener("input", () => onUrlOrEncodingChange(bnr));
    document.getElementById(`buttonUseClipboard${bnr}`)
        .addEventListener("input", () => onClipboardChange(bnr));
}

function onAddButton() {
    const bnr = NEXT_BUTTON_NR++;
    const prevLastBnr = NRS[NRS.length - 1];

    document.getElementById("buttonsContainer")
        .insertBefore(createButtonContainer(bnr), document.getElementById("addButton"));
    INDICES[bnr] = NRS.length;
    NRS = [...NRS, bnr];

    updateButtonStates(bnr);
    if (!!prevLastBnr) updateButtonStates(prevLastBnr);
    onOpenChange(bnr);
    onUrlOrEncodingChange(bnr);
    onClipboardChange(bnr);

    setUpListeners(bnr);
}

function onOpenChange(bnr) {
    document.getElementById(`buttonOpenInNewTab${bnr}`).disabled
        = !document.getElementById(`buttonOpenLink${bnr}`).checked;
}

function onUrlOrEncodingChange(bnr) {
    const url = document.getElementById(`buttonUrl${bnr}`).value.split(";")[0];
    const encoding = document.getElementById(`buttonEncoding${bnr}`).value;
    const example = !!url && !!encoding ? url + POU.encode[encoding](EXAMPLE_SUMMONERS) : "";

    document.getElementById(`buttonExampleLabel${bnr}`).disabled = !example;

    const exampleElement = document.getElementById(`buttonExampleUrl${bnr}`);
    exampleElement.setAttribute("href", example ?? "");
    exampleElement.textContent = example ?? "";
}

function onClipboardChange(bnr) {
    const disabled = !document.getElementById(`buttonUseClipboard${bnr}`).checked;

    document.getElementById(`buttonCopyLink${bnr}`).disabled = disabled;
    document.getElementById(`buttonCopyNames${bnr}`).disabled = disabled;
}

function onFilterTeamsChange() {
    document.getElementById("specifiedTeams").disabled
        = !document.getElementById("filterTeamsSpecMethod").checked;
}

function onMainClick(bnr) {
    const index = INDICES[bnr];
    const prevMainBnr = NRS[0];
    if (!index || !prevMainBnr) return;

    const element = document.getElementById(containerId(bnr));
    const prevMainElement = document.getElementById(containerId(prevMainBnr));

    document.getElementById("buttonsContainer").insertBefore(prevMainElement, element);
    const firstElement = index == 1 ? prevMainElement : document.getElementById(containerId(NRS[1]));
    document.getElementById("buttonsContainer").insertBefore(element, firstElement);

    INDICES[bnr] = 0;
    INDICES[prevMainBnr] = index;
    NRS[0] = bnr;
    NRS[index] = prevMainBnr;

    updateButtonStates(bnr);
    updateButtonStates(prevMainBnr);
}

function onUpClick(bnr) {
    const toMove = document.getElementById(containerId(bnr));
    const previous = toMove.previousElementSibling;

    if (!previous?.previousElementSibling) return;

    const oldIndex = INDICES[bnr];
    const prevBnr = NRS[oldIndex-1];

    document.getElementById("buttonsContainer").insertBefore(toMove, previous);

    INDICES[bnr]--;
    INDICES[prevBnr]++;
    NRS[oldIndex-1] = bnr;
    NRS[oldIndex] = prevBnr;

    updateButtonStates(bnr);
    updateButtonStates(prevBnr);
}

function onDownClick(bnr) {
    const toMove = document.getElementById(containerId(bnr));
    const next = toMove.nextElementSibling;
    if (!next?.nextElementSibling) return;

    const oldIndex = INDICES[bnr];
    const nextBnr = NRS[oldIndex+1];

    document.getElementById("buttonsContainer").insertBefore(toMove, next.nextElementSibling);

    INDICES[bnr]++;
    INDICES[nextBnr]--;
    NRS[oldIndex+1] = bnr;
    NRS[oldIndex] = nextBnr;

    updateButtonStates(bnr);
    updateButtonStates(nextBnr);
}

function onDeleteClick(bnr) {
    document.getElementById(containerId(bnr)).remove();

    const index = INDICES[bnr];
    const prevNr = NRS[index - 1];
    const nextNr = NRS[index + 1];

    let i = index + 1;
    while (i < NRS.length) {
        INDICES[NRS[i]]--;
        i++;
    }
    INDICES[bnr] = undefined;
    NRS.splice(index, 1);

    if (!!prevNr) updateButtonStates(prevNr);
    if (!!nextNr) updateButtonStates(nextNr);
}

function updateButtonStates(bnr) {
    const index = INDICES[bnr];
    const isMain = index <= 0;

    document.getElementById(`buttonMain${bnr}`).disabled = isMain;
    document.getElementById(`buttonUp${bnr}`).disabled = isMain || (index <= 1);
    document.getElementById(`buttonDown${bnr}`).disabled = isMain || (index >= NRS.length - 1);
    document.getElementById(`buttonDelete${bnr}`).disabled = isMain;
}

function onSave() {
    const actions = NRS.map(bnr => ({
        label: document.getElementById(`buttonLabel${bnr}`).value,
        loadUrl: document.getElementById(`buttonOpenLink${bnr}`).checked,
        urls: document.getElementById(`buttonUrl${bnr}`).value.split(";").map(url => url.trim()),
        encoding: document.getElementById(`buttonEncoding${bnr}`).value,
        newTab: document.getElementById(`buttonOpenInNewTab${bnr}`).checked,
        copyToClipboard: document.getElementById(`buttonCopyNames${bnr}`).checked ? "NAMES" : "URL"
    }));

    const options = {
        version: 1,
        actions,
        filter: {
            auto: document.getElementById("filterTeamsAutoMethod").checked,
            specified: document.getElementById("filterTeamsSpecMethod").checked,
            specifiedTeams: document.getElementById("specifiedTeams").value.split(";").map(team => team.trim())
        }
    };

    POU.saveOptionsToStorage(options);
}

function onCancel() {
    init();
}

function onReset() {
    load(POU.defaultOptions);
}

function init() {
    POU.getOptionsFromStorage(options => load(options));
}

function load(options) {
    resetButtons();

    let actions = options?.actions;
    if (!actions?.length)
        actions = POU.defaultOptions.actions;

    actions.forEach(() => onAddButton());

    NRS.forEach((bnr, i) => {
        const fromStorage = actions[i];

        document.getElementById(`buttonLabel${bnr}`).value = fromStorage?.label ?? "";
        document.getElementById(`buttonOpenLink${bnr}`).checked = !!fromStorage?.loadUrl;
        document.getElementById(`buttonUrl${bnr}`).value = (fromStorage?.urls ?? []).filter(url => !!url).join(";");
        document.getElementById(`buttonEncoding${bnr}`).value = getValidValue(fromStorage?.encoding, ["FULL", "REPLACE"]);
        document.getElementById(`buttonOpenInNewTab${bnr}`).checked = !!fromStorage?.newTab;
        if (fromStorage?.copyToClipboard == "NAMES") {
            document.getElementById(`buttonCopyNames${bnr}`).checked = true;
        }
        else {
            document.getElementById(`buttonCopyLink${bnr}`).checked = true;
        }
        document.getElementById(`buttonUseClipboard${bnr}`).checked = !!fromStorage?.copyToClipboard;

        onOpenChange(bnr);
        onClipboardChange(bnr);
        onUrlOrEncodingChange(bnr);
    });

    document.getElementById("filterTeamsAutoMethod").checked = options?.filter?.auto;
    document.getElementById("filterTeamsSpecMethod").checked = options?.filter?.specified;
    document.getElementById("specifiedTeams").value = (options?.filter?.specifiedTeams ?? []).filter(team => !!team).join(";");

    onFilterTeamsChange();
}

function resetButtons() {
    for (let i = NRS.length - 1; i >= 0; i--)
        onDeleteClick(NRS[i]);
}

function getValidValue(value, validValues) {
    return validValues.indexOf(value) < 0 ? validValues[0] : value;
}

onFilterTeamsChange();
init();

document.getElementById("addButton").addEventListener("click", () => onAddButton());
document.getElementById("filterTeamsSpecMethod").addEventListener("input", () => onFilterTeamsChange());
document.getElementById("reset").addEventListener("click", () => onReset());
document.getElementById("cancel").addEventListener("click", () => onCancel());
document.getElementById("save").addEventListener("click", () => onSave());

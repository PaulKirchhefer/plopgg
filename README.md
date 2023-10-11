# PrimeLeague op.gg Button
Firefox extension with the singular purpose of generating op.gg links from primeleague.gg team or match pages.

## Disclaimer
This extension is not affiliated with primeleague.gg or op.gg in any way.

The extension may break easily when the HTML structure of primeleague.gg is changed.
This extension is experimental. I do not know what I am doing here. Just doing this for fun. It works on my machine™...

## Feature
Provides a page action (button in the url bar) when visiting primeleague team or match pages.
Clicking the button extracts summoner names and opens a corresponding op.gg tab. The op.gg link is copied to the
clipboard.
When visiting a team page, the extension extracts the summoner names of all confirmed players.
When visiting a team page, the extension extracts the summoner names of:

- players selected by the opposing team, if the viewing user is in one of the participating teams, 
- or otherwise all players selected for the match by either team.

Buttons for targeting one of the teams manually can be accessed by right-clicking the page action when viewing a match page.

## Installation
Download the .xpi file from this repository. Open a new tab and type about:addons in the url bar.
Click on the gear icon, select 'Install Add-on from file' and select the downloaded .xpi file. 
This also works in case you already have an older version of the extension installed.

Firefox may initially block opening the op.gg tab. In that case you need to allow primeleague.gg to open popup-windows.

You can uninstall the extension on that same page, by finding the extension in the list, pressing '...' and then
selecting 'Remove'.
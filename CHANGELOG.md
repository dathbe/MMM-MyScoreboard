# Changelog

Notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.7.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.6.0...v4.7.0) - 2025-04-12
- **NEW FEATURE**: Australian A-League Women's soccer added
- BUG FIX: Update README with correct ARI Diamondbacks abbreviation
- Logic changes to reduce the number of unecessary API calls
- Under-the-hood changes to make the code more intuitive to me
- Fix some css errors
- Add styling to local sports channels (FanDuel and NBC Sports)
- Update README images
- Add some broadcast logos

## [4.6.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.5.0...v4.6.0) - 2025-04-09
- **NEW FEATURE**: New config option to `showLocalBroadcasts`
- **NEW FEATURE**: New config option to `skipChannels`
- **NEW FEATURE**: New config option to `displayLocalChannels`
- **NEW FEATURE**: Add UEFA Women's Nations League
- **NEW FEATURE**: Some broadcast channel logos will be displayed instead of text (if you want to add a logo, submit an issue)
- Lots of tweaking of how broadcast channels are displayed

## [4.5.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.4.0...v4.5.0) - 2025-04-06

- **NEW FEATURE**: New config option to `hideBroadcasts`
- BUG FIX: English WSL was not fully implemented properly
- BUG FIX: Logo folder previously pointed to my other module, MMM-MyStandings, which wouldn't work unless you have both installed

## [4.4.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.3.2...v4.4.0) - 2025-04-05

- **NEW FEATURE**: `English Women's Super League` added
- Replace `console.log` with `Log.log`

## [4.3.2](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.3.1...v4.3.2) - 2025-04-04

- Replace `internationaltTime` config option with built-in `timeFormat` option

## [4.3.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.3.0...v4.3.1) - 2025-04-03

- Bump version of `moment` dependency
- New CIN (NCAA) logo
- Remove `directory-tree` from list of dependencies

## [4.3.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.2.1...v4.3.0) - 2025-04-01

- **NEW FEATURE**: `internationalTime` config option that allows display of game times in 24-hour format (i.e., "14:00" instead of "2:00 pm")
- **NEW FEATURE**: Module now displays any *national* broadcast channels for ESPN feed leagues (local broadcasts seemed to numerous to fit nicely into the display, but if you feel strongly about it start a discussion in Issues)
- **NEW FEATURE**: WBC (World Baseball Classic) added
- Changed MLB, NFL, and NHL from Sportsnet to ESPN (to take advantage of broadcast channel information)
- Some revisions to game `status` logic (let me know if you see anything weird)
- Replaced `directory-tree` dependency with internal method
- Some new logos

## [4.2.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.2.0...v4.2.1) - 2025-03-31

- Added ESLint and made ESLint style changes

## [4.2.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.1.0...v4.2.0) - 2025-03-31

- **NEW FEATURE**: NLL (National Lacross League) added
- **NEW FEATURE**: PLL (Premier Lacross League) added
- **NEW FEATURE**: AFL (Australian Football League) added
- **NEW FEATURE**: NBA G League (Development League) added

## [4.1.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.0.0...v4.1.0) - 2025-03-31

- Change colors of completed games for more visibility (if you want the old colors, you can put it in your `custom.css` file)
- Removed code relating to lockString (resolved log error; hopefully does not have side effects)
- Replaced `axios` dependency with built-in fetch function
- Bump directory-tree
- Remove dependency on json-parse-async (unused)

## [4.0.0](https://github.com/jclarke0000/MMM-MyScoreboard/compare/master...dathbe:MMM-MyScoreboard:v4.0.0) - 2025-03-28 - First fork version

Forked from [jclarke0000](https://github.com/jclarke0000/MMM-MyScoreboard).
- **NEW FEATURE**: Added `alwaysShowToday` option, which allows today's scores to be shown simultaneously with yesterday's scores until `rolloverHours` time is reached
- Updated some team abbreviations and added new teams
- Moved all NCAA sport logos to `NCAA` subfolder to avoid duplication
- Added CODE_OF_CONDUCT.md
- Update README
- Update package.json
- Lots of new logos
- Other minor changes

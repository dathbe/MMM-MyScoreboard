# Changelog

Notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.14.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.14.0...v4.14.1) - 2025-12-11

- Lint
- Update dependencies

## [4.14.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.6...v4.14.0) - 2025-12-11

- ** NEW FEATURE**: Add Northern Super League (`NSL`)
- ** NEW FEATURE**: Add Canadian Premier League (`CPL`)
- Add logos
- Update readme for developers
- Update dependencies

## [4.13.6](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.5...v4.13.6) - 2025-11-16

- Update ESPN API endpoint

## [4.13.5](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.4...v4.13.5) - 2025-10-11

- Home team displayed first for AFL and rugby

## [4.13.4](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.3...v4.13.4) - 2025-10-06

- More channel logos
- Update dependencies

## [4.13.3](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.2...v4.13.3) - 2025-09-26

- More channel logos
- Update documentation
- Update dependencies

## [4.13.2](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.1...v4.13.2) - 2025-09-11

- BUG FIX: Update CSS to better display scrolling scores while using a custom header
- Update dependencies

## [4.13.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.13.0...v4.13.1) - 2025-09-02

- NCAA conferences updated for realignment
- Update dependencies

## [4.13.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.9...v4.13.0) - 2025-08-09

- ** NEW FEATURE**: Added `SOCCER_ON_TV_NOW` option
- Add channel logo
- Lint
- Remove explicit @eslint/plugin-kit dev dependency

## [4.12.9](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.8...v4.12.9) - 2025-07-27

- Add MLB NL and AL to README (for All-Star Game)
- Add channel logos
- Lint
- Update dev dependencies
- Add @eslint/plugin-kit explicitly as a dev dependency to use security patched version (will be removed when eslint dependency is updated to rely on patched sub-dependency)

## [4.12.8](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.7...v4.12.8) - 2025-07-15

- BUG FIX: Fix CFL url based on SNET API changes
- BREAKING CHANGE:  WBC will no longer work because of the CFL url change; will be updated when WBC resumes in March  (no major version change because it's only a temporary breaking change, and there are no WBC games at the moment)
- Update dependencies

## [4.12.7](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.6...v4.12.7) - 2025-07-05

- Change dependabot schedule
- Update dependencies

## [4.12.6](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.5...v4.12.6) - 2025-06-30

- BUG FIX: Fix `ydLoaded` logic (reduces API calls for yesterday's games)
- Tweak `noGamesToday` logic
- Update how "delay" messages are displayed
- Clean up some code
- Update dependencies

## [4.12.5](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.4...v4.12.5) - 2025-06-27

- BUG FIX: Leagues that use the "Scorepanel" provider would not update under certain conditions
- Update dependencies
- Update dependabot file

## [4.12.4](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.3...v4.12.4) - 2025-06-19

- Update dependencies
- Add dependabot checks
- `npm run` to `node --run`

## [4.12.3](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.2...v4.12.3) - 2025-06-08

- Update dependencies
- Lint per https://modules.magicmirror.builders/result.html

## [4.12.2](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.1...v4.12.2) - 2025-05-22

- Change the selection for description of games that are finished for more complete description
- Update devDependencies

## [4.12.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.12.0...v4.12.1) - 2025-05-14

- BUG FIX: Update `playoffStatus` logic to avoid `undefined` errors
- Updates to scroll logic courtesy of @mikeyounge
- Lint style changes

## [4.12.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.11.3...v4.12.0) - 2025-05-08

- **NEW FEATURE**: Added `showPlayoffStatus` config option to display playoff series information (only works with `stacked` and `stackedWithLogos` views)
- Update devDependencies

## [4.11.3](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.11.2...v4.11.3) - 2025-05-06

- More channel logos
- Refine logging
- Add scroll delay to reduce judder
- Update devDependencies

## [4.11.2](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.11.1...v4.11.2) - 2025-04-27

- BUG FIX: Sort the array so that scores are displayed in the order requested in user's config
- BUG FIX: Correct error where yesterday's scores would not erase at requested time

## [4.11.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.11.0...v4.11.1) - 2025-04-26

- BUG FIX:  English Premier League display was broken
- Switch back to `npm install` (from `npm ci`) on recommendation from sdetweil
- Some new channel logos

## [4.11.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.10.0...v4.11.0) - 2025-04-25

- **NEW FEATURE**: Added the config options to set a module height and scroll through scores when they don't fit within that height.  (Thank you to @mikeyounge)
- **NEW FEATURE**: Added Major League Rugby
- **NEW FEATURE**: `ALL_SOCCER`, `SOCCER_ON_TV`, and `RUGBY` will now display with the specific league header
- BUG FIX: Fixed rugby leagues
- Change install and update instructions to `npm ci` to avoid recreating `package-lock.json` on user installs
- Update README to include instructions on dymanically creating config options
- Update devDependencies
- Some new channel logos

## [4.10.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.9.0...v4.10.0) - 2025-04-20

- **NEW FEATURE**: Added UEFA Women's Champions League
- BUG FIX: Resolve error where today's games would not appear after rolloverHours was passed
- BUG FIX: Remove error thrown when MLB game does not have 'freeGame' key because, e.g., game postponed
- Change the way channel logos rotate when multiple broadcasts available
- Correct LA Galaxy and LAFC abbreviations
- Change so that SOCCER_ON_TV will not display completed games
- Some new channel logos

## [4.9.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.8.1...v4.9.0) - 2025-04-17

- **NEW FEATURE**: Added UEFA Conference League (UEFA_EUROPA_CONF)

## [4.8.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.8.0...v4.8.1) - 2025-04-17

- BUG FIX: Scores would disappear when a league with no games was before a league with games in config
- Some new channel logos

## [4.8.0](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.7.1...v4.8.0) - 2025-04-16

- **NEW FEATURE**: Added `localMarkets` config option to display broadcasts from your local markets
- **NEW FEATURE**: Added `logos_custom` folder where users can place their own custom team logos that will not be overwritten when updating the module
- **NEW FEATURE**: Added `ALL_SOCCER` league option
- **NEW FEATURE**: Added `SOCCER_ON_TV` league option
- **NEW FEATURE**: Added `RUGBY` league option
- Some new channel logos

## [4.7.1](https://github.com/dathbe/MMM-MyScoreboard/compare/v4.7.0...v4.7.1) - 2025-04-13

- Bug fix: Fix logic error that would cause yesterday's scores to continue displaying if there were no today's scores

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

- Update `moment`
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
- Update `directory-tree`
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

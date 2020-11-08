# slipstream

An addon manger for World of Warcraft

![](https://github.com/varexi/slipstream/raw/master/docs/images/screenshot.png)

slipstream is an alternative to the official Curse addon client in early development. I'm doing this as a hobby project to learn Vue.js and Electron development, so I wouldn't count on serious support or exhaustive feature list. If you're looking for something a little more complete, I'd suggest [WowUp](https://wowup.io).

Apparently the company that acquired CurseForge is, at some point in the future, planning to remove the APIs on which third-party addon managers depend, so this app may have a short lifespan.

## Installing
Working on creating installers. To build/run from source:

```npm install```

```npm run electron:build```

## Things that work
- Search, install, and update from CurseForge.
- Bulk update.
- Deletion.
- Retail and Classic.
- Windows and OSX.

## Things that don't work yet
- Addon detection: slipstream can only see the addons it has installed.
- Integration with other addon repositories: TukUI, WowInterface, etc.
- Detection of modified addons.
- Alternate (alpha/beta) CurseForge release channels.
# Apex-bot
A Discord bot for Apex Legends

Welcome to the apex-bot repository! The apex-bot currently interfaces the [Apex-Tab API](https://github.com/Tabwire/ApexTab-API) which provides the functionality to search for Apex Legends players and check their game stats. The discord bot makes it easier to check how your friends and teammates are doing in the game and gets information about their played games, kills, damage, skill level and rank.

# Project setup

To setup the apex-bot project please follow the steps below:
- make sure you have the latest stable version of node.js installed. You can download it from https://nodejs.org
- clone the apex-bot repository
- go to the [Discord developer portal](https://discordapp.com/developers/applications/) and setup a new bot account. [Here is a good tutorial how to do it](https://discordpy.readthedocs.io/en/rewrite/discord.html)
- after the bot is created, copy your bot's secret token and paste it in the auth.json file of the apex-bot project.
- run the following command `npm install`
- when all npm packages are installed you can type `node bot.js` and it would start the bot.

You can add your bot to any Discord server you administrate with this link 
```
https://discordapp.com/oauth2/authorize?client_id={OAUTH_CLIENTID}&scope=bot&permissions={PERMISSIONS_INTEGER} 
```
The OAUTH_CLIENTID placeholder stands for your custom Client ID that is generated for your application by the Discord developer portal.
The PERMISSIONS_INTEGER specifies bot's permissions and it can be generated from the Discord developer portal.

# Bot commands

In discord you can type the following to check what commands does the bot support.
```
!apex-bot help
```

To check Apex Legends user statistics please use the following command:
```
!apex-bot {platform} {username}
```
The {platform} placeholder supports the following values:
pc
psn
xbl

Put the Apex Legends username in the {username} placeholder.
Example:
```
!apex-bot pc nrg_dizzy
```

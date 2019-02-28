const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json');
const fetch = require('node-fetch');

// Configure the console logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize the Discord Bot
const bot = new Discord.Client();

/**
 * Checks the Apex Legends stats by aid number.
 * It prints the stats in a Discord rich embed message.
 * 
 * @param {*} aid - a unique identifier for an Apex Legends account
 * @param {*} message - a discord message object that has the received command and has the ability to send messages.
 */
function matchAid(aid, message) {
    if (!aid) {
        return Promise.resolve();
    }

    return fetch(`https://apextab.com/api/player.php?aid=${aid}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error(`Unable to get data for aid: ${aid} and username: ${username}!`);
        })
        .then(json => {
            const date = new Date();
            const embed = new Discord.RichEmbed()
                .setTitle('API Results')
                .setAuthor('Apex Legends API')
                .setColor(0x00AE86)
                .setDescription('These are the stats only for the currently selected legend. For better results please enable your "kills" and "played games" banners.')
                .setThumbnail(`${json.avatar}`)
                .addField('Name', `${json.name}`)
                .addField('Platform', `${json.platform}`)
                .addField('Skill ratio', `${json.skillratio}`)
                .addField('Selected legend', `${json.legend}`)
                .addField('Level', `${json.level}`)
                .addField('Kills', `${json.kills}`)
                .addField('Headshots', `${json.headshots}`)
                .addField('Matches', `${json.matches}`)
                .addField('Global rank', `${json.globalrank}`)
                .addBlankField(true)
                .setFooter(`This is a temporary snapshot of your Apex character state - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);

            message.channel.send({embed});
            
            Promise.resolve(message);
        })
        .catch(e => logger.error(e));
};

function showHelp(message) {
    const helpRegex = /^\!apex-bot (help|commands)(.*)?$/;
    const helpMatches = message.content.match(helpRegex);
    if (helpMatches) {
        const embed = new Discord.RichEmbed();
        embed.setTitle('Apex bot commands:')
            .setColor(0x00AE86)
            .setDescription('You can get info about your currently selected legend and some additional global stats by using the following commands')
            .addField('!apex-bot {platform} {apexusername}', 
            `
            where the {platform} placeholder can be:
            pc
            psn
            xbl

            and the {apexusername} placeholder is your apex user name.

            Example:
            !apex-bot pc cracker4o
            `)
            .addBlankField(true)
            .addField('!apex-bot aid={aid}', 'This command can show the Apex Legends stats for a user by their AID.')
            .addBlankField(true)
            .setFooter(
            `Please keep in mind that the Apex API is limited and shows the stats for your currently selected legend.
            It might not show all of your stats if they are hidden by banners in the game.`)
        message.channel.send({embed});
    }
}

/**
 * This event is triggered when the apex-bot is connected to the Discord server.
 */
bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(`${bot.user.username}-(${bot.user.id})`);
});

/**
 * This event is triggered when the apex-bot receives a message.
 */
bot.on('message', function (message) {
    showHelp(message);

    const aidRegex = /^\!apex-bot aid=(.*)$/;
    const matchesAid = message.content.match(aidRegex);

    if (matchesAid) {
        const aid = matchesAid[1];
        return matchAid(aid, message);
    }

    const regex = /^\!apex-bot (pc|psn|xbl) (.*)$/;
    const matches = message.content.match(regex);
    if (!matches) {
        return;
    }

    const platform = matches[1];
    const username = matches[2];
    const discovery = fetch(`https://apextab.com/api/search.php?platform=${platform}&search=${username}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }

            message.channel.send(`Unable to retrieve Apex data for username: ${username} and platform: ${platform}`);
            
            throw new Error('Unable to retrieve the response data');
        })
        .then(json => {
            if (json.totalresults === 0) {
                message.channel.send(`No results found for user: ${username} and platform: ${platform}`);
                throw new Error(`No results found for user - ${username}`);
            }

            if (json.totalresults > 1) {
                let resultsTable = `
                            There are more than 1 result from your search.
                            Please use the command:
                                !apex-bot aid={aid}
                            To get the results about a user from the list.
                            =================================================================`;

                json.results.forEach(result => {
                    resultsTable += `
                            Name: ${result.name} 
                            Platform: ${result.platform} 
                            Level: ${result.level}
                            Legend: ${result.legend}
                            Kills: ${result.kills}
                            aid: ${result.aid}
                            =================================================================`;
                });

                // All discord bots have a maximum message length of 2000 characters.
                message.channel.send(resultsTable.substring(0, 1999));

                return Promise.resolve();
            }

            return json.results[0].aid;
        })
        .catch(e => logger.error(e));

    discovery.then(aid => {
        return matchAid(aid, message);
    }).catch(e => logger.error(e));
});

// Login the apex-bot to all registered Discord servers.
bot.login(auth.token);
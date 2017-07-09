/* Roofus - A Slack Chat Bot for Code Camp 2017 */

// required modules
var Botkit = require('botkit');
var os = require('os');

// check for a Slack API Token
if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
} else {
    console.log('Roofus will be using token [' + process.env.token + ']');
}


// set up controller and bot
var controller = Botkit.slackbot({debug: true});
var bot = controller.spawn({token: process.env.token}).startRTM();

controller.hears(['hello', 'hi'], 'message,direct_message', function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], 'direct_message,direct_mention,mention', function(bot, message) {
    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,
        ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.');
});

/**
 * 
 * @param {*} uptime 
 * @return {*}
 */
function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

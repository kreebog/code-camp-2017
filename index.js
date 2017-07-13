/* Roofus - A Slack Chat Bot for Code Camp 2017 */

// check for a Slack API Token
if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
} else {
    console.log('Roofus will be using token [' + process.env.token + ']');
}

// required modules
var Botkit = require('botkit');
var os = require('os');
var dictionary = require('./dictionary.json');

// set up controller and bot
// var controller = Botkit.slackbot({debug: true});
var controller = Botkit.slackbot();
var bot = controller.spawn({token: process.env.token}).startRTM();

controller.hears('', 'message,direct_message,mention,ambient', function(bot, message) {
    console.log('Message: ' + message.ts, message.channel, message.user, message.text);

    // get user name, if possible
    controller.storage.users.get(message.user, function(err, user) {
    7    if (!user || !user.name) {
            bot.api.users.info({user: message.user}, function(err, response) {
                controller.storage.users.save(response.user, function(err) {
                    if (err) {
                        console.log('Error Saving User:' + err);
                    } else {
                        console.log('User Stored: ' + response.user.name);
                    }
                });
            });
        }
    });
});

controller.hears('[hi, hello, hey there]', 'message,direct_message,mention,ambient', function(bot, message) {
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
            bot.api.users.info({user: message.user}, function(err, response) {
                controller.storage.users.save(response.user, function(err) {
                    if (err) {
                        console.log('Error Saving User:' + err);
                        bot.reply(message, 'Hey there.');
                    } else {
                        bot.reply(message, 'Hello ' + response.user.name + '!!');
                    }
                });
            });
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
 * @param {*} values
 * @param {*} text
 * @return {boolean}
 */
function isCategory(values, text) {
    if (text == 'hi') {
        return true;
    } else {
        return false;
    }
}

/**
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

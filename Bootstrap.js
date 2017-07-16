'use strict';

/*
 *
 * ==========================================================
 * WARNING -  WARNING - WARNING - WARNING - WARNING - WARNING
 * ==========================================================
 * 
 *               KIDS: DO NOT CHANGE THIS FILE
 
 * ==========================================================
 * WARNING -  WARNING - WARNING - WARNING - WARNING - WARNING
 * ==========================================================
 * 
 */ 

// Set some basic variables
var sourceFile = 'Bootstrap.js'; // helpful for using with logging functions!

// load the logger
var Logger = require('./LogHelper.js'); // simple logging wrapper

// enable debug logging and make our first log entry!
Logger.debugEnabled = true;
Logger.debug(sourceFile, '', 'LogHelper initialized, loading base modules...');

// Load required modules
var fs = require('fs'); // file system - allows reading and writing files

var SlackBot = require('slackbots'); // the main SlackBots API module

// This is the file you'll be working in! 
var CodeCamp = require('./CodeCamp'); // load the Code Camp Module

// stores users and channels available on this team
var slackUsers = [];
var slackChannels = [];

// Creates a new instance of the Slackbots API using the API Token and Name set in your bot's Personality File
var Bot = new SlackBot({
    token: CodeCamp.botData.apiTokenParts.join('-'),
    name: CodeCamp.botData.name.botName,
});

/*  
 * =================================
 *   EVENT HANDLING STARTS HERE
 * =================================
 */

Bot.on('start', function() {
    Logger.debug(sourceFile, 'Bot.on(start)', 'Bot has logged in.');
    CodeCamp.logged_in(Bot);
});

Bot.on('message', function(data) {
    var user = '';
    var channel = '';
    var message = '';

    Logger.debug(sourceFile, 'Bot.on(message)', 'Message recieved.  Type: ' + data.type);

    // get the user's name
    if (data.user && data.user != CodeCamp.botData.name.botName) {
        user = getUserNameById(data.user);
    }

    // get the channel name
    if (data.channel) {
        channel = getChannelNameById(data.channel);
    }

    // set a local text reference 
    if (data.text) {
        message = data.text;
    }

    // send events to CodeCamp module based on message type
    switch (data.type) {
        case 'error':
            Logger.error(sourceFile, 'Bot.on(message)', '!!SLACK ERROR!! :: Exiting Application :: Code=' + data.error.code + ', MSG=' + data.error.msg);
            process.exit(data.error.code);
        case 'hello':
            Logger.info(sourceFile, 'Bot.on(message)', 'Successfully connected to Slack!');
            break;
        case 'message':
            // bail out if user is the message sender    
            if (user != CodeCamp.botData.name.name) {
                if (message == CodeCamp.botData.killPhrase) {
                    CodeCamp.shutdown_recieved(message, channel, user, Bot);
                    setTimeout(cleanUpAndExit, 2500);
                }

                if (message.indexOf('?') > 0) {
                    CodeCamp.question_recieved(message, channel, user, Bot);
                } else {
                    CodeCamp.message_recieved(data.text, channel, user, Bot);
                }
            }

            break;
        case 'presence_change':
            break;
        case 'reconnect_url':
            // experimental, do not use
            break;
        case 'user_typing':
            break;
        default:
            Logger.debug(sourceFile, 'Bot.on(message)', 'Unhandled Message Type: ' + data.type);
            break;
    }
});

/**
 * If UID/Name match not found in local array, gets full
 * user list from Slack team and updates the array with missing 
 * values. 
 * 
 * @param {*} userId 
 * @return {string} userName (or empty if not found)
 */
function getUserNameById(userId) {
    var userName = searchUserArray(userId);

    if (userName == '') {
        Logger.debug(sourceFile, 'getUserNameById()', 'UserID ' + userId + ' not found in cache.  Updating array...');

        var allUsers = Bot.getUsers();
        // didn't find the user, so let's refresh the array
        for (var n = 0; n < allUsers._value.members.length; n++) {
            var uId = allUsers._value.members[n].id;
            var uName = allUsers._value.members[n].name;

            // while we're here, add any missing users to the array
            if (searchUserArray(uId) == '') {
                slackUsers.push({'id': uId, 'name': uName});
                Logger.debug(sourceFile, 'getUserNameById()', 'Added user ' + uName + ' (' + uId + ') to cache.');
            }

            // check for match and set return value
            if (uId == userId) {
                Logger.debug(sourceFile, 'getUserNameById()', 'User Found: ' + uName + ' (' + uId + ')');
                userName = uName;
            }
        }
    }

    return userName;
}

/**
 * Scans the local slackUsers array for a user with matching ID and returns the user's name
 * @param {*} userId 
 * @return {string} userName (or empty)
 */
function searchUserArray(userId) {
    for (var x = 0; x < slackUsers.length; x++) {
        if (slackUsers[x].id == userId) {
            return slackUsers[x].name;
        }
    }
    return '';
}


/**
 * Scans the local slackUsers array for a user with matching ID and returns the user's name
 * @param {*} userId 
 * @return {string} userName (or empty)
 */
function searchChannelArray(userId) {
    for (var x = 0; x < slackChannels.length; x++) {
        if (slackChannels[x].id == userId) {
            return slackChannels[x].name;
        }
    }
    return '';
}

/**
 * If CID/Name match not found in local array, gets full
 * channel list from Slack team and updates the array with missing 
 * values. 
 * 
 * @param {*} channelId 
 * @return {string} channelName (or empty if not found)
 */
function getChannelNameById(channelId) {
    var channelName = searchChannelArray(channelId);

    if (channelName == '') {
        Logger.debug(sourceFile, 'getChannelNameById()', 'channelID ' + channelId + ' not found in cache.  Updating array...');

        var allChannels = Bot.getChannels();
        // didn't find the channel, so let's refresh the array
        for (var n = 0; n < allChannels._value.channels.length; n++) {
            var cId = allChannels._value.channels[n].id;
            var cName = allChannels._value.channels[n].name;

            // while we're here, add any missing channels to the array
            if (searchChannelArray(cId) == '') {
                slackChannels.push({'id': cId, 'name': cName});
                Logger.debug(sourceFile, 'getChannelNameById()', 'Added channel ' + cName + ' (' + cId + ') to cache.');
            }

            // check for match and set return value
            if (cId == channelId) {
                Logger.debug(sourceFile, 'getChannelNameById()', 'Channel Found: ' + cName + ' (' + cId + ')');
                channelName = cName;
            }
        }
    }

    return channelName;
}

function cleanUpAndExit() {
    var data = JSON.stringify(CodeCamp.botData, null, '\t');

    // backup the bot file first...
    fs.writeFileSync('data/bot.json.bak.' + Date.now(), fs.readFileSync('data/bot.json'));

    // then save the bot data currently in memory
    fs.writeFileSync('data/bot.updated.json', data);

    process.exit(0);
}

/*
var lastChannel = ''; // Used to remember the last channel a message came from

// basic message handler to pass over to CodeCamp module
Bot.on('message', function(data) {
    if (data.type == 'message' && data.username != botConfig.name.botName) {
        var lowerMsg = data.text.toLowerCase();

        if (lowerMsg == 'shutdown secret') {
            process.exit(0);
        }

        Bot.postMessage(data.channel, CodeCamp.messageReceived(lowerMsg));
        lastChannel = data.channel;

        // reset the boredom timer
        createBoredomTimer();
    }
});

// timer for boredom detection
var boredomTimer = null;
function boredomHandler() {
    Bot.postMessage(lastChannel, CodeCamp.youAreBored());

    boredomTimer = setTimeout(boredomHandler, 8000);
}

function createBoredomTimer() {
    if (null != boredomTimer) {
        clearTimeout(boredomTimer);
        boredomTimer = null;
    }

    if ('' != lastChannel) {
        boredomTimer = setTimeout(boredomHandler, 8000);
    }
}

// bot.on('start', function() {
//     // bot.postMessageToChannel('general', CodeCampModule.botName + ' reporting...');
// });

// process.exit(0);
*/

'use strict';

delete require.cache['LogHelper.js'];
delete require.cache['CodeCamp.js'];
delete require.cache['data/bot.json'];



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
    if (data.user) {
        user = getNameFromId('users', slackUsers, data.user);
    }

    // bail out if message was posted by our bot
    if (user == CodeCamp.botData.name.botName) {
        return;
    }

    // get the channel name
    if (data.channel) {
        channel = getNameFromId('channels', slackChannels, data.channel);
    }

    // set a local text reference 
    message = data.text;

    // send events to CodeCamp module based on message type
    switch (data.type) {
        case 'error':
            Logger.error(sourceFile, 'Bot.on(message)', '!!SLACK ERROR!! :: Exiting Application :: Code=' + data.error.code + ', MSG=' + data.error.msg);
            process.exit(data.error.code);
        case 'hello':
            Logger.info(sourceFile, 'Bot.on(message)', 'Successfully connected to Slack!');

            createBoredomTimer();
            break;
        case 'message':
            // bail out if user is the message sender    
            if (user != CodeCamp.botData.name.name) {
                if (message == CodeCamp.botData.killPhrase) {
                    CodeCamp.shutdown_recieved(message, channel, user, Bot);
                    setTimeout(shutdown, 2500);
                }

                if (message.indexOf('?') > 0) {
                    CodeCamp.question_recieved(message, channel, user, Bot);
                } else {
                    CodeCamp.message_recieved(data.text, channel, user, Bot);
                }
            }

            createBoredomTimer();
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
 * Checks local [users | channels] array for matching id, queries slack server
 * and updates local array(s) if a matching id is not found.
 *  * 
 * @param {*} cache (users || channels)
 * @param {*} array 
 * @param {*} id 
 * @return {string} name
 */
function getNameFromId(cache, array, id) {
    var name = searchArray(array, id);
    var list;

    if (name == '') {
        Logger.debug(sourceFile, 'getNameById()', 'id [' + id + '] not found in cache.  Updating array...');

        // matching name not found, scan the appriorate array
        if (cache == 'users') {
            list = Bot.getUsers();
        } else if (cache == 'channels') {
            list = Bot.getChannels();
        } else {
            Logger.error(sourceFile, 'getNameById()', new Error('Invalid cache name, try "users" or "channels"'));
            return '';
        }

        var subArray = (cache == 'users' ? list._value.members : list._value.channels);

        for (var n = 0; n < subArray.length; n++) {
            var _id = (cache == 'users' ? list._value.members[n].id : list._value.channels[n].id);
            var _name = (cache == 'users' ? list._value.members[n].name : list._value.channels[n].name);

            // while we're here, add any missing users to the array
            if (searchArray(array, _id) == '') {
                array.push({'id': _id, 'name': _name});
                Logger.debug(sourceFile, 'getNameFromId()', 'Added ' + cache + ': Name=' + _name + ', ID=' + _id + ' to cache.');
            }

            // check for match and set return value
            if (_id == id) {
                Logger.debug(sourceFile, 'getNameFromId()', cache + ' Found: Name=' + _name + ', ID=' + _id);
                name = _name;
            }
        }
    }

    return name;
}

/**
 * Scans the local array [slackUsers | slackChannels] for the given ID and 
 * returns the matching name or an empty string if no match found.
 * 
 * @param {Array} array 
 * @param {string} id 
 * @return {string} name (or empty)
 */
function searchArray(array, id) {
    for (var x = 0; x < array.length; x++) {
        if (array[x].id == id) {
            return array[x].name;
        }
    }
    return '';
}

// timer for boredom detection
var boredomTimer = null;
function boredomHandler() {
    boredomTimer = setTimeout(boredomHandler, CodeCamp.botData.general.boredomTimer);
    CodeCamp.bored(Bot);
}

function createBoredomTimer() {
    if (null != boredomTimer) {
        clearTimeout(boredomTimer);
        boredomTimer = null;
    }

    boredomTimer = setTimeout(boredomHandler, CodeCamp.botData.general.boredomTimer);
}

/**
 * Backup and save data and exit the process. 
 */
function shutdown() {
    var data = JSON.stringify(CodeCamp.botData, null, '\t');

    // backup the bot file first...
    fs.writeFileSync('data/bot.json.bak.' + Date.now(), fs.readFileSync('data/bot.json'));
    Logger.debug(sourceFile, 'shutdown()', 'data/bot.json file backed up.');

    // then save the bot data currently in memory
    fs.writeFileSync('data/bot.json', data);
    Logger.debug(sourceFile, 'shutdown()', 'data/bot.json updated with current data.');

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

// bot.on('start', function() {
//     // bot.postMessageToChannel('general', CodeCampModule.botName + ' reporting...');
// });

// process.exit(0);
*/

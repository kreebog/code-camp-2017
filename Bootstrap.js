'use strict';

// Set some basic variables
const fileName = 'Bootstrap.js'; // helpful for using with logging functions!

// load the logger
var Logger = require('./LogHelper.js'); // simple logging wrapper

// Load required modules
Logger.debug(fileName, '', 'LogHelper initialized, loading base modules...');
// var FileSystem = require('fs'); // file system - allows reading and writing files
var SlackBot = require('slackbots'); // the main SlackBots API module
// var CodeCamp = require('./CodeCamp'); // load the Code Camp Module

// Load your bot's personality file...
Logger.debug(fileName, '', 'Base modules loaded, loading bot personality: ./Personalities/Roofus.json' );
var botData = require('data/bot');


/* Create a Slackbot! 
*
* You need an API Key - 
*      1) Go to: https://my.slack.com/services/new/bot 
*      2) Give your bot a name
*      3) Click "Add Integration"
*      4) Copy the "API Token" into your bot's Personality file in three parts, leaving out the dashes.  
*         a) Something like this: "apiTokenParts": ["xoxb", "1234567890123", "IMajIguK0hZLnmb9tpzbPG7S"]
*      5) Choose an Image or Emoji for your bot
*      6) Give your bot a First and Last Name
*      7) Describe your bot's purpose
*/ 

// Creates a new instance of the Slackbots API using the API Token and Name set in your bot's Personality File
var Bot = new SlackBot({
    token: botData.apiTokenParts.join('-'),
    name: botData.name.botName,
});

Bot.on('start', function() {
    Bot.postMessageToChannel('jd-testing', 'I\'m here!');
});

Bot.on('message', function(data ) {
    Logger.debug(fileName, 'Bot.on(message)', 'Message recieved.  Type:  ' + data.type);

    switch (data.type) {
        case 'hello':
            Logger.info(fileName, 'Bot.on(message)', 'Successfully connected to Slack!');
            break;
        case 'user_typing':
            break;
        case 'message':
            break;
        case 'reconnect_url':
            // experimental, do not use
            break;
        case 'presence_change':
            break;
        case 'error':
            Logger.error(fileName, 'Bot.on(message)', 'Slack Error Message: ' + data.text);
        default:
            Logger.debug(fileName, 'Bot.on(message)', 'Unhandled Message Type: ' + data.type);
            break;
    }
});

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

'use strict';

// Load required modules
var FileSystem = require('fs'); // file system - allows reading and writing files
var SlackBot = require('slackbots'); // the main SlackBots API module
var Logger = require('./logger.js'); // simple logging wrapper

// Set some basic variables
const fileName = 'Bootstrap.js'; // helpful for using with logging functions!

Logger.debug(fileName, '', 'Base modules loaded & Logger initialized.' );

// Load your bot's personality file...
Logger.debug(fileName, '', 'Loading Personality: ./Personalities/Roofus.json' );
var roofus = require('./Personalities/Roofus.json');
Logger.debug(fileName, '', 'Personality loaded.' );

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

// Creates a new instance of the Slackbots API using the API Token and Name 
// set in your bot's Personality File
var roofus = new SlackBot({
    token: roofus.config.apiKeyParts.join('-'),
    name: roofus.name.botName,
});

// basic message handler to pass over to CodeCamp module
var lastChannel = '';
roofus.on('message', function(data) {
    if (data.type == 'message' && data.username != 'test') {
        var lowerMsg = data.text.toLowerCase();

        if (lowerMsg == 'shutdown secret') {
            process.exit(0);
        }

        roofus.postMessage(data.channel, CodeCampModule.messageReceived(lowerMsg));
        lastChannel = data.channel;

        // reset the boredom timer
        createBoredomTimer();
    }
});

// timer for boredom detection
var boredomTimer = null;
function boredomHandler() {
    roofus.postMessage(lastChannel, CodeCampModule.youAreBored());

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

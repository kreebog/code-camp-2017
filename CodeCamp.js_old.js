'use strict';

// --------------------------------------
// BASIC SETUP STUFF - DON'T CHANGE THIS
// --------------------------------------
var fileName = 'CodeCamp.js'; // helpful for using with logging functions!
var Logger = require('./LogHelper.js'); // simple logging wrapper

Logger.debug(fileName, '', 'Base modules loaded, loading bot personality: /data/bot.json' );
var botData = require('./data/bot');
var botName = botData.name.botName;

// --------------------------------------
// BEGIN CODING HERE
// --------------------------------------

/* Create a Slackbot! 
*
*  You need an API Key - 
*      1) Go to: https://my.slack.com/services/new/bot 
*      2) Give your bot a name
*      3) Click "Add Integration"
*      4) Copy the "API Token" into your bot's Personality file in three parts, leaving out the dashes.  
*         a) Something like this: "apiTokenParts": ["xoxb", "1234567890123", "IMajIguK0hZLnmb9tpzbPG7S"]
*      5) Choose an Image or Emoji for your bot
*      6) Give your bot a First and Last Name
*      7) Describe your bot's purpose
*/ 

function messageReceived(msg) {
    if (msg.includes('what')) {
        return 'Why not?';
    } else {
        return 'Fascinating...';
    }
}

function youAreBored(data) {
    return '...';
}

// --------------------------------------
// END CODING HERE
// --------------------------------------



















exports.messageReceived = messageReceived;
exports.youAreBored = youAreBored;
exports.botName = botName;

'use strict';
// --------------------------------------
// BASIC SETUP STUFF - DON'T CHANGE THIS
// --------------------------------------

var sourceFile = 'CodeCamp.js'; // helpful for using with logging functions!
var Logger = require('./LogHelper.js'); // simple logging wrapper

Logger.debug(sourceFile, '', 'Base modules loaded, loading bot personality: /data/bot.json' );
var botData = require('./data/bot');

module.exports = {
    botData: botData,

    message_recieved: function(message, channelName, userName, Slack) {
        var response = '';
        botData.history.lastChannel = channelName;

        Logger.debug(sourceFile, 'message_recieved', 'Channel: ' + channelName + ' User: ' + userName + ' Message: ' + message);

        if (message == 'hi') {
            response = phraseAtRandom(botData.responses.greeting);
        }

        response = response.replace('${user}', userName);

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },

    question_recieved: function(question, channelName, userName, Slack) {
        var response = '';
        botData.history.lastChannel = channelName;

        Logger.debug(sourceFile, 'question_recieved', 'Channel: ' + channelName + ' User: ' + userName + ' Question: ' + question);

        if (question.toLowerCase() == 'what time is it?') {
            var date = new Date();
            response = '@' + userName + ', right now it\'s ' + date.toLocaleTimeString();
        }

        if (question.toLowerCase() == 'what day is it?') {
            var date = new Date();
            var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            response = '@' + userName + ', are you lost?  Today is ' + days[date.getDay()] + '...';
        }

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },

    bored: function(Slack) {
        var channelName = getLastChannel();
        var date = new Date();

        Logger.debug(sourceFile, 'bored', 'Channel: ' + channelName);
        
        botData.history.lastConnect = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, phraseAtRandom(botData.phrases.bored));
    },

    logged_in: function(Slack) {
        var response = '';
        var channelName = getLastChannel();

        botData.history.lastConnect = Date.now();

        // select a phrase from the bot's data file
        response = phraseAtRandom(botData.phrases.join.login);

        // send message to the server
        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },

    shutdown_recieved: function(message, channelName, userName, Slack) {
        var channelName = getLastChannel();
        var response = phraseAtRandom(botData.phrases.leave.logout);

        botData.general.postCount++;
        Slack.postMessageToUser(userName, 'Kill message recieved, I\'m shutting down now.');

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },
};

/**
 * 
 * @param {*} array 
 * @return {string} Randomly selected phrase from the given array.
 */
function phraseAtRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * @return {string} Last channel used, or 'general' if none found
 */
function getLastChannel() {
    var channel = botData.history.lastChannel;
    if (channel == '') {
        channel = 'general';
        botData.history.lastChannel = channel;
    }

    return channel;
}

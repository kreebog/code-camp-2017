'use strict';
// --------------------------------------
// BASIC SETUP STUFF - DON'T CHANGE THIS
// --------------------------------------

var sourceFile = 'CodeCamp.js'; // helpful for using with logging functions!
var Logger = require('./LogHelper.js'); // simple logging wrapper

Logger.debug(sourceFile, '', 'Base modules loaded, loading bot personality: /data/bot.json' );
var botData = require('./data/bot');
// var botName = botData.name.botName;

module.exports = {
    _botData: botData,

    message_recieved: function(message, channelName, userName, slack) {
        var response = '';

        Logger.debug(sourceFile, 'message_recieved', 'Channel: ' + channelName + ' User: ' + userName + ' Message: ' + message);

        if (message == 'hi') {
            response = randomlyPickFromArray(botData.greetingResponses);
        }

        response = response.replace('${user}', userName);
        slack.postMessageToChannel(channelName, response);
    },

    question_recieved: function(question, channelName, userName, slack) {
        var response = '';

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

        slack.postMessageToChannel('jd-testing', response);
    },




};

function randomlyPickFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

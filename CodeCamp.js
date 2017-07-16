'use strict';
// --------------------------------------
// BASIC SETUP STUFF - DON'T CHANGE THIS
// --------------------------------------

var sourceFile = 'CodeCamp.js'; // helpful for using with logging functions!
var Logger = require('./LogHelper.js'); // simple logging wrapper

Logger.debug(sourceFile, '', 'Base modules loaded, loading bot personality: /data/bot.json' );
var botData = require('./data/bot');

// local variables for keeping track of state
var lastQuestion = '';

var knowledge = {
    color: '',
    realName: '',
};

module.exports = {
    botData: botData,

    message_received: function(message, channelName, userName, Slack) {
        var response = '';
        botData.history.lastChannel = channelName;

        Logger.debug(sourceFile, 'message_received', 'Channel: ' + channelName + ' User: ' + userName + ' Message: ' + message);

        // did we get a response to a question?
        if ('' != lastQuestion) {
            var lastQuestionStore = lastQuestion;
            lastQuestion = ''; // reset the last question we asked to erase state
            switch (lastQuestionStore) {
                case 'color': {
                    response = 'That\'s great! I am a big fan of the color ' + message + ' too!';

                    knowledge.color = message;

                    if ('' == knowledge.realName) {
                        response += ' What\'s your real name?';
                        lastQuestion = 'realName';
                    }
                    break;
                }
                case 'realName': {
                    response = 'Glad to meet you, ' + message + '. That\'s a great name!';
                    knowledge.realName = message;
                    break;
                }
                case 'confirmKnowledge': {
                    if (message.toLowerCase().includes('no')) {
                        response = 'Oh dear! Sorry about that. I\'ve forgotten everything I know about you now!';
                        knowledge.color = '';
                        knowledge.realName = '';
                    } else {
                        response = 'Thanks for confirming that I have a good memory!';
                    }
                    break;
                }
            }
        } else {
            // not currently waiting for a response to a question, so get a conversation going!
            if (message == 'hi') {
                response = phraseAtRandom(botData.responses.greeting);
            } else {
                if ('' == knowledge.color) {
                    response = 'Oh, hey! I don\'t think we\'ve met. What\'s your favorite color?';
                    lastQuestion = 'color';
                } else {
                    if ('' == knowledge.realName) {
                        response = 'Hi there again, ' + userName + '!';
                    } else {
                        response = 'Hi there again, ' + knowledge.realName + '!';
                    }
                }
            }
        }

        response = response.replace('${user}', userName);

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },

    question_received: function(question, channelName, userName, Slack) {
        var response = '';
        botData.history.lastChannel = channelName;

        Logger.debug(sourceFile, 'question_received', 'Channel: ' + channelName + ' User: ' + userName + ' Question: ' + question);

        if (question.toLowerCase() == 'what time is it?') {
            var date = new Date();
            response = '@' + userName + ', right now it\'s ' + date.toLocaleTimeString();
        }

        if (question.toLowerCase() == 'what day is it?') {
            var date = new Date();
            var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            response = '@' + userName + ', are you lost?  Today is ' + days[date.getDay()] + '...';
        }

        var lc = question.toLowerCase();
        if (lc.includes('what') && lc.includes('about') && lc.includes('me')) {
            response = 'Well, your favorite color is ' + knowledge.color + ' and your real name is '
                + knowledge.realName + '. Right?';
            lastQuestion = 'confirmKnowledge';
        } else if (lc.includes('what') && lc.includes('my') && lc.includes('color')) {
            if (knowledge.color != '') {
                response = 'Your favorite color? Why ' + knowledge.color + ' of course!';
            } else {
                response = 'I don\'t think we\'ve talked about favorite colors yet. What is you favorite color if you don\'t mind me asking?';
                lastQuestion = 'color';
            }
        } else if (lc.includes('what') && lc.includes('my') && lc.includes('name')) {
            if (knowledge.realName != '') {
                response = 'Your real name is ' + knowledge.realName + '...or so you\'ve told me!';
            } else {
                response = 'I\'m afraid I only know you by your handle, ' + userName + '. Do you have another name you go by?';
                lastQuestion = 'realName';
            }
        }

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },

    bored: function(Slack) {
        var channelName = getLastChannel();

        Logger.debug(sourceFile, 'bored', 'Channel: ' + channelName);

        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, phraseAtRandom(botData.phrases.bored));
    },

    logged_in: function(Slack) {
        var response = '';
        var channelName = getLastChannel();
        var date = new Date();

        botData.history.lastConnect = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        // select a phrase from the bot's data file
        response = phraseAtRandom(botData.phrases.join.login);

        // send message to the server
        botData.general.postCount++;
        Slack.postMessageToChannel(channelName, response);
    },

    shutdown_received: function(message, channelName, userName, Slack) {
        var channelName = getLastChannel();
        var response = phraseAtRandom(botData.phrases.leave.logout);

        botData.general.postCount++;
        Slack.postMessageToUser(userName, 'Kill message received, I\'m shutting down now.');

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
        channel = botData.general.defaultChannel != '' ? botData.general.defaultChannel : 'general';
        botData.history.lastChannel = channel;
    }

    return channel;
}

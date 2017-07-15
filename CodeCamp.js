'use strict';

// --------------------------------------
// BEGIN CODING HERE
// --------------------------------------

var botName = 'Slack Bot 1';

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

// Get DOM elements
const sentimentWindow = document.getElementById('sentiment-window');
const gigerMeterBar = document.getElementById('giger-meter-bar');
const sentimentScoreElement = document.getElementById('sentiment-score');

let sentimentScore = 0;

// Function to update the Giger-Meter
function updateGigerMeter(score) {
    gigerMeterBar.style.width = `${score}%`;
    sentimentScoreElement.innerText = score.toFixed(2);
}

// Function to handle received messages from the background script
function handleReceivedMessage(message) {
    try {
        if (message.type === 'sentimentScoreUpdate') {
            sentimentScore = message.score;
            updateGigerMeter(sentimentScore);
        } else if (message.type === 'error') {
            sentimentWindow.innerHTML = `<p>Error: ${message.error}</p>`;
        }
    } catch (error) {
        console.error(`Error handling received message: ${error}`);
    }
}

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleReceivedMessage(message);
});

// Function to send a message to the background script
function sendMessage(message) {
    try {
        chrome.runtime.sendMessage(message);
    } catch (error) {
        console.error(`Error sending message: ${error}`);
    }
}

// Function to score a message
function scoreMessage(message) {
    try {
        sendMessage({ type: 'scoreMessage', message: message });
    } catch (error) {
        console.error(`Error scoring message: ${error}`);
    }
}

// Function to handle a new Twitch chat message
function handleChatMessage(message) {
    try {
        scoreMessage(message);
    } catch (error) {
        console.error(`Error handling chat message: ${error}`);
    }
}

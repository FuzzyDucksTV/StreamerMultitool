// Get HTML elements
const toxicityWindow = document.getElementById('toxicity-window');
const toxicityMeterBar = document.getElementById('toxicity-meter-bar');
const toxicityScoreElement = document.getElementById('toxicity-score');

let toxicityScore = 0;

// Function to update the Toxicity-Meter
function updateToxicityMeter(score) {
    if (!toxicityMeterBar || !toxicityScoreElement) {
        console.error('Unable to locate required HTML elements');
        return;
    }
    toxicityMeterBar.style.width = `${score}%`;
    toxicityScoreElement.innerText = score.toFixed(2);
}

// Function to handle received messages from the background script
function handleReceivedMessage(message) {
    if (message.type === 'toxicityScoreUpdate') {
        toxicityScore = message.score;
        updateToxicityMeter(toxicityScore);
    } else if (message.type === 'error') {
        toxicityWindow.innerHTML = `<p>Error: ${message.error}</p>`;
    }
}

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleReceivedMessage(message);
});

// Function to send a message to the background script
function sendMessage(message) {
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.error('Unable to send message to background script');
        return;
    }
    chrome.runtime.sendMessage(message);
}

// Function to score a message
function scoreMessage(message) {
    sendMessage({ type: 'scoreMessage', message: message });
}

// Function to handle a new Twitch chat message
function handleChatMessage(message) {
    scoreMessage(message);
}

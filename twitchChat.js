// Get HTML elements
const chatWindow = document.getElementById('chat-window');

// Function to handle a new Twitch chat message
function handleChatMessage(message) {
    try {
        // Send the chat message to the background scripts for analysis
        chrome.runtime.sendMessage({ type: 'analyzeMessage', message: message });
    } catch (error) {
        console.error(`Error handling chat message: ${error}`);
    }
}

// Listener for messages from the background scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.type === 'sentimentScoreUpdate') {
            // Update the sentiment analysis UI with the new score
            updateSentimentUI(message.score);
        } else if (message.type === 'toxicityScoreUpdate') {
            // Update the toxicity detection UI with the new score
            updateToxicityUI(message.score);
        }
    } catch (error) {
        console.error(`Error handling received message: ${error}`);
    }
});

// Function to update the sentiment analysis UI
function updateSentimentUI(score) {
    try {
        const sentimentWindow = document.getElementById('sentiment-window');
        const gigerMeterBar = document.getElementById('giger-meter-bar');
        const sentimentScoreElement = document.getElementById('sentiment-score');

        gigerMeterBar.style.width = `${score}%`;
        sentimentScoreElement.innerText = score.toFixed(2);
    } catch (error) {
        console.error(`Error updating sentiment UI: ${error}`);
    }
}

// Function to update the toxicity detection UI
function updateToxicityUI(score) {
  try {
      const toxicityWindow = document.getElementById('toxicity-window');
      const toxicityMeterBar = document.getElementById('toxicity-meter-bar');
      const toxicityScoreElement = document.getElementById('toxicity-score');

      toxicityMeterBar.style.width = `${score}%`;
      toxicityScoreElement.innerText = score.toFixed(2);
  } catch (error) {
      console.error(`Error updating toxicity UI: ${error}`);
  }
}

// Import required modules
import Perspective from 'perspective-api-client';
import axios from 'axios';
import './twitchChatHandler.js';

// Initialize Perspective API client
const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_API_KEY });

// Variables for Netlify API
let netlifyAPIKey = process.env.NETLIFY_API_KEY;

// Function to fetch API keys from Netlify
async function fetchAPIKeys() {
    try {
        const response = await axios.get('https://api.netlify.com/api/v1/keys', {
            headers: {
                'Authorization': `Bearer ${netlifyAPIKey}`
            }
        });
        twitchClientID = response.data.twitchClientID;
        twitchAccessToken = response.data.twitchAccessToken;
    } catch (error) {
        console.error('Error fetching API keys from Netlify:', error);
        displayError('Error fetching API keys from Netlify: ' + error.message);
    }
}

// Function to display error messages
function displayError(message) {
    chrome.runtime.sendMessage({ type: 'error', message: message });
}

// Fetch API keys when the extension is loaded
fetchAPIKeys().catch(error => {
    console.error('Error fetching API keys from Netlify:', error);
    displayError('Error fetching API keys from Netlify: ' + error.message);
});

// Function to analyze sentiment of a message
async function analyzeSentiment(message) {
    try {
        const result = await perspective.analyze({ text: message });
        return result.attributeScores.TOXICITY.summaryScore.value;
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        displayError('Error analyzing sentiment: ' + error.message);
    }
}

// Function to handle Twitch chat messages
function handleChatMessage(message) {
    const sentimentScore = analyzeSentiment(message);
    // Update sentiment score in the UI
    chrome.runtime.sendMessage({ type: 'updateSentiment', score: sentimentScore });
    // If the message is toxic, initiate user-defined actions
    if (sentimentScore > 0.5) {
        chrome.storage.sync.get(['responseOptions'], function (data) {
            if (data.responseOptions.notifyModerators) {
                // Notify chat moderators
            }
            if (data.responseOptions.sendPrivateMessage) {
                // Send a private message to the sender
            }
            if (data.responseOptions.browserNotification) {
                // Send a browser notification
            }
        });
    }
}

// Function to monitor Twitch chat in real-time
function monitorTwitchChat() {
    // Connect to Twitch chat using the Twitch API
    // Handle incoming chat messages with handleChatMessage()
}

// Fetch API keys when the extension is loaded
fetchAPIKeys();

// Monitor Twitch chat when the extension is loaded
monitorTwitchChat();

const WebSocket = require('ws');

class TwitchChat {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 1000; // start with 1 second
    this.maxReconnectInterval = 60000; // max of 1 minute
  }

  connect() {
    this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    this.ws.on('open', () => {
      console.log('Connected to Twitch IRC');
      this.ws.send('PASS oauth:your_oauth_token');
      this.ws.send('NICK your_bot_username');
      this.ws.send('JOIN #channel_to_join(this can be dynamically fetched to use the same channel as the users channel they are streaming to.');
      this.reconnectInterval = 1000; // reset reconnect interval on successful connection
    });

    this.ws.on('message', (data) => {
      console.log(data);
      if (data.startsWith('PING')) {
        this.ws.send('PONG :tmi.twitch.tv');
      }
    });

    this.ws.on('error', (err) => {
      console.error('WebSocket error observed:', err);
    });

    this.ws.on('close', (code, reason) => {
      console.log(`WebSocket connection closed: ${code} ${reason}`);
      this.reconnect();
    });
  }

  reconnect() {
    console.log(`Attempting to reconnect in ${this.reconnectInterval / 1000} seconds...`);
    setTimeout(() => {
      this.connect();
      this.reconnectInterval *= 2;
      if (this.reconnectInterval > this.maxReconnectInterval) {
        this.reconnectInterval = this.maxReconnectInterval;
      }
    }, this.reconnectInterval);
  }
}

const twitchChat = new TwitchChat();
twitchChat.connect();

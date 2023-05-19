// Import required modules
const tmi = require('tmi.js');
const axios = require('axios');

// Variables for Netlify API
let netlifyAPIKey = 'YOUR_NETLIFY_API_KEY';

// Function to fetch API keys from Netlify
async function fetchAPIKeys() {
    try {
        const response = await axios.get('https://api.netlify.com/api/v1/keys', {
            headers: {
                'Authorization': `Bearer ${netlifyAPIKey}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching API keys from Netlify:', error);
        throw error;
    }
}

// Function to get the current Twitch channel
async function getCurrentChannel(token, clientId) {
    try {
        const response = await fetch('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Client-Id': clientId
            }
        });
        const data = await response.json();
        return data.data[0].login;
    } catch (error) {
        console.error('Error getting current Twitch channel:', error);
        throw error;
    }
}

// Function to handle Twitch chat messages
function handleChatMessage(channel, userstate, message, self) {
    // Ignore messages from the bot itself
    if (self) return;

    // Send the message to the background script for analysis
    chrome.runtime.sendMessage({ type: 'analyzeMessage', message: message });
}

// Function to monitor Twitch chat in real-time
async function monitorTwitchChat() {
    try {
        // Fetch API keys
        const keys = await fetchAPIKeys();

        // Get the current Twitch channel
        const channel = await getCurrentChannel(keys.twitchAccessToken, keys.twitchClientID);

        // Create a Twitch client
        const client = new tmi.Client({
            options: { debug: true },
            connection: {
                secure: true,
                reconnect: true
            },
            identity: {
                username: keys.twitchClientID,
                password: keys.twitchAccessToken
            },
            channels: [channel]
        });

        // Connect to Twitch
        client.connect().catch(error => {
            console.error('Error connecting to Twitch:', error);
        });

        // Listen for chat messages
        client.on('message', handleChatMessage);
    } catch (error) {
        console.error('Error setting up Twitch chat monitoring:', error);
    }
}

// Monitor Twitch chat when the script is loaded
monitorTwitchChat();

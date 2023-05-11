const twitchClientId = '<YOUR_TWITCH_CLIENT_ID>';
const twitchClientSecret = '<YOUR_TWITCH_CLIENT_SECRET>';
const huggingFaceApiKey = '<YOUR_HUGGING_FACE_API_KEY>';
import TwitchJs

// Function to authenticate with the Twitch API and listen for chat messages
async function listenToTwitchChat() {
  const twitch = new TwitchJs({ clientId: twitchClientId, clientSecret: twitchClientSecret });

  // Authenticate with Twitch API
  await twitch.authenticate();
  const { token } = twitch.getAuthentication();

  // Join the Twitch chat
  const { chat } = new TwitchJs({ token, username: 'AI_StreamMate' });
  await chat.connect();
  await chat.join('<TWITCH_CHANNEL_NAME>');

  // Listen for chat messages
  chat.on('PRIVMSG', handleTwitchChatMessage);
}

// Function to handle incoming Twitch chat messages
async function handleTwitchChatMessage(message) {
  const sentimentScore = await analyzeSentiment(message.message);

  // Update the sentiment meter and track top/bottom commenters
  chrome.runtime.sendMessage({ type: 'updateSentiment', score: sentimentScore, user: message.user });

  // Detect toxic messages and notify the user
  if (sentimentScore < -0.5) {
    chrome.runtime.sendMessage({ type: 'toxicMessage', user: message.user, message: message.message });
  }
}

// Function to analyze the sentiment of a chat message using Hugging Face API
async function analyzeSentiment(message) {
  const response = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${huggingFaceApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: message })
  });

  const responseData = await response.json();
  const sentimentScore = responseData.scores[0];
  return sentimentScore;
}

listenToTwitchChat();

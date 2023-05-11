document.addEventListener('DOMContentLoaded', async () => {
  // Get the current theme from storage
  const theme = await getTheme();
  document.body.classList.toggle('dark-mode', theme === 'dark');

  // Set up event listener for theme toggle
  document.getElementById('themeToggle').addEventListener('click', async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('dark-mode', newTheme === 'dark');
    await chrome.storage.sync.set({ theme: newTheme });
    chrome.runtime.sendMessage({ type: 'toggleTheme', theme: newTheme });
  });

  // Update the sentiment meter and top/bottom commenters list
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'updateSentiment') {
      updateSentimentMeter(request.score);
      updateCommentersList(request.user, request.score);
    }
  });
});

// Function to get the current theme from storage
async function getTheme() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('theme', ({ theme }) => {
      resolve(theme || 'light');
    });
  });
}

// Function to update the sentiment meter
function updateSentimentMeter(score) {
  const sentimentMeter = document.getElementById('sentimentMeter');
  const currentScore = parseFloat(sentimentMeter.value);
  const newScore = currentScore + score;
  sentimentMeter.value = newScore.toFixed(2);
}

// Function to update the top/bottom commenters list
function updateCommentersList(user, score) {
  const commenters = document.getElementById('commenters');
  const listItem = document.createElement('li');
  listItem.textContent = `${user}: ${score.toFixed(2)}`;
  if (score >= 0) {
    commenters.prepend(listItem);
  } else {
    commenters.append(listItem);
  }
}

// popup.js

<!-- popup.js -->
  document.addEventListener('DOMContentLoaded', async () => {
  const themeToggle = document.getElementById('themeToggle');
  const loginWithTwitch = document.getElementById('loginWithTwitch');
  const saveButton = document.getElementById('save');
  const checkboxes = document.querySelectorAll('.feature-list input[type="checkbox"]');
  const sentimentAnalysisCheckbox = document.getElementById('performanceAnalysis');

  // Load current settings from storage
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(null, resolve);
  });

  // Apply the current theme
  document.body.classList.toggle('dark-mode', settings.theme === 'dark');

  // Set the initial state of the checkboxes
  checkboxes.forEach((checkbox) => {
    checkbox.checked = settings[checkbox.id] || false;
  });

  // Dark mode toggle
  themeToggle.addEventListener('change', async () => {
    document.body.classList.toggle('dark-mode');
    await chrome.storage.sync.set({ theme: themeToggle.checked ? 'dark' : 'light' });
  });

  // Login with Twitch
  loginWithTwitch.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'loginWithTwitch' });
  });

  // Save settings
  saveButton.addEventListener('click', async () => {
    const newSettings = Array.from(checkboxes).reduce((acc, checkbox) => {
      acc[checkbox.id] = checkbox.checked;
      return acc;
    }, {});

    try {
      await chrome.storage.sync.set(newSettings);
      console.log('Settings saved.');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  });

  // Show sentiment analysis UI when the checkbox is checked
  sentimentAnalysisCheckbox.addEventListener('change', () => {
    if (sentimentAnalysisCheckbox.checked) {
      window.open('sentiment_analysis.html', '_blank');
    }
  });
});

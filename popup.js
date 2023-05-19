document.addEventListener('DOMContentLoaded', (event) => {
  // Feature-specific elements
  const features = {
    sentiment: {
      toggle: document.getElementById('sentimentToggle'),
      button: document.getElementById('sentimentButton'),
      options: document.getElementById('sentimentOptions'),
      sensitivity: document.getElementById('sentimentSensitivity'),
      sensitivityValue: document.getElementById('sentimentSensitivityValue'),
      showTopScorers: document.getElementById('showTopScorers'),
      showBottomScorers: document.getElementById('showBottomScorers'),
      leaderboardDuration: document.getElementById('leaderboardDuration')
    },
    toxicity: {
      toggle: document.getElementById('toxicityToggle'),
      button: document.getElementById('toxicityButton'),
      options: document.getElementById('toxicityOptions'),
      message: document.getElementById('toxicityMessage'),
      modNotification: document.getElementById('toxicityModNotification'),
      selfNotification: document.getElementById('toxicitySelfNotification'),
      modMessage: document.getElementById('toxicityModMessage'),
      selfMessage: document.getElementById('toxicitySelfMessage')
    }
  };

  // Dark mode toggle element
  const themeToggle = document.getElementById('themeToggle');

  // Load preferences from storage
  chrome.storage.sync.get(['preferences'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('Error loading preferences:', chrome.runtime.lastError);
      return;
    }
    const preferences = data.preferences;

    if (preferences) {
      // Apply theme
      if (preferences.darkMode) {
        document.getElementById('theme-style').href = 'dark.css';
        themeToggle.checked = true;
      } else {
        document.getElementById('theme-style').href = 'light.css';
        themeToggle.checked = false;
      }

      // Load feature preferences
      for (let feature in preferences) {
        if (preferences[feature].enabled) {
          features[feature].toggle.checked = true;
        } else {
          features[feature].toggle.checked = false;
        }

        for (let option in preferences[feature].options) {
          let input = features[feature][option];
          if (input.type === 'checkbox') {
            input.checked = preferences[feature].options[option];
          } else if (input.type === 'select-one') {
            input.value = preferences[feature].options[option];
          } else {
            input.value = preferences[feature].options[option];
          }
        }
      }
    }
  });

  // Save preferences to storage
  function savePreferences() {
    let preferences = {
      darkMode: themeToggle.checked
    };

    for (let feature in features) {
      preferences[feature] = {
        enabled: features[feature].toggle.checked,
        options: {}
      };

      for (let option in features[feature]) {
        if (option !== 'toggle' && option !== 'button' && option !== 'options') {
          let input = features[feature][option];
          if (input.type === 'checkbox') {
            preferences[feature].options[option] = input.checked;
          } else {
            preferences[feature].options[option] = input.value;
          }          
        }
      }
    }

    chrome.storage.sync.set({ preferences }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving preferences:', chrome.runtime.lastError);
      }
    });
  }

  // Toggle theme when themeToggle is clicked
  themeToggle.addEventListener('change', () => {
    document.getElementById('theme-style').href = themeToggle.checked ? 'dark.css' : 'light.css';
    savePreferences();
  });

  // Twitch login button element
  const loginButton = document.getElementById('loginButton');

  // Send message to background script to initiate Twitch login process when loginButton is clicked
  loginButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: 'initiateOAuth'});
  });

  // Add event listeners for feature toggles and buttons
  for (let feature in features) {
    // Toggle feature options when feature button is clicked
    features[feature].button.addEventListener('click', () => {
      let display = features[feature].options.style.display;
      features[feature].options.style.display = (display === 'block') ? 'none' : 'block';
      savePreferences();  // Save the preferences after a change
    });

    // Save preferences when feature toggle is clicked
    features[feature].toggle.addEventListener('change', savePreferences);

    // Add event listeners for feature options
    for (let option in features[feature]) {
      if (option !== 'toggle' && option !== 'button' && option !== 'options') {
        let input = features[feature][option];
        if(input){
          input.addEventListener('input', savePreferences);  // Save the preferences after a change
       
        }
      }
    }
  }

  // In popup.js, after the page loads
  chrome.storage.sync.get(['accessToken'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('Error loading access token:', chrome.runtime.lastError);
      return;
    }

    if (data.accessToken) {
      // If access token exists, user is logged in
      loginButton.style.display = 'none';
      // Display a logout button or a message to indicate user is logged in, for example:
      let logoutButton = document.createElement('button');
      logoutButton.innerText = 'Logout';
      document.getElementById('twitchAuth').appendChild(logoutButton);

      logoutButton.addEventListener('click', () => {
        chrome.storage.sync.remove('accessToken', function() {
            if (chrome.runtime.lastError) {
                console.error('Error removing access token:', chrome.runtime.lastError);
            } else {
                // Refresh the popup window to reflect the logout
                window.location.reload();
            }
        });
    });
    }
  });
});


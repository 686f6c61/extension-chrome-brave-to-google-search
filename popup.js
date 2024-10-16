document.getElementById('changeButton').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0];
    if (currentTab.url.startsWith('https://search.brave.com/search?')) {
      let url = new URL(currentTab.url);
      let query = url.searchParams.get('q');
      let newUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      chrome.tabs.update(currentTab.id, {url: newUrl}, function() {
        if (chrome.runtime.lastError) {
          document.getElementById('status').textContent = 'Error: ' + chrome.runtime.lastError.message;
        } else {
          document.getElementById('status').textContent = 'Cambiado a Google';
        }
      });
    } else {
      document.getElementById('status').textContent = 'No es Brave Search';
    }
  });
});

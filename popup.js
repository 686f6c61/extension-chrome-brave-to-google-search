// Función para actualizar el estado con icono y clase apropiados
function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('status');
  const statusContainer = document.querySelector('.status-container');
  
  // Eliminar clases anteriores
  statusElement.classList.remove('success', 'error', 'warning');
  statusContainer.classList.remove('pulse');
  
  // Configurar el icono y la clase según el tipo
  let icon = 'fa-info-circle';
  if (type === 'success') {
    icon = 'fa-check-circle';
    statusElement.classList.add('success');
  } else if (type === 'error') {
    icon = 'fa-exclamation-circle';
    statusElement.classList.add('error');
  } else if (type === 'warning') {
    icon = 'fa-exclamation-triangle';
    statusElement.classList.add('warning');
  }
  
  // Actualizar el contenido
  statusElement.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  
  // Añadir efecto de pulso para llamar la atención
  if (type === 'success' || type === 'error' || type === 'warning') {
    statusContainer.classList.add('pulse');
    setTimeout(() => statusContainer.classList.remove('pulse'), 2000);
  }
}

// Función para animar botones durante el proceso
function animateButtons(isProcessing = false, buttonId = null) {
  const buttons = document.querySelectorAll('.search-button');
  const iconMap = {
    'googleButton': '<i class="fab fa-google" style="color: #4285F4;"></i> Google',
    'duckduckgoButton': '<i class="fab fa-d-and-d" style="color: #DE5833;"></i> DuckDuckGo',
    'bingButton': '<i class="fab fa-microsoft" style="color: #008373;"></i> Bing',
    'openaiButton': '<i class="fas fa-robot" style="color: #10A37F;"></i> OpenAI'
  };
  
  if (isProcessing && buttonId) {
    // Desactivar todos los botones
    buttons.forEach(button => {
      button.disabled = true;
      button.style.backgroundColor = '#555555';
    });
    
    // Mostrar animación solo en el botón seleccionado
    const selectedButton = document.getElementById(buttonId);
    selectedButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  } else {
    // Restaurar todos los botones
    buttons.forEach(button => {
      button.innerHTML = iconMap[button.id];
      button.disabled = false;
      button.style.backgroundColor = '#212121';
    });
  }
}

// Detectar si estamos en una página de Brave Search al abrir el popup
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0];
    if (currentTab.url.startsWith('https://search.brave.com/search?')) {
      updateStatus('¿A qué motor deseas cambiar?', 'info');
    } else {
      updateStatus('No estás en Brave Search', 'warning');
      // Desactivar todos los botones
      document.querySelectorAll('.search-button').forEach(button => {
        button.disabled = true;
        button.style.backgroundColor = '#555555';
      });
    }
  });
});

// Función para cambiar el motor de búsqueda
function changeSearchEngine(engineName, engineUrl) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0];
    if (currentTab.url.startsWith('https://search.brave.com/search?')) {
      // Animar botones mientras se procesa
      const buttonId = {
        'Google': 'googleButton',
        'DuckDuckGo': 'duckduckgoButton',
        'Bing': 'bingButton',
        'OpenAI': 'openaiButton'
      }[engineName];
      
      animateButtons(true, buttonId);
      
      let url = new URL(currentTab.url);
      let query = url.searchParams.get('q');
      let newUrl = `${engineUrl}${encodeURIComponent(query)}`;
      
      // Pequeña demora para mostrar la animación
      setTimeout(() => {
        chrome.tabs.update(currentTab.id, {url: newUrl}, function() {
          if (chrome.runtime.lastError) {
            updateStatus('Error: ' + chrome.runtime.lastError.message, 'error');
            animateButtons(false);
          } else {
            updateStatus(`¡Cambiado a ${engineName} con éxito!`, 'success');
            setTimeout(() => {
              animateButtons(false);
            }, 1000);
          }
        });
      }, 500);
    } else {
      updateStatus('No estás en una página de Brave Search', 'warning');
    }
  });
}

// Manejar clics en cada botón
document.getElementById('googleButton').addEventListener('click', function() {
  changeSearchEngine('Google', 'https://www.google.com/search?q=');
});

document.getElementById('duckduckgoButton').addEventListener('click', function() {
  changeSearchEngine('DuckDuckGo', 'https://duckduckgo.com/?q=');
});

document.getElementById('bingButton').addEventListener('click', function() {
  changeSearchEngine('Bing', 'https://www.bing.com/search?q=');
});

document.getElementById('openaiButton').addEventListener('click', function() {
  changeSearchEngine('OpenAI', 'https://chat.openai.com/?q=');
});

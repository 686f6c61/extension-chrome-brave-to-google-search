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

// Función para animar el botón durante el proceso
function animateButton(isProcessing = false) {
  const button = document.getElementById('changeButton');
  
  if (isProcessing) {
    button.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #4285F4;"></i> Procesando...';
    button.disabled = true;
    button.style.backgroundColor = '#555555';
  } else {
    button.innerHTML = '<i class="fab fa-google" style="color: #4285F4;"></i> Cambiar a Google Search';
    button.disabled = false;
    button.style.backgroundColor = '#212121';
  }
}

// Detectar si estamos en una página de Brave Search al abrir el popup
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0];
    if (currentTab.url.startsWith('https://search.brave.com/search?')) {
      updateStatus('Listo para cambiar a Google Search', 'info');
    } else {
      updateStatus('No estás en Brave Search', 'warning');
      document.getElementById('changeButton').disabled = true;
      document.getElementById('changeButton').style.backgroundColor = '#555555';
    }
  });
});

// Manejar el clic en el botón
document.getElementById('changeButton').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0];
    if (currentTab.url.startsWith('https://search.brave.com/search?')) {
      // Animar el botón mientras se procesa
      animateButton(true);
      
      let url = new URL(currentTab.url);
      let query = url.searchParams.get('q');
      let newUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      // Pequeña demora para mostrar la animación
      setTimeout(() => {
        chrome.tabs.update(currentTab.id, {url: newUrl}, function() {
          if (chrome.runtime.lastError) {
            updateStatus('Error: ' + chrome.runtime.lastError.message, 'error');
            animateButton(false);
          } else {
            updateStatus('¡Cambiado a Google con éxito!', 'success');
            setTimeout(() => {
              animateButton(false);
            }, 1000);
          }
        });
      }, 500);
    } else {
      updateStatus('No estás en una página de Brave Search', 'warning');
    }
  });
});

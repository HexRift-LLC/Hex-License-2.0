document.addEventListener('DOMContentLoaded', function() {
  // Add fade-in animation to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
  
  // Initialize time-sensitive elements
  updateRelativeTimes();
  setInterval(updateRelativeTimes, 60000); // Update every minute
  
  // Enable tooltips if any
  initializeTooltips();
});

// Function to update relative time displays
function updateRelativeTimes() {
  const timeElements = document.querySelectorAll('.relative-time');
  timeElements.forEach(el => {
    const timestamp = new Date(el.getAttribute('data-time'));
    el.textContent = getRelativeTimeString(timestamp);
  });
}

// Initialize tooltips
function initializeTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  tooltipTriggers.forEach(el => {
    el.title = el.getAttribute('data-tooltip');
  });
}

// Helper function to display relative time
function getRelativeTimeString(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Copy to clipboard utility
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    showNotification('Failed to copy text', 'error');
    console.error('Failed to copy text: ', err);
  });
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Animate out after delay
  setTimeout(() => {
    notification.style.transform = 'translateY(-20px)';
    notification.style.opacity = '0';
    
    // Remove from DOM after animation
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: white;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    transform: translateY(-20px);
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  .notification-success {
    background-color: var(--success-color);
  }
  
  .notification-error {
    background-color: var(--error-color);
  }
  
  .notification-info {
    background-color: var(--primary-color);
  }
  
  .notification-warning {
    background-color: var(--warning-color);
  }
`;

document.head.appendChild(style);

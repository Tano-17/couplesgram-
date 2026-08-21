(function() {
  const HEART_EMOJI = '❤️';
  
  // Create a container for the hearts to keep the DOM clean
  const heartsContainer = document.createElement('div');
  heartsContainer.id = 'floating-hearts-container';
  heartsContainer.style.position = 'fixed';
  heartsContainer.style.top = '0';
  heartsContainer.style.left = '0';
  heartsContainer.style.width = '100vw';
  heartsContainer.style.height = '100vh';
  heartsContainer.style.pointerEvents = 'none';
  heartsContainer.style.zIndex = '9998'; // Just below high-level modals but above most content
  heartsContainer.style.overflow = 'hidden';
  document.body.appendChild(heartsContainer);

  function createHeart() {
    const heart = document.createElement('div');
    heart.innerText = HEART_EMOJI;
    
    // Randomize initial properties
    const startX = Math.random() * 100; // 0 to 100vw
    const fontSize = Math.random() * 20 + 15; // 15px to 35px
    const duration = Math.random() * 5 + 5; // 5s to 10s
    const opacity = Math.random() * 0.4 + 0.2; // 0.2 to 0.6
    
    heart.style.position = 'absolute';
    heart.style.left = `${startX}vw`;
    heart.style.bottom = '-50px'; // Start below screen
    heart.style.fontSize = `${fontSize}px`;
    heart.style.opacity = opacity;
    heart.style.userSelect = 'none';
    
    // Animation properties
    heart.style.transition = `transform ${duration}s linear, bottom ${duration}s linear, opacity ${duration}s ease-in-out`;
    
    heartsContainer.appendChild(heart);
    
    // Trigger animation in next frame
    requestAnimationFrame(() => {
      // Horizontal drift between -50px and 50px
      const drift = (Math.random() - 0.5) * 100;
      
      heart.style.bottom = '110vh'; // Float past top
      heart.style.transform = `translateX(${drift}px) rotate(${Math.random() * 360}deg)`;
      heart.style.opacity = '0'; // Fade out near top
    });
    
    // Clean up after animation finishes
    setTimeout(() => {
      if (heartsContainer.contains(heart)) {
        heartsContainer.removeChild(heart);
      }
    }, duration * 1000);
  }

  // Create hearts periodically
  setInterval(createHeart, 266); // 1 heart every 266ms (increased density)
})();

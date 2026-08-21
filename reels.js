// Global State for Reels View
const reelsState = {
  isGlobalMuted: true,
  likes: { 1: false, 2: false, 3: false, 4: false },
  saves: { 1: false, 2: false, 3: false, 4: false }
};

document.addEventListener('DOMContentLoaded', () => {
  initIntersectionObserver();
  initNavButtons();
  initEndlessScroll();
  
  // Auto-show next button on initial load (first reel is visible but no IntersectionObserver fired yet)
  setTimeout(() => {
    const nextBtn = document.getElementById('reel-next-btn');
    if (nextBtn) nextBtn.classList.add('visible');
  }, 300);
});

// ==========================================================================
// INTERSECTION OBSERVER FOR AUTO-PLAY / PAUSE
// ==========================================================================
function initIntersectionObserver() {
  const reelWrappers = document.querySelectorAll('.reel-wrapper');
  
  const observerOptions = {
    root: document.getElementById('reels-scroller'),
    rootMargin: '0px',
    threshold: 0.6 // Snapped item covers 60%+ of the container to count as active
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const media = entry.target.querySelector('.reel-video');
      const vinyl = entry.target.querySelector('.music-vinyl-thumbnail');
      const isVideo = media && media.tagName === 'VIDEO';
      
      if (entry.isIntersecting) {
        if (isVideo) {
          media.muted = reelsState.isGlobalMuted;
          const playPromise = media.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Autoplay prevented by browser. Muted play active.");
              media.muted = true;
              media.play();
            });
          }
        }
        
        if (vinyl) vinyl.classList.add('rotating');
        updateMuteIconVisuals(entry.target);
        updateNavArrowsVisibility(entry.target);
      } else {
        if (isVideo) {
          media.pause();
          media.currentTime = 0;
        }
        if (vinyl) vinyl.classList.remove('rotating');
      }
    });
  }, observerOptions);
  
  window.reelObserver = observer; // Save globally for endless scroll
  
  reelWrappers.forEach(wrapper => observer.observe(wrapper));
}

// ==========================================================================
// ENDLESS SCROLL MECHANICS (REELS)
// ==========================================================================
function initEndlessScroll() {
  const scroller = document.getElementById('reels-scroller');
  if (scroller) {
    scroller.addEventListener('scroll', () => {
      // Check if near bottom
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 500) {
        const wrappers = Array.from(scroller.querySelectorAll('.reel-wrapper'));
        if (wrappers.length > 0) {
          // Clone all reels and append to end to create infinite loop
          for (let i = 0; i < wrappers.length; i++) {
            if (wrappers[i]) {
              const clone = wrappers[i].cloneNode(true);
              // reset states if needed
              scroller.appendChild(clone);
              if (window.reelObserver) {
                window.reelObserver.observe(clone);
              }
            }
          }
        }
      }
    });
  }
}

// ==========================================================================
// FLOATING VERTICAL NAVIGATION CHEVRONS
// ==========================================================================
function initNavButtons() {
  const scroller = document.getElementById('reels-scroller');
  const prevBtn = document.getElementById('reel-prev-btn');
  const nextBtn = document.getElementById('reel-next-btn');
  
  if (prevBtn && scroller) {
    prevBtn.addEventListener('click', () => {
      scroller.scrollBy({ top: -scroller.clientHeight, behavior: 'smooth' });
    });
  }
  
  if (nextBtn && scroller) {
    nextBtn.addEventListener('click', () => {
      scroller.scrollBy({ top: scroller.clientHeight, behavior: 'smooth' });
    });
  }
}

// Scans wrappers to find the one centered/visible in the container
function getCurrentlyActiveReel() {
  const wrappers = document.querySelectorAll('.reel-wrapper');
  const scroller = document.getElementById('reels-scroller');
  const scrollerRect = scroller.getBoundingClientRect();
  
  let activeReel = null;
  let maxVisibility = 0;
  
  wrappers.forEach(wrapper => {
    const rect = wrapper.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, scrollerRect.bottom) - Math.max(rect.top, scrollerRect.top);
    if (visibleHeight > maxVisibility) {
      maxVisibility = visibleHeight;
      activeReel = wrapper;
    }
  });
  
  return activeReel;
}

function updateNavArrowsVisibility(activeReel) {
  const prevBtn = document.getElementById('reel-prev-btn');
  const nextBtn = document.getElementById('reel-next-btn');
  
  if (!activeReel || !prevBtn || !nextBtn) return;
  
  const isFirst = !activeReel.previousElementSibling;
  const isLast = !activeReel.nextElementSibling;
  
  if (isFirst) {
    prevBtn.classList.remove('visible');
  } else {
    prevBtn.classList.add('visible');
  }
  
  if (isLast) {
    nextBtn.classList.remove('visible');
  } else {
    nextBtn.classList.add('visible');
  }
}

// ==========================================================================
// MUTE / UNMUTE MECHANICS (GLOBAL OVERALL TOGGLE)
// ==========================================================================
function toggleMuteAll(event) {
  event.stopPropagation(); // Avoid double triggering
  reelsState.isGlobalMuted = !reelsState.isGlobalMuted;
  
  const videos = document.querySelectorAll('.reel-video');
  videos.forEach(video => {
    video.muted = reelsState.isGlobalMuted;
  });
  
  // Refresh mute icon states across all reel wrappers
  const wrappers = document.querySelectorAll('.reel-wrapper');
  wrappers.forEach(wrapper => {
    updateMuteIconVisuals(wrapper);
  });
}

function updateMuteIconVisuals(wrapper) {
  const onIcon = wrapper.querySelector('.mute-icon-on');
  const offIcon = wrapper.querySelector('.mute-icon-off');
  
  if (!onIcon || !offIcon) return;
  
  if (reelsState.isGlobalMuted) {
    onIcon.style.display = 'none';
    offIcon.style.display = 'block';
  } else {
    onIcon.style.display = 'block';
    offIcon.style.display = 'none';
  }
}

// ==========================================================================
// INTERACTION CLICKS (LIKE/SAVE)
// ==========================================================================
function toggleReelLike(id) {
  reelsState.likes[id] = !reelsState.likes[id];
  
  const wrapper = document.querySelector(`.reel-wrapper[data-reel-id="${id}"]`);
  const likeBtn = wrapper.querySelector('.reel-like');
  const outlineHeart = likeBtn.querySelector('.heart-outline');
  const filledHeart = likeBtn.querySelector('.heart-filled');
  const countLabel = likeBtn.querySelector('.action-label');
  
  // Parse base likes
  let currentLikes = parseInt(countLabel.textContent.replace('K', '').trim());
  
  if (reelsState.likes[id]) {
    outlineHeart.style.display = 'none';
    filledHeart.style.display = 'block';
    filledHeart.style.animation = 'heartBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    
    // Increment count label
    countLabel.textContent = (currentLikes + 1) + 'K';
    likeBtn.classList.add('liked');
  } else {
    outlineHeart.style.display = 'block';
    filledHeart.style.display = 'none';
    
    // Decrement count label
    countLabel.textContent = (currentLikes - 1) + 'K';
    likeBtn.classList.remove('liked');
  }
}

function toggleReelSave(id) {
  reelsState.saves[id] = !reelsState.saves[id];
  
  const wrapper = document.querySelector(`.reel-wrapper[data-reel-id="${id}"]`);
  const saveBtn = wrapper.querySelector('.reel-save');
  const outlineSave = saveBtn.querySelector('.save-outline');
  const filledSave = saveBtn.querySelector('.save-filled');
  
  if (reelsState.saves[id]) {
    outlineSave.style.display = 'none';
    filledSave.style.display = 'block';
  } else {
    outlineSave.style.display = 'block';
    filledSave.style.display = 'none';
  }
}

// ==========================================================================
// MESSAGES DRAWER COLLAPSIBLE TOGGLE
// ==========================================================================
function toggleMessagesDrawer() {
  const drawer = document.getElementById('messages-drawer');
  drawer.classList.toggle('expanded');
}

// ==========================================================================
// CAROUSEL PAGINATION (HORIZONTAL SWIPE)
// ==========================================================================
function updateReelPagination(track) {
  const scrollPos = track.scrollLeft;
  const slideWidth = track.clientWidth;
  
  // Prevent division by zero if not fully rendered
  if (slideWidth === 0) return;
  
  const currentIndex = Math.round(scrollPos / slideWidth);
  const wrapper = track.closest('.reel-wrapper');
  if (!wrapper) return;
  
  const dots = wrapper.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    if (index === currentIndex) {
      dot.style.background = 'white';
    } else {
      dot.style.background = 'rgba(255,255,255,0.5)';
    }
  });
}

// ==========================================================================
// BACKGROUND MUSIC TOGGLE
// ==========================================================================
let audioPlaying = false;
let firstInteraction = false;

function toggleReelsAudio() {
  const audio = document.getElementById('reels-audio');
  if (!audio) return;
  
  if (audioPlaying) {
    audio.pause();
    audioPlaying = false;
  } else {
    audio.play().catch(e => console.log('Audio play failed', e));
    audioPlaying = true;
  }
  
  // Update icons globally
  document.querySelectorAll('.audio-toggle-btn').forEach(btn => {
    const muteIcon = btn.querySelector('.mute-icon');
    const unmuteIcon = btn.querySelector('.unmute-icon');
    if (muteIcon && unmuteIcon) {
      if (audioPlaying) {
        muteIcon.style.display = 'none';
        unmuteIcon.style.display = 'block';
      } else {
        muteIcon.style.display = 'block';
        unmuteIcon.style.display = 'none';
      }
    }
  });
}

// Autoplay background music on first user interaction
document.addEventListener('click', () => {
  if (firstInteraction) return;
  firstInteraction = true;
  
  const audio = document.getElementById('reels-audio');
  if (audio && !audioPlaying) {
    audio.play().then(() => {
      audioPlaying = true;
      toggleReelsAudio(); // just to sync UI icons, we trigger a dummy toggle or sync
      toggleReelsAudio(); // double toggle to just sync states
    }).catch(e => {
      console.log('Audio autoplay prevented', e);
    });
  }
}, { once: true });

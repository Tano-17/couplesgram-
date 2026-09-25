// State tracker for liked/saved posts and current image slides
const appState = {
  posts: {
    1: { liked: false, saved: false, likes: 1482, currentSlide: 0, totalSlides: 2 },
    2: { liked: false, saved: false, likes: 3291, currentSlide: 0, totalSlides: 1 },
    3: { liked: false, saved: false, likes: 952, currentSlide: 0, totalSlides: 2 },
    4: { liked: false, saved: false, likes: 1104, currentSlide: 0, totalSlides: 1 }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initDoubleTapLike();
  initCarousels();
  initCommentInputs();
  initStoriesScroll();
  initEndlessScroll();
});

// ==========================================================================
// ENDLESS SCROLL MECHANICS (HOME & EXPLORE)
// ==========================================================================
function initEndlessScroll() {
  window.addEventListener('scroll', () => {
    // Check if we are near the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      
      // Home Feed Loop
      const feedColumn = document.querySelector('.feed-column');
      if (feedColumn) {
        const posts = Array.from(feedColumn.querySelectorAll('.post-card'));
        if (posts.length > 0) {
          // Clone all posts and append to bottom
          for (let i = 0; i < posts.length; i++) {
            if (posts[i]) {
              const clone = posts[i].cloneNode(true);
              // reset inline states or just append
              feedColumn.appendChild(clone);
              
              // Re-bind double-tap mechanics to new clone
              const mediaContainer = clone.querySelector('.post-media-container');
              if (mediaContainer) {
                mediaContainer.addEventListener('dblclick', (e) => {
                  const postId = clone.dataset.postId;
                  const bigHeart = clone.querySelector('.double-tap-heart');
                  if (bigHeart) {
                    bigHeart.classList.remove('animate');
                    void bigHeart.offsetWidth;
                    bigHeart.classList.add('animate');
                  }
                  if (!appState.posts[postId].liked) likePost(postId);
                });
              }
            }
          }
        }
      }
      
      // Explore Grid Loop
      const exploreGrid = document.querySelector('.explore-grid');
      if (exploreGrid) {
        const items = Array.from(exploreGrid.querySelectorAll('.explore-item'));
        if (items.length > 0) {
          // Clone all items and append
          for (let i = 0; i < items.length; i++) {
            if (items[i]) {
              const clone = items[i].cloneNode(true);
              exploreGrid.appendChild(clone);
            }
          }
        }
      }
      
    }
  });
}

// ==========================================================================
// DOUBLE-TAP LIKE MECHANICS
// ==========================================================================
function initDoubleTapLike() {
  const mediaContainers = document.querySelectorAll('.post-media-container');
  
  mediaContainers.forEach(container => {
    container.addEventListener('dblclick', (e) => {
      const card = container.closest('.post-card');
      const postId = card.dataset.postId;
      
      // Trigger floating white heart animation
      const heartOverlay = container.nextElementSibling; // overlay sibling or find inside
      const bigHeart = container.parentElement.querySelector('.double-tap-heart');
      
      if (bigHeart) {
        bigHeart.classList.remove('animate');
        // Trigger reflow to restart css animation
        void bigHeart.offsetWidth;
        bigHeart.classList.add('animate');
      }

      // If not liked already, perform like action
      if (!appState.posts[postId].liked) {
        likePost(postId);
      }
    });
  });
}

// Like toggle from footer icon
function toggleLike(postId) {
  if (appState.posts[postId].liked) {
    unlikePost(postId);
  } else {
    likePost(postId);
  }
}

function likePost(postId) {
  appState.posts[postId].liked = true;
  appState.posts[postId].likes += 1;
  
  updateLikeUI(postId);
}

function unlikePost(postId) {
  appState.posts[postId].liked = false;
  appState.posts[postId].likes -= 1;
  
  updateLikeUI(postId);
}

function updateLikeUI(postId) {
  const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
  if (!card) return;
  
  const likeBtn = card.querySelector('.like-btn');
  const outlineHeart = likeBtn.querySelector('.heart-icon-outline');
  const filledHeart = likeBtn.querySelector('.heart-icon-filled');
  const likeNumSpan = card.querySelector('.like-number');
  
  if (appState.posts[postId].liked) {
    likeBtn.classList.add('liked');
    outlineHeart.style.display = 'none';
    filledHeart.style.display = 'block';
  } else {
    likeBtn.classList.remove('liked');
    outlineHeart.style.display = 'block';
    filledHeart.style.display = 'none';
  }
  
  likeNumSpan.textContent = appState.posts[postId].likes.toLocaleString();
}

// ==========================================================================
// SAVE POST MECHANICS
// ==========================================================================
function toggleSave(postId) {
  const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
  if (!card) return;
  
  const saveBtn = card.querySelector('.save-btn');
  const outlineSave = saveBtn.querySelector('.save-icon-outline');
  const filledSave = saveBtn.querySelector('.save-icon-filled');
  
  const isSaved = appState.posts[postId].saved;
  appState.posts[postId].saved = !isSaved;
  
  if (appState.posts[postId].saved) {
    outlineSave.style.display = 'none';
    filledSave.style.display = 'block';
  } else {
    outlineSave.style.display = 'block';
    filledSave.style.display = 'none';
  }
}

// ==========================================================================
// IMAGE CAROUSEL SYSTEM (SCROLL-SNAP BASED)
// ==========================================================================
function initCarousels() {
  const tracks = document.querySelectorAll('.carousel-track');
  
  tracks.forEach(track => {
    const container = track.parentElement;
    const prevArrow = container.querySelector('.carousel-prev');
    const nextArrow = container.querySelector('.carousel-next');
    const dotsContainer = container.querySelector('.carousel-pagination');
    
    // Initial arrow and dots refresh
    updateSliderControls(track, prevArrow, nextArrow, dotsContainer);
    
    // Scroll listener to update dots/arrows dynamically (swipes or buttons)
    track.addEventListener('scroll', () => {
      updateSliderControls(track, prevArrow, nextArrow, dotsContainer);
    });
    
    // Arrow Click listeners
    if (prevArrow) {
      prevArrow.addEventListener('click', () => {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
      });
    }
    
    if (nextArrow) {
      nextArrow.addEventListener('click', () => {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      });
    }
  });
}

function updateSliderControls(track, prevArrow, nextArrow, dotsContainer) {
  const scrollLeft = track.scrollLeft;
  const clientWidth = track.clientWidth;
  const scrollWidth = track.scrollWidth;
  
  // 1. Toggle Prev Arrow Visibility
  if (prevArrow) {
    if (scrollLeft <= 5) {
      prevArrow.style.display = 'none';
    } else {
      prevArrow.style.display = 'flex';
    }
  }
  
  // 2. Toggle Next Arrow Visibility
  if (nextArrow) {
    const isAtEnd = (scrollLeft + clientWidth) >= (scrollWidth - 5);
    // If there is only 1 slide, scrollWidth equals clientWidth, so it's always at end.
    if (isAtEnd || scrollWidth <= clientWidth) {
      nextArrow.style.display = 'none';
    } else {
      nextArrow.style.display = 'flex';
    }
  }
  
  // 3. Update Dots Highlight
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const activeIndex = Math.round(scrollLeft / clientWidth);
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
}

// ==========================================================================
// STORIES SCROLLING SYSTEM
// ==========================================================================
function initStoriesScroll() {
  const storiesRow = document.getElementById('stories-row');
  const prevBtn = document.getElementById('story-prev-btn');
  const nextBtn = document.getElementById('story-next-btn');
  
  if (storiesRow) {
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        storiesRow.scrollBy({ left: 320, behavior: 'smooth' });
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        storiesRow.scrollBy({ left: -320, behavior: 'smooth' });
      });
    }
    
    // Toggle navigation buttons based on scroll position
    storiesRow.addEventListener('scroll', () => {
      const scrollLeft = storiesRow.scrollLeft;
      const maxScroll = storiesRow.scrollWidth - storiesRow.clientWidth;
      
      // Toggle Prev (Left) Button
      if (prevBtn) {
        if (scrollLeft <= 5) {
          prevBtn.style.opacity = '0';
          prevBtn.style.pointerEvents = 'none';
        } else {
          prevBtn.style.opacity = '1';
          prevBtn.style.pointerEvents = 'auto';
        }
      }
      
      // Toggle Next (Right) Button
      if (nextBtn) {
        if (scrollLeft >= maxScroll - 5) {
          nextBtn.style.opacity = '0';
          nextBtn.style.pointerEvents = 'none';
        } else {
          nextBtn.style.opacity = '1';
          nextBtn.style.pointerEvents = 'auto';
        }
      }
    });
  }
}

// ==========================================================================
// COMMENTS SYSTEM
// ==========================================================================
function initCommentInputs() {
  const commentBoxes = document.querySelectorAll('.comment-box');
  commentBoxes.forEach(box => {
    box.addEventListener('input', (e) => {
      const postId = e.target.id.split('-').pop();
      const postBtn = document.getElementById(`post-btn-${postId}`);
      
      if (e.target.value.trim().length > 0) {
        postBtn.classList.add('active');
      } else {
        postBtn.classList.remove('active');
      }
    });
  });
}

function focusCommentInput(postId) {
  const commentInput = document.getElementById(`comment-box-${postId}`);
  if (commentInput) {
    commentInput.focus();
  }
}

function handleCommentInput(event, postId) {
  if (event.key === 'Enter') {
    submitComment(postId);
  }
}

function submitComment(postId) {
  const input = document.getElementById(`comment-box-${postId}`);
  const text = input.value.trim();
  if (text.length === 0) return;
  
  const commentsList = document.getElementById(`comments-list-${postId}`);
  
  // Create comment DOM element
  const commentItem = document.createElement('div');
  commentItem.className = 'comment-item';
  
  const userSpan = document.createElement('span');
  userSpan.className = 'bold-text';
  userSpan.textContent = 'your_profile '; // Simulate current user
  
  const textNode = document.createTextNode(text);
  
  commentItem.appendChild(userSpan);
  commentItem.appendChild(textNode);
  
  commentsList.appendChild(commentItem);
  
  // Clear input
  input.value = '';
  
  // Disable submit button
  const postBtn = document.getElementById(`post-btn-${postId}`);
  postBtn.classList.remove('active');
}




// CAROUSEL MODAL LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const carouselBtn = document.getElementById('carousel-nav-btn');
    const carouselModal = document.getElementById('carousel-modal');
    const audio = document.getElementById('laufey-carousel-audio');
    const carousel3d = document.getElementById('carousel-3d-container');

    // All images — paths use forward slashes for web compatibility
    const allImages = [
        "assets/IMG-20251118-WA0078.jpg", "assets/IMG-20251118-WA0081.jpg",
        "assets/IMG-20251208-WA0016.jpg", "assets/IMG-20251230-WA0019.jpg",
        "assets/IMG-20260220-WA0016.jpg", "assets/IMG-20260303-WA0001.jpg",
        "assets/IMG-20260303-WA0005.jpg", "assets/IMG-20260303-WA0007.jpg",
        "assets/IMG-20260305-WA0011.jpg", "assets/IMG-20260305-WA0012.jpg",
        "assets/IMG-20260305-WA0013.jpg", "assets/IMG-20260423-WA0091.jpg",
        "assets/IMG-20260423-WA0092.jpg", "assets/IMG-20260505-WA0118.jpg",
        "assets/IMG-20260505-WA0150.jpg", "assets/IMG-20260505-WA0243.jpg",
        "assets/IMG-20260505-WA0250.jpg", "assets/IMG-20260505-WA0254.jpg",
        "assets/IMG-20260505-WA0258.jpg", "assets/IMG-20260505-WA0260.jpg",
        "assets/IMG-20260602-WA0005.jpg", "assets/IMG-20260731-WA0151.jpg",
        "assets/IMG-20260731-WA0152.jpg", "assets/IMG-20260731-WA0156.jpg",
        "assets/IMG_20250414_185437.jpg", "assets/IMG_20250414_185439.jpg",
        "assets/IMG_20251115_172733.jpg", "assets/IMG_20251115_172756.jpg",
        "assets/IMG_20251115_172800.jpg", "assets/IMG_20251115_172802.jpg",
        "assets/IMG_20251115_172816.jpg", "assets/IMG_20251207_201541.jpg",
        "assets/IMG_20251207_201549.jpg", "assets/IMG_20251225_172321.jpg",
        "assets/IMG_20251225_172325.jpg", "assets/IMG_20251225_172329.jpg",
        "assets/IMG_20251225_173249.jpg", "assets/IMG_20251225_173335.jpg",
        "assets/Snapchat-1682205913.jpg", "assets/Snapchat-352071190.jpg",
        "assets/Snapchat-603721540.jpg"
    ];

    function initCarousel() {
        if (!carousel3d) return;
        carousel3d.innerHTML = '';

        // Shuffle a copy so original order is preserved for potential re-init
        const shuffled = [...allImages].sort(() => Math.random() - 0.5);

        // Use ALL images — polygon math scales automatically
        const N = shuffled.length;
        const theta = 360 / N; // degrees between each image
        // Radius formula: r = (cellWidth/2) / tan(PI/N)
        const cellWidth = 220;
        const radius = Math.round((cellWidth / 2) / Math.tan(Math.PI / N));

        shuffled.forEach((imgPath, idx) => {
            const cell = document.createElement('div');
            cell.className = 'carousel__cell';
            cell.style.transform = `rotateY(${idx * theta}deg) translateZ(${radius}px)`;

            const imgEl = document.createElement('img');
            // imgPath already contains 'assets/' prefix — use directly
            imgEl.src = imgPath;
            imgEl.loading = 'lazy';
            imgEl.alt = 'Memory';

            cell.appendChild(imgEl);
            carousel3d.appendChild(cell);
        });
    }

    if (carouselBtn && carouselModal) {
        carouselBtn.addEventListener('click', (e) => {
            e.preventDefault();
            initCarousel();
            carouselModal.classList.remove('hidden');
            if (audio) {
                audio.play().catch(err => console.warn('Audio autoplay prevented:', err));
            }
        });
    }

    window.closeCarousel = function() {
        if (carouselModal) {
            carouselModal.classList.add('hidden');
        }
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };
});

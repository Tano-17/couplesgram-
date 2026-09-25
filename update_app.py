import glob
import json
import re

assets = [f for f in glob.glob('assets/*') if f.endswith('.jpg')]
assets_names = [f.split('\\\\')[-1].split('/')[-1] for f in assets]

js_array = json.dumps(assets_names)

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# I will replace the existing Carousel Modal Logic entirely.
new_logic = f'''
// CAROUSEL MODAL LOGIC
document.addEventListener('DOMContentLoaded', () => {{
    const carouselBtn = document.getElementById('carousel-nav-btn');
    const carouselModal = document.getElementById('carousel-modal');
    const audio = document.getElementById('laufey-carousel-audio');
    const carousel3d = document.getElementById('carousel-3d-container');

    const allImages = {js_array};

    function initCarousel() {{
        if (!carousel3d) return;
        carousel3d.innerHTML = '';
        
        // Shuffle images
        const shuffled = allImages.sort(() => Math.random() - 0.5);
        
        // We'll pick 12 images to form a 12-sided dodecagon to keep it reasonable
        const N = Math.min(12, shuffled.length);
        const images = shuffled.slice(0, N);
        
        const theta = 360 / N;
        const radius = Math.round((250 / 2) / Math.tan(Math.PI / N));
        
        images.forEach((img, idx) => {{
            const cell = document.createElement('div');
            cell.className = 'carousel__cell';
            
            // For mobile responsiveness, we'll use CSS custom properties to handle the radius
            cell.style.setProperty('--rotate-y', `${{idx * theta}}deg`);
            cell.style.setProperty('--translate-z', `${{radius}}px`);
            
            const imgEl = document.createElement('img');
            imgEl.src = 'assets/' + img;
            imgEl.loading = 'lazy';
            
            cell.appendChild(imgEl);
            carousel3d.appendChild(cell);
        }});
    }}

    if (carouselBtn && carouselModal) {{
        carouselBtn.addEventListener('click', (e) => {{
            e.preventDefault();
            initCarousel();
            carouselModal.classList.remove('hidden');
            if (audio) {{
                audio.play().catch(err => console.warn('Audio autoplay prevented:', err));
            }}
        }});
    }}

    window.closeCarousel = function() {{
        if (carouselModal) {{
            carouselModal.classList.add('hidden');
        }}
        if (audio) {{
            audio.pause();
            audio.currentTime = 0;
        }}
    }};
}});
'''

# Regex to remove old logic
# Since it starts with // CAROUSEL MODAL LOGIC
old_logic_pattern = re.compile(r'// CAROUSEL MODAL LOGIC.*', re.DOTALL)
js_code = old_logic_pattern.sub('', js_code)
js_code += new_logic

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print('app.js updated')

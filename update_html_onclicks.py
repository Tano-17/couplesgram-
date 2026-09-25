import re
import os

files = ['index.html', 'explore.html', 'reels.html']
for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove any existing onclick attribute we might have added so we don't duplicate
        content = re.sub(r'\s*onclick="openCarouselModal\(event\)"', '', content)
        
        # Add new onclick
        content = re.sub(r'(id="carousel-nav-btn")', r'\1 onclick="openCarouselModal(event)"', content)
        
        # Update close button
        content = content.replace('onclick="closeCarousel()"', 'onclick="closeCarouselModal()"')
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f + ' updated')

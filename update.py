import glob
import re
from bs4 import BeautifulSoup
import json

assets = [f for f in glob.glob('assets/*') if f.endswith('.jpg') or f.endswith('.mp4')]
assets_names = [f.split('\\\\')[-1].split('/')[-1] for f in assets]

carousel_html = '''
<div id="carousel-modal" class="hidden">
  <div class="carousel-close" onclick="closeCarousel()">&#x2715;</div>
  <div class="scene">
    <div class="carousel-3d" id="carousel-3d-container">
      <!-- Populated by JS -->
    </div>
  </div>
</div>
<audio id="laufey-carousel-audio" src="assets/Laufey_-_Carousel_(mp3.pm).mp3" loop></audio>
'''

for file in ['index.html', 'reels.html', 'explore.html']:
    with open(file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # Task 1: Mon Cœur
    for span in soup.find_all('span', class_='reel-username'):
        if span.string and 'lovebirds' in span.string.lower():
            span.string = 'Mon Cœur'
            
    # Task 2: Story ring images in index.html
    if file == 'index.html':
        story_items = soup.find_all('div', class_='story-item')
        for i, item in enumerate(story_items):
            img = item.find('img')
            if img and i < len(assets_names):
                img['src'] = 'assets/' + assets_names[i]
                
    # Task 4: Ensure carousel modal exists
    body = soup.find('body')
    if body and not soup.find(id='carousel-modal'):
        modal_soup = BeautifulSoup(carousel_html, 'html.parser')
        body.append(modal_soup)
    elif body and soup.find(id='carousel-modal'):
        # update it to have empty container
        c3d = soup.find(id='carousel-3d-container')
        if not c3d:
            old_c3d = soup.find('div', class_='carousel-3d')
            if old_c3d:
                old_c3d['id'] = 'carousel-3d-container'
                old_c3d.clear()

    with open(file, 'w', encoding='utf-8') as f:
        f.write(str(soup))

print('HTML updated')

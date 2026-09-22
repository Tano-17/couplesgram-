import glob
from bs4 import BeautifulSoup
import re

svg_carousel = '''
<svg class="nav-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
  <polyline points="21 3 21 8 16 8"></polyline>
</svg>
'''

carousel_html = '''
<div id="carousel-modal" class="hidden">
  <div class="carousel-close" onclick="closeCarousel()">&#x2715;</div>
  <div class="scene">
    <div class="carousel-3d">
      <div class="carousel__cell"><img src="assets/IMG-20251118-WA0078.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG-20251208-WA0016.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG-20260305-WA0011.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG-20260423-WA0091.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG-20260505-WA0150.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG-20260505-WA0254.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG_20250414_185437.jpg" loading="lazy"></div>
      <div class="carousel__cell"><img src="assets/IMG_20251207_201549.jpg" loading="lazy"></div>
    </div>
  </div>
</div>
<audio id="laufey-carousel-audio" src="assets/Laufey_-_Carousel_(mp3.pm).mp3" loop></audio>
'''

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # 1. Update Sidebar
    messages_span = soup.find('span', string=re.compile('Messages'))
    if messages_span:
        messages_span.string = 'Carousel'
        a_tag = messages_span.parent
        a_tag['id'] = 'carousel-nav-btn'
        if a_tag.name != 'a':
            a_tag = a_tag.parent
            if a_tag and a_tag.name == 'a':
                a_tag['id'] = 'carousel-nav-btn'
        
        icon_container = a_tag.find('div', class_='icon-badge-container')
        if icon_container:
            icon_container.clear()
            icon_container.append(BeautifulSoup(svg_carousel, 'html.parser'))
        else:
            svg = a_tag.find('svg')
            if svg:
                new_svg = BeautifulSoup(svg_carousel, 'html.parser').find('svg')
                svg.replace_with(new_svg)
        
    # 2. Append Carousel Modal to index.html ONLY
    if file == 'index.html':
        body = soup.find('body')
        if body and not soup.find(id='carousel-modal'):
            modal_soup = BeautifulSoup(carousel_html, 'html.parser')
            body.append(modal_soup)
            
    with open(file, 'w', encoding='utf-8') as f:
        f.write(str(soup))
print('Updated HTML files')

import glob
from bs4 import BeautifulSoup

captions = [
    "Orchestras, grocery stores, museums, empty rooms<br>Everywhere looks colourful when you're beside me",
    "October 28 2025. The day I said yes to the rest of my life",
    "Here's to many more years of iPhone 7, TEMS, and fantasy football 😂",
    "I promise to try avocados one day for you"
]

for file in ['index.html', 'reels.html']:
    with open(file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    if file == 'index.html':
        target_classes = ['post-caption']
    else:
        target_classes = ['reel-caption']
        
    elements = soup.find_all('div', class_=lambda c: c and any(cls in c for cls in target_classes))
    
    for i, el in enumerate(elements):
        caption_html = captions[i % len(captions)]
        el.clear()
        el.append(BeautifulSoup(caption_html, 'html.parser'))
        if 'custom-cursive-caption' not in el.get('class', []):
            el['class'] = el.get('class', []) + ['custom-cursive-caption']
            
    with open(file, 'w', encoding='utf-8') as f:
        f.write(str(soup))
print('Updated captions')

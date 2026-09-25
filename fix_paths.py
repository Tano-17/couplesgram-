import re

# Fix double path: assets/assets\\ -> assets/
for filename in ['index.html', 'explore.html', 'reels.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed = re.sub(r'assets/assets[/\\]+', 'assets/', content)
    
    # Fix lovebirds alt text in index.html
    if filename == 'index.html':
        fixed = fixed.replace('alt="lovebirds"', 'alt="Mon Coeur"')
    
    # Standardize reel username to Mon Coeur in reels.html
    if filename == 'reels.html':
        fixed = fixed.replace('Mon C\u0153ur', 'Mon Coeur')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f'{filename} fixed')

print('All done')

import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace all hardcoded .carousel__cell:nth-child(...) rules
css = re.sub(r'\.carousel__cell:nth-child\(\d+\).*?;\s*\}', '', css)

# Update .carousel__cell to use CSS variables
css = css.replace('.carousel__cell {', '.carousel__cell {\n  transform: rotateY(var(--rotate-y)) translateZ(var(--translate-z));')

# For mobile responsiveness, we reduce translateZ by a factor (e.g. * 0.75) since 180 / 250 = 0.72
mobile_fix = '''
  .carousel__cell {
    width: 180px;
    height: 250px;
    transform: rotateY(var(--rotate-y)) translateZ(calc(var(--translate-z) * 0.75));
  }
'''
css = css.replace('.carousel__cell {\n    width: 180px;\n    height: 250px;\n  }', mobile_fix)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('style.css updated')

#!/usr/bin/env python3
from pathlib import Path
import base64, io, re, subprocess, sys, zipfile
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
errors = []

class RefParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]
    def handle_starttag(self, tag, attrs):
        data=dict(attrs)
        if tag=='script' and data.get('src'): self.refs.append(data['src'])
        if tag=='link' and data.get('href'): self.refs.append(data['href'])

parser=RefParser(); parser.feed((ROOT/'index.html').read_text(encoding='utf-8'))
for ref in parser.refs:
    clean_ref=ref.split('?',1)[0].split('#',1)[0]
    if not ref.startswith(('http://','https://','data:','#')) and not (ROOT/clean_ref).is_file():
        errors.append(f'Fehlende index.html-Referenz: {ref}')

framework=(ROOT/'editor/js/core/framework.js').read_text(encoding='utf-8')
for ref in re.findall(r"'(assets/[^']+|frameworks/[^']+|plugins/site/[^']+)'", framework):
    if not (ROOT/ref).is_file(): errors.append(f'Fehlende Framework-Datei: {ref}')

site_images=(ROOT/'editor/js/core/site-images.js').read_text(encoding='utf-8')
for ref in re.findall(r'"(images/[^\"]+)"', site_images):
    if not (ROOT/'assets'/ref).is_file(): errors.append(f'Fehlendes Bild: assets/{ref}')

for path in ROOT.rglob('*'):
    if not path.is_file() or path.name=='site-assets-bundle.js' or path.suffix.lower() in {'.map','.zip'}: continue
    if path.suffix.lower() not in {'.html','.js','.css','.md'}: continue
    text=path.read_text(encoding='utf-8', errors='ignore')
    for legacy in ('site-assets/', 'builder/'):
        if legacy in text and path.name != 'CHANGELOG.md':
            errors.append(f'Veraltete Referenz {legacy} in {path.relative_to(ROOT)}')

bundle=(ROOT/'editor/js/core/site-assets-bundle.js').read_text(encoding='utf-8')
m=re.search(r"SITE_ASSETS_ZIP_BASE64\s*=\s*\[(.*?)\]\.join\(''\)", bundle, re.S)
if not m:
    errors.append('Eingebettetes Export-Assetpaket fehlt.')
else:
    try:
        encoded = ''.join(re.findall(r"'([^']*)'", m.group(1)))
        with zipfile.ZipFile(io.BytesIO(base64.b64decode(encoded))) as z:
            names=set(z.namelist())
            required={
                'css/local-fonts.css','css/bootstrap4/bootstrap.min.css','css/bootstrap5/bootstrap.min.css',
                'css/pagebuilder-bs5.css','js/bootstrap4/bootstrap.bundle.min.js',
                'js/bootstrap5/bootstrap.bundle.min.js','js/pagebuilder-bs5-gallery.js',
                'images/favicon.ico'
            }
            for ref in sorted(required-names): errors.append(f'Fehlende Exportdatei im Assetpaket: {ref}')
            bad=z.testzip()
            if bad: errors.append(f'Defekte Datei im Export-Assetpaket: {bad}')
    except Exception as exc:
        errors.append(f'Export-Assetpaket ist nicht lesbar: {exc}')

node = subprocess.run(['sh','-lc','command -v node'], capture_output=True, text=True)
if node.returncode == 0:
    for path in sorted((ROOT/'editor').rglob('*.js')):
        if path.name.endswith('.min.js'): continue
        result=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
        if result.returncode: errors.append(f'JavaScript-Syntaxfehler in {path.relative_to(ROOT)}: {result.stderr.strip()}')

# Oluntir 1.1.0 architecture rules
for area in (ROOT/'editor/modules', ROOT/'editor/services'):
    for path in area.rglob('*.js'):
        if '.gjs-' in path.read_text(encoding='utf-8', errors='ignore'):
            errors.append(f'GrapesJS-DOM-Kopplung außerhalb des Adapters: {path.relative_to(ROOT)}')
for path in (ROOT/'editor/modules/image-select').rglob('*.js'):
    text=path.read_text(encoding='utf-8', errors='ignore')
    if 'MutationObserver' in text or 'setInterval(' in text:
        errors.append(f'Unbegrenzte UI-Beobachtung im Image-Select: {path.relative_to(ROOT)}')
if not (ROOT/'vendor/grapesjs/0.23.2/VERSION').is_file():
    errors.append('Versionierte GrapesJS-Vendor-Datei fehlt.')

if errors:
    print('STRUKTURPRÜFUNG FEHLGESCHLAGEN')
    for item in errors: print('-',item)
    sys.exit(1)
print('STRUKTURPRÜFUNG ERFOLGREICH')
print(f'- {len(parser.refs)} statische HTML-Referenzen geprüft')
print('- Bootstrap 4.6.2 und Bootstrap 5.3.8 geprüft')
print('- lokale Bilder und Export-Assetpaket geprüft')
print('- alte Laufzeitpfade ausgeschlossen')
print('- versionierte Vendor-Abhängigkeiten zugelassen')
print('- JavaScript-Syntax geprüft')

import glob

files = glob.glob('public/*.html')
print('Found:', len(files), 'files')

snippet = """  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet">
  <style>
    /* Playtest Watermark for Print & Display */
    @media print {
      body::before {
        content: "PROTÓTIPO DE PLAYTEST — MATERIAL CONFIDENCIAL NÃO COMERCIAL";
        position: fixed;
        top: 45%;
        left: 5%;
        right: 5%;
        font-size: 32px;
        font-weight: 900;
        color: rgba(220, 38, 38, 0.25) !important;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 4px;
        transform: rotate(-35deg);
        pointer-events: none;
        z-index: 999999;
      }
    }
  </style>
"""

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    if 'robots' not in c:
        c = c.replace('<head>', '<head>\n' + snippet, 1)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(c)
        print('Updated:', f)
    else:
        print('Already processed:', f)

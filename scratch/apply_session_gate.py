import glob

files = glob.glob('public/*.html')
print(f"Encontrados {len(files)} arquivos HTML em public/")

gate_script = """  <!-- Playtest Access Protection -->
  <script>
    (function() {
      try {
        if (sessionStorage.getItem('pwnd_playtest_auth_token_v1') !== 'granted') {
          window.location.replace('/?denied=true');
        }
      } catch (e) {
        window.location.replace('/?denied=true');
      }
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=/?denied=true">
    <style>body { display: none !important; }</style>
  </noscript>
"""

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    
    if 'pwnd_playtest_auth_token_v1' not in c:
        # Insere logo apos a tag <head>
        c = c.replace('<head>', '<head>\n' + gate_script, 1)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(c)
        print(f"Protegido com sucesso: {f}")
    else:
        print(f"Ja protegido anteriormente: {f}")

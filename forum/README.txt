ZooPet - Mapeamento Inteligente

Como rodar localmente:

1) Instale o JSON Server (uma vez):
   npm i -g json-server

2) No terminal, entre na pasta 'zoopet' e rode a API fake:
   json-server --watch db.json --port 3000

   Isso disponibiliza:
   - http://localhost:3000/instituicoes
   - http://localhost:3000/animais_rua
   - http://localhost:3000/forum

3) Sirva os arquivos estáticos (recomendado para evitar CORS):
   Opção A (VSCode): use a extensão 'Live Server' e abra o index.html
   Opção B (npx): npx serve .
   Opção C (Python): python -m http.server 5500

4) Abra o index.html no navegador (se estiver servindo na porta 5500, por ex. http://localhost:5500).

Observação:
- Adicionei a VIEW do Fórum (id="viewForum") que estava faltando no HTML original,
  para casar com o JavaScript (loadForum(), renderTopics etc.).
- Os mapas usam Leaflet + OpenStreetMap; é necessário estar online para carregar os tiles.

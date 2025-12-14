# ZooPet — Mapa de Instituições (TI)

Este pacote contém uma versão **funcional** apenas do **Mapa de Instituições**, alinhada ao seu HTML atual. 
A parte de **Animais de Rua / Cadastro** estava referenciada no seu JavaScript original, mas **não há elementos no HTML** para essas telas, o que quebraria o app. 
Aqui eu limpei o `script.js` para manter **somente** o que existe no HTML e evitar erros.

## Estrutura
- `index.html` — sua página (instituições)
- `styles.css` — estilos (mantive seu visual)
- `script.js` — JavaScript **focado em instituições**
- `db.json` — dados para o JSON Server

## Como rodar
1. Instale o JSON Server (uma vez):
   ```bash
   npm i -g json-server
   ```
2. Inicie a API local na pasta onde está o `db.json`:
   ```bash
   json-server --watch db.json --port 3000
   ```
3. Abra o `index.html` no navegador (ou sirva com alguma extensão de servidor estático).
   - O app vai buscar `http://localhost:3000/instituicoes`.

## Dicas
- Para adicionar mais instituições, edite `db.json` (seção `instituicoes`).
- Se quiser ativar a **view de Animais/Cadastro** depois, posso gerar um HTML com as seções necessárias e reativar as funções no JS (os estilos já estão prontos).

Bom trabalho! 🚀

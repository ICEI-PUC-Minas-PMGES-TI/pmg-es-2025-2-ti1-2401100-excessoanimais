const formCadastro = document.getElementById('form-cadastro');
const mensagem = document.getElementById('mensagem');

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    // verifica se já existe um usuário com o mesmo e-mail
    const verifica = await fetch(`http://localhost:3000/usuarios?email=${email}`);
    const existe = await verifica.json();

    if (existe.length > 0) {
      mensagem.textContent = 'Este e-mail já está cadastrado.';
      mensagem.style.color = 'red';
      return;
    }

    // cria o novo usuário
    await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    mensagem.textContent = 'Cadastro realizado com sucesso!';
    mensagem.style.color = 'green';
    formCadastro.reset();

  } catch (erro) {
    mensagem.textContent = 'Erro ao conectar com o servidor.';
    mensagem.style.color = 'red';
    console.error(erro);
  }
});

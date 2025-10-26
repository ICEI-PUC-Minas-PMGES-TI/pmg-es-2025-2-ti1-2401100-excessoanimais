const formLogin = document.getElementById('form-login');
const mensagem = document.getElementById('mensagem');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const resposta = await fetch('http://localhost:3000/usuarios?email=' + email);
    const dados = await resposta.json();

    if (dados.length === 0) {
      mensagem.textContent = 'Usuário não encontrado!';
      mensagem.style.color = 'red';
      return;
    }

    const usuario = dados[0];

    if (usuario.senha === senha) {
      mensagem.textContent = 'Login realizado com sucesso!';
      mensagem.style.color = 'green';
      // redirecionar futuramente para o dashboard
    } else {
      mensagem.textContent = 'Senha incorreta!';
      mensagem.style.color = 'red';
    }

  } catch (erro) {
    mensagem.textContent = 'Erro ao conectar com o servidor.';
    mensagem.style.color = 'red';
    console.error(erro);
  }
});

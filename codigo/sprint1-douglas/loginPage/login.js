const formLogin = document.getElementById('form-login');
const mensagem = document.getElementById('mensagem');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  try {
    // Busca o usuário pelo e-mail
    const resposta = await fetch(`http://localhost:3000/usuarios?email=${email}`);
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

      // Salva o usuário logado localmente
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

      // Aguarda um instante antes de redirecionar
      setTimeout(() => {
        if (usuario.tipoUsuario === 'zoonoses') {
          window.location.href = '../../dashboard/zoonoses/index.html';
        } else {
          window.location.href = '../../dashboard/usuario/index.html';
        }
      }, 1000);
    } else {
      mensagem.textContent = 'Senha incorreta!';
      mensagem.style.color = 'red';
    }
  } catch (erro) {
    mensagem.textContent = 'Erro ao conectar com o servidor.';
    mensagem.style.color = 'red';
    console.error('Erro no login:', erro);
  }
});

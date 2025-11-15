const formCadastro = document.getElementById('form-cadastro');
const mensagem = document.getElementById('mensagem');

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = {
    tipoUsuario: document.getElementById('tipoUsuario').value,
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value,
    telefone: document.getElementById('telefone').value,
    cep: document.getElementById('cep').value,
    endereco: document.getElementById('endereco').value,
    bio: document.getElementById('bio').value,
    // Campos de controle
    animaisAdotados: [],
    animaisCurtidos: [],
    denunciasFeitas: []
  };

  try {
    // Verifica se o e-mail já está cadastrado
    const verifica = await fetch(`http://localhost:3000/usuarios?email=${usuario.email}`);
    const existe = await verifica.json();

    if (existe.length > 0) {
      mensagem.textContent = 'Este e-mail já está cadastrado.';
      mensagem.style.color = 'red';
      return;
    }

    // Cria o novo usuário
    await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
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

function mostrarFiltros() {
  const selecionados = [];
  document
    .querySelectorAll('input[type="checkbox"]:checked')
    .forEach((el) => selecionados.push(el.value));

  const idade = document.getElementById("idade").value;
  if (idade) selecionados.push(`Idade: ${idade}`);

  const resultado = document.getElementById("resultado");
  if (selecionados.length > 0) {
    resultado.style.display = "block";
    resultado.innerHTML = `<strong>Filtros aplicados:</strong><br>${selecionados.join(
      ", "
    )}`;
  } else {
    resultado.style.display = "block";
    resultado.innerHTML = "<em>Nenhum filtro selecionado.</em>";
  }
}

function limparFiltros() {
  // desmarca todos os checkboxes
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((el) => (el.checked = false));

  // reseta o select
  document.getElementById("idade").value = "";

  // limpa o resultado
  const resultado = document.getElementById("resultado");
  resultado.style.display = "none";
  resultado.innerHTML = "";
}

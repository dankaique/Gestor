const form = document.getElementById("form-transacao");
const lista = document.getElementById("lista");
const metaGasto = document.getElementById("metaGasto");
const metaReserva = document.getElementById("metaReserva");
const alertaMeta = document.getElementById("alertaMeta");

let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

function salvarLocal() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

function alternarTema() {
  const html = document.documentElement;
  const novoTema = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = novoTema;
  localStorage.setItem("tema", novoTema);
}

form.onsubmit = (e) => {
  e.preventDefault();
  const desc = document.getElementById("descricao").value;
  const val = parseFloat(document.getElementById("valor").value);
  const cat = document.getElementById("categoria").value;
  const tipo = document.getElementById("tipo").value;
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  transacoes.push({ descricao: desc, valor: val, categoria: cat, tipo, data: dataHoje });
  salvarLocal();
  form.reset();
  render();
};

function render() {
  lista.innerHTML = "";
  let entrada = 0, saida = 0;
  transacoes.forEach((t, i) => {
    if (t.tipo === "entrada") entrada += t.valor;
    else saida += t.valor;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.descricao} - R$ ${t.valor.toFixed(2)} (${t.categoria})</span>
      <button class="remove-btn" onclick="remover(${i})"><i class="fas fa-trash"></i></button>
    `;
    lista.appendChild(li);
  });

  document.getElementById("totalSaldo").textContent = `Saldo Total: R$ ${(entrada - saida).toFixed(2)}`;
  document.getElementById("totalEntradas").textContent = `Entradas: R$ ${entrada.toFixed(2)}`;
  document.getElementById("totalSaidas").textContent = `Saídas: R$ ${saida.toFixed(2)}`;

  verificarMetas(entrada, saida);
  atualizarGraficos(entrada, saida);
}

function remover(i) {
  transacoes.splice(i, 1);
  salvarLocal();
  render();
}

function verificarMetas(entrada, saida) {
  const metaG = parseFloat(metaGasto.value);
  const metaR = parseFloat(metaReserva.value);
  alertaMeta.className = "alerta";
  alertaMeta.style.display = "none";

  if (!isNaN(metaG) && saida >= metaG) {
    alertaMeta.classList.add("gasto");
    alertaMeta.textContent = `Atenção: Você ultrapassou sua meta de gasto de R$ ${metaG.toFixed(2)}!`;
    alertaMeta.style.display = "block";
  } else if (!isNaN(metaR) && (entrada - saida) >= metaR) {
    alertaMeta.classList.add("reserva");
    alertaMeta.textContent = `Parabéns: Você atingiu sua meta de reserva de R$ ${metaR.toFixed(2)}!`;
    alertaMeta.style.display = "block";
  }
}

function alternarMenuOpcoes() {
  const menu = document.getElementById("opcoesExtras");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function toggleGerenciamentoData() {
  const secao = document.getElementById("gerenciamentoData");
  secao.style.display = secao.style.display === "none" ? "block" : "none";
  mostrarTransacoesPorData();
}

function mostrarTransacoesPorData() {
  const listaDiv = document.getElementById("listaPorData");
  listaDiv.innerHTML = "";
  const agrupado = {};

  transacoes.forEach(t => {
    const data = t.data || "Sem Data";
    if (!agrupado[data]) agrupado[data] = [];
    agrupado[data].push(t);
  });

  for (const data in agrupado) {
    const grupo = agrupado[data];
    const div = document.createElement("div");
    div.innerHTML = `<h3>${data}</h3>`;
    grupo.forEach(t => {
      const p = document.createElement("p");
      p.textContent = `${t.descricao} - R$ ${t.valor.toFixed(2)} (${t.categoria}) [${t.tipo}]`;
      div.appendChild(p);
    });
    listaDiv.appendChild(div);
  }
}

function atualizarGraficos(entrada, saida) {
  const pizza = document.getElementById("graficoPizza").getContext("2d");
  const coluna = document.getElementById("graficoColuna").getContext("2d");

  if (window.graficoPizza) window.graficoPizza.destroy();
  if (window.graficoColuna) window.graficoColuna.destroy();

  const total = entrada + saida;
  const pctEntrada = total ? (entrada / total) * 100 : 0;
  const pctSaida = total ? (saida / total) * 100 : 0;

  window.graficoPizza = new Chart(pizza, {
    type: "pie",
    data: {
      labels: ["Entradas (%)", "Saídas (%)"],
      datasets: [{
        data: [pctEntrada, pctSaida],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });

  window.graficoColuna = new Chart(coluna, {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{
        data: [entrada, saida],
        backgroundColor: ["#4caf50", "#f44336"],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `R$ ${ctx.parsed.y.toFixed(2)}` } }
      }
    }
  });
}

document.getElementById("exportarExcel").onclick = () => {
  const ws = XLSX.utils.json_to_sheet(transacoes);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transações");
  XLSX.writeFile(wb, "controle_financeiro.xlsx");
};

document.getElementById("exportarPDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const rows = transacoes.map(t => [t.descricao, `R$ ${t.valor.toFixed(2)}`, t.categoria, t.tipo]);
  doc.autoTable({ head: [["Descrição", "Valor", "Categoria", "Tipo"]], body: rows });
  doc.save("controle_financeiro.pdf");
};

function carregarTema() {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo) document.documentElement.dataset.theme = temaSalvo;
}

function carregarMetas() {
  const metaG = localStorage.getItem("metaGasto");
  const metaR = localStorage.getItem("metaReserva");
  if (metaG !== null) metaGasto.value = metaG;
  if (metaR !== null) metaReserva.value = metaR;
}

metaGasto.addEventListener("input", () => {
  localStorage.setItem("metaGasto", metaGasto.value);
  render();
});

metaReserva.addEventListener("input", () => {
  localStorage.setItem("metaReserva", metaReserva.value);
  render();
});

window.onload = () => {
  carregarTema();
  carregarMetas();
  render();
}
function alternarTema() {
      const html = document.documentElement;
      const icone = document.getElementById("btnTema").firstElementChild;
      const novoTema = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = novoTema;
      localStorage.setItem("tema", novoTema);
      icone.className = novoTema === "dark" ? "fas fa-moon" : "fas fa-moon";
    }

    document.addEventListener("DOMContentLoaded", () => {
      const icone = document.getElementById("btnTema").firstElementChild;
      const tema = document.documentElement.dataset.theme;
      icone.className = tema === "dark" ? "fas fa-sun" : "fas fa-moon";
    });

    const transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

    // Pizza - categorias de saída
    const categorias = {};
    transacoes.forEach(t => {
      if (t.tipo === "saida") {
        categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
      }
    });

    new Chart(document.getElementById("graficoPizzaDashboard"), {
      type: "pie",
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias),
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "Despesas por Categoria" }
        }
      }
    });

    // Barras - entradas vs saídas
    let entradas = 0;
    let saidas = 0;
    transacoes.forEach(t => {
      if (t.tipo === "entrada") entradas += t.valor;
      else saidas += t.valor;
    });

    new Chart(document.getElementById("graficoBarraDashboard"), {
      type: "bar",
      data: {
        labels: ["Entradas", "Saídas"],
        datasets: [{
          label: "R$",
          data: [entradas, saidas],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Entradas vs Saídas" }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: valor => `R$ ${valor.toFixed(2)}`
            }
          }
        }
      }
    });

 
  
  function alternarTema() {
    const html = document.documentElement;
    const icone = document.getElementById("btnTema").firstElementChild;
    const novoTema = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = novoTema;
    localStorage.setItem("tema", novoTema);
    icone.className = novoTema === "dark" ? "fas fa-moon" : "fas fa-moon";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const icone = document.getElementById("btnTema").firstElementChild;
    const tema = document.documentElement.dataset.theme;
    icone.className = tema === "dark" ? "fas fa-sun" : "fas fa-moon";
  });

  // =================== BANCO DE DADOS ====================
  let db;
  const request = indexedDB.open("ControleFinanceiroDB", 1);

  request.onerror = (event) => {
    console.error("Erro ao abrir IndexedDB", event);
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    carregarTransacoesParaGraficos();
  };

  function carregarTransacoesParaGraficos() {
    const tx = db.transaction("transacoes", "readonly");
    const store = tx.objectStore("transacoes");
    const request = store.getAll();

    request.onsuccess = () => {
      const transacoes = request.result;
      gerarGraficos(transacoes);
    };
  }

  function gerarGraficos(transacoes) {
    const categorias = {};
    let entradas = 0;
    let saidas = 0;

    transacoes.forEach(t => {
      const valor = Number(t.valor);
      if (t.tipo === "entrada") entradas += valor;
      else if (t.tipo === "saída" || t.tipo === "saida") {
        saidas += valor;
        categorias[t.categoria] = (categorias[t.categoria] || 0) + valor;
      }
    });

    new Chart(document.getElementById("graficoPizzaDashboard"), {
      type: "pie",
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias),
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "Despesas por Categoria" }
        }
      }
    });

    new Chart(document.getElementById("graficoBarraDashboard"), {
      type: "bar",
      data: {
        labels: ["Entradas", "Saídas"],
        datasets: [{
          label: "R$",
          data: [entradas, saidas],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Entradas vs Saídas" }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: valor => `R$ ${valor.toFixed(2)}`
            }
            
          }
        }
      }
    });
  }
document.getElementById("calcularReservaBtn").addEventListener("click", () => {
  const valorMensal = parseFloat(document.getElementById("valorInvestido").value);
  const taxaAnual = parseFloat(document.getElementById("taxaJuros").value);
  const anos = parseInt(document.getElementById("tempoAplicacao").value);

  if (isNaN(valorMensal) || isNaN(taxaAnual) || isNaN(anos)) {
    document.getElementById("resultadoReserva").innerText = "Preencha todos os campos corretamente.";
    return;
  }

  const meses = anos * 12;
  const taxaMensal = taxaAnual / 12 / 100;

  // Fórmula de juros compostos com aportes mensais: FV = P * [((1 + i)^n - 1) / i]
  const montante = valorMensal * ((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal);

  document.getElementById("resultadoReserva").innerText = 
    `Valor estimado da reserva após ${anos} anos: R$ ${montante.toFixed(2)}`;
});

// Alternar tema (já estava presente)
function alternarTema() {
  const atual = document.documentElement.getAttribute("data-theme");
  const novoTema = atual === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", novoTema);
  localStorage.setItem("tema", novoTema);
}
/*Menu e Rodapé*/

document.addEventListener('DOMContentLoaded', () => {

    const conteudo = document.querySelector('.conteudo');

    /*Botão do menu*/
    const botao = document.querySelector('.cabecalhoMenu button');
    const menu = document.querySelector('.cabecalhoMenu');

    if (botao && menu) {
        botao.addEventListener('click', () => {
            menu.classList.toggle('ativo');
        });
    }

    /*Função de carregar as páginas*/
    function carregarPagina(pagina) {
        fetch(pagina)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Página não encontrada: " + pagina);
                }
                return res.text();
            })
            .then(html => {
                conteudo.innerHTML = html;
                if (pagina.includes('dashboard')) {
                iniciarDashboard();
            }

            if (pagina.includes('consultas')) {
                iniciarConsultas();
            }

            if (pagina.includes('perfil')) {
                iniciarPerfil();
            }

            if (pagina.includes('exames')) {
                iniciarExames();
            }
            if (pagina.includes('medicamentos')) {
                iniciarMedicamentos();
            }
            if (pagina.includes('sintomas')) {
                iniciarSintomas();
            }
            })
            .catch(err => {
                conteudo.innerHTML = "<p>Erro ao carregar conteúdo</p>";
                console.log(err);
            });
    }

    /*Deixa a função acessível no HTML ****IMPORTANTE*****/
    window.carregarPagina = carregarPagina;

    /*Carrega a dashboard ao abrir*/
    carregarPagina('paginas/dashboard.html');

});    

function iniciarPerfil() {

    console.log("Perfil carregado");

    const visualizacao = document.getElementById("visualizacao");
    const edicao = document.getElementById("edicao");

    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");
    const btnCancelar = document.getElementById("btnCancelar");

    const viewNome = document.getElementById("viewNome");
    const viewEmail = document.getElementById("viewEmail");
    const viewTelefone = document.getElementById("viewTelefone");
    const viewAltura = document.getElementById("viewAltura");
    const viewPeso = document.getElementById("viewPeso");
    const viewAlergias = document.getElementById("viewAlergias");

    const inputNome = document.getElementById("nome");
    const inputEmail = document.getElementById("email");
    const inputTelefone = document.getElementById("telefone");
    const inputAltura = document.getElementById("altura");
    const inputPeso = document.getElementById("peso");
    const inputAlergias = document.getElementById("alergias");

    if (!btnEditar || !btnSalvar || !btnCancelar) {
        console.log("Elementos não encontrados");
        return;
    }

    //Editar
    btnEditar.onclick = () => {

        visualizacao.style.display = "none";
        edicao.style.display = "block";

        inputNome.value = viewNome.textContent;
        inputEmail.value = viewEmail.textContent;
        inputTelefone.value = viewTelefone.textContent;
        inputAltura.value = viewAltura.textContent;
        inputPeso.value = viewPeso.textContent;
        inputAlergias.value = viewAlergias.textContent;
    };

    /*Cancelar*/
    btnCancelar.onclick = () => {
        edicao.style.display = "none";
        visualizacao.style.display = "block";
    };

    /*Salvar*/
    btnSalvar.onclick = () => {

        viewNome.textContent = inputNome.value;
        viewEmail.textContent = inputEmail.value;
        viewTelefone.textContent = inputTelefone.value;
        viewAltura.textContent = inputAltura.value;
        viewPeso.textContent = inputPeso.value;
        viewAlergias.textContent = inputAlergias.value;

        document.getElementById("msg").style.display = "block";

        setTimeout(() => {
            document.getElementById("msg").style.display = "none";
        }, 2000);

        edicao.style.display = "none";
        visualizacao.style.display = "block";
    };
}

/* botao dashboard */
function iniciarDashboard() {

    const meds = document.getElementById("qtdMedicamentos");
    const cons = document.getElementById("qtdConsultas");
    const sint = document.getElementById("qtdSintomas");

    const btn = document.getElementById("btnAtualizar");

    if (!btn) return;

    function gerarDados() {
        meds.textContent = Math.floor(Math.random() * 5);
        cons.textContent = Math.floor(Math.random() * 3);
        sint.textContent = Math.floor(Math.random() * 2);
    }

    gerarDados();

    btn.onclick = gerarDados;
}

/* funcao consultas */
function iniciarConsultas() {

    const lista = document.getElementById("listaConsultas");
    const btn = document.getElementById("btnAddConsulta");

    if (!btn) return;

    btn.onclick = () => {

        const data = document.getElementById("dataConsulta").value;
        const medico = document.getElementById("medicoConsulta").value;
        const esp = document.getElementById("espConsulta").value;

        if (!data || !medico || !esp) {
            alert("Preencha tudo!");
            return;
        }

        const div = document.createElement("div");
        div.classList.add("consulta");

        div.innerHTML = `
            <p><strong>Data:</strong> ${data}</p>
            <p><strong>Médico:</strong> ${medico}</p>
            <p><strong>Especialidade:</strong> ${esp}</p>
            <button class="remover">Remover</button>
        `;

        div.querySelector(".remover").onclick = () => {
            div.remove();
        };

        lista.appendChild(div);

        // limpa inputs
        document.getElementById("dataConsulta").value = "";
        document.getElementById("medicoConsulta").value = "";
        document.getElementById("espConsulta").value = "";
    };
}

/* funcao exames */
function iniciarExames() {

    const lista = document.getElementById("listaExames");
    const btn = document.getElementById("btnAddExame");

    if (!btn) return;

    btn.onclick = () => {

        const nome = document.getElementById("nomeExame").value;
        const data = document.getElementById("dataExame").value;
        const resultado = document.getElementById("resultadoExame").value;

        if (!nome || !data || !resultado) {
            alert("Preencha todos os campos!");
            return;
        }

        const div = document.createElement("div");
        div.classList.add("exame");

        div.innerHTML = `
            <p><strong>Exame:</strong> ${nome}</p>
            <p><strong>Data:</strong> ${data}</p>
            <p><strong>Resultado:</strong> ${resultado}</p>
            <button class="remover">Remover</button>
        `;

        div.querySelector(".remover").onclick = () => {
            div.remove();
        };

        lista.appendChild(div);

        // limpar campos
        document.getElementById("nomeExame").value = "";
        document.getElementById("dataExame").value = "";
        document.getElementById("resultadoExame").value = "";
    };
}

/* funcao medicamentos */
function iniciarMedicamentos() {

    const lista = document.getElementById("listaMedicamentos");
    const btn = document.getElementById("btnAddMed");

    if (!btn) return;

    btn.onclick = () => {

        const nome = document.getElementById("nomeMed").value;
        const horario = document.getElementById("horarioMed").value;
        const tipo = document.getElementById("tipoFreq").value;
        const valor = document.getElementById("valorFreq").value;

        if (!nome || !horario || !tipo) {
            alert("Preencha todos os campos!");
            return;
        }

        if ((tipo === "intervalo" || tipo === "dias") && !valor) {
            alert("Preencha corretamente a frequência!");
            return;
        }

        let intervaloHoras = null;

        if (tipo === "intervalo") {
            intervaloHoras = Number(valor);
        }
        else if (tipo === "semanal") {
            intervaloHoras = 7 * 24;
        }
        else if (tipo === "quinzenal") {
            intervaloHoras = 15 * 24;
        }
        else if (tipo === "mensal") {
            intervaloHoras = 30 * 24;
        }

        let proximaDoseTexto = "Não calculado";

        if (intervaloHoras) {

            const agora = new Date();

            // separa horário
            const [h, m] = horario.split(":");

            const primeiraDose = new Date();
            primeiraDose.setHours(h);
            primeiraDose.setMinutes(m);
            primeiraDose.setSeconds(0);

            if (primeiraDose < agora) {
            primeiraDose.setDate(primeiraDose.getDate() + 1);
        }

            const proxima = new Date(primeiraDose.getTime() + intervaloHoras * 60 * 60 * 1000);

            proximaDoseTexto = proxima.toLocaleString();
        }

        // texto da frequência
        let frequenciaTexto = "";

        if (tipo === "intervalo") {
            frequenciaTexto = `A cada ${valor} horas`;
        } 
        else if (tipo === "dias") {
            frequenciaTexto = `Por ${valor} dias`;
        } 
        else if (tipo === "semanal") {
            frequenciaTexto = "1 vez por semana";
        } 
        else if (tipo === "quinzenal") {
            frequenciaTexto = "A cada 15 dias";
        } 
        else if (tipo === "mensal") {
            frequenciaTexto = "1 vez por mês";
        }

        const div = document.createElement("div");
        div.classList.add("med");

        div.innerHTML = `
            <p><strong>Medicamento:</strong> ${nome}</p>
            <p><strong>Horário:</strong> ${horario}</p>
            <p><strong>Frequência:</strong> ${frequenciaTexto}</p>
            <p><strong>Próxima dose:</strong> ${proximaDoseTexto}</p>
            <p class="status"><strong>Status:</strong> Pendente</p>

            <button class="tomar">Tomado</button>
            <button class="remover">Remover</button>
        `;

        const status = div.querySelector(".status");

        // marcar como tomado
        div.querySelector(".tomar").onclick = () => {
            div.classList.toggle("tomado");

            if (div.classList.contains("tomado")) {
                status.innerHTML = "<strong>Status:</strong> Tomado";
            } else {
                status.innerHTML = "<strong>Status:</strong> Pendente";
            }
        };

        // remover
        div.querySelector(".remover").onclick = () => {
            div.remove();
        };

        lista.appendChild(div);

        // limpar inputs
        document.getElementById("nomeMed").value = "";
        document.getElementById("horarioMed").value = "";
        document.getElementById("tipoFreq").value = "";
        document.getElementById("valorFreq").value = "";
    };
}

/* funcoes sintomas */
function iniciarSintomas() {

    const lista = document.getElementById("listaSintomas");
    const btn = document.getElementById("btnAddSintoma");

    if (!btn) return;

    // carregar histórico ao abrir
    carregarHistorico();

    btn.onclick = () => {

        const descricao = document.getElementById("descSintoma").value;
        const categoria = document.getElementById("categoriaSintoma").value;
        const nivel = document.getElementById("nivelSintoma").value;
        const data = document.getElementById("dataSintoma").value;
        const tipo = document.getElementById("tipoSintoma").value;

        // validação
        if (!descricao || !categoria || !nivel || !data || !tipo) {
            alert("Preencha todos os campos!");
            return;
        }

        // objeto do sintoma
        const novoSintoma = {
            id: Date.now(), // ID único
            descricao,
            categoria,
            nivel,
            data,
            tipo,
            status: "ativo"
        };

        // salvar no localStorage
        let sintomas = JSON.parse(localStorage.getItem("sintomas")) || [];
        sintomas.push(novoSintoma);
        localStorage.setItem("sintomas", JSON.stringify(sintomas));

        // atualizar tela
        carregarHistorico();

        // limpar campos
        document.getElementById("descSintoma").value = "";
        document.getElementById("categoriaSintoma").value = "";
        document.getElementById("nivelSintoma").value = "";
        document.getElementById("dataSintoma").value = "";
        document.getElementById("tipoSintoma").value = "";
    };

    // historico sintomas
    function carregarHistorico() {

        lista.innerHTML = "";

        const sintomas = JSON.parse(localStorage.getItem("sintomas")) || [];

        const agrupados = {};

        // agrupar por data
        sintomas.forEach(s => {
            const dataFormatada = new Date(s.data).toLocaleDateString();

            if (!agrupados[dataFormatada]) {
                agrupados[dataFormatada] = [];
            }

            agrupados[dataFormatada].push(s);
        });

        // renderizar
        for (let data in agrupados) {

            const titulo = document.createElement("h3");
            titulo.textContent = ` ${data}`;
            lista.appendChild(titulo);

            agrupados[data].forEach(s => {

                const nivelTexto =
                    s.nivel === "leve" ? "Leve" :
                    s.nivel === "medio" ? "Médio" :
                    "Grave";

                let alerta = "";
                if (s.nivel === "grave") {
                    alerta = "⚠️ Sintoma grave!";
                }

                const div = document.createElement("div");
                div.classList.add("sintoma", s.nivel);

                if (s.status === "resolvido") {
                    div.classList.add("resolvido");
                }

                div.innerHTML = `
                    <p><strong>Descrição:</strong> ${s.descricao}</p>
                    <p><strong>Categoria:</strong> ${s.categoria}</p>
                    <p><strong>Intensidade:</strong> ${nivelTexto}</p>
                    <p><strong>Quando ocorreu:</strong> ${s.data}</p>
                    <p><strong>Tipo:</strong> ${s.tipo}</p>
                    <p class="alerta">${alerta}</p>
                    <p class="status"><strong>Status:</strong> ${s.status}</p>

                    <button class="resolver">Resolver</button>
                    <button class="remover">Remover</button>
                `;

                const statusEl = div.querySelector(".status");

                // resolver (salva no storage)
                div.querySelector(".resolver").onclick = () => {

                    let sintomas = JSON.parse(localStorage.getItem("sintomas")) || [];

                    sintomas = sintomas.map(item => {
                        if (item.id === s.id) {
                            item.status = item.status === "ativo" ? "resolvido" : "ativo";
                        }
                        return item;
                    });

                    localStorage.setItem("sintomas", JSON.stringify(sintomas));

                    carregarHistorico();
                };

                // remover (remove do storage)
                div.querySelector(".remover").onclick = () => {

                    let sintomas = JSON.parse(localStorage.getItem("sintomas")) || [];

                    sintomas = sintomas.filter(item => item.id !== s.id);

                    localStorage.setItem("sintomas", JSON.stringify(sintomas));

                    carregarHistorico();
                };

                lista.appendChild(div);
            });
        }
    }
}
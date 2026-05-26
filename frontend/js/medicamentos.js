/* funcao medicamentos */
function iniciarMedicamentos() {

    const token = localStorage.getItem("token");
    const lista = document.getElementById("listaMedicamentos");
    const btn = document.getElementById("btnAddMed");
    
    // Variável de controle para saber se estamos criando um novo ou editando um existente
    let idMedEdicao = null; 

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarMedicamentos();

    // --- EVENTO: SALVAR / EDITAR MEDICAMENTO PRINCIPAL ---
    btn.onclick = async () => {
        const nome = document.getElementById("nomeMed").value;
        const dosagem = document.getElementById("dosagemMed").value;
        const finalidade = document.getElementById("finalidadeMed").value;
        const horario = document.getElementById("horarioMed").value;
        const tipo = document.getElementById("tipoFreq").value;
        const valor = document.getElementById("valorFreq").value;
        const dataInicio = document.getElementById("dataInicioMed").value;
        const dataFim = document.getElementById("dataFimMed").value;
        const observacoes = document.getElementById("obsMed").value;

        if (!nome || !dosagem || !horario || !dataInicio || !tipo) {
            alert("Preencha nome, dosagem, horário, data de início e frequência!");
            return;
        }

        const medicamento = {
            nome,
            dosagem,
            finalidade,
            horario,
            tipoFrequencia: tipo,
            valorFrequencia: valor ? Number(valor) : null,
            dataInicio,
            dataFim: dataFim || null,
            observacoes,
            ativo: true
        };

        try {
            const url = idMedEdicao 
                ? `http://localhost:8085/medicamentos/${idMedEdicao}?gerarAlarmes=true`
                : `http://localhost:8085/medicamentos?gerarAlarmes=true`;

            const metodo = idMedEdicao ? "PUT" : "POST";

            const resposta = await fetch(montarUrlComPaciente(url), {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(medicamento)
            });

            if (!resposta.ok) {
                mostrarToast("Erro ao salvar medicamento");
                return;
            }

            mostrarToast(idMedEdicao ? "Medicamento e alarmes atualizados!" : "Medicamento salvo com sucesso!");

            idMedEdicao = null;
            btn.textContent = "Salvar Medicamento";

            limparCamposMedicamento();
            carregarMedicamentos();

        } catch (erro) {
            console.log(erro);
            mostrarToast("Erro ao conectar com backend");
        }
    };

    // --- EVENTO: CONFIRMAR IMPORTAÇÃO (OCR) ---
    const btnConfirmar = document.getElementById("btnConfirmarImportacao");
    if (btnConfirmar) {
        btnConfirmar.onclick = async () => {
            const medId = document.getElementById("editIdMed").value;

            const medicamentoAtualizado = {
                nome: document.getElementById("editNome").value,
                dosagem: document.getElementById("editDosagem").value,
                finalidade: document.getElementById("editFinalidade").value,
                horario: document.getElementById("editHorario").value,
                tipoFrequencia: document.getElementById("editTipoFreq").value,
                valorFrequencia: document.getElementById("editValorFreq").value ? Number(document.getElementById("editValorFreq").value) : null,
                dataInicio: document.getElementById("editDataInicio").value,
                dataFim: document.getElementById("editDataFim").value || null,
                observacoes: document.getElementById("editObs").value,
                ativo: true
            };

            try {
                // 1. Atualiza o medicamento
                const resPut = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${medId}`), {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token 
                    },
                    body: JSON.stringify(medicamentoAtualizado)
                });

                if (!resPut.ok) throw new Error("Erro ao salvar edições");

                // 2. Gera os alarmes
                const resPost = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${medId}/alarmes`), {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + token }
                });

                if (resPost.ok) {
                    mostrarToast("Tratamento confirmado e alarmes gerados!");
                    document.getElementById("containerEdicao").style.display = "none";
                    carregarMedicamentos();
                }
            } catch (e) {
                console.error(e);
                alert("Erro ao confirmar tratamento.");
            }
        };
    }

    async function carregarMedicamentos() {
        lista.innerHTML = "<p>Carregando medicamentos...</p>";

        try {
            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/medicamentos"), {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar medicamentos.</p>";
                return;
            }

            const medicamentos = await resposta.json();
            lista.innerHTML = "";

            if (medicamentos.length === 0) {
                lista.innerHTML = "<p>Nenhum medicamento cadastrado ainda.</p>";
                return;
            }

            medicamentos.forEach(med => {
                const div = document.createElement("div");
                div.classList.add("med");

                const finalizado = med.ativo === false || (med.dataFim && new Date(med.dataFim + "T00:00:00") < new Date());

                div.innerHTML = `
                    <div class="med-topo">
                        <div>
                            <h3>${med.nome}</h3>
                            <span class="dosagem">${med.dosagem || "Dosagem não informada"}</span>
                        </div>
                        <span class="status-med ${finalizado ? 'finalizado' : 'ativo'}">
                            ${finalizado ? 'Finalizado' : 'Ativo'}
                        </span>
                    </div>
                    <p><strong>Finalidade:</strong> ${med.finalidade || "Não informado"}</p>
                    <p><strong>Horário:</strong> ${med.horario || "Não informado"}</p>
                    <p><strong>Frequência:</strong> ${formatarFrequencia(med.tipoFrequencia, med.valorFrequencia)}</p>
                    <p><strong>Início:</strong> ${formatarDataMed(med.dataInicio)}</p>
                    <p><strong>Término:</strong> ${formatarDataMed(med.dataFim)}</p>
                    <p><strong>Observações:</strong> ${med.observacoes || "Nenhuma"}</p>

                    <div class="acoes-med">
                        <button class="editar" style="background-color: #f39c12; color: white;">Editar</button>
                        ${!finalizado ? `<button class="finalizar">Finalizar tratamento</button>` : ""}
                        <button class="remover">Remover</button>
                    </div>
                `;

                div.querySelector(".editar").onclick = () => {
                    prepararEdicaoMedicamento(med);
                };

                const btnFinalizar = div.querySelector(".finalizar");
                if (btnFinalizar) {
                    btnFinalizar.onclick = () => finalizarMedicamento(med);
                }

                div.querySelector(".remover").onclick = () => {
                    const confirmar = confirm("Tem certeza que deseja remover este medicamento? Para manter histórico, use 'Finalizar tratamento'.");
                    if (confirmar) removerMedicamento(med.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    // AGORA ESTA FUNÇÃO ESTÁ NO LUGAR CERTO (DENTRO DO ESCOPO)
    function prepararEdicaoMedicamento(med) {
        idMedEdicao = med.id; // Grava o ID que está sendo editado

        document.getElementById("nomeMed").value = med.nome || "";
        document.getElementById("dosagemMed").value = med.dosagem || "";
        document.getElementById("finalidadeMed").value = med.finalidade || "";
        document.getElementById("horarioMed").value = med.horario || "";
        document.getElementById("tipoFreq").value = med.tipoFrequencia || "";
        document.getElementById("valorFreq").value = med.valorFrequencia || "";
        document.getElementById("dataInicioMed").value = med.dataInicio || "";
        document.getElementById("dataFimMed").value = med.dataFim || "";
        document.getElementById("obsMed").value = med.observacoes || "";

        if (typeof toggleValorFreq === "function") {
            toggleValorFreq();
        }

        btn.textContent = "Salvar Alterações";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function finalizarMedicamento(med) {
        const medicamentoAtualizado = {
            ...med,
            ativo: false,
            dataFim: med.dataFim || new Date().toISOString().split("T")[0]
        };
        try {
            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${med.id}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(medicamentoAtualizado)
            });
            if (!resposta.ok) {
                mostrarToast("Erro ao finalizar tratamento");
                return;
            }
            mostrarToast("Tratamento finalizado e alarmes removidos!");
            carregarMedicamentos();
        } catch (erro) {
            console.log(erro);
            mostrarToast("Erro ao conectar com backend");
        }
    }

    async function removerMedicamento(id) {
        try {
            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${id}`), {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            if (!resposta.ok) {
                mostrarToast("Erro ao remover medicamento");
                return;
            }
            mostrarToast("Medicamento removido!");
            carregarMedicamentos();
        } catch (erro) {
            console.log(erro);
            mostrarToast("Erro ao conectar com backend");
        }
    }

    function limparCamposMedicamento() {
        document.getElementById("nomeMed").value = "";
        document.getElementById("dosagemMed").value = "";
        document.getElementById("finalidadeMed").value = "";
        document.getElementById("horarioMed").value = "";
        document.getElementById("tipoFreq").value = "";
        document.getElementById("valorFreq").value = "";
        document.getElementById("dataInicioMed").value = "";
        document.getElementById("dataFimMed").value = "";
        document.getElementById("obsMed").value = "";
    }

    function formatarFrequencia(tipo, valor) {
        if (tipo === "DIARIO") return "Diário";
        if (tipo === "INTERVALO_HORAS") return !valor ? "Intervalo não informado" : `A cada ${valor} horas`;
        if (tipo === "SEMANAL") return "Semanal";
        if (tipo === "MENSAL") return "Mensal";
        return "Não informado";
    }
}

// --- FUNÇÕES GLOBAIS (FORA DE iniciarMedicamentos) ---

// Esta função precisa ser global para ser chamada pelo OCR de outra página
function exibirDadosParaEdicao(medData) {
    document.getElementById("containerEdicao").style.display = "block";
    
    document.getElementById("editIdMed").value = medData.id;
    document.getElementById("editNome").value = medData.nome || "";
    document.getElementById("editDosagem").value = medData.dosagem || "";
    document.getElementById("editFinalidade").value = medData.finalidade || "";
    document.getElementById("editHorario").value = medData.horario || "";
    document.getElementById("editTipoFreq").value = medData.tipoFrequencia || "DIARIO";
    document.getElementById("editValorFreq").value = medData.valorFrequencia || "";
    document.getElementById("editDataInicio").value = medData.dataInicio || "";
    document.getElementById("editDataFim").value = medData.dataFim || "";
    document.getElementById("editObs").value = medData.observacoes || "";
}

// Esta função precisa ser global para funcionar com o 'onchange' no HTML
function toggleValorFreq() {
    const tipo = document.getElementById("tipoFreq").value;
    const campoValor = document.getElementById("valorFreq");

    if (tipo === "INTERVALO_HORAS") {
        campoValor.style.display = "block";
    } else {
        campoValor.style.display = "none";
        campoValor.value = ""; 
    }
}

function formatarDataMed(data) {
    if (!data) {
        return "Não informado";
    }
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}
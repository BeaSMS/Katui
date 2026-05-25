/* funcao medicamentos */
function iniciarMedicamentos() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaMedicamentos");
    const btn = document.getElementById("btnAddMed");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarMedicamentos();

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

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/medicamentos?gerarAlarmes=true"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify(medicamento)
                }
            );

            if (!resposta.ok) {
                mostrarToast("Erro ao salvar medicamento");
                return;
            }

            mostrarToast("Medicamento salvo com sucesso!");

            limparCamposMedicamento();
            carregarMedicamentos();

        } catch (erro) {
            console.log(erro);
            mostrarToast("Erro ao conectar com backend");
        }
    };

    async function carregarMedicamentos() {

        lista.innerHTML = "<p>Carregando medicamentos...</p>";

        try {

            const resposta = await fetch(
                montarUrlComPaciente("http://localhost:8085/medicamentos"),
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

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

                const finalizado =
                    med.ativo === false ||
                    (med.dataFim && new Date(med.dataFim + "T00:00:00") < new Date());

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
                        ${
                            !finalizado
                                ? `<button class="finalizar">Finalizar tratamento</button>`
                                : ""
                        }
                        <button class="remover">Remover</button>
                    </div>
                `;

                const btnFinalizar = div.querySelector(".finalizar");

                if (btnFinalizar) {
                    btnFinalizar.onclick = () => {
                        finalizarMedicamento(med);
                    };
                }

                div.querySelector(".remover").onclick = () => {
                const confirmar = confirm(
                    "Tem certeza que deseja remover este medicamento? Para manter histórico, use 'Finalizar tratamento'."
                );

                    if (confirmar) {
                        removerMedicamento(med.id);
                    }
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function finalizarMedicamento(med) {

        const medicamentoAtualizado = {
            ...med,
            ativo: false,
            dataFim: med.dataFim || new Date().toISOString().split("T")[0]
        };

        try {

            const resposta = await fetch(
                montarUrlComPaciente(`http://localhost:8085/medicamentos/${med.id}`),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify(medicamentoAtualizado)
                }
            );

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

            const resposta = await fetch(
                montarUrlComPaciente(`http://localhost:8085/medicamentos/${id}`),
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

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

        if (tipo === "DIARIO") {
            return "Diário";
        }

        if (tipo === "INTERVALO_HORAS") {
            if (!valor) {
                return "Intervalo não informado";
            }

            return `A cada ${valor} horas`;
        }

        if (tipo === "SEMANAL") {
            return "Semanal";
        }

        if (tipo === "MENSAL") {
            return "Mensal";
        }

        return "Não informado";
    }


}

function exibirDadosParaEdicao(medData) {
    document.getElementById("containerEdicao").style.display = "block";
    
    // Preenche o formulário com o que a IA leu
    document.getElementById("editIdMed").value = medData.id; 
    document.getElementById("editNome").value = medData.nome;
    document.getElementById("editHorario").value = medData.horario;
    document.getElementById("editTipoFreq").value = medData.tipoFrequencia;
}

function toggleValorFreq() {
    const tipo = document.getElementById("tipoFreq").value;
    const campoValor = document.getElementById("valorFreq");

    // Mostra o campo apenas se for "A cada X horas"
    if (tipo === "INTERVALO_HORAS") {
        campoValor.style.display = "block";
    } else {
        campoValor.style.display = "none";
        campoValor.value = ""; // Limpa o valor se o usuário trocar de opção
    }
}

document.getElementById("btnConfirmarImportacao").onclick = async () => {
    const medId = document.getElementById("editIdMed").value;
    const token = localStorage.getItem("token");

    // 1. Prepara o objeto com as edições do usuário
    const medicamentoEditado = {
        nome: document.getElementById("editNome").value,
        horario: document.getElementById("editHorario").value,
        tipoFrequencia: document.getElementById("editTipoFreq").value,
        ativo: true
        // Adicione aqui outros campos se necessário (ex: dosagem, finalidade)
    };

    try {
        // 2. Primeiro: Salva as alterações (PUT)
        const resPut = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${medId}`), {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token 
            },
            body: JSON.stringify(medicamentoEditado)
        });

        if (!resPut.ok) throw new Error("Erro ao salvar edições");

        // 3. Segundo: Agora que o dado está correto no banco, gera os alarmes
        const resPost = await fetch(montarUrlComPaciente(`http://localhost:8085/medicamentos/${medId}/alarmes`), {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
        });

        if (resPost.ok) {
            alert("Tratamento confirmado e alarmes atualizados!");
            document.getElementById("containerEdicao").style.display = "none";
            carregarMedicamentos();
        } else {
            alert("Erro ao gerar alarmes.");
        }
    } catch (e) {
        console.error(e);
        alert("Erro ao processar confirmação.");
    }
};

function formatarDataMed(data) {

    if (!data) {
        return "Não informado";
    }

    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}
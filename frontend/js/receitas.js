function iniciarReceitas() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaReceitas");
    const btn = document.getElementById("btnAddReceita");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarReceitas();

    btn.onclick = async () => {

        const observacao = document.getElementById("obsReceita").value;
        const arquivo = document.getElementById("arquivoReceita").files[0];

        if (!observacao || !arquivo) {
            alert("Preencha a observação e selecione um arquivo!");
            return;
        }

        const formData = new FormData();

        formData.append("observacao", observacao);
        formData.append("arquivo", arquivo);

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/receitas"), {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            });

            if (!resposta.ok) {
                alert("Erro ao salvar receita");
                return;
            }

            limparCamposReceita();

            carregarReceitas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarReceitas() {

        lista.innerHTML = "<p>Carregando receitas...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/receitas"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar receitas.</p>";
                return;
            }

            const receitas = await resposta.json();

            lista.innerHTML = "";

            if (receitas.length === 0) {
                lista.innerHTML = "<p>Nenhuma receita cadastrada ainda.</p>";
                return;
            }

            receitas.forEach(receita => {

                const div = document.createElement("div");
                div.classList.add("receita");

                div.innerHTML = `
                    <p><strong>Observação:</strong> ${receita.observacao}</p>

                    <button class="btnDownloadReceita">
                        Baixar Arquivo
                    </button>

                    <button class="btnProcessarReceita">
                        Processar Receita
                    </button>

                    <button class="btnRemoverReceita">
                        Remover
                    </button>

                    <div class="resultadoReceita"></div>
                `;

                div.querySelector(".btnDownloadReceita").onclick = () => {
                    baixarReceita(receita.id);
                };

                div.querySelector(".btnProcessarReceita").onclick = () => {
                    processarReceita(receita.id, div.querySelector(".resultadoReceita"));
                };

                div.querySelector(".btnRemoverReceita").onclick = () => {
                    removerReceita(receita.id);
                };

                lista.appendChild(div);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    async function baixarReceita(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/receitas/${id}/download`), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao baixar receita");
                return;
            }

            const blob = await resposta.blob();
            const url = window.URL.createObjectURL(blob);

            window.open(url);

        } catch (erro) {
            console.log(erro);
            alert("Erro ao baixar arquivo");
        }
    }

    async function processarReceita(id, areaResultado) {
        areaResultado.innerHTML = "<p>Processando receita... Aguarde.</p>";

        try {
            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/receitas/${id}/processar`), {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                const erro = await resposta.text();
                areaResultado.innerHTML = `<p>Erro ao processar receita: ${erro}</p>`;
                return;
            }

            const medicamentos = await resposta.json();
            areaResultado.innerHTML = "";

            if (medicamentos.length === 0) {
                areaResultado.innerHTML = "<p>Nenhum medicamento identificado pela IA.</p>";
                return;
            }

            medicamentos.forEach((med, index) => {
                const div = document.createElement("div");
                div.classList.add("medicamento-extraido");
                div.style.border = "1px solid #ccc";
                div.style.padding = "15px";
                div.style.marginTop = "10px";
                div.style.borderRadius = "8px";

                // Desenhando o card com INPUTS para edição
                div.innerHTML = `
                    <h3 style="color: #2da79d; margin-bottom: 10px;">
                        <input type="text" id="ocr_nome_${index}" value="${med.nome || ''}" style="font-size: 1.2em; font-weight: bold; width: 100%; border: none; border-bottom: 1px solid #ccc;">
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="font-size: 0.85em; color: #666;">Duração (dias):</label>
                            <input type="number" id="ocr_dias_${index}" value="${med.dias || ''}" style="width: 100%; padding: 5px;">
                        </div>
                        <div>
                            <label style="font-size: 0.85em; color: #666;">Horário Inicial:</label>
                            <input type="time" id="ocr_horario_${index}" value="${med.horarioInicial || '08:00'}" style="width: 100%; padding: 5px;">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="font-size: 0.85em; color: #666;">Frequência:</label>
                            <select id="ocr_tipoFreq_${index}" style="width: 100%; padding: 5px;" onchange="document.getElementById('ocr_valorFreq_${index}').style.display = this.value === 'INTERVALO_HORAS' ? 'block' : 'none'">
                                <option value="DIARIO" ${med.tipoFrequencia === 'DIARIO' ? 'selected' : ''}>Diário</option>
                                <option value="INTERVALO_HORAS" ${med.tipoFrequencia === 'INTERVALO_HORAS' ? 'selected' : ''}>A cada X horas</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 0.85em; color: #666;">Intervalo (Horas):</label>
                            <input type="number" id="ocr_valorFreq_${index}" value="${med.valorFrequencia || ''}" style="width: 100%; padding: 5px; display: ${med.tipoFrequencia === 'INTERVALO_HORAS' ? 'block' : 'none'};">
                        </div>
                    </div>

                    <div class="acoes-med" style="margin-top: 10px; display: flex; gap: 10px;">
                        <button class="btnAddMedicamentoReceita" style="background-color: #2da79d; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                            Salvar na minha rotina
                        </button>
                    </div>
                `;

                // Ação de salvar lendo os dados recém-editados nos inputs
                div.querySelector(".btnAddMedicamentoReceita").onclick = () => {
                    const dadosValidados = {
                        nome: document.getElementById(`ocr_nome_${index}`).value,
                        dias: document.getElementById(`ocr_dias_${index}`).value ? Number(document.getElementById(`ocr_dias_${index}`).value) : null,
                        horarioInicial: document.getElementById(`ocr_horario_${index}`).value,
                        tipoFrequencia: document.getElementById(`ocr_tipoFreq_${index}`).value,
                        valorFrequencia: document.getElementById(`ocr_valorFreq_${index}`).value ? Number(document.getElementById(`ocr_valorFreq_${index}`).value) : null
                    };
                    adicionarMedicamentoDaReceita(dadosValidados, div);
                };

                areaResultado.appendChild(div);
            });

        } catch (erro) {
            console.log("Erro real do JS:", erro); 
            areaResultado.innerHTML = "<p>Erro interno ao processar a resposta.</p>";
        }
    }

    async function adicionarMedicamentoDaReceita(medValidado, divCard) {
        if (!medValidado.nome) {
            alert("O medicamento precisa de um nome.");
            return;
        }

        const medicamento = {
            nome: medValidado.nome,
            horario: medValidado.horarioInicial,
            tipoFrequencia: medValidado.tipoFrequencia,
            valorFrequencia: medValidado.valorFrequencia,
            dias: medValidado.dias,
            ativo: true,
            dataInicio: new Date().toISOString().split("T")[0]
        };

        try {
            // O Segredo: A URL envia ?gerarAlarmes=true para já configurar o tratamento
            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/medicamentos?gerarAlarmes=true"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(medicamento)
            });

            if (!resposta.ok) {
                alert("Erro ao adicionar medicamento");
                return;
            }

            alert("Medicamento salvo e alarmes configurados na sua rotina!");
            
            // Remove o card da tela, já que foi salvo com sucesso
            divCard.remove(); 

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    }

    async function removerReceita(id) {

        try {

            const resposta = await fetch(montarUrlComPaciente(`http://localhost:8085/receitas/${id}`), {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                alert("Erro ao remover receita");
                return;
            }

            carregarReceitas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao remover receita");
        }
    }

    function limparCamposReceita() {

        document.getElementById("obsReceita").value = "";
        document.getElementById("arquivoReceita").value = "";
    }

    function formatarFrequenciaReceita(tipo, valor) {

        if (tipo === "intervalo") {
            return `A cada ${valor} horas`;
        }

        if (tipo === "dias") {
            return `Por ${valor} dias`;
        }

        if (tipo === "semanal") {
            return "Semanal";
        }

        if (tipo === "quinzenal") {
            return "Quinzenal";
        }

        if (tipo === "mensal") {
            return "Mensal";
        }

        return "Não informado";
    }
}
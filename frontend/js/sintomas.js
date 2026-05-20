function iniciarSintomas() {

    const token = localStorage.getItem("token");

    const lista = document.getElementById("listaSintomas");
    const btn = document.getElementById("btnAddSintoma");

    if (!token) {
        alert("Você precisa fazer login");
        carregarPagina('paginas/auth/login.html');
        return;
    }

    if (!lista || !btn) {
        return;
    }

    carregarSintomas();

    btn.onclick = async () => {

        const localizacao = document.getElementById("localSintoma").value;
        const qualidade = document.getElementById("qualidadeSintoma").value;
        const intensidadeEscala = document.getElementById("intensidadeSintoma").value;
        const incapacitante = document.getElementById("incapacitanteSintoma").value;
        const padraoTempo = document.getElementById("padraoTempoSintoma").value;
        const fatoresAssociados = document.getElementById("fatoresSintoma").value;
        const impactoFuncional = document.getElementById("impactoSintoma").value;
        const dataHoraRegistro = document.getElementById("dataHoraSintoma").value;

        if (!localizacao || !qualidade || !intensidadeEscala || !incapacitante || !padraoTempo || !dataHoraRegistro) {
            alert("Preencha localização, qualidade, intensidade, incapacitante, tempo/padrão e data!");
            return;
        }

        const sintoma = {
            localizacao: localizacao,
            qualidade: qualidade,
            intensidadeEscala: Number(intensidadeEscala),
            incapacitante: incapacitante === "true",
            padraoTempo: padraoTempo,
            fatoresAssociados: fatoresAssociados,
            impactoFuncional: impactoFuncional,
            dataHoraRegistro: dataHoraRegistro
        };

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/sintomas"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(sintoma)
            });

            if (!resposta.ok) {
                alert("Erro ao salvar sintoma");
                return;
            }

            limparCamposSintoma();
            carregarSintomas();

        } catch (erro) {
            console.log(erro);
            alert("Erro ao conectar com backend");
        }
    };

    async function carregarSintomas() {

        lista.innerHTML = "<p>Carregando sintomas...</p>";

        try {

            const resposta = await fetch(montarUrlComPaciente("http://localhost:8085/sintomas"), {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!resposta.ok) {
                lista.innerHTML = "<p>Erro ao carregar sintomas.</p>";
                return;
            }

            const sintomas = await resposta.json();

            lista.innerHTML = "";

            if (sintomas.length === 0) {
                lista.innerHTML = "<p>Nenhum sintoma cadastrado ainda.</p>";
                return;
            }

            sintomas.sort((a, b) =>
                new Date(b.dataHoraRegistro) - new Date(a.dataHoraRegistro)
            );

            const sintomasPorDia = {};

            sintomas.forEach(s => {

                const data = new Date(s.dataHoraRegistro);
                const dia = data.toLocaleDateString("pt-BR");

                if (!sintomasPorDia[dia]) {
                    sintomasPorDia[dia] = [];
                }

                sintomasPorDia[dia].push(s);
            });

            Object.keys(sintomasPorDia).forEach(dia => {

                const grupo = document.createElement("div");
                grupo.classList.add("grupo-dia-sintoma");

                grupo.innerHTML = `<h3>${dia}</h3>`;

                sintomasPorDia[dia].forEach(s => {

                    const item = document.createElement("div");
                    item.classList.add("sintoma-historico");

                    if (s.intensidadeEscala >= 8 || s.incapacitante) {
                        item.classList.add("grave");
                    } else if (s.intensidadeEscala >= 4) {
                        item.classList.add("medio");
                    } else {
                        item.classList.add("leve");
                    }

                    item.innerHTML = `
                        <div class="sintoma-hora">
                            ${formatarHoraSintoma(s.dataHoraRegistro)}
                        </div>

                        <div class="sintoma-info">
                            <strong>${s.qualidade || "Sintoma não informado"}</strong>

                            <p>
                                Local: ${s.localizacao || "Não informado"} |
                                Intensidade: ${s.intensidadeEscala ?? "?"}/10
                            </p>

                            <p>
                                ${s.incapacitante ? "⚠️ Incapacitante" : "Não incapacitante"}
                            </p>

                            <p>
                                ${s.impactoFuncional || ""}
                            </p>
                        </div>
                    `;

                    grupo.appendChild(item);
                });

                lista.appendChild(grupo);
            });

        } catch (erro) {
            console.log(erro);
            lista.innerHTML = "<p>Erro ao conectar com backend.</p>";
        }
    }

    function limparCamposSintoma() {
        document.getElementById("localSintoma").value = "";
        document.getElementById("qualidadeSintoma").value = "";
        document.getElementById("intensidadeSintoma").value = "";
        document.getElementById("incapacitanteSintoma").value = "";
        document.getElementById("padraoTempoSintoma").value = "";
        document.getElementById("fatoresSintoma").value = "";
        document.getElementById("impactoSintoma").value = "";
        document.getElementById("dataHoraSintoma").value = "";
    }

    function formatarHoraSintoma(data) {

        if (!data) {
            return "--:--";
        }

        return new Date(data).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
}
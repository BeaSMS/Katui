async function fazerCadastro() {

    const nome = document.getElementById("nomeCadastro").value;
    const email = document.getElementById("emailCadastro").value;
    const telefone = document.getElementById("telefoneCadastro").value;
    const altura = Number(document.getElementById("alturaCadastro").value);
    const peso = Number(document.getElementById("pesoCadastro").value);
    const alergias = document.getElementById("alergiasCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;
    const tipo = document.getElementById("tipoCadastro").value;

    try {

        const resposta = await fetch("http://localhost:8085/auth/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome,
                email,
                senha,
                tipo,
                telefone,
                altura,
                peso,
                alergias
            })

        });

        if (!resposta.ok) {

            alert("Erro ao cadastrar");

            return;
        }

        const dados = await resposta.json();

        localStorage.setItem("token", dados.token);

        mostrarMenuSistema();

        carregarPagina('paginas/dashboard.html');

    } catch (erro) {

        console.log(erro);

        alert("Erro ao conectar com backend");

    }

}



async function fazerLogin() {

    const email = document.getElementById("emailLogin").value;
    const senha = document.getElementById("senhaLogin").value;

    try {

        const resposta = await fetch("http://localhost:8085/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })

        });

        if (!resposta.ok) {

            alert("Email ou senha inválidos");

            return;
        }

        const dados = await resposta.json();

        localStorage.setItem("token", dados.token);

        mostrarMenuSistema();

        carregarPagina('paginas/dashboard.html');

    } catch (erro) {

        console.log(erro);

        alert("Erro ao conectar com backend");

    }

}



function mostrarMenuSistema() {

    document.getElementById("itemLogin").style.display = "none";
    document.getElementById("itemCadastro").style.display = "none";

    document.getElementById("itemDashboard").style.display = "block";
    document.getElementById("itemMedicamentos").style.display = "block";
    document.getElementById("itemSintomas").style.display = "block";
    document.getElementById("itemConsultas").style.display = "block";
    document.getElementById("itemPerfil").style.display = "block";
    document.getElementById("itemExames").style.display = "block";
    document.getElementById("itemReceitas").style.display = "block";
    document.getElementById("itemSair").style.display = "block";

}



function sair() {

    localStorage.removeItem("token");

    document.getElementById("itemLogin").style.display = "block";
    document.getElementById("itemCadastro").style.display = "block";

    document.getElementById("itemDashboard").style.display = "none";
    document.getElementById("itemMedicamentos").style.display = "none";
    document.getElementById("itemSintomas").style.display = "none";
    document.getElementById("itemConsultas").style.display = "none";
    document.getElementById("itemPerfil").style.display = "none";
    document.getElementById("itemExames").style.display = "none";
    document.getElementById("itemReceitas").style.display = "none";
    document.getElementById("itemSair").style.display = "none";

    carregarPagina('paginas/auth/login.html');

}
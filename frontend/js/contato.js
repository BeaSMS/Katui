async function enviarMensagemContato() {
    const nome = document.getElementById("nomeContato").value;
    const email = document.getElementById("emailContato").value;
    const assunto = document.getElementById("assuntoContato").value;
    const mensagem = document.getElementById("mensagemContato").value;

    if (!nome || !email || !assunto || !mensagem) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Aqui você pode integrar com algum serviço de email (como EmailJS) ou seu próprio backend
    const dadosFormulario = { nome, email, assunto, mensagem };
    
    console.log("Enviando mensagem:", dadosFormulario);
    
    alert("Mensagem enviada com sucesso! Em breve entraremos em contato.");
    
    // Limpa o formulário
    document.getElementById("formContato").reset();
}
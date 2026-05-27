package com.katui.controller;

import com.katui.entity.Exame;
import com.katui.entity.Receita;
import com.katui.entity.TokenMedico;
import com.katui.entity.Usuario;
import com.katui.service.CuidadorService; // 1. IMPORTANTE: Adicione este import
import com.katui.service.ExameService;
import com.katui.service.ReceitaService;
import com.katui.service.TokenMedicoService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/medico")
@RequiredArgsConstructor
public class TokenMedicoController {

    private final TokenMedicoService tokenMedicoService;
    private final ExameService exameService;
    private final ReceitaService receitaService;
    private final CuidadorService cuidadorService; // 2. NOVO: Injetar o serviço do cuidador

    // Paciente ou Cuidador gera o token/QR code
    @PostMapping("/token")
    public Map<String, String> gerarToken(
            @RequestParam(value = "pacienteId", required = false) Long pacienteId, // 3. NOVO: Receber o parâmetro do frontend
            Authentication authentication
    ) {
        Usuario usuarioAlvo = (Usuario) authentication.getPrincipal();

        // 4. NOVO: Se o Cuidador enviou o ID do paciente, validamos o acesso e o alvo passa a ser o Paciente!
        if (pacienteId != null) {
            usuarioAlvo = cuidadorService.verificarAcesso(usuarioAlvo, pacienteId);
        }

        // Agora o token será gerado e guardado no banco com o ID do paciente correto
        TokenMedico token = tokenMedicoService.gerarToken(usuarioAlvo);

        // Retorna o token e a URL que vai no QR code
        String url = "http://localhost:5500/paginas/medico.html?token=" + token.getToken();

        return Map.of(
                "url", url,
                "expiracao", token.getExpiracao().toString()
        );
    }

    // Médico envia exame via token (rota pública)
    @PostMapping(value = "/exame", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Exame enviarExame(
            @RequestParam("token") String token,
            @RequestParam("nome") String nome,
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo
    ) throws IOException {

        // Como o token agora foi gerado para o Paciente, a validação vai retornar o Paciente corretamente
        Usuario paciente = tokenMedicoService.validarToken(token);
        return exameService.salvar(nome, observacao, arquivo, paciente);
    }

    // Médico envia receita via token (rota pública)
    @PostMapping(value = "/receita", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Receita enviarReceita(
            @RequestParam("token") String token,
            @RequestParam("observacao") String observacao,
            @RequestParam("arquivo") MultipartFile arquivo
    ) throws IOException {

        Usuario paciente = tokenMedicoService.validarToken(token);
        return receitaService.salvar(observacao, arquivo, paciente);
    }

    // Médico consulta informações básicas do paciente pelo token
    @GetMapping("/paciente")
    public Map<String, String> buscarPaciente(
            @RequestParam("token") String token
    ) {
        Usuario paciente = tokenMedicoService.validarToken(token);

        return Map.of(
                "nome", paciente.getNome() != null ? paciente.getNome() : "",
                "alergias", paciente.getAlergias() != null ? paciente.getAlergias() : ""
        );
    }
}
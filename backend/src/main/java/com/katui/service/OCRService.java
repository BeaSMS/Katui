package com.katui.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.katui.dto.ReceitaProcessadaDTO.MedicamentoExtratoDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

@Service
public class OCRService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<MedicamentoExtratoDTO> extrairMedicamentos(Path caminhoImagem) {
        try {
            byte[] imageBytes = Files.readAllBytes(caminhoImagem);
            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            String mediaType = Files.probeContentType(caminhoImagem);

            String body = """
                {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "inline_data": {
                                        "mime_type": "%s",
                                        "data": "%s"
                                    }
                                },
                                {
                                    "text": "Leia esta receita médica e retorne SOMENTE um array JSON, sem nenhum texto adicional, sem markdown, sem blocos de código. Formato: [{\\"nome\\": \\"nome do medicamento\\", \\"dias\\": \\"quantidade de dias\\", \\"periodo\\": \\"periodo de tratamento\\"}]. Se nao encontrar algum campo, use null."
                                }
                            ]
                        }
                    ]
                }
                """.formatted(mediaType, base64);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );
            System.out.println("Resposta Gemini: " + response.body());

            var json = mapper.readTree(response.body());
            String content = json
                    .get("candidates").get(0)
                    .get("content")
                    .get("parts").get(0)
                    .get("text")
                    .asText()
                    .trim();

            return mapper.readValue(
                    content,
                    new TypeReference<List<MedicamentoExtratoDTO>>() {}
            );

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar receita: " + e.getMessage());
        }
    }
}
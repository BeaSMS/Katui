package com.katui.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.katui.dto.ReceitaProcessadaDTO.MedicamentoExtratoDTO;

import com.katui.entity.Receita;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Map;

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

            String prompt = "Leia esta receita médica e retorne SOMENTE um array JSON, sem nenhum texto adicional, sem markdown, sem blocos de código. " +
                    "Formato: [{\"nome\": \"nome do medicamento\", \"dias\": 7, \"tipoFrequencia\": \"INTERVALO_HORAS\", \"valorFrequencia\": 8, \"horarioInicial\": \"08:00\", \"diasSemana\": null}]. " +
                    "Para tipoFrequencia use APENAS estes valores: " +
                    "INTERVALO_HORAS (ex: a cada 8 horas -> valorFrequencia: 8, diasSemana: null), " +
                    "VEZES_DIA (ex: 3x ao dia -> valorFrequencia: 3, diasSemana: null), " +
                    "DIAS_ESPECIFICOS (ex: segunda e sexta -> valorFrequencia: null, diasSemana: [1,5]). " +
                    "Dias da semana: 1=Segunda, 2=Terca, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sabado, 7=Domingo. " +
                    "Para horarioInicial use o horario indicado na receita ou 08:00 como padrao. " +
                    "Para dias use numero inteiro ou null se nao informado. " +
                    "Se nao encontrar algum campo, use null.";

            // Monta o body usando Map para evitar problemas de escape
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("inline_data", Map.of(
                                            "mime_type", mediaType,
                                            "data", base64
                                    )),
                                    Map.of("text", prompt)
                            ))
                    )
            );

            String bodyJson = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey
                    ))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
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
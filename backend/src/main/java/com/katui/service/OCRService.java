package com.katui.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
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
import java.util.Map;

@Service
public class OCRService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // Configuração para o Java não quebrar se o JSON vier com campos invisíveis ou inesperados
    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<MedicamentoExtratoDTO> extrairMedicamentos(Path caminhoImagem) {

        try {
            byte[] imageBytes = Files.readAllBytes(caminhoImagem);
            String base64 = Base64.getEncoder().encodeToString(imageBytes);

            // Tenta adivinhar o tipo, mas protege contra retorno nulo
            String mediaType = Files.probeContentType(caminhoImagem);

            if (mediaType == null) {
                String nomeArquivo = caminhoImagem.getFileName().toString().toLowerCase();
                if (nomeArquivo.endsWith(".pdf")) {
                    mediaType = "application/pdf";
                } else if (nomeArquivo.endsWith(".jpg") || nomeArquivo.endsWith(".jpeg")) {
                    mediaType = "image/jpeg";
                } else if (nomeArquivo.endsWith(".png")) {
                    mediaType = "image/png";
                } else {
                    mediaType = "application/octet-stream";
                }
            }

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

            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("inline_data", Map.of(
                                            "mime_type", mediaType,
                                            "data", base64
                                    )),
                                    Map.of("text", prompt)
                            ))
                    ),
                    // Força a API a devolver um JSON limpo
                    "generationConfig", Map.of(
                            "responseMimeType", "application/json"
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

            System.out.println("Resposta Gemini Bruta: " + response.body());

            var jsonNode = mapper.readTree(response.body());

            // Proteção caso a API retorne um erro mapeado
            if (jsonNode.has("error")) {
                throw new RuntimeException("Erro da API do Gemini: " + jsonNode.get("error").toString());
            }

            String content = jsonNode
                    .get("candidates").get(0)
                    .get("content")
                    .get("parts").get(0)
                    .get("text")
                    .asText()
                    .trim();

            // Limpa formatações Markdown residuais caso existam
            content = content.replaceAll("^```json\\s*", "").replaceAll("\\s*```$", "").trim();

            return mapper.readValue(
                    content,
                    new TypeReference<List<MedicamentoExtratoDTO>>() {}
            );

        } catch (Exception e) {
            // Esta linha garante que você veja o real motivo do erro vermelho no terminal
            e.printStackTrace();
            throw new RuntimeException("Erro ao processar receita: " + e.getMessage(), e);
        }
    }
}
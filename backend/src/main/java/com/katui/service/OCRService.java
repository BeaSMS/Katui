package com.katui.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OCRService {

    public String lerReceita(String imagemUrl) {

        RestTemplate restTemplate = new RestTemplate();

        String apiUrl = "https://api.ocr.space/parse/imageurl?apikey=SUA_CHAVE&url=" + imagemUrl;

        return restTemplate.getForObject(apiUrl, String.class);
    }
}

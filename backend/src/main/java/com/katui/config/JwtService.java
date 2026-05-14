package com.katui.config;

import com.katui.entity.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;

import java.util.Date;

import java.util.function.Function;

@Service

public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    // Gerar chave
    private Key getSignKey() {

        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Gerar token
    public String generateToken(Usuario usuario) {

        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000 * 60 * 60 * 24
                        )
                )
                .signWith(
                        getSignKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // Extrair email do token
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    // Extrair claims
    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver
    ) {

        final Claims claims = extractAllClaims(token);

        return resolver.apply(claims);
    }

    // Extrair todas claims
    private Claims extractAllClaims(String token) {

        return Jwts
                .parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Validar token
    public boolean isTokenValid(
            String token,
            Usuario usuario
    ) {

        final String email = extractUsername(token);

        return email.equals(usuario.getEmail())
                && !isTokenExpired(token);
    }

    // Verificar expiração
    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    // Extrair expiração
    private Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }
}
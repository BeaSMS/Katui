# Katui — Backend

API REST para gerenciamento de saúde pessoal, desenvolvida com Spring Boot e PostgreSQL.

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- [Java 21](https://adoptium.net/) instalado (para rodar fora do Docker)
- [Maven](https://maven.apache.org/) instalado (para rodar fora do Docker)

---

## Subindo o ambiente

### Opção 1 — Tudo via Docker (recomendado)

Sobe o banco, o pgAdmin e o backend juntos:

```bash
docker-compose up --build
```

O backend estará disponível em `http://localhost:8086`.

---

### Opção 2 — Banco via Docker + Backend local (desenvolvimento)

**1. Sobe apenas o banco de dados:**

```bash
docker-compose up postgres -d
```

**2. Ajuste o `application.properties`** para apontar para o localhost:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5435/katui
```

> A porta é **5435** porque o docker-compose mapeia `5435:5432`.

**3. Execute o backend:**

```bash
./mvnw spring-boot:run
```

O backend estará disponível em `http://localhost:8085`.

---

## Serviços disponíveis

| Serviço   | URL                        | Credenciais                          |
|-----------|----------------------------|--------------------------------------|
| Backend   | http://localhost:8086      | —                                    |
| pgAdmin   | http://localhost:5055      | admin@katui.com / admin              |
| PostgreSQL| localhost:5435             | postgres / postgres                  |

---

## Endpoints

### Autenticação

| Método | Rota             | Descrição         | Auth |
|--------|------------------|-------------------|------|
| POST   | /auth/register   | Registrar usuário | Não  |
| POST   | /auth/login      | Login             | Não  |

**Register — body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "telefone": "11999999999",
  "peso": 75.0,
  "altura": 1.80,
  "alergias": "Dipirona"
}
```

**Login — body:**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Login — resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

> Todos os endpoints abaixo exigem o header:
> ```
> Authorization: Bearer <token>
> ```

---

### Medicamentos

| Método | Rota                  | Descrição                    |
|--------|-----------------------|------------------------------|
| POST   | /medicamentos         | Cadastrar medicamento        |
| GET    | /medicamentos         | Listar medicamentos do usuário |
| GET    | /medicamentos/{id}    | Buscar medicamento por ID    |
| PUT    | /medicamentos/{id}    | Atualizar medicamento        |
| DELETE | /medicamentos/{id}    | Deletar medicamento          |

**Body (POST/PUT):**
```json
{
  "nome": "Dipirona",
  "horario": "08:00",
  "tipoFrequencia": "intervalo",
  "valorFrequencia": 8
}
```

---

### Sintomas

| Método | Rota              | Descrição                   |
|--------|-------------------|-----------------------------|
| POST   | /sintomas         | Cadastrar sintoma           |
| GET    | /sintomas         | Listar sintomas do usuário  |
| GET    | /sintomas/{id}    | Buscar sintoma por ID       |
| PUT    | /sintomas/{id}    | Atualizar sintoma           |
| DELETE | /sintomas/{id}    | Deletar sintoma             |

**Body (POST/PUT):**
```json
{
  "descricao": "Dor de cabeça",
  "categoria": "Neurologico",
  "intensidade": "Alta",
  "tipo": "Agudo",
  "data": "2026-05-15T08:00:00"
}
```

---

### Exames

| Método | Rota            | Descrição                  |
|--------|-----------------|----------------------------|
| POST   | /exames         | Cadastrar exame            |
| GET    | /exames         | Listar exames do usuário   |
| GET    | /exames/{id}    | Buscar exame por ID        |
| DELETE | /exames/{id}    | Deletar exame              |

**Body (POST):**
```json
{
  "nome": "Hemograma",
  "arquivo": "https://link-do-arquivo.com/exame.pdf",
  "observacao": "Exame de rotina"
}
```

---

### Receitas

| Método | Rota               | Descrição                    |
|--------|--------------------|------------------------------|
| POST   | /receitas          | Cadastrar receita            |
| GET    | /receitas          | Listar receitas do usuário   |
| GET    | /receitas/{id}     | Buscar receita por ID        |
| DELETE | /receitas/{id}     | Deletar receita              |
| GET    | /receitas/ocr      | Ler receita via OCR          |

**Body (POST):**
```json
{
  "observacao": "Receita pós consulta",
  "imagem": "https://link-da-imagem.com/receita.jpg"
}
```

**OCR — query param:**
```
GET /receitas/ocr?imagemUrl=https://link-da-imagem.com/receita.jpg
```

---

### Usuários

| Método | Rota               | Descrição              |
|--------|--------------------|------------------------|
| GET    | /usuarios          | Listar usuários        |
| GET    | /usuarios/{id}     | Buscar usuário por ID  |
| PUT    | /usuarios/{id}     | Atualizar usuário      |
| DELETE | /usuarios/{id}     | Deletar usuário        |

**Body (PUT):**
```json
{
  "nome": "João Silva",
  "telefone": "11999999999",
  "peso": 76.0,
  "altura": 1.80,
  "alergias": "Nenhuma"
}
```

---

## Variáveis de ambiente

Configuradas no `docker-compose.yml` para o container do backend:

| Variável                    | Valor padrão                          |
|-----------------------------|---------------------------------------|
| SPRING_DATASOURCE_URL       | jdbc:postgresql://postgres:5432/katui |
| SPRING_DATASOURCE_USERNAME  | postgres                              |
| SPRING_DATASOURCE_PASSWORD  | postgres                              |

Para desenvolvimento local, ajuste o `application.properties` conforme descrito na seção de setup.

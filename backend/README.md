# Katui — Backend

API REST para gerenciamento de saúde pessoal. Permite que pacientes e cuidadores gerenciem medicamentos, sintomas, exames e receitas médicas, com suporte a leitura automática de receitas via IA (Google Gemini).

---

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Subindo o ambiente](#subindo-o-ambiente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Autenticação](#autenticação)
- [Tipos de usuário](#tipos-de-usuário)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Usuários](#usuários)
  - [Medicamentos](#medicamentos)
  - [Alarmes](#alarmes)
  - [Sintomas](#sintomas)
  - [Exames](#exames)
  - [Receitas](#receitas)
- [Parâmetros globais](#parâmetros-globais)
- [Estrutura do projeto](#estrutura-do-projeto)

---

## Tecnologias

- Java 21
- Spring Boot 4.0.6
- Spring Security + JWT
- PostgreSQL 16
- Hibernate / JPA
- Google Gemini 2.5 Flash (leitura de receitas)
- Docker + Docker Compose
- Lombok

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- [Java 21](https://adoptium.net/) (para rodar fora do Docker)
- [Maven](https://maven.apache.org/) (para rodar fora do Docker)

---

## Subindo o ambiente

### Opção 1 — Tudo via Docker (recomendado)

```bash
docker-compose up --build
```

O backend estará disponível em `http://localhost:8086`.

### Opção 2 — Banco via Docker + Backend local (desenvolvimento)

**1. Sobe apenas o banco:**

```bash
docker-compose up postgres -d
```

**2. Ajuste o `application.properties`:**

```properties
spring.datasource.url=jdbc:postgresql://localhost:5435/katui
```

**3. Execute o backend:**

```bash
./mvnw spring-boot:run
```

O backend estará disponível em `http://localhost:8085`.

---

## Serviços

| Serviço    | URL                   | Credenciais             |
|------------|-----------------------|-------------------------|
| Backend    | http://localhost:8086 | —                       |
| pgAdmin    | http://localhost:5055 | admin@katui.com / admin |
| PostgreSQL | localhost:5435        | postgres / postgres     |

---

## Variáveis de ambiente

| Variável                   | Padrão                                | Descrição                    |
|----------------------------|---------------------------------------|------------------------------|
| SPRING_DATASOURCE_URL      | jdbc:postgresql://postgres:5432/katui | URL do banco                 |
| SPRING_DATASOURCE_USERNAME | postgres                              | Usuário do banco             |
| SPRING_DATASOURCE_PASSWORD | postgres                              | Senha do banco               |
| jwt.secret                 | katuiSecretKey...                     | Chave de assinatura do JWT   |
| gemini.api.key             | —                                     | Chave da API do Google Gemini |

> A chave do Gemini é obtida em [aistudio.google.com](https://aistudio.google.com). Sem ela, o endpoint de processamento de receitas não funciona.

---

## Autenticação

A API usa **JWT Bearer Token**. Após o login ou registro, inclua o token em todas as requisições:

```
Authorization: Bearer <token>
```

O token expira em **24 horas**. Após expirar, faça login novamente para obter um novo.

As únicas rotas públicas (sem token) são `POST /auth/register` e `POST /auth/login`.

---

## Tipos de usuário

| Tipo      | Descrição                                                   |
|-----------|-------------------------------------------------------------|
| PACIENTE  | Usuário padrão. Gerencia seus próprios dados de saúde.      |
| CUIDADOR  | Pode ser vinculado a pacientes e gerenciar os dados deles.  |

O tipo é definido no momento do cadastro e não pode ser alterado depois.

---

## Endpoints

### Auth

#### POST /auth/register
Registra um novo usuário e retorna um token JWT.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "PACIENTE",
  "telefone": "11999999999",
  "peso": 75.0,
  "altura": 1.80,
  "alergias": "Dipirona"
}
```

| Campo    | Tipo   | Obrigatório | Descrição                        |
|----------|--------|-------------|----------------------------------|
| nome     | String | Sim         | Nome completo                    |
| email    | String | Sim         | E-mail único                     |
| senha    | String | Sim         | Senha (armazenada com BCrypt)    |
| tipo     | Enum   | Sim         | `PACIENTE` ou `CUIDADOR`         |
| telefone | String | Não         | Telefone de contato              |
| peso     | Double | Não         | Peso em kg                       |
| altura   | Double | Não         | Altura em metros                 |
| alergias | String | Não         | Alergias conhecidas              |

**Resposta:**
```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

---

#### POST /auth/login
Autentica um usuário existente e retorna um token JWT.

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

---

### Usuários

> Todas as rotas requerem token JWT.

#### GET /usuarios/me
Retorna os dados do usuário logado.

#### PUT /usuarios/me
Atualiza os dados do usuário logado.

**Body:**
```json
{
  "nome": "João Silva",
  "telefone": "11999999999",
  "peso": 76.0,
  "altura": 1.80,
  "alergias": "Nenhuma"
}
```

| Campo    | Tipo   | Descrição           |
|----------|--------|---------------------|
| nome     | String | Nome completo       |
| telefone | String | Telefone de contato |
| peso     | Double | Peso em kg          |
| altura   | Double | Altura em metros    |
| alergias | String | Alergias conhecidas |

> E-mail e senha não são atualizáveis por este endpoint.

#### DELETE /usuarios/me
Deleta a conta do usuário logado.

---

#### POST /usuarios/me/pacientes
Vincula um paciente ao cuidador logado.

> Requer que o usuário logado seja do tipo `CUIDADOR` e o alvo seja do tipo `PACIENTE`.

**Body:**
```json
{ "email": "paciente@email.com" }
```

#### GET /usuarios/me/pacientes
Lista todos os pacientes vinculados ao cuidador logado.

#### DELETE /usuarios/me/pacientes/{pacienteId}
Remove o vínculo com um paciente.

#### PUT /usuarios/me/pacientes/{pacienteId}
Cuidador atualiza os dados de um paciente vinculado.

**Body:** mesmo formato do `PUT /usuarios/me`.

---

### Medicamentos

> Todas as rotas requerem token JWT.
> Suportam o parâmetro `?pacienteId={id}` para cuidadores agirem em nome de um paciente.

#### POST /medicamentos
Cadastra um medicamento para o usuário logado.

Parâmetro opcional: `?gerarAlarmes=true` — gera os alarmes automaticamente após o cadastro.

**Body:**
```json
{
  "nome": "Dipirona 500mg",
  "horario": "08:00",
  "tipoFrequencia": "INTERVALO_HORAS",
  "valorFrequencia": 8,
  "dias": 7,
  "diasSemana": null
}
```

| Campo          | Tipo        | Obrigatório | Descrição                                              |
|----------------|-------------|-------------|--------------------------------------------------------|
| nome           | String      | Sim         | Nome do medicamento                                    |
| horario        | String      | Sim         | Horário inicial no formato `HH:mm`                     |
| tipoFrequencia | Enum        | Sim         | `INTERVALO_HORAS`, `VEZES_DIA` ou `DIAS_ESPECIFICOS`  |
| valorFrequencia| Integer     | Condicional | Horas de intervalo ou vezes por dia                    |
| dias           | Integer     | Não         | Duração do tratamento em dias                          |
| diasSemana     | List\<Integer\> | Condicional | Dias da semana (1=Seg...7=Dom). Só para `DIAS_ESPECIFICOS` |

**Valores de `tipoFrequencia`:**

| Valor           | Exemplo            | valorFrequencia | diasSemana     |
|-----------------|--------------------|-----------------|----------------|
| INTERVALO_HORAS | A cada 8 horas     | 8               | null           |
| VEZES_DIA       | 3x ao dia          | 3               | null           |
| DIAS_ESPECIFICOS| Segunda e sexta    | null            | [1, 5]         |

#### GET /medicamentos
Lista todos os medicamentos do usuário logado.

#### GET /medicamentos/{id}
Busca um medicamento por ID.

#### PUT /medicamentos/{id}
Atualiza um medicamento. Parâmetro opcional: `?gerarAlarmes=true`.

**Body:** mesmo formato do `POST /medicamentos`.

#### DELETE /medicamentos/{id}
Deleta um medicamento e seus alarmes associados.

#### POST /medicamentos/{id}/alarmes
Gera os alarmes de um medicamento já cadastrado.

---

### Alarmes

> Todas as rotas requerem token JWT.
> Suportam o parâmetro `?pacienteId={id}` para cuidadores.

Os alarmes são gerados automaticamente a partir dos dados do medicamento (horário, frequência e duração). Cada alarme representa um horário exato em que o medicamento deve ser tomado.

#### GET /alarmes
Lista todos os alarmes do usuário logado.

#### GET /alarmes/{id}
Busca um alarme por ID.

#### PUT /alarmes/{id}
Atualiza o horário de um alarme específico.

**Body:**
```json
{ "horario": "2026-05-20T09:00:00" }
```

#### PATCH /alarmes/{id}/tomado
Marca um alarme como tomado.

Sem body. Apenas altera o campo `tomado` para `true`.

#### DELETE /alarmes/{id}
Deleta um alarme específico.

---

### Sintomas

> Todas as rotas requerem token JWT.
> Suportam o parâmetro `?pacienteId={id}` para cuidadores.

#### POST /sintomas
Cadastra um sintoma.

**Body:**
```json
{
  "descricao": "Dor de cabeça",
  "categoria": "Neurologico",
  "intensidade": "Alta",
  "tipo": "Agudo",
  "data": "2026-05-15T08:00:00"
}
```

| Campo      | Tipo            | Obrigatório | Descrição                        |
|------------|-----------------|-------------|----------------------------------|
| descricao  | String          | Sim         | Descrição do sintoma             |
| categoria  | String          | Não         | Ex: Neurologico, Respiratorio    |
| intensidade| String          | Não         | Ex: Baixa, Media, Alta           |
| tipo       | String          | Não         | Ex: Agudo, Cronico               |
| data       | LocalDateTime   | Não         | Data e hora do sintoma           |

#### GET /sintomas
Lista todos os sintomas do usuário logado.

#### GET /sintomas/{id}
Busca um sintoma por ID.

#### PUT /sintomas/{id}
Atualiza um sintoma. **Body:** mesmo formato do `POST /sintomas`.

#### DELETE /sintomas/{id}
Deleta um sintoma.

---

### Exames

> Todas as rotas requerem token JWT.
> Suportam o parâmetro `?pacienteId={id}` para cuidadores.
> Os endpoints de cadastro e atualização usam `multipart/form-data`.

#### POST /exames
Cadastra um exame com upload de arquivo.

**Form-data:**

| Campo      | Tipo   | Obrigatório | Descrição                        |
|------------|--------|-------------|----------------------------------|
| nome       | Text   | Sim         | Nome do exame                    |
| observacao | Text   | Não         | Observações sobre o exame        |
| arquivo    | File   | Sim         | Arquivo do exame (PDF, imagem)   |

Tamanho máximo do arquivo: **400MB**.

#### GET /exames
Lista todos os exames do usuário logado.

#### GET /exames/{id}
Busca um exame por ID.

#### PUT /exames/{id}
Atualiza um exame. **Form-data:** mesmo formato do `POST /exames`.

#### DELETE /exames/{id}
Deleta um exame.

#### GET /exames/{id}/download
Faz o download do arquivo do exame.

---

### Receitas

> Todas as rotas requerem token JWT.
> Suportam o parâmetro `?pacienteId={id}` para cuidadores.
> Os endpoints de cadastro usam `multipart/form-data`.

#### POST /receitas
Cadastra uma receita com upload da imagem.

**Form-data:**

| Campo      | Tipo   | Obrigatório | Descrição                         |
|------------|--------|-------------|-----------------------------------|
| observacao | Text   | Não         | Observações sobre a receita       |
| arquivo    | File   | Sim         | Foto/scan da receita              |

**Resposta:**
```json
{
  "id": 1,
  "observacao": "Consulta 15/05",
  "imagem": "uploads/receitas/uuid_receita.jpg",
  "usuario": { "id": 1, "nome": "João" }
}
```

#### GET /receitas
Lista todas as receitas do usuário logado.

#### GET /receitas/{id}
Busca uma receita por ID.

#### DELETE /receitas/{id}
Deleta uma receita.

#### GET /receitas/{id}/download
Faz o download da imagem da receita.

#### POST /receitas/{id}/processar
Envia a imagem da receita para o Google Gemini e retorna os medicamentos extraídos.

Sem body. A imagem já deve estar salva (use `POST /receitas` antes).

**Resposta:**
```json
[
  {
    "nome": "Amoxicilina 500mg",
    "dias": "7",
    "tipoFrequencia": "INTERVALO_HORAS",
    "valorFrequencia": 8,
    "horarioInicial": "08:00",
    "diasSemana": null
  },
  {
    "nome": "Dipirona 500mg",
    "dias": null,
    "tipoFrequencia": "INTERVALO_HORAS",
    "valorFrequencia": 6,
    "horarioInicial": "08:00",
    "diasSemana": null
  }
]
```

> O frontend recebe esse JSON e decide se cadastra os medicamentos automaticamente ou exibe para o usuário confirmar.

---

## Parâmetros globais

Todos os endpoints de recursos (medicamentos, sintomas, exames, receitas, alarmes) aceitam os seguintes parâmetros opcionais via query string:

| Parâmetro    | Tipo    | Descrição                                                                 |
|--------------|---------|---------------------------------------------------------------------------|
| pacienteId   | Long    | Cuidador age em nome do paciente. Requer vínculo ativo.                   |
| gerarAlarmes | Boolean | Apenas em medicamentos. Gera alarmes automaticamente após salvar.         |

**Exemplo:**
```
POST /medicamentos?gerarAlarmes=true&pacienteId=7
```

---

## Estrutura do projeto

```
src/main/java/com/katui/
├── config/
│   ├── JwtFilter.java          # Filtro JWT nas requisições
│   ├── JwtService.java         # Geração e validação de tokens
│   ├── SecurityBeansConfig.java # Bean do PasswordEncoder
│   └── SecurityConfig.java     # Configuração do Spring Security
│
├── controller/
│   ├── AuthController.java
│   ├── AlarmeController.java
│   ├── ExameController.java
│   ├── MedicamentoController.java
│   ├── ReceitaController.java
│   ├── SintomaController.java
│   └── UsuarioController.java
│
├── dto/
│   └── ReceitaProcessadaDTO.java
│
├── entity/
│   ├── Alarme.java
│   ├── Exame.java
│   ├── Medicamento.java
│   ├── Receita.java
│   ├── Sintoma.java
│   ├── TipoUsuario.java        # Enum: PACIENTE, CUIDADOR
│   └── Usuario.java
│
├── repository/
│   ├── AlarmeRepository.java
│   ├── ExameRepository.java
│   ├── MedicamentoRepository.java
│   ├── ReceitaRepository.java
│   ├── SintomaRepository.java
│   └── UsuarioRepository.java
│
└── service/
    ├── AlarmeService.java      # Geração automática de alarmes
    ├── AuthService.java        # Registro e login
    ├── CuidadorService.java    # Vínculo cuidador-paciente
    ├── ExameService.java
    ├── MedicamentoService.java
    ├── OCRService.java         # Integração com Google Gemini
    ├── ReceitaService.java
    ├── SintomaService.java
    └── UsuarioService.java
```

# Katui — Acompanhamento Inteligente de Tratamento e Sintomas

Katu'I é um sistema completo de acompanhamento inteligente de tratamento e sintomas, desenvolvido para melhorar a qualidade de vida dos usuários através de uma interface intuitiva e funcionalidades robustas.

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Setup](#instalação-e-setup)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura](#arquitetura)
- [Serviços](#serviços)
- [API Endpoints](#api-endpoints)
- [Funcionalidades](#funcionalidades)
- [Configuração](#configuração)
- [Desenvolvido Por](#desenvolvido-por)

---

## 🎯 Visão Geral

Katui é uma plataforma de saúde digital que permite aos usuários:

- 📊 **Dashboard Inteligente**: Visualizar um resumo completo do seu acompanhamento de saúde
- 💊 **Gerenciamento de Medicamentos**: Registrar e acompanhar medicamentos prescritos
- 🩺 **Monitoramento de Sintomas**: Rastrear sintomas e seus padrões
- 📅 **Agendamento de Consultas**: Manter registro de consultas médicas
- 🧪 **Histórico de Exames**: Armazenar e visualizar resultados de exames
- 👤 **Perfil de Usuário**: Gerenciar informações pessoais e preferências
- 🤖 **IA Integrada**: Utilizar inteligência artificial para análises e recomendações

O projeto foi desenvolvido como **Projeto Integrador - Semestre 2** e combina um backend robusto em Spring Boot com um frontend responsivo em HTML/CSS/JavaScript.

---

## 🛠️ Tecnologias

### Backend
- **Java 21**: Linguagem de programação principal
- **Spring Boot 4.0.6**: Framework web e injeção de dependências
- **Spring Data JPA**: Persistência de dados e ORM
- **Spring Security**: Autenticação e autorização
- **PostgreSQL**: Banco de dados relacional
- **JWT (JSON Web Tokens)**: Autenticação stateless
- **OpenAI GPT-3**: Integração com IA para análises
- **Lombok**: Redução de boilerplate code
- **Maven**: Gerenciador de dependências
- **Docker**: Containerização

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilização responsiva
- **JavaScript Vanilla**: Interatividade e requisições dinâmicas
- **Acessibilidade WCAG 2.1 Nível AA**: Compatibilidade com leitores de tela

### Infraestrutura
- **Docker Compose**: Orquestração de containers
- **pgAdmin**: Interface gráfica para PostgreSQL
- **Insomnia**: Coleção de requisições para API testing

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Docker](https://www.docker.com/get-started) versão 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) versão 1.29+
- [Git](https://git-scm.com/) para clonar o repositório
- (Opcional) [Insomnia](https://insomnia.rest/) para testar a API

---

## 🚀 Instalação e Setup

### 1. Clone o Repositório

```bash
git clone https://github.com/BeaSMS/Katui.git
cd Katui
```

### 2. Configure as Variáveis de Ambiente (Opcional)

Se desejar personalizar as credenciais ou portas, edite o arquivo `docker-compose.yml`:

```yaml
# Exemplo de customização
environment:
  POSTGRES_PASSWORD: sua_senha_postgres
  PGADMIN_DEFAULT_PASSWORD: sua_senha_pgadmin
```

### 3. Inicie os Containers

```bash
docker-compose up --build
```

Este comando irá:
- ✅ Fazer build da imagem do backend
- ✅ Iniciar PostgreSQL
- ✅ Iniciar pgAdmin
- ✅ Iniciar o backend Spring Boot
- ✅ Criar volumes persistentes para dados

**Aguarde o build finalizar**. A primeira execu��ão pode levar alguns minutos.

### 4. Acesse a Aplicação

Após a inicialização, a aplicação estará disponível em:

```
Frontend:  http://localhost:3000 (se houver servidor estático)
Backend:   http://localhost:8086
```

---

## 📁 Estrutura do Projeto

```
Katui/
├── backend/                          # Aplicação Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/fateccotia/pi/
│   │   │   │   ├── controllers/      # REST Controllers
│   │   │   │   ├── services/         # Lógica de negócio
│   │   │   │   ├── repositories/     # Acesso a dados (JPA)
│   │   │   │   ├── models/           # Entidades JPA
│   │   │   │   ├── security/         # Configuração de segurança
│   │   │   │   ├── utils/            # Utilitários
│   │   │   │   └── KatuiApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── Dockerfile                    # Docker image definition
│   ├── pom.xml                       # Dependências Maven
│   ├── mvnw                          # Maven Wrapper (Unix)
│   └── mvnw.cmd                      # Maven Wrapper (Windows)
│
├── frontend/                         # Aplicação Web
│   ├── index.html                    # Página principal
│   ├── css/
│   │   └── style.css                 # Estilos globais
│   ├── js/
│   │   └── script.js                 # Lógica principal
│   └── paginas/                      # Páginas da aplicação
│       ├── dashboard.html
│       ├── medicamentos.html
│       ├── sintomas.html
│       ├── consultas.html
│       ├── perfil.html
│       └── exames.html
│
├── docker-compose.yml                # Composição de serviços
├── Insomnia_Katui.yaml              # Coleção de testes da API
└── README.md                        # Este arquivo

```

---

## 🏗️ Arquitetura

### Backend Architecture

```
┌─────────────────────────────────────────────────────┐
│                  REST API (Port 8086)               │
├─────────────────────────────────────────────────────┤
│                Spring Boot Application              │
├─────────────────────────────────────────────────────┤
│  Controllers  │  Services  │  Repositories (JPA)   │
├─────────────────────────────────────────────────────┤
│              Spring Security + JWT Auth             │
├─────────────────────────────────────────────────────┤
│         PostgreSQL Database (Port 5435)             │
└─────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌──────────────────────────────────────┐
│        index.html (Main Entry)       │
├──────────────────────────────────────┤
│   Navigation Component               │
├──────────────────────────────────────┤
│   Dynamic Content Loading (AJAX)     │
│   └─ paginas/*.html                  │
├──────────────────────────────────────┤
│   CSS Responsive Framework           │
├──────────────────────────────────────┤
│   JavaScript Event Handlers          │
│   └─ API Integration                 │
└──────────────────────────────────────┘
```

---

## 🔧 Serviços

| Serviço | URL | Protocolo | Credenciais | Status |
|---------|-----|-----------|-------------|--------|
| **Backend** | `http://localhost:8086` | HTTP/REST | N/A | ✅ API Principal |
| **pgAdmin** | `http://localhost:5055` | HTTP | `admin@katui.com` / `admin` | 📊 Gerenciamento BD |
| **PostgreSQL** | `localhost:5435` | TCP | `postgres` / `postgres` | 🗄️ Database |

### Verificar Status dos Containers

```bash
docker-compose ps
```

### Parar os Containers

```bash
docker-compose down
```

### Parar e Remover Volumes (Limpar dados)

```bash
docker-compose down -v
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8086/api/v1
```

### Autenticação
Todos os endpoints (exceto login/registro) requerem um **JWT Token** no header:
```
Authorization: Bearer {token}
```

### Principais Endpoints

#### 👤 Usuários
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `GET /users/{id}` - Obter informações do usuário
- `PUT /users/{id}` - Atualizar perfil

#### 💊 Medicamentos
- `GET /medications` - Listar medicamentos
- `POST /medications` - Criar novo medicamento
- `PUT /medications/{id}` - Atualizar medicamento
- `DELETE /medications/{id}` - Deletar medicamento

#### 🩺 Sintomas
- `GET /symptoms` - Listar sintomas
- `POST /symptoms` - Registrar novo sintoma
- `GET /symptoms/history/{userId}` - Histórico de sintomas

#### 📅 Consultas
- `GET /appointments` - Listar consultas
- `POST /appointments` - Agendar consulta
- `PUT /appointments/{id}` - Atualizar consulta
- `DELETE /appointments/{id}` - Cancelar consulta

#### 🧪 Exames
- `GET /exams` - Listar exames
- `POST /exams` - Registrar exame
- `GET /exams/{id}` - Obter detalhes do exame

#### 📊 Dashboard
- `GET /dashboard` - Dados consolidados do dashboard

**Para documentação completa da API**, importe o arquivo `Insomnia_Katui.yaml` no Insomnia.

---

## ✨ Funcionalidades

### Dashboard
- 📈 Resumo de saúde do último período
- 📊 Gráficos de evolução de sintomas
- 💊 Próximas doses de medicamentos
- 📅 Consultas próximas

### Medicamentos
- ➕ Adicionar novos medicamentos prescritos
- ✏️ Editar dosagem e frequência
- 🔔 Lembretes automáticos (integração futura)
- 📋 Histórico completo de medicações

### Sintomas
- 📝 Registrar sintomas diários
- 🩺 Classificação por tipo e intensidade
- 📊 Análise de padrões com IA
- 🧠 Recomendações personalizadas

### Consultas
- 📅 Agendar e gerenciar consultas
- 👨‍⚕️ Informações do médico/especialista
- 📄 Notas de consulta
- 🔗 Integração com histórico médico

### Perfil
- 👤 Informações pessoais
- 🏥 Histórico médico
- ⚠️ Alergias e condições pré-existentes
- 📱 Contato de emergência

### Exames
- 🧪 Registrar resultados de exames
- 📊 Comparação de resultados ao longo do tempo
- 📈 Interpretação com IA
- 📥 Upload de documentos

### Inteligência Artificial
- 🤖 Análise inteligente de padrões de sintomas
- 💡 Recomendações de saúde personalizadas
- 🧠 Processamento de linguagem natural para consultas

---

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

As variáveis são definidas no `docker-compose.yml`:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/katui
  SPRING_DATASOURCE_USERNAME: postgres
  SPRING_DATASOURCE_PASSWORD: postgres
  SPRING_JPA_HIBERNATE_DDL_AUTO: update
  JWT_SECRET: sua_chave_secreta_jwt
  OPENAI_API_KEY: sua_chave_openai
```

### Configuração do Banco de Dados

O banco de dados é criado automaticamente. Para resetar:

```bash
# Parar containers e remover volumes
docker-compose down -v

# Reiniciar
docker-compose up --build
```

### CORS (Cross-Origin Resource Sharing)

Configure CORS no backend para permitir requisições do frontend:

```java
// Em SecurityConfig.java
@Bean
public WebSecurityCustomizer webSecurityCustomizer() {
    return (web) -> web.ignoring()
        .requestMatchers("/error", "/favicon.ico");
}
```

---

## 🔐 Segurança

- ✅ **JWT Authentication**: Tokens seguros para autenticação stateless
- ✅ **Spring Security**: Proteção contra vulnerabilidades comuns
- ✅ **HTTPS (Recomendado)**: Para produção, use HTTPS
- ✅ **Password Hashing**: Senhas criptografadas com BCrypt
- ✅ **CORS Protection**: Validação de origens permitidas
- ✅ **Input Validation**: Validação em todas as entradas
- ✅ **SQL Injection Prevention**: Uso de JPA com query parametrizadas

---

## 📝 Logs e Debug

### Ver Logs do Backend

```bash
docker-compose logs -f backend
```

### Ver Logs do PostgreSQL

```bash
docker-compose logs -f postgres
```

### Acessar Logs Persistentes

```bash
docker exec katui-backend tail -f /var/log/spring-boot/application.log
```

---

## 🧪 Testando a API

### Com Insomnia (Recomendado)

1. Abra o Insomnia
2. Importe o arquivo `Insomnia_Katui.yaml`
3. Configure o ambiente com `http://localhost:8086`
4. Execute as requisições

### Com cURL

```bash
# Login
curl -X POST http://localhost:8086/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Listar medicamentos (com token)
curl -X GET http://localhost:8086/api/v1/medications \
  -H "Authorization: Bearer {seu_token}"
```

### Com Postman

Importe a coleção `Insomnia_Katui.yaml` (compatível com Postman também).

---

## 🚀 Deploy em Produção

### Build para Produção

```bash
# Build da imagem final
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Configurações Recomendadas para Produção

1. **Habilite HTTPS** com certificados SSL
2. **Configure variáveis sensíveis** em arquivo `.env`
3. **Use banco de dados gerenciado** (AWS RDS, Heroku Postgres, etc.)
4. **Implemente Backups** automáticos
5. **Configure Monitoramento** (DataDog, New Relic, etc.)
6. **Use CDN** para servir assets estáticos

---

## 📱 Responsividade

A aplicação é **totalmente responsiva** e funciona em:

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Smartphones (320px - 767px)

Todas as páginas foram testadas com:
- Chrome, Firefox, Safari, Edge
- Accessibility: WCAG 2.1 Nível AA

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📚 Documentação Adicional

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo `LICENSE` para detalhes.

---

## 👥 Desenvolvido Por

**Katu'I** foi desenvolvido como projeto integrador do **Semestre 2** por:

- **BeaSMS** - [@BeaSMS](https://github.com/BeaSMS)
- E membros da equipe de desenvolvimento

---

## 🎓 Instituição

Desenvolvido em parceria com a **FATEC Cotia** como projeto acadêmico.

---

## 📊 Status do Projeto

- ✅ Backend: Funcional
- ✅ Frontend: Em desenvolvimento
- ✅ API: Documentada
- 🔄 Testes: Em andamento
- 📋 Deploy: Pronto para produção

---

**Última atualização:** 16 de Maio de 2026

**Versão:** 0.0.1-SNAPSHOT

---

Feito com ♥️ para sua saúde

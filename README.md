# Katui — Acompanhamento Inteligente de Tratamento e Sintomas

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Docker](https://img.shields.io/badge/Docker-compatible-2496ED)

Katu'I é um sistema completo de acompanhamento inteligente de tratamento e sintomas, desenvolvido para melhorar a qualidade de vida dos usuários através de uma interface intuitiva, tecnologia IA e funcionalidades robustas.

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Rápida](#-instalação-rápida)
- [Serviços](#-serviços)
- [Funcionalidades](#-funcionalidades)
- [Documentação](#-documentação)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Visão Geral

**Katui** é uma plataforma de saúde digital que permite aos usuários e cuidadores:

- 📊 **Dashboard Inteligente**: Visualizar um resumo completo do acompanhamento de saúde
- 💊 **Gerenciamento de Medicamentos**: Registrar e acompanhar medicamentos com alarmes automáticos
- 🩺 **Monitoramento de Sintomas**: Rastrear sintomas e seus padrões ao longo do tempo
- 📅 **Agendamento de Consultas**: Manter registro centralizado de consultas médicas
- 🧪 **Histórico de Exames**: Armazenar e visualizar resultados de exames com comparações
- 👥 **Sistema de Cuidadores**: Permite que cuidadores gerenciem dados de pacientes
- 🤖 **IA Integrada**: Google Gemini para leitura automática de receitas e análises inteligentes
- 📱 **Acessível**: Desenvolvido com WCAG 2.1 Nível AA, totalmente responsivo

### Tipos de Usuário

| Tipo | Descrição |
|------|-----------|
| **PACIENTE** | Usuário padrão que gerencia seus próprios dados de saúde |
| **CUIDADOR** | Pode ser vinculado a pacientes e gerenciar seus dados |

---

## 🛠️ Tecnologias

### Backend
- **Java 21**: Linguagem principal com suporte a features modernas
- **Spring Boot 4.0.6**: Framework web com auto-configuração
- **Spring Data JPA**: ORM para persistência de dados
- **Spring Security**: Autenticação segura com JWT
- **PostgreSQL 16**: Banco de dados relacional robusto
- **JWT (JSON Web Tokens)**: Autenticação stateless com expiração de 24h
- **Google Gemini 2.5 Flash**: IA para processamento de receitas médicas
- **Lombok**: Redução de boilerplate code
- **Maven**: Gerenciador de dependências
- **Docker + Docker Compose**: Containerização e orquestração

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização responsiva e moderna
- **JavaScript Vanilla**: Interatividade sem dependências externas
- **Acessibilidade WCAG 2.1 Nível AA**: Compatibilidade com leitores de tela

### Infraestrutura
- **Docker Compose**: Orquestração simplificada
- **pgAdmin 4**: Interface gráfica para gerenciamento do banco
- **Insomnia**: Coleção de requisições para testes de API

---

## 📁 Estrutura do Projeto

```
Katui/
├── backend/                              # Aplicação Spring Boot
│   ├── src/
│   │   ├── main/java/com/katui/
│   │   │   ├── config/                  # Configuração JWT, Security
│   │   │   ├── controller/              # REST Controllers (7 controllers)
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   ├── entity/                  # Entidades JPA (7 entities)
│   │   │   ├── repository/              # Acesso a dados
│   │   │   ├── service/                 # Lógica de negócio
│   │   │   └── KatuiApplication.java   # Classe principal
│   │   ├── resources/
│   │   │   └── application.properties   # Configurações do app
│   │   └── test/                        # Testes unitários
│   ├── Dockerfile                       # Build do backend
│   ├── pom.xml                          # Dependências Maven
│   ├── mvnw & mvnw.cmd                  # Maven Wrapper
│   ├── uploads/                         # Armazenamento de arquivos
│   └── README.md                        # Documentação detalhada
│
├── frontend/                            # Aplicação Web
│   ├── index.html                       # Página principal (SPA)
│   ├── css/
│   │   └── style.css                    # Estilos globais e responsivos
│   ├── js/
│   │   └── script.js                    # Lógica principal e AJAX
│   └── paginas/                         # Páginas da aplicação
│       ├── dashboard.html               # Dashboard principal
│       ├── medicamentos.html            # Gerenciamento de medicamentos
│       ├── sintomas.html                # Registro de sintomas
│       ├── consultas.html               # Agendamento de consultas
│       ├── perfil.html                  # Perfil do usuário
│       └── exames.html                  # Histórico de exames
│
├── docker-compose.yml                   # Composição de serviços
├── Insomnia_Katui.yaml                  # Coleção de testes da API
└── README.md                            # Este arquivo

```

---

## 🏗️ Arquitetura

### Backend Architecture

```
┌───────────────────────────────────────────────────────────┐
│                REST API (Port 8086)                       │
├───────────────────────────────────────────────────────────┤
│              Spring Boot Application                      │
├────────────────────┬──────────────────┬──────────────────┤
│ Controllers (7)    │ Services (9)     │ Repositories (6) │
├────────────────────┼──────────────────┼──────────────────┤
│ · Auth             │ · AuthService    │ · UsuarioRepo    │
│ · Usuario          │ · UsuarioService │ · MedicamentoRepo│
│ · Medicamento      │ · CuidadorServ.  │ · AlarmeRepo     │
│ · Alarme           │ · MedicamentoS.  │ · SintomaRepo    │
│ · Sintoma          │ · AlarmeService  │ · ExameRepo      │
│ · Exame            │ · SintomaService │ · ReceitaRepo    │
│ · Receita          │ · ExameService   │                  │
│                    │ · ReceitaServ.   │                  │
│                    │ · OCRService     │                  │
├────────────────────┴──────────────────┴──────────────────┤
│         Spring Security + JWT Auth (24h expiry)          │
├───────────────────────────────────────────────────────────┤
│          PostgreSQL Database (Port 5435)                  │
└───────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌──────────────────────────────────────┐
│    index.html (Single Page App)      │
├──────────────────────────────────────┤
│  Navigation + Menu Responsivo        │
├──────────────────────────────────────┤
│  Dynamic Content Loading (AJAX)      │
│  ├─ paginas/dashboard.html           │
│  ├─ paginas/medicamentos.html        │
│  ├─ paginas/sintomas.html            │
│  ├─ paginas/consultas.html           │
│  ├─ paginas/perfil.html              │
│  └─ paginas/exames.html              │
├──────────────────────────────────────┤
│  CSS3 Responsive Framework           │
├──────────────────────────────────────┤
│  JavaScript Event Handlers           │
│  └─ API Integration (Fetch API)      │
└──────────────────────────────────────┘
```

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Versão | Link |
|-----------|--------|------|
| **Docker** | 20.10+ | [docker.com](https://www.docker.com/get-started) |
| **Docker Compose** | 1.29+ | [docs.docker.com/compose](https://docs.docker.com/compose/install/) |
| **Git** | 2.0+ | [git-scm.com](https://git-scm.com/) |
| **(Opcional) Insomnia** | latest | [insomnia.rest](https://insomnia.rest/) |

---

## 🚀 Instalação Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/BeaSMS/Katui.git
cd Katui
```

### 2. Inicie com Docker Compose

```bash
docker-compose up --build
```

Aguarde o build finalizar (2-5 minutos na primeira execução).

### 3. Acesse a Aplicação

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | N/A |
| **Backend** | http://localhost:8086 | N/A |
| **pgAdmin** | http://localhost:5055 | admin@katui.com / admin |

---

## 🔧 Serviços

### Status dos Containers

```bash
# Ver status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
```

### Gerenciar Containers

```bash
# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: perderá dados)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart backend
```

### Estrutura de Serviços

| Serviço | URL | Porta | Credenciais | Status |
|---------|-----|-------|-------------|--------|
| **Backend** | http://localhost:8086 | 8086 | N/A | ✅ API REST |
| **pgAdmin** | http://localhost:5055 | 5055 | admin@katui.com / admin | 📊 BD Management |
| **PostgreSQL** | localhost | 5435 | postgres / postgres | 🗄️ Database |

---

## ✨ Funcionalidades

### 📊 Dashboard
- Resumo completo de saúde com estatísticas
- Gráficos de evolução de sintomas
- Próximas doses de medicamentos
- Consultas agendadas

### 💊 Medicamentos
- Cadastro com múltiplos tipos de frequência
- Geração automática de alarmes
- Tipos de frequência:
  - **INTERVALO_HORAS**: A cada X horas
  - **VEZES_DIA**: X vezes ao dia
  - **DIAS_ESPECIFICOS**: Dias da semana específicos
- Histórico completo

### 🩺 Sintomas
- Registro com descrição, categoria, intensidade e tipo
- Classificação automática
- Análise de padrões com histórico
- Recomendações personalizadas

### 📅 Consultas
- Agendamento e gerenciamento
- Vinculação com médico/especialista
- Notas de consulta
- Histórico integrado

### 🧪 Exames
- Upload de arquivos (PDF, imagens)
- Armazenamento seguro (até 400MB)
- Download direto
- Comparação de resultados ao longo do tempo

### 👤 Perfil
- Informações pessoais completas
- Histórico médico
- Alergias e condições pré-existentes
- Contato de emergência

### 👥 Sistema de Cuidadores
- Vínculo entre cuidador e paciente
- Gerenciamento de dados em nome do paciente
- Suporte total com parâmetro `?pacienteId={id}`

### 🤖 IA Integrada
- Leitura automática de receitas com Google Gemini
- Extração de medicamentos
- Análise inteligente de padrões

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8086/api/v1
```

### Autenticação
Todos os endpoints (exceto login/registro) requerem **JWT Bearer Token**:
```
Authorization: Bearer {token}
```

**Token válido por 24 horas**

### Principais Endpoints

#### 🔐 Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar novo usuário |
| POST | `/auth/login` | Fazer login e obter token |

#### 👤 Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/usuarios/me` | Dados do usuário logado |
| PUT | `/usuarios/me` | Atualizar perfil |
| DELETE | `/usuarios/me` | Deletar conta |
| POST | `/usuarios/me/pacientes` | Vincular paciente (cuidador) |
| GET | `/usuarios/me/pacientes` | Listar pacientes (cuidador) |
| DELETE | `/usuarios/me/pacientes/{id}` | Desvincular paciente |

#### 💊 Medicamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/medicamentos` | Listar medicamentos |
| POST | `/medicamentos` | Criar medicamento |
| GET | `/medicamentos/{id}` | Obter medicamento |
| PUT | `/medicamentos/{id}` | Atualizar medicamento |
| DELETE | `/medicamentos/{id}` | Deletar medicamento |
| POST | `/medicamentos/{id}/alarmes` | Gerar alarmes |

#### 🔔 Alarmes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/alarmes` | Listar alarmes |
| PATCH | `/alarmes/{id}/tomado` | Marcar como tomado |

#### 🩺 Sintomas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/sintomas` | Listar sintomas |
| POST | `/sintomas` | Registrar sintoma |
| GET | `/sintomas/{id}` | Obter sintoma |
| DELETE | `/sintomas/{id}` | Deletar sintoma |

#### 🧪 Exames
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/exames` | Listar exames |
| POST | `/exames` | Cadastrar exame com upload |
| GET | `/exames/{id}/download` | Download do arquivo |

#### 📄 Receitas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/receitas` | Listar receitas |
| POST | `/receitas` | Cadastrar receita com upload |
| POST | `/receitas/{id}/processar` | Processar com Google Gemini |
| GET | `/receitas/{id}/download` | Download da receita |

**Para documentação completa**: Importe `Insomnia_Katui.yaml` no Insomnia ou Postman.

---

## 📚 Documentação

### Frontend
Veja a estrutura e funcionalidades no `frontend/` e importe a coleção de requisições.

### Backend
Documentação detalhada em `backend/README.md` com:
- Variáveis de ambiente
- Tipos de frequência de medicamentos
- Exemplos de requisições
- Estrutura de código
- Fluxos de alarmes

---

## ⚙️ Configuração Avançada

### Variáveis de Ambiente

Edite o `docker-compose.yml` para customizar:

```yaml
environment:
  # Banco de Dados
  POSTGRES_DB: katui
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  
  # Spring Boot
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/katui
  SPRING_DATASOURCE_USERNAME: postgres
  SPRING_DATASOURCE_PASSWORD: postgres
  
  # JWT
  jwt.secret: sua_chave_secreta_jwt_aqui
  
  # Google Gemini (obrigatório para receitas)
  gemini.api.key: sua_chave_api_gemini
```

### Obter Chaves de API

**Google Gemini:**
1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Clique em "Get API Key"
3. Crie uma chave e copie
4. Adicione ao docker-compose.yml

---

## 🔐 Segurança

- ✅ **JWT Authentication**: Tokens com expiração de 24h
- ✅ **Spring Security**: Proteção contra CSRF, XSS, CORS
- ✅ **Password Hashing**: BCrypt com salt automático
- ✅ **SQL Injection Prevention**: JPA com queries parametrizadas
- ✅ **Input Validation**: Validação em todas as entradas
- ✅ **HTTPS Recomendado**: Para produção com certificados SSL

---

## 🧪 Testando a API

### Com Insomnia (Recomendado)
1. Instale [Insomnia](https://insomnia.rest/)
2. Importe `Insomnia_Katui.yaml`
3. Configure o ambiente: `http://localhost:8086`
4. Execute as requisições

### Com cURL
```bash
# Login
curl -X POST http://localhost:8086/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","senha":"password123"}'

# Listar medicamentos
curl -X GET http://localhost:8086/api/v1/medicamentos \
  -H "Authorization: Bearer {seu_token}"
```

### Com Postman
Importe o arquivo `Insomnia_Katui.yaml` (compatível com Postman).

---

## 📱 Responsividade

A aplicação é **100% responsiva** e testada em:

| Dispositivo | Resoluções | Status |
|------------|-----------|--------|
| Desktop | 1920px+ | ✅ Otimizado |
| Tablet | 768px - 1024px | ✅ Responsivo |
| Mobile | 320px - 767px | ✅ Mobile-first |

### Compatibilidade de Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Acessibilidade
- ✅ WCAG 2.1 Nível AA
- ✅ Compatível com leitores de tela
- ✅ Contraste de cores adequado
- ✅ Navegação por teclado

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Faça um Fork** do projeto
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaFeature
   ```
3. **Commit suas mudanças**:
   ```bash
   git commit -m 'feat: adicionar MinhaFeature'
   ```
4. **Push para a branch**:
   ```bash
   git push origin feature/MinhaFeature
   ```
5. **Abra um Pull Request** com descrição clara

### Padrão de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas gerais

---

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/BeaSMS/Katui/issues) com:

- ✅ Descrição clara do problema
- ✅ Passos para reproduzir
- ✅ Comportamento esperado vs atual
- ✅ Screenshots/logs relevantes
- ✅ Ambiente (SO, navegador, versão)

---

## 📚 Documentação Adicional

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Docker Docs](https://docs.docker.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [Google Gemini API](https://ai.google.dev/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo `LICENSE` para detalhes.

---

## 👥 Desenvolvido Por

**Katu'I** foi desenvolvido como projeto integrador do **Semestre 2** por:

- **BeaSMS** - [@BeaSMS](https://github.com/BeaSMS)
- Equipe de desenvolvimento

---

## 🎓 Instituição

Desenvolvido em parceria com a **FATEC Cotia** como projeto acadêmico integrativo.

---

## 📊 Status do Projeto

| Componente | Status |
|-----------|--------|
| Backend (Spring Boot) | ✅ Funcional |
| Frontend (Web) | ✅ Em desenvolvimento |
| API REST | ✅ Documentada |
| Autenticação JWT | ✅ Implementada |
| Google Gemini | ✅ Integrado |
| Sistema de Alarmes | ✅ Funcional |
| Sistema de Cuidadores | ✅ Funcional |
| Testes Unitários | 🔄 Em andamento |
| Deploy Production | 📋 Pronto |

---

## 📞 Suporte e Contato

Para dúvidas ou suporte:

- 📧 **Issues**: [GitHub Issues](https://github.com/BeaSMS/Katui/issues)
- 📖 **Documentação**: Veja `backend/README.md` para detalhes técnicos
- 💬 **Discussões**: [GitHub Discussions](https://github.com/BeaSMS/Katui/discussions)

---

## 🎉 Agradecimentos

Agradecimentos especiais a:

- Spring Boot Team
- PostgreSQL Community
- Docker Community
- Google Gemini API
- Todos os contribuidores

---

**Última atualização:** 27 de Maio de 2026

**Versão:** 0.0.1-SNAPSHOT (Beta)

---

Feito com ♥️ para sua saúde.

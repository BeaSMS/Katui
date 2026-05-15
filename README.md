# Katui — Backend

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados

---

## Subindo o ambiente

**1. Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/katui.git
cd katui
```

**2. Suba os containers:**

```bash
docker-compose up --build
```

Aguarde o build finalizar. O backend estará disponível em `http://localhost:8086`.

---

## Serviços

| Serviço    | URL                   | Credenciais             |
|------------|-----------------------|-------------------------|
| Backend    | http://localhost:8086 | —                       |
| pgAdmin    | http://localhost:5055 | admin@katui.com / admin |
| PostgreSQL | localhost:5435        | postgres / postgres     |

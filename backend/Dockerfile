# -------- Étape de build --------
FROM python:3.11-slim AS builder

WORKDIR /app

# Installe uniquement les outils nécessaires pour la compilation
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Installe les dépendances dans un dossier local
RUN pip install --no-cache-dir --user -r requirements.txt


# -------- Étape finale légère --------
FROM python:3.11-slim

WORKDIR /app

# Copie les libs Python depuis l’étape de build
COPY --from=builder /root/.local /root/.local

# Met à jour le PATH pour inclure les libs locales
ENV PATH=/root/.local/bin:$PATH

# Copie le code source de l’application
COPY . .

EXPOSE 5000

CMD ["python", "-u", "app.py"]

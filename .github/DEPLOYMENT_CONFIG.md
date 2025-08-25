# ================================

# CONFIGURACIÓN DE ENVIRONMENTS

# ================================

# Para configurar environments en GitHub:

# 1. Ve a Settings > Environments en tu repositorio

# 2. Crea los siguientes environments:

## STAGING ENVIRONMENT

Name: staging
Protection Rules:

- ✅ Required reviewers: 0 (para desarrollo rápido)
- ✅ Wait timer: 0 minutes
- ✅ Deployment branches: develop branch only

Environment Variables:

- API_URL: https://api-staging.wira.com
- DATABASE_CONNECTION: [staging database connection]
- JWT_SECRET: [staging jwt secret]
- EMAIL_SMTP_SERVER: [staging email config]

## PRODUCTION ENVIRONMENT

Name: production
Protection Rules:

- ✅ Required reviewers: 1-2 (para seguridad)
- ✅ Wait timer: 5 minutes (tiempo para cancelar si hay problemas)
- ✅ Deployment branches: main branch only

Environment Variables:

- API_URL: https://api.wira.com
- DATABASE_CONNECTION: [production database connection]
- JWT_SECRET: [production jwt secret - MUY SEGURO]
- EMAIL_SMTP_SERVER: [production email config]

# ================================

# SECRETS A CONFIGURAR

# ================================

# Ve a Settings > Secrets and variables > Actions

# Agrega estos repository secrets:

## GENERAL SECRETS (todos los environments)

- CODECOV_TOKEN: [para reportes de cobertura]
- DOCKER_HUB_USERNAME: [si usas Docker]
- DOCKER_HUB_ACCESS_TOKEN: [si usas Docker]

## DEPLOYMENT SECRETS

- AZURE_CREDENTIALS: [si despliegas en Azure]
- AWS_ACCESS_KEY_ID: [si despliegas en AWS]
- AWS_SECRET_ACCESS_KEY: [si despliegas en AWS]
- HEROKU_API_KEY: [si despliegas en Heroku]

# ================================

# BRANCH PROTECTION RULES

# ================================

# Settings > Branches > Add protection rule

## MAIN BRANCH

Branch name pattern: main

- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - backend-test
  - frontend-test
  - security-analysis
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Include administrators

## DEVELOP BRANCH

Branch name pattern: develop

- ✅ Require status checks to pass before merging
  - backend-test
  - frontend-test
- ✅ Require branches to be up to date before merging

# 🚀 GUÍA DE CONFIGURACIÓN CI/CD - WIRA

## 📋 PASOS PARA ACTIVAR EL PIPELINE

### 1. 🔧 CONFIGURACIÓN INICIAL EN GITHUB

#### Subir archivos al repositorio:

```bash
cd C:/Proyectos/Wira
git add .github/
git commit -m "feat: add CI/CD pipeline with GitHub Actions"
git push origin main
```

### 2. 🔒 CONFIGURAR ENVIRONMENTS

1. Ve a tu repositorio en GitHub
2. Settings > Environments
3. Crea dos environments:

#### **Staging Environment:**

- Name: `staging`
- Deployment branches: `develop` only
- Protection rules: No required reviewers (desarrollo rápido)

#### **Production Environment:**

- Name: `production`
- Deployment branches: `main` only
- Protection rules: 1-2 required reviewers
- Wait timer: 5 minutes

### 3. 🔐 CONFIGURAR SECRETS

Settings > Secrets and variables > Actions > New repository secret

#### **Secrets básicos:**

```
CODECOV_TOKEN: (opcional - para reportes de cobertura)
```

#### **Para deployment (agregar según tu plataforma):**

```
# Azure
AZURE_CREDENTIALS: {...}

# AWS
AWS_ACCESS_KEY_ID: xxx
AWS_SECRET_ACCESS_KEY: xxx

# Heroku
HEROKU_API_KEY: xxx

# Docker Hub
DOCKER_HUB_USERNAME: xxx
DOCKER_HUB_ACCESS_TOKEN: xxx
```

### 4. 🛡️ CONFIGURAR BRANCH PROTECTION

Settings > Branches > Add protection rule

#### **Main Branch:**

- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass:
  - `backend-test`
  - `frontend-test`
  - `security-analysis`
- ✅ Require branches to be up to date

#### **Develop Branch:**

- Branch name pattern: `develop`
- ✅ Require status checks to pass:
  - `backend-test`
  - `frontend-test`

### 5. 🔄 CONFIGURAR BRANCH STRATEGY

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
hotfix/* (emergency fixes)
```

## 📊 WORKFLOWS CONFIGURADOS

### 1. **ci-cd.yml** - Pipeline Principal

- ✅ Trigger: Push/PR a main/develop
- ✅ Tests backend (100 unitarios + 12 integración)
- ✅ Tests frontend (cuando se agreguen)
- ✅ Análisis de seguridad
- ✅ Deploy automático staging (develop)
- ✅ Deploy automático production (main)

### 2. **pr-validation.yml** - Validación de PRs

- ✅ Trigger: PRs a main/develop
- ✅ Tests rápidos
- ✅ Comentarios automáticos en PR

### 3. **hotfix.yml** - Hotfixes de Emergencia

- ✅ Trigger: Push a hotfix/\*
- ✅ Tests críticos únicamente
- ✅ Deploy directo a producción

## 🚀 CÓMO USAR EL PIPELINE

### **Desarrollo Normal:**

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub hacia develop

# 4. El pipeline validará automáticamente
# 5. Merge a develop → Deploy automático a staging
# 6. PR de develop a main → Deploy a production
```

### **Hotfixes de Emergencia:**

```bash
# 1. Crear hotfix desde main
git checkout main
git checkout -b hotfix/fix-critico

# 2. Hacer el fix
git add .
git commit -m "fix: resolver problema crítico"

# 3. Push → Deploy automático a production
git push origin hotfix/fix-critico
```

## 📈 MÉTRICAS Y MONITORING

### **Lo que el pipeline reporta:**

- ✅ Resultados de 112 tests
- ✅ Cobertura de código
- ✅ Análisis de seguridad
- ✅ Tiempo de build
- ✅ Success/failure de deployments

### **Dashboards disponibles:**

- GitHub Actions (automático)
- Codecov (si configuras el token)
- Deployment status por environment

## 🔧 PRÓXIMOS PASOS RECOMENDADOS

### **Inmediato:**

1. ✅ Subir configuración a GitHub
2. ✅ Configurar environments
3. ✅ Configurar branch protection
4. ✅ Probar con un PR de prueba

### **Corto plazo:**

1. Agregar tests al frontend
2. Configurar deployment real (Azure/AWS/Heroku)
3. Configurar monitoring (Application Insights, etc.)
4. Agregar notificaciones (Slack, Teams, Email)

### **Mediano plazo:**

1. Performance testing
2. Load testing
3. Automated security scanning
4. Database migration automation

## 🆘 TROUBLESHOOTING

### **Pipeline falla en tests:**

```bash
# Correr tests localmente
cd backend/Wira.Api.Tests
dotnet test --verbosity normal
```

### **Deployment falla:**

1. Verificar secrets configurados
2. Verificar permisos de environment
3. Revisar logs en Actions tab

### **PR bloqueado:**

1. Verificar que tests pasen
2. Verificar que branch esté actualizado
3. Verificar required reviews

¡El pipeline está listo! 🎉

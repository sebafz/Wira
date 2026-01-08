# Proyecto Wira
<div align="center">
<img src="https://res.cloudinary.com/dbkb6ywuz/image/upload/v1752202258/wira2-removebg-preview_aoecda.png" width="35%" >
  <br>
  <sup>Sistema de licitación para mineras del norte argentino</sup>
</div>
Este proyecto tiene como objetivo desarrollar una plataforma de licitación en línea que promueva la libre competencia, transparencia y eficiencia en la contratación de proveedores por parte de empresas mineras del norte argentino.

## Contexto

En el norte argentino, particularmente en Salta, la actividad minera ha crecido exponencialmente en la última década. Sin embargo, la falta de competencia entre proveedores impide el desarrollo de un ecosistema comercial justo y eficiente. Este sistema busca digitalizar y democratizar el proceso de compra, facilitando la conexión entre empresas mineras y proveedores locales.

## Estructura del Proyecto

```
/Wira
├── backend/            # API RESTful en .NET Core 9
│   ├── Controllers/
│   ├── Models/
│   ├── Repositories/
│   │   └── Interfaces/
│   ├── Services/
│   │   └── Interfaces/
│   ├── appsettings.json
│   ├── Program.cs
│   └── Wira.http
│
├── frontend/           # Aplicación cliente en React
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
└── README.md           # Este archivo
```

## Tecnologías Utilizadas

### Backend (.NET Core 9)

- C#
- ASP.NET Core Web API
- Entity Framework (planeado)
- Patrón MVC y arquitectura por capas
- Swagger para documentación de endpoints

### Frontend (React)

- React 19 + Vite
- Styled Components
- Axios (para conexión con API)
- Eslint y config modular

## Objetivos del sistema

- Permitir a empresas mineras publicar licitaciones con fecha límite y presupuesto.
- Habilitar a proveedores locales para presentar sus ofertas digitalmente.
- Fomentar la libre competencia, accesibilidad y trazabilidad del proceso.
- Aumentar la eficiencia del abastecimiento en el sector minero.
- Proteger la integridad y confidencialidad de los datos a través de prácticas de ciberseguridad (HTTPS, autenticación, encriptación, logging).

## Funcionalidades previstas

- Registro y login de usuarios con roles diferenciados (minera / proveedor).
- Creación y publicación de licitaciones por parte de empresas mineras.
- Postulación de ofertas por parte de proveedores registrados.
- Visualización del historial de licitaciones y ofertas.
- Selección y adjudicación de ofertas ganadoras.
- Envío y gestión de archivos adjuntos en licitaciones y ofertas.
- Sistema de auditoría básica (acciones clave de usuarios).
- Filtros de búsqueda en licitaciones por rubro, fecha, estado.
- Sistema de notificaciones.
- Preparado para futuras funcionalidades y escalabilidad.

## Requisitos para ejecutar el proyecto

### Backend
- .NET 9 SDK
- SQL Server o base de datos relacional compatible

```bash
cd backend/Wira.Api
dotnet restore
dotnet run
```

Por defecto: `https://localhost:5242/swagger`

---

### Frontend
- Node.js >= 18

```bash
cd frontend/Wira
npm install
npm run dev
```

Por defecto: `http://localhost:5173`

---

## Despliegue a Render (dev/main)

- Infraestructura declarada en `render.yaml` con cuatro servicios: backend y frontend para `dev` y `main`, con despliegue automático por rama.
- Base de datos: la API usa SQL Server (`Microsoft.EntityFrameworkCore.SqlServer`), Render no ofrece SQL Server gestionado. Usa un SQL Server externo (Azure SQL u on-prem expuesto de forma segura) y define `ConnectionStrings__DefaultConnection` en cada servicio.
- Configurar env vars en Render: `Jwt__Key` (>=32 chars), `Jwt__Issuer`, `Jwt__Audience`, `Email__*`, `Frontend__BaseUrl`, `VITE_API_URL` en los sitios estáticos. El almacenamiento de adjuntos es en disco local y efímero en Render; para persistencia usa un bucket externo (S3/compatible) antes de producción.
- Workflow `render-deploy.yml`: al hacer push a `dev` o `main` se llama al deploy hook de Render. Añade en GitHub Secrets los hooks de cada servicio: `RENDER_HOOK_API_DEV`, `RENDER_HOOK_WEB_DEV`, `RENDER_HOOK_API_PROD`, `RENDER_HOOK_WEB_PROD`.
- Flujo: commit a `dev` → Render despliega `wira-api-dev` y `wira-web-dev`; commit a `main` → Render despliega `wira-api-prod` y `wira-web-prod`.
- Verificación rápida: en Render revisa logs de build/run, prueba `/swagger` de la API y la SPA ya publicada con la URL configurada en `VITE_API_URL`.
- Para ver Swagger en Render: añade env var `Swagger__Enabled=true` en el servicio de la API. La ruta es `/swagger`.

## Seguridad y buenas prácticas

- Autenticación: uso de contraseñas cifradas y roles
- HTTPS y cifrado de datos en tránsito
- Logs de auditoría de acciones de usuarios
- Separación de responsabilidades por capas:
  - `Controllers/` → entrada HTTP
  - `Services/` → lógica de negocio
  - `Repositories/` → acceso a datos

## Metodología de trabajo

- Modelo de desarrollo: **iterativo e incremental**
- Git flow para control de versiones
- Historias de usuario con fórmula **INVEST**
- Diseño basado en principios **MVC** y patrones de diseño reutilizables

## Autor

**Nombre:** Sebastián Fernandez Zavalía
**Carrera:** Ingeniería Informática
**Universidad:** Universidad Católica de Salta
**Fecha:** 2025


## Estado actual

- [x] Estructura inicial
- [x] Incremento 1 – Autenticación y carga de licitaciones
- [x] Incremento 2 – Parámetros de licitaciones y recepción de ofertas
- [x] Incremento 3 – Generación de ranking de propuestas
- [x] Incremento 4 – Notificaciones y auditoría
- [x] Incremento 5 – Historial de participación y calificación post-licitación
- [x] Validaciones y pruebas
- [ ] Integraciones finales
- [ ] CI/CD y producción

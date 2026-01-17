# Sistema Wira
<div align="center">
<img src="https://res.cloudinary.com/dbkb6ywuz/image/upload/v1752202258/wira2-removebg-preview_aoecda.png" width="35%" >
  <br>
  <sup>Sistema de licitación para mineras del norte argentino</sup>
</div>
Este proyecto tiene como objetivo desarrollar una plataforma de licitación en línea que promueva la libre competencia, transparencia y eficiencia en la contratación de proveedores por parte de empresas mineras del norte argentino.

## Objetivos del sistema

- Facilitar la interacción entre empresas mineras y proveedores mediante una plataforma digital unificada.
- Mejorar la transparencia y trazabilidad de los procesos de evaluación y adjudicación.
- Permitir la gestión de usuarios, roles y permisos acorde a los distintos actores del sistema.
- Proveer herramientas que acompañen la toma de decisiones a partir de criterios objetivos y configurables.
- Proteger la integridad y confidencialidad de los datos a través de prácticas de ciberseguridad (HTTPS, autenticación, encriptación, logging).

## Funcionalidades previstas

- Autenticación y gestión de usuarios con roles (minera / proveedor / admin).
- Administración de empresas mineras y rubros.
- Creación, publicación y gestión de licitaciones con criterios y opciones.
- Presentación de propuestas por proveedores; generación automática de ranking.
- Historial de participación por proveedor y calificación post-licitación.
- Notificaciones y trazabilidad mediante auditoría de acciones.
- Gestión de archivos adjuntos en licitaciones y propuestas.
- Búsquedas y filtros por rubro, fecha, estado y moneda.

## Estructura del proyecto

```
/Wira
├── backend/            # API RESTful en .NET Core 9
│   ├── Controllers/    # Endpoints HTTP
│   ├── Data/           # DbContext e inicialización
│   ├── DTOs/           # Contratos de entrada/salida
│   ├── Migrations/     # Migraciones EF Core
│   ├── Models/         # Entidades de dominio
│   ├── Services/       # Lógica de negocio
│   ├── appsettings.json
│   ├── Program.cs
│   └── Wira.Api.http
│
├── frontend/           # Aplicación cliente en React
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   └── package.json
│
└── README.md           # Este archivo
```

## Tecnologías utilizadas

### Backend (.NET Core 9)

- C#
- ASP.NET Core Web API
- Entity Framework Core + Npgsql (PostgreSQL)
- Patrón MVC y arquitectura por capas
- Swagger para documentación de endpoints
- Autenticación JWT y autorización por roles

### Frontend (React)

- React 19 + Vite
- Styled Components
- Axios (para conexión con API)
- Eslint y config modular

## Requisitos para ejecutar el proyecto

### Backend (local)
- .NET 9 SDK
- PostgreSQL (migrado de SQL Server para compatibilidad con Render)

Variables de entorno mínimas:

```
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=wira;Username=postgres;Password=postgres
Jwt__Key=<clave de 32+ caracteres>
Jwt__Issuer=wira
Jwt__Audience=wira-client
Swagger__Enabled=true
```

```bash
cd backend/Wira.Api
dotnet restore
dotnet run
```

Por defecto: `https://localhost:5242/swagger`

---

### Frontend (local)
- Node.js >= 18

```bash
cd frontend/Wira
npm install
npm run dev
```

Por defecto: `http://localhost:5173`

---

## Despliegue a Render (main)

- Infraestructura con backend y frontend para `main`, con despliegue automático.
- Base de datos: PostgreSQL gestionado por Render. Crea una instancia y usa `ConnectionStrings__DefaultConnection` con cadena Npgsql.
- URLs de prueba:
  - Frontend (SPA): https://wira-app.onrender.com/
  - Backend (Swagger): https://wira-vhg3.onrender.com/swagger/index.html
- Variables de entorno en Render: `ConnectionStrings__DefaultConnection`, `Jwt__Key` (>=32 chars), `Jwt__Issuer`, `Jwt__Audience`, `Email__*`, `Frontend__BaseUrl`, y `VITE_API_URL` en el sitio estático.

## Seguridad y buenas prácticas

- **Autenticación y autorización**: uso de contraseñas cifradas y control de acceso basado en roles (RBAC).
- **Comunicación segura**: uso de HTTPS para el cifrado de datos en tránsito entre cliente y servidor.
- **Trazabilidad y auditoría**: registro de acciones relevantes de los usuarios mediante logs de auditoría.
- **Validación de datos**: validaciones en backend para prevenir datos inconsistentes o accesos no autorizados.
- **Separación de responsabilidades**: arquitectura en capas para mejorar mantenibilidad y seguridad:
  - `Controllers/` → gestión de solicitudes HTTP y validaciones iniciales
  - `Services/` → lógica de negocio y reglas de negocio
  - `Repositories/` → acceso a datos y persistencia
- **Configuración segura**: uso de variables de entorno para credenciales y parámetros sensibles.
- **Control de errores**: manejo centralizado de errores sin exponer información sensible al cliente.


## Metodología de trabajo

- Modelo de desarrollo: **iterativo e incremental**
- Git flow para control de versiones
- Historias de usuario con fórmula **INVEST**
- Diseño basado en principios **MVC** y patrones de diseño reutilizables

## Autor

- **Nombre:** Sebastián Fernandez Zavalía
- **Carrera:** Ingeniería Informática
- **Universidad:** Universidad Católica de Salta
- **Fecha:** 2025


## Versiones

- v1.0.0: presentación del proyecto de grado.
- v2.0.0: correcciones y mejoras solicitadas por el jurado.
- v2.1.0 (actual): corrección de errores y migraciones de base de datos (PostgreSQL), ajustes en funcionalidades y despliegues en Render.

## Estado actual

- [x] Estructura inicial
- [x] Incremento 1 – Autenticación y carga de licitaciones
- [x] Incremento 2 – Publicación de ofertas y generación de ranking
- [x] Incremento 3 – Funciones para administradores, gestión de notificaciones; auditoría y trazabilidad
- [x] Incremento 4 – Historial de participación y calificación poslicitacion; gestión del perfil.
- [x] Validaciones y pruebas
- [x] Integraciones finales
- [x] CI/CD y producción
- [x] Despliegue en Render
- [x] Correcciones del Tribunal Evaluador

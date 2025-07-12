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
├── backend/            # API RESTful en .NET Core 8
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

### Backend (.NET Core 8)

- C#
- ASP.NET Core Web API
- Entity Framework (planeado)
- Patrón MVC y arquitectura por capas
- Swagger para documentación de endpoints

### Frontend (React)

- React 18 + Vite
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
- .NET 8 SDK
- SQL Server o base de datos relacional compatible

```bash
cd backend
dotnet restore
dotnet run
```

Por defecto: `https://localhost:5001/swagger`

---

### Frontend
- Node.js >= 18

```bash
cd frontend
npm install
npm run dev
```

Por defecto: `http://localhost:5173`

---

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

**Nombre:** [Tu nombre aquí]  
**Carrera:** Ingeniería Informática  
**Universidad:** [Tu universidad]  
**Fecha:** 2025

## Estado actual

- [x] Estructura inicial
- [ ] Incremento 1 – Autenticación y carga de licitaciones
- [ ] Incremento 2 – Parámetros de licitaciones y recepción de ofertas
- [ ] Incremento 3 – Generación de ranking de propuestas
- [ ] Incremento 4 – Notificaciones y auditoría
- [ ] Incremento 5 – Historial de participación y calificación post-licitación
- [ ] Validaciones y pruebas
- [ ] Integraciones finales
- [ ] CI/CD y producción

using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace Wira.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var ahora = new DateTime(2026, 1, 4, 0, 0, 0, DateTimeKind.Utc);

            // Monedas
            migrationBuilder.InsertData(
                table: "Monedas",
                columns: new[] { "MonedaID", "Codigo", "Nombre", "Simbolo", "Activo" },
                values: new object[,]
                {
                    { 1, "ARS", "Peso argentino", "$", true },
                    { 2, "USD", "Dólar estadounidense", "US$", true }
                });

            // Roles
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RolID", "Nombre", "Descripcion" },
                values: new object[,]
                {
                    { 1, "MINERA_ADMINISTRADOR", "Minera - Administrador" },
                    { 2, "MINERA_USUARIO", "Minera - Usuario" },
                    { 3, "PROVEEDOR_ADMINISTRADOR", "Proveedor - Administrador" },
                    { 4, "PROVEEDOR_USUARIO", "Proveedor - Usuario" },
                    { 5, "ADMIN_SISTEMA", "Administrador del sistema" }
                });

            // Estados de licitación
            migrationBuilder.InsertData(
                table: "EstadosLicitacion",
                columns: new[] { "EstadoLicitacionID", "NombreEstado" },
                values: new object[,]
                {
                    { 1, "Borrador" },
                    { 2, "Publicada" },
                    { 3, "En Evaluación" },
                    { 4, "Adjudicada" },
                    { 5, "Cancelada" },
                    { 6, "Cerrada" }
                });

            // Estados de propuesta
            migrationBuilder.InsertData(
                table: "EstadosPropuesta",
                columns: new[] { "EstadoPropuestaID", "NombreEstado" },
                values: new object[,]
                {
                    { 1, "Enviada" },
                    { 2, "En Revisión" },
                    { 3, "Aprobada" },
                    { 4, "Rechazada" },
                    { 5, "Adjudicada" }
                });

            // Rubros
            migrationBuilder.InsertData(
                table: "Rubros",
                columns: new[] { "RubroID", "Nombre", "Activo" },
                values: new object[,]
                {
                    { 1, "Construcción e infraestructura", true },
                    { 2, "Transporte y logística", true },
                    { 3, "Equipos y maquinarias", true },
                    { 4, "Servicios profesionales", true },
                    { 5, "Suministros y materiales", true },
                    { 6, "Mantenimiento y reparaciones", true },
                    { 7, "Seguridad industrial", true },
                    { 8, "Medio ambiente y sustentabilidad", true },
                    { 9, "Reactivos químicos", true },
                    { 10, "Tecnología y software", true }
                });

            // Empresas mineras
            migrationBuilder.InsertData(
                table: "Empresas",
                columns: new[] { "EmpresaID", "Nombre", "RazonSocial", "CUIT", "EmailContacto", "Telefono", "TipoEmpresa", "FechaAlta", "Activo", "RubroID" },
                values: new object[,]
                {
                    { 1, "Borax Argentina", "Borax Argentina SA", "30-12345678-9", "contacto@borax.com", "+54 9 11 4000 0001", "MINERA", ahora, true, null },
                    { 2, "Bajo de la Alumbrera", "Bajo de la Alumbrera SA", "30-87654321-2", "info@bajoalumbrera.com", "+54 9 11 4000 0002", "MINERA", ahora, true, null },
                    { 3, "Cauchari-Olaroz", "Cauchari-Olaroz SA", "30-11223344-5", "contacto@cauchari-olaroz.com", "+54 9 11 4000 0003", "MINERA", ahora, true, null }
                });

            // Empresas proveedoras
            migrationBuilder.InsertData(
                table: "Empresas",
                columns: new[] { "EmpresaID", "Nombre", "RazonSocial", "CUIT", "EmailContacto", "Telefono", "TipoEmpresa", "FechaAlta", "Activo", "RubroID" },
                values: new object[,]
                {
                    { 4, "Transportes del Norte", "Transportes del Norte SA", "30-55667788-1", null, "+54 9 381 200 0001", "PROVEEDOR", ahora, true, 2 },
                    { 5, "Equipos Mineros", "Equipos Mineros SRL", "30-99887766-4", null, "+54 9 381 200 0002", "PROVEEDOR", ahora, true, 3 },
                    { 6, "Servicios Técnicos Unidos", "Servicios Técnicos Unidos SA", "30-44556677-7", null, "+54 9 381 200 0003", "PROVEEDOR", ahora, true, 6 },
                    { 7, "Químicos Industriales", "Químicos Industriales SA", "30-33445566-9", null, "+54 9 381 200 0004", "PROVEEDOR", ahora, true, 9 }
                });

            // Usuarios (bcrypt hash de "123456")
            const string passwordHash = "$2a$11$Kqnc1OBwzhjg3kzP/d9vyuk3F7S3w7Dnk3a1JpN96CB2A2n6U5HNe";

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[]
                {
                    "UsuarioID", "Email", "PasswordHash", "Nombre", "Apellido", "DNI", "Telefono", "Activo", "FechaRegistro",
                    "FechaBaja", "EstadoAprobacion", "FechaAprobacion", "AprobadoPorUsuarioID", "MotivoRechazo", "ValidadoEmail",
                    "TokenVerificacionEmail", "FechaVencimientoTokenVerificacion", "TokenRecuperacionPassword", "FechaVencimientoTokenRecuperacion", "EmpresaID"
                },
                values: new object[,]
                {
                    { 1, "minera@gmail.com", passwordHash, "Usuario Minera", "Demo", "20000001", "+54 9 387 4000 1001", true, ahora, null, "APROBADO", ahora, null, null, true, null, null, null, null, 1 },
                    { 2, "proveedor@gmail.com", passwordHash, "Usuario Proveedor", "Demo", "20000002", "+54 9 387 3000 2001", true, ahora, null, "APROBADO", ahora, null, null, true, null, null, null, null, 4 },
                    { 3, "admin@gmail.com", passwordHash, "Admin", "Principal", "20000000", "+54 9 387 4000 1111", true, ahora, null, "APROBADO", ahora, null, null, true, null, null, null, null, null },
                    { 4, "mineraadmin@gmail.com", passwordHash, "Admin Minera", "Demo", "20000003", "+54 9 387 5000 1002", true, ahora, null, "APROBADO", ahora, null, null, true, null, null, null, null, 1 },
                    { 5, "proveedoradmin@gmail.com", passwordHash, "Admin Proveedor", "Demo", "20000004", "+54 9 11 4000 2002", true, ahora, null, "APROBADO", ahora, null, null, true, null, null, null, null, 4 }
                });

            // Usuarios-Roles
            migrationBuilder.InsertData(
                table: "UsuariosRoles",
                columns: new[] { "UsuarioID", "RolID" },
                values: new object[,]
                {
                    { 1, 2 }, // minera usuario
                    { 2, 4 }, // proveedor usuario
                    { 3, 5 }, // admin sistema
                    { 4, 1 }, // minera admin
                    { 5, 3 }  // proveedor admin
                });

            // Proyectos mineros para Borax (EmpresaID 1)
            migrationBuilder.InsertData(
                table: "ProyectosMineros",
                columns: new[] { "ProyectoMineroID", "MineraID", "Nombre", "Ubicacion", "Descripcion", "FechaInicio", "Activo" },
                values: new object[,]
                {
                    { 1, 1, "Extracción Tinkal", "Salar del Hombre Muerto, Catamarca", "Proyecto de extracción de boratos en la cuenca de Tincalayu, fase de expansión de operaciones existentes con nuevas tecnologías de extracción sostenible.", ahora.AddMonths(-18), true },
                    { 2, 1, "Planta de Refinado Norte", "Campo Quijano, Salta", "Construcción de nueva planta de refinado de ácido bórico con tecnología de última generación para incrementar la capacidad de procesamiento.", ahora.AddMonths(-12), true },
                    { 3, 1, "Modernización Infraestructura", "Tincalayu, Catamarca", "Actualización integral de sistemas de transporte interno, modernización de equipos de extracción y mejora de la infraestructura logística.", ahora.AddMonths(-9), true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "ProyectosMineros", keyColumn: "ProyectoMineroID", keyValue: 1);
            migrationBuilder.DeleteData(table: "ProyectosMineros", keyColumn: "ProyectoMineroID", keyValue: 2);
            migrationBuilder.DeleteData(table: "ProyectosMineros", keyColumn: "ProyectoMineroID", keyValue: 3);

            migrationBuilder.DeleteData(table: "UsuariosRoles", keyColumns: new[] { "UsuarioID", "RolID" }, keyValues: new object[] { 1, 2 });
            migrationBuilder.DeleteData(table: "UsuariosRoles", keyColumns: new[] { "UsuarioID", "RolID" }, keyValues: new object[] { 2, 4 });
            migrationBuilder.DeleteData(table: "UsuariosRoles", keyColumns: new[] { "UsuarioID", "RolID" }, keyValues: new object[] { 3, 5 });
            migrationBuilder.DeleteData(table: "UsuariosRoles", keyColumns: new[] { "UsuarioID", "RolID" }, keyValues: new object[] { 4, 1 });
            migrationBuilder.DeleteData(table: "UsuariosRoles", keyColumns: new[] { "UsuarioID", "RolID" }, keyValues: new object[] { 5, 3 });

            migrationBuilder.DeleteData(table: "Usuarios", keyColumn: "UsuarioID", keyValue: 1);
            migrationBuilder.DeleteData(table: "Usuarios", keyColumn: "UsuarioID", keyValue: 2);
            migrationBuilder.DeleteData(table: "Usuarios", keyColumn: "UsuarioID", keyValue: 3);
            migrationBuilder.DeleteData(table: "Usuarios", keyColumn: "UsuarioID", keyValue: 4);
            migrationBuilder.DeleteData(table: "Usuarios", keyColumn: "UsuarioID", keyValue: 5);

            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 4);
            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 5);
            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 6);
            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 7);
            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 1);
            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 2);
            migrationBuilder.DeleteData(table: "Empresas", keyColumn: "EmpresaID", keyValue: 3);

            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 1);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 2);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 3);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 4);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 5);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 6);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 7);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 8);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 9);
            migrationBuilder.DeleteData(table: "Rubros", keyColumn: "RubroID", keyValue: 10);

            migrationBuilder.DeleteData(table: "EstadosPropuesta", keyColumn: "EstadoPropuestaID", keyValue: 1);
            migrationBuilder.DeleteData(table: "EstadosPropuesta", keyColumn: "EstadoPropuestaID", keyValue: 2);
            migrationBuilder.DeleteData(table: "EstadosPropuesta", keyColumn: "EstadoPropuestaID", keyValue: 3);
            migrationBuilder.DeleteData(table: "EstadosPropuesta", keyColumn: "EstadoPropuestaID", keyValue: 4);
            migrationBuilder.DeleteData(table: "EstadosPropuesta", keyColumn: "EstadoPropuestaID", keyValue: 5);

            migrationBuilder.DeleteData(table: "EstadosLicitacion", keyColumn: "EstadoLicitacionID", keyValue: 1);
            migrationBuilder.DeleteData(table: "EstadosLicitacion", keyColumn: "EstadoLicitacionID", keyValue: 2);
            migrationBuilder.DeleteData(table: "EstadosLicitacion", keyColumn: "EstadoLicitacionID", keyValue: 3);
            migrationBuilder.DeleteData(table: "EstadosLicitacion", keyColumn: "EstadoLicitacionID", keyValue: 4);
            migrationBuilder.DeleteData(table: "EstadosLicitacion", keyColumn: "EstadoLicitacionID", keyValue: 5);
            migrationBuilder.DeleteData(table: "EstadosLicitacion", keyColumn: "EstadoLicitacionID", keyValue: 6);

            migrationBuilder.DeleteData(table: "Roles", keyColumn: "RolID", keyValue: 1);
            migrationBuilder.DeleteData(table: "Roles", keyColumn: "RolID", keyValue: 2);
            migrationBuilder.DeleteData(table: "Roles", keyColumn: "RolID", keyValue: 3);
            migrationBuilder.DeleteData(table: "Roles", keyColumn: "RolID", keyValue: 4);
            migrationBuilder.DeleteData(table: "Roles", keyColumn: "RolID", keyValue: 5);

            migrationBuilder.DeleteData(table: "Monedas", keyColumn: "MonedaID", keyValue: 1);
            migrationBuilder.DeleteData(table: "Monedas", keyColumn: "MonedaID", keyValue: 2);
        }
    }
}

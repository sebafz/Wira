using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Wira.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EstadosLicitacion",
                columns: table => new
                {
                    EstadoLicitacionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreEstado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadosLicitacion", x => x.EstadoLicitacionID);
                });

            migrationBuilder.CreateTable(
                name: "EstadosPropuesta",
                columns: table => new
                {
                    EstadoPropuestaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreEstado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadosPropuesta", x => x.EstadoPropuestaID);
                });

            migrationBuilder.CreateTable(
                name: "Monedas",
                columns: table => new
                {
                    MonedaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Simbolo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Monedas", x => x.MonedaID);
                });

            migrationBuilder.CreateTable(
                name: "Notificaciones",
                columns: table => new
                {
                    NotificacionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Mensaje = table.Column<string>(type: "text", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()"),
                    Tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EntidadTipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EntidadID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificaciones", x => x.NotificacionID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RolID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RolID);
                });

            migrationBuilder.CreateTable(
                name: "Rubros",
                columns: table => new
                {
                    RubroID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rubros", x => x.RubroID);
                });

            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    EmpresaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    RazonSocial = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CUIT = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EmailContacto = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    TipoEmpresa = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FechaAlta = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()"),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RubroID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.EmpresaID);
                    table.CheckConstraint("CK_Empresas_TipoEmpresa", "[TipoEmpresa] IN ('MINERA', 'PROVEEDOR')");
                    table.ForeignKey(
                        name: "FK_Empresas_Rubros_RubroID",
                        column: x => x.RubroID,
                        principalTable: "Rubros",
                        principalColumn: "RubroID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProyectosMineros",
                columns: table => new
                {
                    ProyectoMineroID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MineraID = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Ubicacion = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProyectosMineros", x => x.ProyectoMineroID);
                    table.ForeignKey(
                        name: "FK_ProyectosMineros_Empresas_MineraID",
                        column: x => x.MineraID,
                        principalTable: "Empresas",
                        principalColumn: "EmpresaID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    UsuarioID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DNI = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    FechaRegistro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()"),
                    FechaBaja = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstadoAprobacion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FechaAprobacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AprobadoPorUsuarioID = table.Column<int>(type: "integer", nullable: true),
                    MotivoRechazo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ValidadoEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TokenVerificacionEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    FechaVencimientoTokenVerificacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TokenRecuperacionPassword = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    FechaVencimientoTokenRecuperacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmpresaID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.UsuarioID);
                    table.ForeignKey(
                        name: "FK_Usuarios_Empresas_EmpresaID",
                        column: x => x.EmpresaID,
                        principalTable: "Empresas",
                        principalColumn: "EmpresaID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Auditoria",
                columns: table => new
                {
                    AuditoriaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioID = table.Column<int>(type: "integer", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()"),
                    Operacion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TablaAfectada = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ClaveRegistro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auditoria", x => x.AuditoriaID);
                    table.ForeignKey(
                        name: "FK_Auditoria_Usuarios_UsuarioID",
                        column: x => x.UsuarioID,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioID");
                });

            migrationBuilder.CreateTable(
                name: "NotificacionesUsuarios",
                columns: table => new
                {
                    UsuarioID = table.Column<int>(type: "integer", nullable: false),
                    NotificacionID = table.Column<int>(type: "integer", nullable: false),
                    Leido = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FechaLeido = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificacionesUsuarios", x => new { x.UsuarioID, x.NotificacionID });
                    table.ForeignKey(
                        name: "FK_NotificacionesUsuarios_Notificaciones_NotificacionID",
                        column: x => x.NotificacionID,
                        principalTable: "Notificaciones",
                        principalColumn: "NotificacionID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotificacionesUsuarios_Usuarios_UsuarioID",
                        column: x => x.UsuarioID,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsuariosRoles",
                columns: table => new
                {
                    UsuarioID = table.Column<int>(type: "integer", nullable: false),
                    RolID = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuariosRoles", x => new { x.UsuarioID, x.RolID });
                    table.ForeignKey(
                        name: "FK_UsuariosRoles_Roles_RolID",
                        column: x => x.RolID,
                        principalTable: "Roles",
                        principalColumn: "RolID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuariosRoles_Usuarios_UsuarioID",
                        column: x => x.UsuarioID,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArchivosAdjuntos",
                columns: table => new
                {
                    ArchivoID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntidadTipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntidadID = table.Column<int>(type: "integer", nullable: false),
                    PropuestaID = table.Column<int>(type: "integer", nullable: true),
                    NombreArchivo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    RutaArchivo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TipoMime = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TamañoBytes = table.Column<int>(type: "integer", nullable: true),
                    FechaSubida = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArchivosAdjuntos", x => x.ArchivoID);
                    table.CheckConstraint("CK_ArchivosAdjuntos_EntidadTipo", "[EntidadTipo] IN ('LICITACION', 'PROPUESTA')");
                });

            migrationBuilder.CreateTable(
                name: "Licitaciones",
                columns: table => new
                {
                    LicitacionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MineraID = table.Column<int>(type: "integer", nullable: false),
                    RubroID = table.Column<int>(type: "integer", nullable: false),
                    MonedaID = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PresupuestoEstimado = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Condiciones = table.Column<string>(type: "text", nullable: true),
                    EstadoLicitacionID = table.Column<int>(type: "integer", nullable: false),
                    Eliminado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ArchivoID = table.Column<int>(type: "integer", nullable: true),
                    ProyectoMineroID = table.Column<int>(type: "integer", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Licitaciones", x => x.LicitacionID);
                    table.ForeignKey(
                        name: "FK_Licitaciones_ArchivosAdjuntos_ArchivoID",
                        column: x => x.ArchivoID,
                        principalTable: "ArchivosAdjuntos",
                        principalColumn: "ArchivoID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Licitaciones_Empresas_MineraID",
                        column: x => x.MineraID,
                        principalTable: "Empresas",
                        principalColumn: "EmpresaID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Licitaciones_EstadosLicitacion_EstadoLicitacionID",
                        column: x => x.EstadoLicitacionID,
                        principalTable: "EstadosLicitacion",
                        principalColumn: "EstadoLicitacionID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Licitaciones_Monedas_MonedaID",
                        column: x => x.MonedaID,
                        principalTable: "Monedas",
                        principalColumn: "MonedaID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Licitaciones_ProyectosMineros_ProyectoMineroID",
                        column: x => x.ProyectoMineroID,
                        principalTable: "ProyectosMineros",
                        principalColumn: "ProyectoMineroID");
                    table.ForeignKey(
                        name: "FK_Licitaciones_Rubros_RubroID",
                        column: x => x.RubroID,
                        principalTable: "Rubros",
                        principalColumn: "RubroID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CalificacionesPostLicitacion",
                columns: table => new
                {
                    CalificacionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProveedorID = table.Column<int>(type: "integer", nullable: false),
                    LicitacionID = table.Column<int>(type: "integer", nullable: false),
                    Puntualidad = table.Column<int>(type: "integer", nullable: true),
                    Calidad = table.Column<int>(type: "integer", nullable: true),
                    Comunicacion = table.Column<int>(type: "integer", nullable: true),
                    Comentarios = table.Column<string>(type: "text", nullable: true),
                    FechaCalificacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalificacionesPostLicitacion", x => x.CalificacionID);
                    table.CheckConstraint("CK_CalificacionPostLicitacion_Calidad", "[Calidad] BETWEEN 1 AND 5");
                    table.CheckConstraint("CK_CalificacionPostLicitacion_Comunicacion", "[Comunicacion] BETWEEN 1 AND 5");
                    table.CheckConstraint("CK_CalificacionPostLicitacion_Puntualidad", "[Puntualidad] BETWEEN 1 AND 5");
                    table.ForeignKey(
                        name: "FK_CalificacionesPostLicitacion_Empresas_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Empresas",
                        principalColumn: "EmpresaID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CalificacionesPostLicitacion_Licitaciones_LicitacionID",
                        column: x => x.LicitacionID,
                        principalTable: "Licitaciones",
                        principalColumn: "LicitacionID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CriteriosLicitacion",
                columns: table => new
                {
                    CriterioID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LicitacionID = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Peso = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    EsExcluyente = table.Column<bool>(type: "boolean", nullable: false),
                    EsPuntuable = table.Column<bool>(type: "boolean", nullable: false),
                    ValorRequeridoBooleano = table.Column<bool>(type: "boolean", nullable: true),
                    ValorMinimo = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    ValorMaximo = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    MayorMejor = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriosLicitacion", x => x.CriterioID);
                    table.CheckConstraint("CK_CriterioLicitacion_MayorMejorAplicable", "[Tipo] = 1 OR [MayorMejor] IS NULL");
                    table.CheckConstraint("CK_CriterioLicitacion_MayorMejorRequerido", "[Tipo] <> 1 OR [MayorMejor] IS NOT NULL");
                    table.CheckConstraint("CK_CriterioLicitacion_Tipo", "[Tipo] IN (1,2,3,4)");
                    table.CheckConstraint("CK_CriterioLicitacion_ValorBooleanoAplicable", "[Tipo] = 2 OR [ValorRequeridoBooleano] IS NULL");
                    table.CheckConstraint("CK_CriterioLicitacion_ValorBooleanoRequerido", "[Tipo] <> 2 OR [EsPuntuable] = 0 OR [ValorRequeridoBooleano] IS NOT NULL");
                    table.CheckConstraint("CK_CriterioLicitacion_Valores", "[ValorMinimo] IS NULL OR [ValorMaximo] IS NULL OR [ValorMinimo] <= [ValorMaximo]");
                    table.ForeignKey(
                        name: "FK_CriteriosLicitacion_Licitaciones_LicitacionID",
                        column: x => x.LicitacionID,
                        principalTable: "Licitaciones",
                        principalColumn: "LicitacionID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HistorialProveedorLicitacion",
                columns: table => new
                {
                    HistorialID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProveedorID = table.Column<int>(type: "integer", nullable: false),
                    LicitacionID = table.Column<int>(type: "integer", nullable: false),
                    Resultado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Ganador = table.Column<bool>(type: "boolean", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    FechaParticipacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()"),
                    FechaGanador = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialProveedorLicitacion", x => x.HistorialID);
                    table.ForeignKey(
                        name: "FK_HistorialProveedorLicitacion_Empresas_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Empresas",
                        principalColumn: "EmpresaID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HistorialProveedorLicitacion_Licitaciones_LicitacionID",
                        column: x => x.LicitacionID,
                        principalTable: "Licitaciones",
                        principalColumn: "LicitacionID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Propuestas",
                columns: table => new
                {
                    PropuestaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LicitacionID = table.Column<int>(type: "integer", nullable: false),
                    ProveedorID = table.Column<int>(type: "integer", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "GETDATE()"),
                    EstadoPropuestaID = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    PresupuestoOfrecido = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonedaID = table.Column<int>(type: "integer", nullable: false),
                    FechaEntrega = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CumpleRequisitos = table.Column<bool>(type: "boolean", nullable: false),
                    CalificacionFinal = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    Eliminado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Propuestas", x => x.PropuestaID);
                    table.ForeignKey(
                        name: "FK_Propuestas_Empresas_ProveedorID",
                        column: x => x.ProveedorID,
                        principalTable: "Empresas",
                        principalColumn: "EmpresaID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Propuestas_EstadosPropuesta_EstadoPropuestaID",
                        column: x => x.EstadoPropuestaID,
                        principalTable: "EstadosPropuesta",
                        principalColumn: "EstadoPropuestaID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Propuestas_Licitaciones_LicitacionID",
                        column: x => x.LicitacionID,
                        principalTable: "Licitaciones",
                        principalColumn: "LicitacionID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Propuestas_Monedas_MonedaID",
                        column: x => x.MonedaID,
                        principalTable: "Monedas",
                        principalColumn: "MonedaID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CriteriosOpciones",
                columns: table => new
                {
                    OpcionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CriterioID = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Puntaje = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    Orden = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriosOpciones", x => x.OpcionID);
                    table.ForeignKey(
                        name: "FK_CriteriosOpciones_CriteriosLicitacion_CriterioID",
                        column: x => x.CriterioID,
                        principalTable: "CriteriosLicitacion",
                        principalColumn: "CriterioID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RespuestasCriteriosLicitacion",
                columns: table => new
                {
                    RespuestaID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PropuestaID = table.Column<int>(type: "integer", nullable: false),
                    CriterioID = table.Column<int>(type: "integer", nullable: false),
                    ValorProveedor = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ValorNumerico = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    ValorBooleano = table.Column<bool>(type: "boolean", nullable: true),
                    CriterioOpcionID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RespuestasCriteriosLicitacion", x => x.RespuestaID);
                    table.ForeignKey(
                        name: "FK_RespuestasCriteriosLicitacion_CriteriosLicitacion_CriterioID",
                        column: x => x.CriterioID,
                        principalTable: "CriteriosLicitacion",
                        principalColumn: "CriterioID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RespuestasCriteriosLicitacion_CriteriosOpciones_CriterioOpc~",
                        column: x => x.CriterioOpcionID,
                        principalTable: "CriteriosOpciones",
                        principalColumn: "OpcionID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RespuestasCriteriosLicitacion_Propuestas_PropuestaID",
                        column: x => x.PropuestaID,
                        principalTable: "Propuestas",
                        principalColumn: "PropuestaID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArchivosAdjuntos_PropuestaID",
                table: "ArchivosAdjuntos",
                column: "PropuestaID");

            migrationBuilder.CreateIndex(
                name: "IX_Auditoria_UsuarioID",
                table: "Auditoria",
                column: "UsuarioID");

            migrationBuilder.CreateIndex(
                name: "IX_CalificacionesPostLicitacion_LicitacionID",
                table: "CalificacionesPostLicitacion",
                column: "LicitacionID");

            migrationBuilder.CreateIndex(
                name: "IX_CalificacionesPostLicitacion_ProveedorID",
                table: "CalificacionesPostLicitacion",
                column: "ProveedorID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriosLicitacion_LicitacionID",
                table: "CriteriosLicitacion",
                column: "LicitacionID");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriosOpciones_CriterioID_Valor",
                table: "CriteriosOpciones",
                columns: new[] { "CriterioID", "Valor" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_RubroID",
                table: "Empresas",
                column: "RubroID");

            migrationBuilder.CreateIndex(
                name: "UX_Empresas_CUIT",
                table: "Empresas",
                column: "CUIT",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EstadosLicitacion_NombreEstado",
                table: "EstadosLicitacion",
                column: "NombreEstado",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EstadosPropuesta_NombreEstado",
                table: "EstadosPropuesta",
                column: "NombreEstado",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HistorialProveedorLicitacion_LicitacionID",
                table: "HistorialProveedorLicitacion",
                column: "LicitacionID");

            migrationBuilder.CreateIndex(
                name: "IX_HistorialProveedorLicitacion_ProveedorID",
                table: "HistorialProveedorLicitacion",
                column: "ProveedorID");

            migrationBuilder.CreateIndex(
                name: "IX_Licitaciones_ArchivoID",
                table: "Licitaciones",
                column: "ArchivoID");

            migrationBuilder.CreateIndex(
                name: "IX_Licitaciones_EstadoLicitacionID",
                table: "Licitaciones",
                column: "EstadoLicitacionID");

            migrationBuilder.CreateIndex(
                name: "IX_Licitaciones_MineraID",
                table: "Licitaciones",
                column: "MineraID");

            migrationBuilder.CreateIndex(
                name: "IX_Licitaciones_MonedaID",
                table: "Licitaciones",
                column: "MonedaID");

            migrationBuilder.CreateIndex(
                name: "IX_Licitaciones_ProyectoMineroID",
                table: "Licitaciones",
                column: "ProyectoMineroID");

            migrationBuilder.CreateIndex(
                name: "IX_Licitaciones_RubroID",
                table: "Licitaciones",
                column: "RubroID");

            migrationBuilder.CreateIndex(
                name: "IX_Monedas_Codigo",
                table: "Monedas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificacionesUsuarios_NotificacionID",
                table: "NotificacionesUsuarios",
                column: "NotificacionID");

            migrationBuilder.CreateIndex(
                name: "IX_Propuestas_EstadoPropuestaID",
                table: "Propuestas",
                column: "EstadoPropuestaID");

            migrationBuilder.CreateIndex(
                name: "IX_Propuestas_LicitacionID",
                table: "Propuestas",
                column: "LicitacionID");

            migrationBuilder.CreateIndex(
                name: "IX_Propuestas_MonedaID",
                table: "Propuestas",
                column: "MonedaID");

            migrationBuilder.CreateIndex(
                name: "IX_Propuestas_ProveedorID",
                table: "Propuestas",
                column: "ProveedorID");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectosMineros_MineraID",
                table: "ProyectosMineros",
                column: "MineraID");

            migrationBuilder.CreateIndex(
                name: "IX_RespuestasCriteriosLicitacion_CriterioID",
                table: "RespuestasCriteriosLicitacion",
                column: "CriterioID");

            migrationBuilder.CreateIndex(
                name: "IX_RespuestasCriteriosLicitacion_CriterioOpcionID",
                table: "RespuestasCriteriosLicitacion",
                column: "CriterioOpcionID");

            migrationBuilder.CreateIndex(
                name: "IX_RespuestasCriteriosLicitacion_PropuestaID",
                table: "RespuestasCriteriosLicitacion",
                column: "PropuestaID");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Nombre",
                table: "Roles",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_DNI",
                table: "Usuarios",
                column: "DNI",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_EmpresaID",
                table: "Usuarios",
                column: "EmpresaID");

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosRoles_RolID",
                table: "UsuariosRoles",
                column: "RolID");

            migrationBuilder.AddForeignKey(
                name: "FK_ArchivosAdjuntos_Propuestas_PropuestaID",
                table: "ArchivosAdjuntos",
                column: "PropuestaID",
                principalTable: "Propuestas",
                principalColumn: "PropuestaID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ArchivosAdjuntos_Propuestas_PropuestaID",
                table: "ArchivosAdjuntos");

            migrationBuilder.DropTable(
                name: "Auditoria");

            migrationBuilder.DropTable(
                name: "CalificacionesPostLicitacion");

            migrationBuilder.DropTable(
                name: "HistorialProveedorLicitacion");

            migrationBuilder.DropTable(
                name: "NotificacionesUsuarios");

            migrationBuilder.DropTable(
                name: "RespuestasCriteriosLicitacion");

            migrationBuilder.DropTable(
                name: "UsuariosRoles");

            migrationBuilder.DropTable(
                name: "Notificaciones");

            migrationBuilder.DropTable(
                name: "CriteriosOpciones");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "CriteriosLicitacion");

            migrationBuilder.DropTable(
                name: "Propuestas");

            migrationBuilder.DropTable(
                name: "EstadosPropuesta");

            migrationBuilder.DropTable(
                name: "Licitaciones");

            migrationBuilder.DropTable(
                name: "ArchivosAdjuntos");

            migrationBuilder.DropTable(
                name: "EstadosLicitacion");

            migrationBuilder.DropTable(
                name: "Monedas");

            migrationBuilder.DropTable(
                name: "ProyectosMineros");

            migrationBuilder.DropTable(
                name: "Empresas");

            migrationBuilder.DropTable(
                name: "Rubros");
        }
    }
}

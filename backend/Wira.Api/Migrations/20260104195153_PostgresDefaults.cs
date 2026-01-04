using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wira.Api.Migrations
{
    /// <inheritdoc />
    public partial class PostgresDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Empresas_TipoEmpresa",
                table: "Empresas");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorAplicable",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorRequerido",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_Tipo",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoAplicable",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoRequerido",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_Valores",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Calidad",
                table: "CalificacionesPostLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Comunicacion",
                table: "CalificacionesPostLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Puntualidad",
                table: "CalificacionesPostLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ArchivosAdjuntos_EntidadTipo",
                table: "ArchivosAdjuntos");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaRegistro",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaEnvio",
                table: "Propuestas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Notificaciones",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Licitaciones",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaParticipacion",
                table: "HistorialProveedorLicitacion",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaAlta",
                table: "Empresas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCalificacion",
                table: "CalificacionesPostLicitacion",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Fecha",
                table: "Auditoria",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaSubida",
                table: "ArchivosAdjuntos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Empresas_TipoEmpresa",
                table: "Empresas",
                sql: "\"TipoEmpresa\" IN ('MINERA','PROVEEDOR')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorAplicable",
                table: "CriteriosLicitacion",
                sql: "\"Tipo\" = 1 OR \"MayorMejor\" IS NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorRequerido",
                table: "CriteriosLicitacion",
                sql: "\"Tipo\" <> 1 OR \"MayorMejor\" IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_Tipo",
                table: "CriteriosLicitacion",
                sql: "\"Tipo\" IN (1,2,3,4)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoAplicable",
                table: "CriteriosLicitacion",
                sql: "\"Tipo\" = 2 OR \"ValorRequeridoBooleano\" IS NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoRequerido",
                table: "CriteriosLicitacion",
                sql: "\"Tipo\" <> 2 OR \"EsPuntuable\" = FALSE OR \"ValorRequeridoBooleano\" IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_Valores",
                table: "CriteriosLicitacion",
                sql: "\"ValorMinimo\" IS NULL OR \"ValorMaximo\" IS NULL OR \"ValorMinimo\" <= \"ValorMaximo\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Calidad",
                table: "CalificacionesPostLicitacion",
                sql: "\"Calidad\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Comunicacion",
                table: "CalificacionesPostLicitacion",
                sql: "\"Comunicacion\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Puntualidad",
                table: "CalificacionesPostLicitacion",
                sql: "\"Puntualidad\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ArchivosAdjuntos_EntidadTipo",
                table: "ArchivosAdjuntos",
                sql: "\"EntidadTipo\" IN ('LICITACION','PROPUESTA')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Empresas_TipoEmpresa",
                table: "Empresas");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorAplicable",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorRequerido",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_Tipo",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoAplicable",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoRequerido",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CriterioLicitacion_Valores",
                table: "CriteriosLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Calidad",
                table: "CalificacionesPostLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Comunicacion",
                table: "CalificacionesPostLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Puntualidad",
                table: "CalificacionesPostLicitacion");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ArchivosAdjuntos_EntidadTipo",
                table: "ArchivosAdjuntos");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaRegistro",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaEnvio",
                table: "Propuestas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Notificaciones",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Licitaciones",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaParticipacion",
                table: "HistorialProveedorLicitacion",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaAlta",
                table: "Empresas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCalificacion",
                table: "CalificacionesPostLicitacion",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Fecha",
                table: "Auditoria",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaSubida",
                table: "ArchivosAdjuntos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Empresas_TipoEmpresa",
                table: "Empresas",
                sql: "[TipoEmpresa] IN ('MINERA', 'PROVEEDOR')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorAplicable",
                table: "CriteriosLicitacion",
                sql: "[Tipo] = 1 OR [MayorMejor] IS NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_MayorMejorRequerido",
                table: "CriteriosLicitacion",
                sql: "[Tipo] <> 1 OR [MayorMejor] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_Tipo",
                table: "CriteriosLicitacion",
                sql: "[Tipo] IN (1,2,3,4)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoAplicable",
                table: "CriteriosLicitacion",
                sql: "[Tipo] = 2 OR [ValorRequeridoBooleano] IS NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_ValorBooleanoRequerido",
                table: "CriteriosLicitacion",
                sql: "[Tipo] <> 2 OR [EsPuntuable] = 0 OR [ValorRequeridoBooleano] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CriterioLicitacion_Valores",
                table: "CriteriosLicitacion",
                sql: "[ValorMinimo] IS NULL OR [ValorMaximo] IS NULL OR [ValorMinimo] <= [ValorMaximo]");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Calidad",
                table: "CalificacionesPostLicitacion",
                sql: "[Calidad] BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Comunicacion",
                table: "CalificacionesPostLicitacion",
                sql: "[Comunicacion] BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CalificacionPostLicitacion_Puntualidad",
                table: "CalificacionesPostLicitacion",
                sql: "[Puntualidad] BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ArchivosAdjuntos_EntidadTipo",
                table: "ArchivosAdjuntos",
                sql: "[EntidadTipo] IN ('LICITACION', 'PROPUESTA')");
        }
    }
}

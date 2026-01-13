using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wira.Api.Models;

namespace Wira.Api.Data
{
    public class WiraDbContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private bool _auditoriaEnProgreso;

        public WiraDbContext(DbContextOptions<WiraDbContext> options, IHttpContextAccessor? httpContextAccessor = null) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        // DbSets
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<UsuarioRol> UsuariosRoles { get; set; }
        public DbSet<Empresa> Empresas { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<EstadoLicitacion> EstadosLicitacion { get; set; }
        public DbSet<Licitacion> Licitaciones { get; set; }
        public DbSet<CriterioLicitacion> CriteriosLicitacion { get; set; }
        public DbSet<CriterioOpcion> CriteriosOpciones { get; set; }
        public DbSet<EstadoPropuesta> EstadosPropuesta { get; set; }
        public DbSet<Propuesta> Propuestas { get; set; }
        public DbSet<RespuestaCriterioLicitacion> RespuestasCriteriosLicitacion { get; set; }
        public DbSet<ArchivoAdjunto> ArchivosAdjuntos { get; set; }
        public DbSet<Notificacion> Notificaciones { get; set; }
        public DbSet<NotificacionUsuario> NotificacionesUsuarios { get; set; }
        public DbSet<HistorialProveedorLicitacion> HistorialProveedorLicitacion { get; set; }
        public DbSet<CalificacionPostLicitacion> CalificacionesPostLicitacion { get; set; }
        public DbSet<Auditoria> Auditoria { get; set; }
        public DbSet<ProyectoMinero> ProyectosMineros { get; set; }
        public DbSet<Moneda> Monedas { get; set; }

        public override int SaveChanges()
        {
            return SaveChangesInternal(() => base.SaveChanges());
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return SaveChangesInternalAsync(() => base.SaveChangesAsync(cancellationToken));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de claves compuestas
            modelBuilder.Entity<UsuarioRol>()
                .HasKey(ur => new { ur.UsuarioID, ur.RolID });

            modelBuilder.Entity<NotificacionUsuario>()
                .HasKey(nu => new { nu.UsuarioID, nu.NotificacionID });

            // Configuración de índices únicos
            modelBuilder.Entity<Rol>()
                .HasIndex(r => r.Nombre)
                .IsUnique();

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.DNI)
                .IsUnique();

            modelBuilder.Entity<Moneda>()
                .HasIndex(m => m.Codigo)
                .IsUnique();

            modelBuilder.Entity<Empresa>()
                .HasIndex(e => e.CUIT)
                .HasDatabaseName("UX_Empresas_CUIT")
                .IsUnique();

            modelBuilder.Entity<Empresa>()
                .ToTable(t => t.HasCheckConstraint("CK_Empresas_TipoEmpresa",
                    "\"TipoEmpresa\" IN ('MINERA','PROVEEDOR')"));

            modelBuilder.Entity<EstadoLicitacion>()
                .HasIndex(el => el.NombreEstado)
                .IsUnique();

            modelBuilder.Entity<EstadoPropuesta>()
                .HasIndex(ep => ep.NombreEstado)
                .IsUnique();

            modelBuilder.Entity<CriterioLicitacion>(entity =>
            {
                entity.ToTable(t =>
                {
                    t.HasCheckConstraint("CK_CriterioLicitacion_MayorMejorAplicable",
                        "\"Tipo\" = 1 OR \"MayorMejor\" IS NULL");
                    t.HasCheckConstraint("CK_CriterioLicitacion_MayorMejorRequerido",
                        "\"Tipo\" <> 1 OR \"MayorMejor\" IS NOT NULL");
                    t.HasCheckConstraint("CK_CriterioLicitacion_Valores",
                        "\"ValorMinimo\" IS NULL OR \"ValorMaximo\" IS NULL OR \"ValorMinimo\" <= \"ValorMaximo\"");
                    t.HasCheckConstraint("CK_CriterioLicitacion_Tipo",
                        "\"Tipo\" IN (1,2,3,4)");
                    t.HasCheckConstraint("CK_CriterioLicitacion_ValorBooleanoAplicable",
                        "\"Tipo\" = 2 OR \"ValorRequeridoBooleano\" IS NULL");
                    t.HasCheckConstraint("CK_CriterioLicitacion_ValorBooleanoRequerido",
                        "\"Tipo\" <> 2 OR \"EsPuntuable\" = FALSE OR \"ValorRequeridoBooleano\" IS NOT NULL");
                });
            });

            modelBuilder.Entity<CriterioOpcion>()
                .HasIndex(o => new { o.CriterioID, o.Valor })
                .IsUnique();

            // Configuración de restricciones CHECK para EntidadTipo en ArchivosAdjuntos
            modelBuilder.Entity<ArchivoAdjunto>()
                .ToTable(t => t.HasCheckConstraint("CK_ArchivosAdjuntos_EntidadTipo",
                    "\"EntidadTipo\" IN ('LICITACION','PROPUESTA')"));

            // Configuración de restricciones CHECK para calificaciones
            modelBuilder.Entity<CalificacionPostLicitacion>()
                .ToTable(t => t.HasCheckConstraint("CK_CalificacionPostLicitacion_Puntualidad",
                    "\"Puntualidad\" BETWEEN 1 AND 5"))
                .ToTable(t => t.HasCheckConstraint("CK_CalificacionPostLicitacion_Calidad",
                    "\"Calidad\" BETWEEN 1 AND 5"))
                .ToTable(t => t.HasCheckConstraint("CK_CalificacionPostLicitacion_Comunicacion",
                    "\"Comunicacion\" BETWEEN 1 AND 5"));

            // Configuración de relaciones opcionales para Usuario
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Empresa)
                .WithMany(e => e.Usuarios)
                .HasForeignKey(u => u.EmpresaID)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración de propiedades con valores por defecto
            modelBuilder.Entity<Usuario>()
                .Property(u => u.FechaRegistro)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Usuario>()
                .Property(u => u.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Usuario>()
                .Property(u => u.ValidadoEmail)
                .HasDefaultValue(false);

            modelBuilder.Entity<Moneda>()
                .Property(m => m.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Empresa>()
                .Property(e => e.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Empresa>()
                .Property(e => e.FechaAlta)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Rubro>()
                .Property(r => r.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Licitacion>()
                .Property(l => l.Eliminado)
                .HasDefaultValue(false);

            modelBuilder.Entity<Licitacion>()
                .Property(l => l.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Empresa>()
                .HasOne(e => e.Rubro)
                .WithMany(r => r.Proveedores)
                .HasForeignKey(e => e.RubroID)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Licitacion>()
                .HasOne(l => l.Rubro)
                .WithMany(r => r.Licitaciones)
                .HasForeignKey(l => l.RubroID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Licitacion>()
                .HasOne(l => l.Moneda)
                .WithMany(m => m.Licitaciones)
                .HasForeignKey(l => l.MonedaID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Propuesta>()
                .Property(p => p.FechaEnvio)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Propuesta>()
                .Property(p => p.Eliminado)
                .HasDefaultValue(false);

            modelBuilder.Entity<Propuesta>()
                .HasOne(p => p.Moneda)
                .WithMany(m => m.Propuestas)
                .HasForeignKey(p => p.MonedaID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ArchivoAdjunto>()
                .Property(a => a.FechaSubida)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Notificacion>()
                .Property(n => n.FechaCreacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<NotificacionUsuario>()
                .Property(nu => nu.Leido)
                .HasDefaultValue(false);

            modelBuilder.Entity<HistorialProveedorLicitacion>()
                .Property(h => h.FechaParticipacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<CalificacionPostLicitacion>()
                .Property(c => c.FechaCalificacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Auditoria>()
                .Property(a => a.Fecha)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<Licitacion>()
                .HasOne(l => l.ArchivoAdjunto)
                .WithMany()
                .HasForeignKey(l => l.ArchivoID)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ArchivoAdjunto>()
                .HasOne(a => a.Propuesta)
                .WithMany(p => p.ArchivosAdjuntos)
                .HasForeignKey(a => a.PropuestaID)
                .OnDelete(DeleteBehavior.Restrict);

            // Configurar relaciones para evitar ciclos de eliminación en cascada
            modelBuilder.Entity<Propuesta>()
                .HasOne(p => p.Licitacion)
                .WithMany(l => l.Propuestas)
                .HasForeignKey(p => p.LicitacionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CriterioLicitacion>()
                .HasOne(c => c.Licitacion)
                .WithMany(l => l.CriteriosLicitacion)
                .HasForeignKey(c => c.LicitacionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CriterioOpcion>()
                .HasOne(o => o.Criterio)
                .WithMany(c => c.Opciones)
                .HasForeignKey(o => o.CriterioID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RespuestaCriterioLicitacion>()
                .HasOne(r => r.Propuesta)
                .WithMany(p => p.RespuestasCriterios)
                .HasForeignKey(r => r.PropuestaID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RespuestaCriterioLicitacion>()
                .HasOne(r => r.Criterio)
                .WithMany(c => c.RespuestasCriterios)
                .HasForeignKey(r => r.CriterioID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RespuestaCriterioLicitacion>()
                .HasOne(r => r.OpcionSeleccionada)
                .WithMany()
                .HasForeignKey(r => r.CriterioOpcionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CalificacionPostLicitacion>()
                .HasOne(c => c.Licitacion)
                .WithMany(l => l.CalificacionesPost)
                .HasForeignKey(c => c.LicitacionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CalificacionPostLicitacion>()
                .HasOne(c => c.Proveedor)
                .WithMany(e => e.CalificacionesPost)
                .HasForeignKey(c => c.ProveedorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HistorialProveedorLicitacion>()
                .HasOne(h => h.Licitacion)
                .WithMany(l => l.HistorialesProveedor)
                .HasForeignKey(h => h.LicitacionID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HistorialProveedorLicitacion>()
                .HasOne(h => h.Proveedor)
                .WithMany(e => e.HistorialesProveedor)
                .HasForeignKey(h => h.ProveedorID)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private int SaveChangesInternal(Func<int> saveFunc)
        {
            if (_auditoriaEnProgreso)
            {
                return saveFunc();
            }
            // Normalizar todas las fechas a UTC antes de guardar para evitar excepciones de Kind
            EnsureDateTimePropertiesAreUtc();

            var auditoriasPendientes = PrepararEntradasAuditoria();
            var result = saveFunc();

            if (auditoriasPendientes.Count > 0)
            {
                _auditoriaEnProgreso = true;
                try
                {
                    foreach (var pending in auditoriasPendientes)
                    {
                        pending.CompletarClave();
                        Auditoria.Add(pending.ToEntity());
                    }

                    saveFunc();
                }
                finally
                {
                    _auditoriaEnProgreso = false;
                }
            }

            return result;
        }

        private async Task<int> SaveChangesInternalAsync(Func<Task<int>> saveFunc)
        {
            if (_auditoriaEnProgreso)
            {
                return await saveFunc();
            }
            // Normalizar todas las fechas a UTC antes de guardar para evitar excepciones de Kind
            EnsureDateTimePropertiesAreUtc();

            var auditoriasPendientes = PrepararEntradasAuditoria();
            var result = await saveFunc();

            if (auditoriasPendientes.Count > 0)
            {
                _auditoriaEnProgreso = true;
                try
                {
                    foreach (var pending in auditoriasPendientes)
                    {
                        pending.CompletarClave();
                        Auditoria.Add(pending.ToEntity());
                    }

                    await saveFunc();
                }
                finally
                {
                    _auditoriaEnProgreso = false;
                }
            }

            return result;
        }

        private List<AuditoriaEntry> PrepararEntradasAuditoria()
        {
            ChangeTracker.DetectChanges();

            var nowUtc = DateTime.UtcNow;
            var userId = ObtenerUsuarioActual();
            int? userIdForAudit = userId > 0 ? userId : null;

            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                .Where(e => !(e.Entity is Auditoria))
                .ToList();

            var list = new List<AuditoriaEntry>();

            foreach (var entry in entries)
            {
                list.Add(new AuditoriaEntry
                {
                    Entry = entry,
                    UsuarioID = userIdForAudit,
                    Fecha = nowUtc,
                    Operacion = ObtenerOperacion(entry.State),
                    TablaAfectada = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                    ClaveRegistro = ObtenerClave(entry, includeTemporary: false),
                    Descripcion = ConstruirDescripcion(entry)
                });
            }

            return list;
        }

        private int ObtenerUsuarioActual()
        {
            var userIdClaim = _httpContextAccessor?.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private void EnsureDateTimePropertiesAreUtc()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified)
                .ToList();

            foreach (var entry in entries)
            {
                foreach (var prop in entry.Properties)
                {
                    if (prop.CurrentValue == null)
                        continue;

                    try
                    {
                        if (prop.Metadata.ClrType == typeof(DateTime))
                        {
                            var dt = (DateTime)prop.CurrentValue!;
                            DateTime utc = dt.Kind switch
                            {
                                DateTimeKind.Utc => dt,
                                DateTimeKind.Local => dt.ToUniversalTime(),
                                _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                            };

                            prop.CurrentValue = utc;
                        }
                        else if (prop.Metadata.ClrType == typeof(DateTimeOffset))
                        {
                            var dto = (DateTimeOffset)prop.CurrentValue!;
                            prop.CurrentValue = dto.ToUniversalTime();
                        }
                        else if (prop.Metadata.ClrType.IsArray)
                        {
                            var elemType = prop.Metadata.ClrType.GetElementType();
                            if (elemType == typeof(DateTime))
                            {
                                var arr = (DateTime[])prop.CurrentValue!;
                                for (int i = 0; i < arr.Length; i++)
                                {
                                    var d = arr[i];
                                    arr[i] = d.Kind switch
                                    {
                                        DateTimeKind.Utc => d,
                                        DateTimeKind.Local => d.ToUniversalTime(),
                                        _ => DateTime.SpecifyKind(d, DateTimeKind.Utc)
                                    };
                                }
                                prop.CurrentValue = arr;
                            }
                        }
                        else if (prop.Metadata.ClrType.IsGenericType)
                        {
                            var genDef = prop.Metadata.ClrType.GetGenericTypeDefinition();
                            var genArg = prop.Metadata.ClrType.GetGenericArguments().FirstOrDefault();
                            if (genArg == typeof(DateTime))
                            {
                                // Handle List<DateTime>, ICollection<DateTime>, IEnumerable<DateTime> etc.
                                if (prop.CurrentValue is System.Collections.IEnumerable enumerable)
                                {
                                    var list = new System.Collections.Generic.List<DateTime>();
                                    foreach (var item in enumerable)
                                    {
                                        if (item is DateTime d)
                                        {
                                            var utc = d.Kind switch
                                            {
                                                DateTimeKind.Utc => d,
                                                DateTimeKind.Local => d.ToUniversalTime(),
                                                _ => DateTime.SpecifyKind(d, DateTimeKind.Utc)
                                            };
                                            list.Add(utc);
                                        }
                                    }

                                    // Try to assign back a List<DateTime> (compatible with most collection properties)
                                    prop.CurrentValue = list;
                                }
                            }
                            else if (genArg == typeof(DateTime?))
                            {
                                if (prop.CurrentValue is System.Collections.IEnumerable enumerable)
                                {
                                    var list = new System.Collections.Generic.List<DateTime?>();
                                    foreach (var item in enumerable)
                                    {
                                        if (item is DateTime d)
                                        {
                                            var utc = d.Kind switch
                                            {
                                                DateTimeKind.Utc => d,
                                                DateTimeKind.Local => d.ToUniversalTime(),
                                                _ => DateTime.SpecifyKind(d, DateTimeKind.Utc)
                                            };
                                            list.Add(utc);
                                        }
                                        else
                                        {
                                            list.Add(null);
                                        }
                                    }
                                    prop.CurrentValue = list;
                                }
                            }
                        }
                        else if (prop.Metadata.ClrType == typeof(DateTime?))
                        {
                            var nullable = (DateTime?)prop.CurrentValue;
                            if (nullable.HasValue)
                            {
                                var dt = nullable.Value;
                                DateTime utc = dt.Kind switch
                                {
                                    DateTimeKind.Utc => dt,
                                    DateTimeKind.Local => dt.ToUniversalTime(),
                                    _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                                };

                                prop.CurrentValue = (DateTime?)utc;
                            }
                        }
                    }
                    catch
                    {
                        // No propagar errores de conversión de tipos; continuar con otras propiedades
                    }
                }
            }
        }

        private static string ObtenerOperacion(EntityState state) => state switch
        {
            EntityState.Added => "CREATE",
            EntityState.Modified => "UPDATE",
            EntityState.Deleted => "DELETE",
            _ => "UNKNOWN"
        };

        private static string? ObtenerClave(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry, bool includeTemporary)
        {
            var keyValues = entry.Properties
                .Where(p => p.Metadata.IsPrimaryKey())
                .Where(p => includeTemporary || !p.IsTemporary)
                .Select(p => p.CurrentValue ?? p.OriginalValue)
                .Where(v => v != null)
                .Select(v => v?.ToString());

            var joined = string.Join("|", keyValues);
            return string.IsNullOrWhiteSpace(joined) ? null : joined;
        }

        private static string? ConstruirDescripcion(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            try
            {
                if (entry.State == EntityState.Added)
                {
                    var currentValues = entry.Properties.ToDictionary(p => p.Metadata.Name, p => p.CurrentValue);
                    return JsonSerializer.Serialize(currentValues);
                }

                if (entry.State == EntityState.Deleted)
                {
                    var originalValues = entry.Properties.ToDictionary(p => p.Metadata.Name, p => p.OriginalValue);
                    return JsonSerializer.Serialize(originalValues);
                }

                if (entry.State == EntityState.Modified)
                {
                    var changes = entry.Properties
                        .Where(p => p.IsModified)
                        .ToDictionary(p => p.Metadata.Name, p => new { Original = p.OriginalValue, Current = p.CurrentValue });

                    return changes.Count > 0 ? JsonSerializer.Serialize(changes) : null;
                }
            }
            catch
            {
                // No bloquear por fallas de serialización; registrar mínimo.
                return null;
            }

            return null;
        }

        private class AuditoriaEntry
        {
            public Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry { get; set; } = default!;
            public int? UsuarioID { get; set; }
            public DateTime Fecha { get; set; }
            public string Operacion { get; set; } = string.Empty;
            public string TablaAfectada { get; set; } = string.Empty;
            public string? ClaveRegistro { get; set; }
            public string? Descripcion { get; set; }

            public void CompletarClave()
            {
                if (!string.IsNullOrWhiteSpace(ClaveRegistro))
                {
                    return;
                }

                ClaveRegistro = ObtenerClave(Entry, includeTemporary: true);
            }

            public Auditoria ToEntity()
            {
                return new Auditoria
                {
                    UsuarioID = UsuarioID,
                    Fecha = Fecha,
                    Operacion = Operacion,
                    TablaAfectada = TablaAfectada,
                    ClaveRegistro = ClaveRegistro,
                    Descripcion = Descripcion
                };
            }
        }
    }
}

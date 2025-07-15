using Microsoft.EntityFrameworkCore;
using Wira.Api.Models;

namespace Wira.Api.Data
{
    public class WiraDbContext : DbContext
    {
        public WiraDbContext(DbContextOptions<WiraDbContext> options) : base(options)
        {
        }

        // DbSets
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<UsuarioRol> UsuariosRoles { get; set; }
        public DbSet<Minera> Mineras { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<EstadoLicitacion> EstadosLicitacion { get; set; }
        public DbSet<Licitacion> Licitaciones { get; set; }
        public DbSet<CriterioLicitacion> CriteriosLicitacion { get; set; }
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
                .HasIndex(r => r.NombreRol)
                .IsUnique();

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Minera>()
                .HasIndex(m => m.CUIT)
                .IsUnique();

            modelBuilder.Entity<Proveedor>()
                .HasIndex(p => p.CUIT)
                .IsUnique();

            modelBuilder.Entity<EstadoLicitacion>()
                .HasIndex(el => el.NombreEstado)
                .IsUnique();

            modelBuilder.Entity<EstadoPropuesta>()
                .HasIndex(ep => ep.NombreEstado)
                .IsUnique();

            // Configuración de restricciones CHECK para ModoEvaluacion
            modelBuilder.Entity<CriterioLicitacion>()
                .ToTable(t => t.HasCheckConstraint("CK_CriterioLicitacion_ModoEvaluacion", 
                    "[ModoEvaluacion] IN ('MENOR_MEJOR', 'MAYOR_MEJOR')"));

            // Configuración de restricciones CHECK para EntidadTipo en ArchivosAdjuntos
            modelBuilder.Entity<ArchivoAdjunto>()
                .ToTable(t => t.HasCheckConstraint("CK_ArchivosAdjuntos_EntidadTipo", 
                    "[EntidadTipo] IN ('LICITACION', 'PROPUESTA')"));

            // Configuración de restricciones CHECK para calificaciones
            modelBuilder.Entity<CalificacionPostLicitacion>()
                .ToTable(t => t.HasCheckConstraint("CK_CalificacionPostLicitacion_Puntualidad", 
                    "[Puntualidad] BETWEEN 0 AND 10"))
                .ToTable(t => t.HasCheckConstraint("CK_CalificacionPostLicitacion_Calidad", 
                    "[Calidad] BETWEEN 0 AND 10"))
                .ToTable(t => t.HasCheckConstraint("CK_CalificacionPostLicitacion_Comunicacion", 
                    "[Comunicacion] BETWEEN 0 AND 10"));

            // Configuración de relaciones opcionales para Usuario
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Minera)
                .WithMany(m => m.Usuarios)
                .HasForeignKey(u => u.MineraID)
                .IsRequired(false);

            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Proveedor)
                .WithMany(p => p.Usuarios)
                .HasForeignKey(u => u.ProveedorID)
                .IsRequired(false);

            // Configuración de propiedades con valores por defecto
            modelBuilder.Entity<Usuario>()
                .Property(u => u.FechaRegistro)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Usuario>()
                .Property(u => u.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Usuario>()
                .Property(u => u.ValidadoEmail)
                .HasDefaultValue(false);

            modelBuilder.Entity<Minera>()
                .Property(m => m.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Proveedor>()
                .Property(p => p.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Rubro>()
                .Property(r => r.Activo)
                .HasDefaultValue(true);

            modelBuilder.Entity<Licitacion>()
                .Property(l => l.Eliminado)
                .HasDefaultValue(false);

            modelBuilder.Entity<Licitacion>()
                .Property(l => l.FechaCreacion)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Proveedor>()
                .HasOne(p => p.Rubro)
                .WithMany(r => r.Proveedores)
                .HasForeignKey(p => p.RubroID)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Licitacion>()
                .HasOne(l => l.Rubro)
                .WithMany(r => r.Licitaciones)
                .HasForeignKey(l => l.RubroID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Propuesta>()
                .Property(p => p.FechaEnvio)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Propuesta>()
                .Property(p => p.Eliminado)
                .HasDefaultValue(false);

            modelBuilder.Entity<ArchivoAdjunto>()
                .Property(a => a.FechaSubida)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Notificacion>()
                .Property(n => n.FechaCreacion)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<NotificacionUsuario>()
                .Property(nu => nu.Leido)
                .HasDefaultValue(false);

            modelBuilder.Entity<HistorialProveedorLicitacion>()
                .Property(h => h.FechaParticipacion)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<CalificacionPostLicitacion>()
                .Property(c => c.FechaCalificacion)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Auditoria>()
                .Property(a => a.Fecha)
                .HasDefaultValueSql("GETDATE()");

            // Configuración de relaciones opcionales para ArchivosAdjuntos
            modelBuilder.Entity<Licitacion>()
                .HasOne(l => l.ArchivoAdjunto)
                .WithMany()
                .HasForeignKey(l => l.ArchivoID)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Propuesta>()
                .HasOne(p => p.ArchivoAdjunto)
                .WithMany()
                .HasForeignKey(p => p.ArchivoID)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

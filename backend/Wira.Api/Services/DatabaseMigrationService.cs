using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;

namespace Wira.Api.Services
{
    public static class DatabaseMigrationService
    {
        public static async Task EnsureEmailVerificationColumnsExistAsync(WiraDbContext context)
        {
            try
            {
                // Verificar si las columnas existen ejecutando una consulta de prueba
                await context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                                   WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'TokenVerificacionEmail')
                    BEGIN
                        ALTER TABLE Usuarios ADD TokenVerificacionEmail NVARCHAR(255) NULL;
                    END
                    
                    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                                   WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'FechaVencimientoTokenVerificacion')
                    BEGIN
                        ALTER TABLE Usuarios ADD FechaVencimientoTokenVerificacion DATETIME2 NULL;
                    END
                    
                    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                                   WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'TokenRecuperacionPassword')
                    BEGIN
                        ALTER TABLE Usuarios ADD TokenRecuperacionPassword NVARCHAR(255) NULL;
                    END
                    
                    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                                   WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'FechaVencimientoTokenRecuperacion')
                    BEGIN
                        ALTER TABLE Usuarios ADD FechaVencimientoTokenRecuperacion DATETIME2 NULL;
                    END
                ");

                Console.WriteLine("✅ Columnas de verificación de email verificadas/creadas exitosamente");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error verificando/creando columnas: {ex.Message}");
                throw;
            }
        }
    }
}

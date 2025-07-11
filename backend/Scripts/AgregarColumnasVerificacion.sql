-- Script para agregar columnas de verificación de email a la tabla Usuarios
-- Ejecutar este script en SQL Server Management Studio o herramienta similar

USE [TuBaseDeDatos]; -- Reemplaza con el nombre de tu base de datos

-- Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'TokenVerificacionEmail')
BEGIN
    ALTER TABLE Usuarios 
    ADD TokenVerificacionEmail NVARCHAR(255) NULL;
    PRINT 'Columna TokenVerificacionEmail agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna TokenVerificacionEmail ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'FechaVencimientoTokenVerificacion')
BEGIN
    ALTER TABLE Usuarios 
    ADD FechaVencimientoTokenVerificacion DATETIME2 NULL;
    PRINT 'Columna FechaVencimientoTokenVerificacion agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna FechaVencimientoTokenVerificacion ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'TokenRecuperacionPassword')
BEGIN
    ALTER TABLE Usuarios 
    ADD TokenRecuperacionPassword NVARCHAR(255) NULL;
    PRINT 'Columna TokenRecuperacionPassword agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna TokenRecuperacionPassword ya existe';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'FechaVencimientoTokenRecuperacion')
BEGIN
    ALTER TABLE Usuarios 
    ADD FechaVencimientoTokenRecuperacion DATETIME2 NULL;
    PRINT 'Columna FechaVencimientoTokenRecuperacion agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna FechaVencimientoTokenRecuperacion ya existe';
END

-- Verificar que todas las columnas fueron creadas
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Usuarios' 
AND COLUMN_NAME IN (
    'TokenVerificacionEmail',
    'FechaVencimientoTokenVerificacion',
    'TokenRecuperacionPassword',
    'FechaVencimientoTokenRecuperacion'
)
ORDER BY COLUMN_NAME;

PRINT 'Script ejecutado completamente. Revisa los resultados arriba.';

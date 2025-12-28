using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Wira.Api.Controllers;
using Wira.Api.Data;
using Wira.Api.Models;
using Wira.Api.Services;
using Wira.Api.Tests.Helpers;
using FluentAssertions;
using Xunit;

namespace Wira.Api.Tests.Controllers
{
    public class PropuestasControllerTests : IDisposable
    {
        private readonly WiraDbContext _context;
        private readonly Mock<ILogger<PropuestasController>> _mockLogger;
        private readonly Mock<INotificacionService> _mockNotificacionService;
        private readonly PropuestasController _controller;

        public PropuestasControllerTests()
        {
            _context = TestDbContextHelper.CreateInMemoryDbContext();
            _mockLogger = new Mock<ILogger<PropuestasController>>();
            _mockNotificacionService = new Mock<INotificacionService>();
            _controller = new PropuestasController(_context, _mockLogger.Object, _mockNotificacionService.Object);

            SeedTestData();
        }

        private void SeedTestData()
        {
            if (!_context.Monedas.Any())
            {
                _context.Monedas.AddRange(
                    new Moneda { MonedaID = 1, Codigo = "ARS", Nombre = "Peso argentino", Simbolo = "$", Activo = true },
                    new Moneda { MonedaID = 2, Codigo = "USD", Nombre = "Dólar estadounidense", Simbolo = "US$", Activo = true }
                );
            }

            // Seed Minera
            var minera = new Minera
            {
                MineraID = 1,
                Nombre = "Minera Test",
                CUIT = "20-12345678-9",
                EmailContacto = "test@minera.com",
                Activo = true
            };
            _context.Mineras.Add(minera);

            // Seed Rubro
            var rubro = new Rubro
            {
                RubroID = 1,
                Nombre = "Construcción",
                Activo = true
            };
            _context.Rubros.Add(rubro);

            // Seed Proveedor
            var proveedor = new Proveedor
            {
                ProveedorID = 1,
                Nombre = "Proveedor Test",
                CUIT = "20-87654321-9",
                RubroID = 1,
                Activo = true
            };
            _context.Proveedores.Add(proveedor);

            // Seed Estado Licitación
            var estadoLicitacion = new EstadoLicitacion
            {
                EstadoLicitacionID = 1,
                NombreEstado = "Publicada"
            };
            _context.EstadosLicitacion.Add(estadoLicitacion);

            // Seed Estados Propuesta
            var estadoEnviada = new EstadoPropuesta
            {
                EstadoPropuestaID = 1,
                NombreEstado = "Enviada"
            };
            var estadoEvaluada = new EstadoPropuesta
            {
                EstadoPropuestaID = 2,
                NombreEstado = "Evaluada"
            };
            var estadoSeleccionada = new EstadoPropuesta
            {
                EstadoPropuestaID = 3,
                NombreEstado = "Seleccionada"
            };
            var estadoRechazada = new EstadoPropuesta
            {
                EstadoPropuestaID = 4,
                NombreEstado = "Rechazada"
            };
            _context.EstadosPropuesta.AddRange(estadoEnviada, estadoEvaluada, estadoSeleccionada, estadoRechazada);

            // Seed Licitación
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Licitación Test",
                Descripcion = "Descripción Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                PresupuestoEstimado = 100000,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);

            // Seed Criterio Licitación
            var criterio = new CriterioLicitacion
            {
                CriterioID = 1,
                LicitacionID = 1,
                Nombre = "Precio",
                Descripcion = "Evaluación del precio",
                Peso = 100,
                MayorMejor = false
            };
            _context.CriteriosLicitacion.Add(criterio);

            _context.SaveChanges();
        }

        [Fact]
        public async Task GetPropuestas_ReturnsAllActivePropuestas()
        {
            // Arrange
            var propuesta = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                Descripcion = "Propuesta Test",
                PresupuestoOfrecido = 50000,
                MonedaID = 1,
                FechaEntrega = DateTime.UtcNow.AddDays(15),
                CumpleRequisitos = true,
                Eliminado = false
            };
            _context.Propuestas.Add(propuesta);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPropuestas();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var propuestas = okResult.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            propuestas.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetPropuestas_DoesNotReturnDeletedPropuestas()
        {
            // Arrange
            var propuestaActiva = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 50000,
                MonedaID = 1,
                Eliminado = false
            };

            var propuestaEliminada = new Propuesta
            {
                PropuestaID = 2,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 60000,
                MonedaID = 1,
                Eliminado = true
            };

            _context.Propuestas.AddRange(propuestaActiva, propuestaEliminada);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPropuestas();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var propuestas = okResult.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            propuestas.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetPropuesta_WithValidId_ReturnsPropuesta()
        {
            // Arrange
            var propuesta = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                Descripcion = "Propuesta Test",
                PresupuestoOfrecido = 50000,
                MonedaID = 1,
                Eliminado = false
            };
            _context.Propuestas.Add(propuesta);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPropuesta(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPropuesta_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetPropuesta(999);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetPropuesta_WithDeletedPropuesta_ReturnsNotFound()
        {
            // Arrange
            var propuesta = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 50000,
                Eliminado = true
            };
            _context.Propuestas.Add(propuesta);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPropuesta(1);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetPropuestasByProveedor_ReturnsCorrectPropuestas()
        {
            // Arrange
            var proveedor2 = new Proveedor
            {
                ProveedorID = 2,
                Nombre = "Proveedor 2",
                CUIT = "20-11111111-1",
                RubroID = 1,
                Activo = true
            };
            _context.Proveedores.Add(proveedor2);

            var propuesta1 = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 50000,
                Eliminado = false
            };

            var propuesta2 = new Propuesta
            {
                PropuestaID = 2,
                LicitacionID = 1,
                ProveedorID = 2,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 60000,
                Eliminado = false
            };

            _context.Propuestas.AddRange(propuesta1, propuesta2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPropuestasByProveedor(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var propuestas = okResult.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            propuestas.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetPropuestasByLicitacion_ReturnsCorrectPropuestas()
        {
            // Arrange
            var licitacion2 = new Licitacion
            {
                LicitacionID = 2,
                Titulo = "Licitación 2",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                EstadoLicitacionID = 1,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion2);

            var propuesta1 = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 50000,
                Eliminado = false
            };

            var propuesta2 = new Propuesta
            {
                PropuestaID = 2,
                LicitacionID = 2,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 60000,
                Eliminado = false
            };

            _context.Propuestas.AddRange(propuesta1, propuesta2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetPropuestasByLicitacion(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var propuestas = okResult.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            propuestas.Should().HaveCount(1);
        }

        [Fact]
        public async Task CreatePropuesta_WithValidData_CreatesPropuesta()
        {
            // Arrange
            var createDto = new CreatePropuestaDto
            {
                LicitacionID = 1,
                ProveedorID = 1,
                Descripcion = "Nueva propuesta",
                PresupuestoOfrecido = 45000,
                FechaEntrega = DateTime.UtcNow.AddDays(20),
                CumpleRequisitos = true
            };

            // Setup mock para el servicio de notificaciones
            _mockNotificacionService
                .Setup(x => x.CrearNotificacionNuevaPropuesta(
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreatePropuesta(createDto);

            // Assert - Por ahora, simplemente verificamos que no haya error 500 y que se cree la propuesta
            var actionResult = result as IActionResult;
            actionResult.Should().NotBeNull();

            // Verificar que la propuesta se creó en la base de datos
            var propuestaEnDb = await _context.Propuestas.FirstOrDefaultAsync();

            if (propuestaEnDb == null)
            {
                // Si no se creó la propuesta, el controlador falló
                if (result is ObjectResult objectResult && objectResult.StatusCode == 500)
                {
                    throw new Exception($"Error 500 en CreatePropuesta: {objectResult.Value}");
                }
                else
                {
                    throw new Exception($"La propuesta no se creó pero no se devolvió error 500. Resultado: {result.GetType().Name}");
                }
            }

            // Si llegamos aquí, la propuesta se creó exitosamente
            propuestaEnDb.PresupuestoOfrecido.Should().Be(45000);
            propuestaEnDb.EstadoPropuestaID.Should().Be(1); // Enviada por defecto

            // Verificar que se llamó al servicio de notificaciones
            _mockNotificacionService.Verify(
                x => x.CrearNotificacionNuevaPropuesta(
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>()),
                Times.Once);
        }

        [Fact]
        public async Task CreatePropuesta_WithInvalidLicitacion_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreatePropuestaDto
            {
                LicitacionID = 999, // Licitación que no existe
                ProveedorID = 1,
                Descripcion = "Nueva propuesta",
                PresupuestoOfrecido = 45000
            };

            // Act
            var result = await _controller.CreatePropuesta(createDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task CreatePropuesta_WithInvalidProveedor_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreatePropuestaDto
            {
                LicitacionID = 1,
                ProveedorID = 999, // Proveedor que no existe
                Descripcion = "Nueva propuesta",
                PresupuestoOfrecido = 45000
            };

            // Act
            var result = await _controller.CreatePropuesta(createDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task CreatePropuesta_WithDuplicatePropuesta_ReturnsBadRequest()
        {
            // Arrange
            var propuestaExistente = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 50000,
                Eliminado = false
            };
            _context.Propuestas.Add(propuestaExistente);
            await _context.SaveChangesAsync();

            var createDto = new CreatePropuestaDto
            {
                LicitacionID = 1,
                ProveedorID = 1, // Mismo proveedor para la misma licitación
                Descripcion = "Nueva propuesta",
                PresupuestoOfrecido = 45000
            };

            // Act
            var result = await _controller.CreatePropuesta(createDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdatePropuesta_WithValidData_UpdatesPropuesta()
        {
            // Arrange
            var propuesta = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                Descripcion = "Propuesta Original",
                PresupuestoOfrecido = 50000,
                Eliminado = false
            };
            _context.Propuestas.Add(propuesta);
            await _context.SaveChangesAsync();

            var updateDto = new UpdatePropuestaDto
            {
                EstadoPropuestaID = 2,
                Descripcion = "Propuesta Actualizada",
                PresupuestoOfrecido = 55000,
                CalificacionFinal = 85.5m,
                RespuestasCriterios = new List<RespuestaCriterioDto>
                {
                    new RespuestaCriterioDto { CriterioID = 1, ValorProveedor = "55000" }
                }
            };

            // Act
            var result = await _controller.UpdatePropuesta(1, updateDto);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            var propuestaActualizada = await _context.Propuestas.FindAsync(1);
            propuestaActualizada!.EstadoPropuestaID.Should().Be(2);
            propuestaActualizada.Descripcion.Should().Be("Propuesta Actualizada");
            propuestaActualizada.PresupuestoOfrecido.Should().Be(55000);
            propuestaActualizada.CalificacionFinal.Should().Be(85.5m);
        }

        [Fact]
        public async Task UpdatePropuesta_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new UpdatePropuestaDto
            {
                Descripcion = "Propuesta Actualizada",
                PresupuestoOfrecido = 55000
            };

            // Act
            var result = await _controller.UpdatePropuesta(999, updateDto);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task DeletePropuesta_WithValidId_SoftDeletesPropuesta()
        {
            // Arrange
            var propuesta = new Propuesta
            {
                PropuestaID = 1,
                LicitacionID = 1,
                ProveedorID = 1,
                FechaEnvio = DateTime.UtcNow,
                EstadoPropuestaID = 1,
                PresupuestoOfrecido = 50000,
                Eliminado = false
            };
            _context.Propuestas.Add(propuesta);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeletePropuesta(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            var propuestaEliminada = await _context.Propuestas.FindAsync(1);
            propuestaEliminada.Should().NotBeNull();
            propuestaEliminada!.Eliminado.Should().BeTrue(); // Soft delete
        }

        [Fact]
        public async Task DeletePropuesta_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeletePropuesta(999);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}

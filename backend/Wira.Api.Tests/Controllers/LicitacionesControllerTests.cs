using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq;
using Wira.Api.Controllers;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;
using Wira.Api.Services;
using Wira.Api.Tests.Helpers;
using FluentAssertions;
using Xunit;

namespace Wira.Api.Tests.Controllers
{
    public class LicitacionesControllerTests : IDisposable
    {
        private readonly WiraDbContext _context;
        private readonly Mock<ILogger<LicitacionesController>> _mockLogger;
        private readonly Mock<INotificacionService> _mockNotificacionService;
        private readonly LicitacionesController _controller;

        public LicitacionesControllerTests()
        {
            _context = TestDbContextHelper.CreateInMemoryDbContext();
            _mockLogger = new Mock<ILogger<LicitacionesController>>();
            _mockNotificacionService = new Mock<INotificacionService>();
            _controller = new LicitacionesController(_context, _mockLogger.Object, _mockNotificacionService.Object);

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

            // Seed Estados de Licitación
            var estadoPublicada = new EstadoLicitacion
            {
                EstadoLicitacionID = 1,
                NombreEstado = "Publicada"
            };
            var estadoEvaluacion = new EstadoLicitacion
            {
                EstadoLicitacionID = 2,
                NombreEstado = "En Evaluación"
            };
            var estadoAdjudicada = new EstadoLicitacion
            {
                EstadoLicitacionID = 3,
                NombreEstado = "Adjudicada"
            };
            var estadoCerrada = new EstadoLicitacion
            {
                EstadoLicitacionID = 4,
                NombreEstado = "Cerrada"
            };
            _context.EstadosLicitacion.AddRange(estadoPublicada, estadoEvaluacion, estadoAdjudicada, estadoCerrada);

            // Seed ProyectoMinero
            var proyectoMinero = new ProyectoMinero
            {
                ProyectoMineroID = 1,
                MineraID = 1,
                Nombre = "Proyecto Test",
                Ubicacion = "Test Location",
                Descripcion = "Test Description",
                Activo = true
            };
            _context.ProyectosMineros.Add(proyectoMinero);

            _context.SaveChanges();
        }

        [Fact]
        public async Task GetLicitaciones_ReturnsAllActiveLicitaciones()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                ProyectoMineroID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                PresupuestoEstimado = 100000,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetLicitaciones();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var licitaciones = okResult.Value.Should().BeAssignableTo<IEnumerable<LicitacionDto>>().Subject;
            licitaciones.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetLicitaciones_DoesNotReturnDeletedLicitaciones()
        {
            // Arrange
            var licitacionActiva = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Licitación Activa",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };

            var licitacionEliminada = new Licitacion
            {
                LicitacionID = 2,
                Titulo = "Licitación Eliminada",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = true
            };

            _context.Licitaciones.AddRange(licitacionActiva, licitacionEliminada);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetLicitaciones();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var licitaciones = okResult.Value.Should().BeAssignableTo<IEnumerable<LicitacionDto>>().Subject;
            licitaciones.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetLicitacion_WithValidId_ReturnsLicitacion()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                ProyectoMineroID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                PresupuestoEstimado = 100000,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetLicitacion(1);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var licitacionDto = okResult.Value.Should().BeOfType<LicitacionDto>().Subject;
            licitacionDto.LicitacionID.Should().Be(1);
            licitacionDto.Titulo.Should().Be("Test Licitación");
        }

        [Fact]
        public async Task GetLicitacion_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetLicitacion(999);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetLicitacion_WithDeletedLicitacion_ReturnsNotFound()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = true
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetLicitacion(1);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task CreateLicitacion_WithValidData_CreatesLicitacion()
        {
            // Arrange
            var request = new CreateLicitacionRequest
            {
                Titulo = "Nueva Licitación",
                Descripcion = "Nueva Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                ProyectoMineroID = 1,
                RubroID = 1,
                MonedaID = 1,
                PresupuestoEstimado = 50000,
                Condiciones = "Condiciones de la licitación",
                Criterios = new List<CreateCriterioRequest>
                {
                    new CreateCriterioRequest
                    {
                        Nombre = "Precio",
                        Descripcion = "Evaluación del precio ofrecido",
                        Peso = 60,
                        MayorMejor = false
                    },
                    new CreateCriterioRequest
                    {
                        Nombre = "Calidad",
                        Descripcion = "Evaluación de la calidad",
                        Peso = 40,
                        MayorMejor = true
                    }
                }
            };

            // Act
            var result = await _controller.CreateLicitacion(request);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var licitacionDto = okResult.Value.Should().BeOfType<LicitacionDto>().Subject;
            licitacionDto.Titulo.Should().Be("Nueva Licitación");

            var licitacionEnDb = await _context.Licitaciones.FirstOrDefaultAsync();
            licitacionEnDb.Should().NotBeNull();
            licitacionEnDb!.Titulo.Should().Be("Nueva Licitación");
            licitacionEnDb.EstadoLicitacionID.Should().Be(1); // Publicada por defecto

            // Verificar que los criterios se crearon
            var criterios = await _context.CriteriosLicitacion
                .Where(c => c.LicitacionID == licitacionEnDb.LicitacionID)
                .ToListAsync();
            criterios.Should().HaveCount(2);

            // Verificar que se llamó al servicio de notificaciones
            _mockNotificacionService.Verify(
                x => x.CrearNotificacionLicitacionPublicada(
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>()),
                Times.Once);
        }

        [Fact]
        public async Task CreateLicitacion_WithInvalidMinera_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateLicitacionRequest
            {
                Titulo = "Nueva Licitación",
                Descripcion = "Nueva Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 999, // Minera que no existe
                RubroID = 1,
                MonedaID = 1,
                PresupuestoEstimado = 50000,
                Criterios = new List<CreateCriterioRequest>
                {
                    new CreateCriterioRequest { Nombre = "Precio", Peso = 100, MayorMejor = false }
                }
            };

            // Act
            var result = await _controller.CreateLicitacion(request);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task CreateLicitacion_WithInvalidDateRange_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateLicitacionRequest
            {
                Titulo = "Nueva Licitación",
                Descripcion = "Nueva Descripción",
                FechaInicio = DateTime.UtcNow.AddDays(10),
                FechaCierre = DateTime.UtcNow.AddDays(5), // Fecha de cierre antes de inicio
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                PresupuestoEstimado = 50000,
                Criterios = new List<CreateCriterioRequest>
                {
                    new CreateCriterioRequest { Nombre = "Precio", Peso = 100, MayorMejor = false }
                }
            };

            // Act
            var result = await _controller.CreateLicitacion(request);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task CreateLicitacion_WithInvalidCriteriaWeights_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateLicitacionRequest
            {
                Titulo = "Nueva Licitación",
                Descripcion = "Nueva Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                PresupuestoEstimado = 50000,
                Criterios = new List<CreateCriterioRequest>
                {
                    new CreateCriterioRequest { Nombre = "Precio", Peso = 60, MayorMejor = false },
                    new CreateCriterioRequest { Nombre = "Calidad", Peso = 30, MayorMejor = true }
                    // Total: 90% (debería ser 100%)
                }
            };

            // Act
            var result = await _controller.CreateLicitacion(request);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateLicitacion_WithValidData_UpdatesLicitacion()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Licitación Original",
                Descripcion = "Descripción Original",
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
            await _context.SaveChangesAsync();

            var updateRequest = new UpdateLicitacionRequest
            {
                RubroID = 1,
                MonedaID = 1,
                Titulo = "Licitación Actualizada",
                Descripcion = "Descripción Actualizada",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(45),
                PresupuestoEstimado = 150000,
                Condiciones = "Condiciones actualizadas",
                Criterios = new List<CreateCriterioRequest>
                {
                    new CreateCriterioRequest
                    {
                        Nombre = "Precio Actualizado",
                        Peso = 60,
                        Tipo = TipoCriterio.Numerico,
                        MayorMejor = false
                    },
                    new CreateCriterioRequest
                    {
                        Nombre = "Calidad Actualizada",
                        Peso = 40,
                        Tipo = TipoCriterio.Descriptivo,
                        Descripcion = "Evaluación cualitativa",
                        EsPuntuable = false
                    }
                }
            };

            // Act
            var result = await _controller.UpdateLicitacion(1, updateRequest);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            var licitacionActualizada = await _context.Licitaciones.FindAsync(1);
            licitacionActualizada!.Titulo.Should().Be("Licitación Actualizada");
            licitacionActualizada.Descripcion.Should().Be("Descripción Actualizada");
            licitacionActualizada.PresupuestoEstimado.Should().Be(150000);
            licitacionActualizada.RubroID.Should().Be(1);

            var criteriosActualizados = await _context.CriteriosLicitacion
                .Where(c => c.LicitacionID == 1)
                .ToListAsync();
            criteriosActualizados.Should().HaveCount(2);
            criteriosActualizados.Select(c => c.Nombre)
                .Should().Contain(new[] { "Precio Actualizado", "Calidad Actualizada" });
        }

        [Fact]
        public async Task UpdateLicitacion_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var updateRequest = new UpdateLicitacionRequest
            {
                RubroID = 1,
                MonedaID = 1,
                Titulo = "Licitación Actualizada",
                Descripcion = "Descripción Actualizada",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(45),
                PresupuestoEstimado = 150000,
                Criterios = new List<CreateCriterioRequest>
                {
                    new CreateCriterioRequest
                    {
                        Nombre = "Precio",
                        Peso = 100,
                        Tipo = TipoCriterio.Numerico,
                        MayorMejor = false
                    }
                }
            };

            // Act
            var result = await _controller.UpdateLicitacion(999, updateRequest);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteLicitacion_WithValidId_SoftDeletesLicitacion()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test Descripción",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteLicitacion(1);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            var licitacionEliminada = await _context.Licitaciones.FindAsync(1);
            licitacionEliminada.Should().NotBeNull();
            licitacionEliminada!.Eliminado.Should().BeTrue(); // Soft delete
        }

        [Fact]
        public async Task DeleteLicitacion_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteLicitacion(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetCriteriosLicitacion_WithValidId_ReturnsCriterios()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                EstadoLicitacionID = 1,
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);

            var criterio1 = new CriterioLicitacion
            {
                CriterioID = 1,
                LicitacionID = 1,
                Nombre = "Precio",
                Descripcion = "Evaluación del precio",
                Peso = 60,
                MayorMejor = false
            };

            var criterio2 = new CriterioLicitacion
            {
                CriterioID = 2,
                LicitacionID = 1,
                Nombre = "Calidad",
                Descripcion = "Evaluación de la calidad",
                Peso = 40,
                MayorMejor = true
            };

            _context.CriteriosLicitacion.AddRange(criterio1, criterio2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetCriteriosLicitacion(1);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var criterios = okResult.Value.Should().BeAssignableTo<IEnumerable<object>>().Subject;
            criterios.Should().HaveCount(2);
        }

        [Fact]
        public async Task CerrarLicitacion_FromPublicadaState_ChangesToEvaluacion()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1, // Publicada
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.CerrarLicitacion(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            var licitacionActualizada = await _context.Licitaciones
                .Include(l => l.EstadoLicitacion)
                .FirstOrDefaultAsync(l => l.LicitacionID == 1);

            licitacionActualizada!.EstadoLicitacionID.Should().Be(2); // En Evaluación

            // Verificar que se llamó al servicio de notificaciones
            _mockNotificacionService.Verify(
                x => x.CrearNotificacionLicitacionCerrada(
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>()),
                Times.Once);
        }

        [Fact]
        public async Task AdjudicarLicitacion_FromEvaluacionState_ChangesToAdjudicada()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 2, // En Evaluación
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.AdjudicarLicitacion(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            var licitacionActualizada = await _context.Licitaciones.FindAsync(1);
            licitacionActualizada!.EstadoLicitacionID.Should().Be(3); // Adjudicada

            // Verificar que se llamó al servicio de notificaciones
            _mockNotificacionService.Verify(
                x => x.CrearNotificacionLicitacionAdjudicada(
                    It.IsAny<int>(),
                    It.IsAny<string>(),
                    It.IsAny<int>()),
                Times.Once);
        }

        [Fact]
        public async Task AdjudicarLicitacion_FromWrongState_ReturnsBadRequest()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 1, // Publicada (estado incorrecto)
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.AdjudicarLicitacion(1);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task FinalizarLicitacion_FromAdjudicadaState_ChangesToCerrada()
        {
            // Arrange
            var licitacion = new Licitacion
            {
                LicitacionID = 1,
                Titulo = "Test Licitación",
                Descripcion = "Test",
                FechaInicio = DateTime.UtcNow,
                FechaCierre = DateTime.UtcNow.AddDays(30),
                MineraID = 1,
                RubroID = 1,
                MonedaID = 1,
                EstadoLicitacionID = 3, // Adjudicada
                FechaCreacion = DateTime.UtcNow,
                Eliminado = false
            };
            _context.Licitaciones.Add(licitacion);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.FinalizarLicitacion(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            var licitacionActualizada = await _context.Licitaciones.FindAsync(1);
            licitacionActualizada!.EstadoLicitacionID.Should().Be(4); // Cerrada
            licitacionActualizada.FechaCierre.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}

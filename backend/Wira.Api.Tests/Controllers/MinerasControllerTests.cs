using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Wira.Api.Controllers;
using Wira.Api.Data;
using Wira.Api.Models;
using Wira.Api.Tests.Helpers;

namespace Wira.Api.Tests.Controllers
{
    public class MinerasControllerTests : IDisposable
    {
        private readonly WiraDbContext _context;
        private readonly MinerasController _controller;
        private readonly Mock<ILogger<MinerasController>> _mockLogger;

        public MinerasControllerTests()
        {
            _context = TestDbContextHelper.CreateInMemoryDbContext();
            _mockLogger = new Mock<ILogger<MinerasController>>();
            _controller = new MinerasController(_context, _mockLogger.Object);

            SeedTestData();
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        private void SeedTestData()
        {
            // Seed Mineras activas
            var mineraActiva1 = new Minera
            {
                MineraID = 1,
                Nombre = "Minera Los Andes",
                CUIT = "20-12345678-9",
                EmailContacto = "contacto@losandes.com",
                Activo = true
            };

            var mineraActiva2 = new Minera
            {
                MineraID = 2,
                Nombre = "Minera Cordillera",
                CUIT = "20-23456789-0",
                EmailContacto = "info@cordillera.com",
                Activo = true
            };

            // Seed Minera inactiva
            var mineraInactiva = new Minera
            {
                MineraID = 3,
                Nombre = "Minera Cerrada",
                CUIT = "20-34567890-1",
                EmailContacto = "cerrada@minera.com",
                Activo = false
            };

            _context.Mineras.AddRange(mineraActiva1, mineraActiva2, mineraInactiva);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetMineras_ReturnsAllActiveMineras()
        {
            // Act
            var result = await _controller.GetMineras();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var mineras = okResult!.Value as IEnumerable<object>;
            
            mineras.Should().NotBeNull();
            var minerasList = mineras!.ToList();
            minerasList.Should().HaveCount(2); // Solo las activas

            // Verificar que están ordenadas por nombre usando reflection
            var minera1 = minerasList[0];
            var minera2 = minerasList[1];
            
            var nombre1 = GetPropertyValue(minera1, "Nombre")?.ToString();
            var nombre2 = GetPropertyValue(minera2, "Nombre")?.ToString();
            
            nombre1.Should().Be("Minera Cordillera"); // Orden alfabético
            nombre2.Should().Be("Minera Los Andes");
        }

        [Fact]
        public async Task GetMinera_WithValidId_ReturnsMinera()
        {
            // Arrange
            int mineraId = 1;

            // Act
            var result = await _controller.GetMinera(mineraId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var minera = okResult!.Value;
            
            minera.Should().NotBeNull();
            
            var returnedId = GetPropertyValue(minera!, "MineraID");
            var nombre = GetPropertyValue(minera!, "Nombre")?.ToString();
            var cuit = GetPropertyValue(minera!, "CUIT")?.ToString();
            var email = GetPropertyValue(minera!, "EmailContacto")?.ToString();
            
            returnedId.Should().Be(1);
            nombre.Should().Be("Minera Los Andes");
            cuit.Should().Be("20-12345678-9");
            email.Should().Be("contacto@losandes.com");
        }

        [Fact]
        public async Task GetMinera_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int invalidId = 999;

            // Act
            var result = await _controller.GetMinera(invalidId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            var notFoundResult = result as NotFoundObjectResult;
            var response = notFoundResult!.Value;
            
            response.Should().NotBeNull();
            var message = GetPropertyValue(response!, "message")?.ToString();
            message.Should().Be("Minera no encontrada");
        }

        [Fact]
        public async Task GetMinera_WithInactiveMinera_ReturnsNotFound()
        {
            // Arrange
            int inactiveMineraId = 3;

            // Act
            var result = await _controller.GetMinera(inactiveMineraId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            var notFoundResult = result as NotFoundObjectResult;
            var response = notFoundResult!.Value;
            
            response.Should().NotBeNull();
            var message = GetPropertyValue(response!, "message")?.ToString();
            message.Should().Be("Minera no encontrada");
        }

        [Fact]
        public async Task GetMineras_WhenNoActiveMineras_ReturnsEmptyList()
        {
            // Arrange - Desactivar todas las mineras
            var allMineras = await _context.Mineras.ToListAsync();
            foreach (var minera in allMineras)
            {
                minera.Activo = false;
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetMineras();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var mineras = okResult!.Value as IEnumerable<object>;
            
            mineras.Should().NotBeNull();
            mineras!.Should().BeEmpty();
        }

        [Fact]
        public async Task GetMineras_ReturnsCorrectProperties()
        {
            // Act
            var result = await _controller.GetMineras();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var mineras = okResult!.Value as IEnumerable<object>;
            
            mineras.Should().NotBeNull();
            var minerasList = mineras!.ToList();
            minerasList.Should().HaveCount(2);

            var firstMinera = (dynamic)minerasList[0];
            
            // Verificar que tiene las propiedades esperadas
            Assert.True(HasProperty(firstMinera, "MineraID"));
            Assert.True(HasProperty(firstMinera, "Nombre"));
            Assert.True(HasProperty(firstMinera, "CUIT"));
            Assert.True(HasProperty(firstMinera, "EmailContacto"));
        }

        private static bool HasProperty(dynamic obj, string propertyName)
        {
            try
            {
                var type = obj.GetType();
                return type.GetProperty(propertyName) != null;
            }
            catch
            {
                return false;
            }
        }

        private static object? GetPropertyValue(object obj, string propertyName)
        {
            try
            {
                var type = obj.GetType();
                var property = type.GetProperty(propertyName);
                return property?.GetValue(obj);
            }
            catch
            {
                return null;
            }
        }
    }
}

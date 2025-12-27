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
    public class ProveedoresControllerTests : IDisposable
    {
        private readonly WiraDbContext _context;
        private readonly ProveedoresController _controller;
        private readonly Mock<ILogger<ProveedoresController>> _mockLogger;

        public ProveedoresControllerTests()
        {
            _context = TestDbContextHelper.CreateInMemoryDbContext();
            _mockLogger = new Mock<ILogger<ProveedoresController>>();
            _controller = new ProveedoresController(_context, _mockLogger.Object);

            SeedTestData();
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        private void SeedTestData()
        {
            // Seed Rubros
            var rubroConstruccion = new Rubro
            {
                RubroID = 1,
                Nombre = "Construcción",
                Activo = true
            };

            var rubroMineria = new Rubro
            {
                RubroID = 2,
                Nombre = "Minería",
                Activo = true
            };

            var rubroInactivo = new Rubro
            {
                RubroID = 3,
                Nombre = "Rubro Inactivo",
                Activo = false
            };

            _context.Rubros.AddRange(rubroConstruccion, rubroMineria, rubroInactivo);

            // Seed Proveedores activos
            var proveedor1 = new Empresa
            {
                EmpresaID = 1,
                Nombre = "Constructora ABC",
                RazonSocial = "Constructora ABC SA",
                CUIT = "20-11111111-1",
                RubroID = 1,
                TipoEmpresa = EmpresaTipos.Proveedor,
                Activo = true
            };

            var proveedor2 = new Empresa
            {
                EmpresaID = 2,
                Nombre = "Minera XYZ",
                RazonSocial = "Minera XYZ SRL",
                CUIT = "20-22222222-2",
                RubroID = 2,
                TipoEmpresa = EmpresaTipos.Proveedor,
                Activo = true
            };

            var proveedor3 = new Empresa
            {
                EmpresaID = 3,
                Nombre = "Empresa DEF",
                RazonSocial = "Empresa DEF SRL",
                CUIT = "20-33333333-3",
                RubroID = 1,
                TipoEmpresa = EmpresaTipos.Proveedor,
                Activo = true
            };

            // Proveedor inactivo
            var proveedorInactivo = new Empresa
            {
                EmpresaID = 4,
                Nombre = "Proveedor Cerrado",
                RazonSocial = "Proveedor Cerrado SRL",
                CUIT = "20-44444444-4",
                RubroID = 1,
                TipoEmpresa = EmpresaTipos.Proveedor,
                Activo = false
            };

            // Proveedor sin rubro
            var proveedorSinRubro = new Empresa
            {
                EmpresaID = 5,
                Nombre = "Proveedor Sin Rubro",
                RazonSocial = "Proveedor Sin Rubro SRL",
                CUIT = "20-55555555-5",
                RubroID = null,
                TipoEmpresa = EmpresaTipos.Proveedor,
                Activo = true
            };

            _context.Empresas.AddRange(proveedor1, proveedor2, proveedor3, proveedorInactivo, proveedorSinRubro);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetProveedores_ReturnsAllActiveProveedores()
        {
            // Act
            var result = await _controller.GetProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var proveedores = okResult!.Value as IEnumerable<object>;

            proveedores.Should().NotBeNull();
            var proveedoresList = proveedores!.ToList();
            proveedoresList.Should().HaveCount(4); // Solo los activos (incluyendo el sin rubro)

            // Verificar que están ordenados por nombre
            var firstProvider = proveedoresList[0];
            var firstName = GetPropertyValue(firstProvider, "Nombre")?.ToString();
            firstName.Should().Be("Constructora ABC"); // Orden alfabético
        }

        [Fact]
        public async Task GetProveedores_ReturnsCorrectPropertiesWithRubroInfo()
        {
            // Act
            var result = await _controller.GetProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var proveedores = okResult!.Value as IEnumerable<object>;

            proveedores.Should().NotBeNull();
            var proveedoresList = proveedores!.ToList();

            var proveedorConRubro = proveedoresList.First(p =>
            {
                var nombre = GetPropertyValue(p, "Nombre")?.ToString();
                return nombre == "Constructora ABC";
            });

            // Verificar propiedades
            Assert.True(HasProperty(proveedorConRubro, "ProveedorID"));
            Assert.True(HasProperty(proveedorConRubro, "Nombre"));
            Assert.True(HasProperty(proveedorConRubro, "CUIT"));
            Assert.True(HasProperty(proveedorConRubro, "RubroID"));
            Assert.True(HasProperty(proveedorConRubro, "RubroNombre"));

            var rubroNombre = GetPropertyValue(proveedorConRubro, "RubroNombre")?.ToString();
            rubroNombre.Should().Be("Construcción");
        }

        [Fact]
        public async Task GetProveedores_HandlesProveedorWithoutRubro()
        {
            // Act
            var result = await _controller.GetProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var proveedores = okResult!.Value as IEnumerable<object>;

            proveedores.Should().NotBeNull();
            var proveedoresList = proveedores!.ToList();

            var proveedorSinRubro = proveedoresList.First(p =>
            {
                var nombre = GetPropertyValue(p, "Nombre")?.ToString();
                return nombre == "Proveedor Sin Rubro";
            });

            // RubroID debería ser null y RubroNombre también
            var rubroId = GetPropertyValue(proveedorSinRubro, "RubroID");
            var rubroNombre = GetPropertyValue(proveedorSinRubro, "RubroNombre");

            rubroId.Should().BeNull();
            rubroNombre.Should().BeNull();
        }

        [Fact]
        public async Task GetProveedor_WithValidId_ReturnsProveedor()
        {
            // Arrange
            int proveedorId = 1;

            // Act
            var result = await _controller.GetProveedor(proveedorId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var proveedor = okResult!.Value;

            proveedor.Should().NotBeNull();

            var returnedId = GetPropertyValue(proveedor!, "ProveedorID");
            var nombre = GetPropertyValue(proveedor!, "Nombre")?.ToString();
            var cuit = GetPropertyValue(proveedor!, "CUIT")?.ToString();
            var rubroNombre = GetPropertyValue(proveedor!, "RubroNombre")?.ToString();

            returnedId.Should().Be(1);
            nombre.Should().Be("Constructora ABC");
            cuit.Should().Be("20-11111111-1");
            rubroNombre.Should().Be("Construcción");
        }

        [Fact]
        public async Task GetProveedor_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int invalidId = 999;

            // Act
            var result = await _controller.GetProveedor(invalidId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            var notFoundResult = result as NotFoundObjectResult;
            var response = notFoundResult!.Value;

            response.Should().NotBeNull();
            var message = GetPropertyValue(response!, "message")?.ToString();
            message.Should().Be("Proveedor no encontrado");
        }

        [Fact]
        public async Task GetProveedor_WithInactiveProveedor_ReturnsNotFound()
        {
            // Arrange
            int inactiveProveedorId = 4;

            // Act
            var result = await _controller.GetProveedor(inactiveProveedorId);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            var notFoundResult = result as NotFoundObjectResult;
            var response = notFoundResult!.Value;

            response.Should().NotBeNull();
            var message = GetPropertyValue(response!, "message")?.ToString();
            message.Should().Be("Proveedor no encontrado");
        }

        [Fact]
        public async Task GetRubrosConProveedores_ReturnsOnlyRubrosWithActiveProveedores()
        {
            // Act
            var result = await _controller.GetRubrosConProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var rubros = okResult!.Value as IEnumerable<object>;

            rubros.Should().NotBeNull();
            var rubrosList = rubros!.ToList();
            rubrosList.Should().HaveCount(2); // Solo Construcción y Minería

            var firstRubro = rubrosList[0];
            var firstName = GetPropertyValue(firstRubro, "Nombre")?.ToString();
            firstName.Should().Be("Construcción"); // Orden alfabético

            var secondRubro = rubrosList[1];
            var secondName = GetPropertyValue(secondRubro, "Nombre")?.ToString();
            secondName.Should().Be("Minería");
        }

        [Fact]
        public async Task GetRubrosConProveedores_ReturnsCorrectProperties()
        {
            // Act
            var result = await _controller.GetRubrosConProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var rubros = okResult!.Value as IEnumerable<object>;

            rubros.Should().NotBeNull();
            var rubrosList = rubros!.ToList();
            rubrosList.Should().HaveCount(2);

            var firstRubro = rubrosList[0];

            // Verificar que tiene las propiedades esperadas
            Assert.True(HasProperty(firstRubro, "RubroID"));
            Assert.True(HasProperty(firstRubro, "Nombre"));

            var rubroId = GetPropertyValue(firstRubro, "RubroID");
            var nombre = GetPropertyValue(firstRubro, "Nombre")?.ToString();

            rubroId.Should().NotBeNull();
            Convert.ToInt32(rubroId).Should().BeGreaterThan(0);
            nombre.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task GetProveedores_WhenNoActiveProveedores_ReturnsEmptyList()
        {
            // Arrange - Desactivar todos los proveedores
            var allProveedores = await _context.Empresas.Where(p => p.TipoEmpresa == EmpresaTipos.Proveedor).ToListAsync();
            foreach (var proveedor in allProveedores)
            {
                proveedor.Activo = false;
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var proveedores = okResult!.Value as IEnumerable<object>;

            proveedores.Should().NotBeNull();
            proveedores!.Should().BeEmpty();
        }

        [Fact]
        public async Task GetRubrosConProveedores_WhenNoActiveProveedores_ReturnsEmptyList()
        {
            // Arrange - Desactivar todos los proveedores
            var allProveedores = await _context.Empresas.Where(p => p.TipoEmpresa == EmpresaTipos.Proveedor).ToListAsync();
            foreach (var proveedor in allProveedores)
            {
                proveedor.Activo = false;
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetRubrosConProveedores();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            var rubros = okResult!.Value as IEnumerable<object>;

            rubros.Should().NotBeNull();
            rubros!.Should().BeEmpty();
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

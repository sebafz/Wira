// ⚠️  ARCHIVO DE EJEMPLO - NO SE COMPILA EN CI/CD
// EJEMPLO DE PLAYWRIGHT PARA WIRA (No ejecutar - solo referencia)
// 
// Para usar este ejemplo:
// 1. Instalar: dotnet add package Microsoft.Playwright.NUnit
// 2. Instalar: dotnet add package Microsoft.Playwright
// 3. Ejecutar: pwsh bin/Debug/net9.0/playwright.ps1 install
// 4. Remover la exclusión en Wira.Api.Tests.csproj
//
// Este archivo está excluido del build para que no rompa el CI/CD
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;

namespace Wira.Api.Tests.E2E
{
    [TestFixture]
    public class WiraE2ETests : PageTest
    {
        [Test]
        public async Task CompleteUserFlow_RegisterLoginAndCreateLicitacion_ShouldWork()
        {
            // Arrange - Navegar a la aplicación
            await Page.GotoAsync("http://localhost:5173");

            // Act 1 - Registro
            await Page.ClickAsync("text=Registrarse");
            await Page.FillAsync("#nombre", "Test User E2E");
            await Page.FillAsync("#email", "e2e@test.com");
            await Page.FillAsync("#password", "password123");
            await Page.SelectOptionAsync("#tipoCuenta", "Minera");
            await Page.ClickAsync("button[type=submit]");

            // Verificar redirección después del registro
            await Expect(Page).ToHaveURLAsync(new Regex(".*login.*"));

            // Act 2 - Login
            await Page.FillAsync("#email", "e2e@test.com");
            await Page.FillAsync("#password", "password123");
            await Page.ClickAsync("button[type=submit]");

            // Verificar login exitoso
            await Expect(Page).ToHaveURLAsync(new Regex(".*dashboard.*"));

            // Act 3 - Crear licitación
            await Page.ClickAsync("text=Nueva Licitación");
            await Page.FillAsync("#titulo", "Licitación E2E Test");
            await Page.FillAsync("#descripcion", "Descripción de prueba");
            await Page.ClickAsync("button:has-text('Crear')");

            // Assert - Verificar que la licitación se creó
            await Expect(Page.Locator("text=Licitación E2E Test")).ToBeVisibleAsync();
        }

        [Test]
        public async Task ProveedorFlow_SubmitPropuesta_ShouldWork()
        {
            // Similar flow para proveedor
            // 1. Login como proveedor
            // 2. Ver licitaciones disponibles
            // 3. Enviar propuesta
            // 4. Verificar confirmación
        }
    }
}

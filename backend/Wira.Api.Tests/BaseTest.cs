using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Wira.Api.Data;
using Wira.Api.Tests.Helpers;

namespace Wira.Api.Tests
{
    public abstract class BaseTest : IDisposable
    {
        protected WiraDbContext DbContext { get; private set; } = null!;
        protected Mock<ILogger> MockLogger { get; private set; } = null!;
        protected IConfiguration Configuration { get; private set; } = null!;

        protected BaseTest()
        {
            InitializeTest();
        }

        private void InitializeTest()
        {
            // Crear DbContext en memoria
            DbContext = TestDbContextHelper.CreateInMemoryDbContext();
            
            // Configurar mocks
            MockLogger = new Mock<ILogger>();
            
            // Configurar IConfiguration para tests
            var configurationData = new Dictionary<string, string>
            {
                {"Jwt:Key", "TestSecretKeyForJwtTokenGeneration123456789"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"},
                {"EmailSettings:SmtpServer", "smtp.test.com"},
                {"EmailSettings:Port", "587"},
                {"EmailSettings:Username", "test@test.com"},
                {"EmailSettings:Password", "testpassword"},
                {"EmailSettings:FromEmail", "test@test.com"},
                {"EmailSettings:FromName", "Test System"}
            };

            Configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configurationData!)
                .Build();
        }

        protected async Task SeedTestDataAsync()
        {
            await TestDbContextHelper.SeedTestDataAsync(DbContext);
        }

        protected Mock<ILogger<T>> CreateMockLogger<T>()
        {
            return new Mock<ILogger<T>>();
        }

        public virtual void Dispose()
        {
            DbContext?.Dispose();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Wira.Api.Data;
using Wira.Api.Services;
using Wira.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Swagger se habilita en Development o si Swagger:Enabled=true (útil para staging/prod)
var enableSwagger = builder.Environment.IsDevelopment() ||
    builder.Configuration.GetValue<bool>("Swagger:Enabled");

builder.Services.AddOpenApi();

// Agregar Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar Entity Framework (PostgreSQL)
builder.Services.AddDbContext<WiraDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpContextAccessor();

// Configurar JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-secret-key")),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Registrar servicios
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificacionService, NotificacionService>();
builder.Services.AddScoped<IPropuestaEvaluacionService, PropuestaEvaluacionService>();

// Configurar CORS (orígenes desde configuración, separadas por coma)
var allowedOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Agregar controladores
builder.Services.AddControllers();

var app = builder.Build();

// Ejecución opcional: reset completo de la base de datos (dropear esquema, migrar y seed)
if (args.Contains("--reset-db"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<WiraDbContext>();

    var conn = db.Database.GetDbConnection();
    await conn.OpenAsync();
    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = "DROP SCHEMA public CASCADE; CREATE SCHEMA public;";
        await cmd.ExecuteNonQueryAsync();
    }

    await db.Database.MigrateAsync();
    await DbInitializer.InitializeAsync(db);
    return;
}

// Ejecución opcional de migraciones + seed manual al arrancar con --seed
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<WiraDbContext>();
    await db.Database.MigrateAsync();
    await DbInitializer.InitializeAsync(db);
    return;
}

// Configurar pipeline HTTP request
if (enableSwagger)
{
    app.MapOpenApi();

    // Habilitar Swagger UI
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Wira API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Usar CORS
app.UseCors("AllowReactApp");

// Usar autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapear controladores
app.MapControllers();

// Ruta raíz: redirige a Swagger si está habilitado, sino responde health
if (enableSwagger)
{
    app.MapGet("/", () => Results.Redirect("/swagger"));
}
else
{
    app.MapGet("/", () => Results.Ok(new { status = "ok", env = app.Environment.EnvironmentName }));
}

app.Run();

// Hacer la clase Program accesible para tests de integración
public partial class Program { }

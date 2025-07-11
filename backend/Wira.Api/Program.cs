using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Agregar Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar Entity Framework
builder.Services.AddDbContext<WiraDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar CORS para desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Agregar controladores
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
    
    // Habilitar Swagger UI
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Wira API v1");
        c.RoutePrefix = "swagger"; // Swagger estará en /swagger
    });
}

app.UseHttpsRedirection();

// Usar CORS
app.UseCors("AllowReactApp");

// Mapear controladores
app.MapControllers();

// Ruta raíz que redirecciona a Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

// Inicializar la base de datos con datos semilla
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<WiraDbContext>();
    await DbInitializer.InitializeAsync(context);
}

app.Run();

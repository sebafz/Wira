using System.ComponentModel.DataAnnotations;

namespace Wira.Api.DTOs
{
    public class RegistrarCalificacionPostLicitacionRequest
    {
        [Required]
        public int LicitacionID { get; set; }

        [Required]
        public int ProveedorID { get; set; }

        [Range(1, 5)]
        public int Puntualidad { get; set; }

        [Range(1, 5)]
        public int Calidad { get; set; }

        [Range(1, 5)]
        public int Comunicacion { get; set; }

        [MaxLength(2000)]
        public string? Comentarios { get; set; }
    }
}

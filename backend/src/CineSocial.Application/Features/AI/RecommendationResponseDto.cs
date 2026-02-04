using System.Text.Json.Serialization;

namespace CineSocial.Application.Features.AI;

public record RecommendedItemDto(
    [property: JsonPropertyName("tmdb_id")] int TmdbId,
    [property: JsonPropertyName("score")] double Score,
    [property: JsonPropertyName("debug_info")] string? DebugInfo
);

public record RecommendationResponseDto(
    [property: JsonPropertyName("source_movie")] int SourceMovie,
    [property: JsonPropertyName("recommendations")] List<RecommendedItemDto> Recommendations
);

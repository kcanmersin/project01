# Frontend Needs

The following backend features are missing or incomplete, preventing the full implementation of the Home and Movie Detail pages:

## 1. Genres Endpoint (CRITICAL)
- **Problem**: There is no API endpoint to retrieve a list of all movie genres (e.g., Action, Comedy, Drama).
- **Requirement**: A `GET /api/genres` (or similar) endpoint is needed to populate the sidebar filters and genre selection dropdowns.
- **Current State**: Search for `GenresController` or `GetGenres` returned no results.

## 2. Date-Based Filtering (CRITICAL for "Upcoming" & "Now Playing")
- **Problem**: `GetMoviesQuery` only supports `MinYear` and `MaxYear`. It does not support specific `MinDate` or `MaxDate`.
- **Requirement**: To accurately implement "Upcoming Movies" (Release Date > Today) or "Now Playing" (Release Date within last X weeks), we need precise date filters.
- **Current State**: `GetMoviesQuery.cs` only has sorting by `ReleaseDate` and year filtering.

## 3. Featured/Trending Logic (Suggested)
- **Problem**: Relying solely on `SortBy=Popularity` works, but a dedicated "Trending" endpoint (checking daily/weekly trends) is often better for a Home Page.
- **Requirement**: Review if `SortBy=Popularity` is sufficient or if a specific `IsTrending` flag or endpoint is desired.

## 4. Cast/Crew Images (Minor)
- **Problem**: `MovieDetailDto` has `Cast` and `Crew`, but verify if `ProfilePath` is a full URL or just a partial path requiring a base URL (likely partial, as is common with TMDB).
- **Requirement**: Frontend needs to know the base URL for images if not provided as full URLs.

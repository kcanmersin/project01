namespace CineSocial.Application.Common;

public class PagedResult<T>
{
    public List<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages { get; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedResult(List<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
    }

    public static PagedResult<T> Create(List<T> items, int totalCount, int pageNumber, int pageSize)
        => new(items, totalCount, pageNumber, pageSize);

    public static PagedResult<T> Empty(int pageNumber = 1, int pageSize = 10)
        => new(new List<T>(), 0, pageNumber, pageSize);
}

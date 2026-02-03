namespace CineSocial.Tests.Application.Common;

public class PagedResultTests
{
    [Fact]
    public void Create_ShouldCreatePagedResultWithCorrectProperties()
    {
        // Arrange
        var items = new List<string> { "item1", "item2", "item3" };
        var totalCount = 10;
        var pageNumber = 2;
        var pageSize = 3;

        // Act
        var result = PagedResult<string>.Create(items, totalCount, pageNumber, pageSize);

        // Assert
        result.Items.Should().HaveCount(3);
        result.Items.Should().BeEquivalentTo(items);
        result.TotalCount.Should().Be(10);
        result.PageNumber.Should().Be(2);
        result.PageSize.Should().Be(3);
        result.TotalPages.Should().Be(4); // Ceiling(10/3) = 4
    }

    [Fact]
    public void TotalPages_ShouldCalculateCorrectly_WhenItemsAreEvenlyDivisible()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 20, 1, 5);

        // Assert
        result.TotalPages.Should().Be(4);
    }

    [Fact]
    public void TotalPages_ShouldCalculateCorrectly_WhenItemsHaveRemainder()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 21, 1, 5);

        // Assert
        result.TotalPages.Should().Be(5); // Ceiling(21/5) = 5
    }

    [Fact]
    public void HasPreviousPage_ShouldBeTrue_WhenPageNumberIsGreaterThan1()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 10, 2, 5);

        // Assert
        result.HasPreviousPage.Should().BeTrue();
    }

    [Fact]
    public void HasPreviousPage_ShouldBeFalse_WhenPageNumberIs1()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 10, 1, 5);

        // Assert
        result.HasPreviousPage.Should().BeFalse();
    }

    [Fact]
    public void HasNextPage_ShouldBeTrue_WhenNotOnLastPage()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 10, 1, 5);

        // Assert
        result.HasNextPage.Should().BeTrue();
    }

    [Fact]
    public void HasNextPage_ShouldBeFalse_WhenOnLastPage()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 10, 2, 5);

        // Assert
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public void Empty_ShouldCreateEmptyPagedResult()
    {
        // Act
        var result = PagedResult<string>.Empty();

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public void Empty_ShouldUseCustomPageNumberAndSize_WhenProvided()
    {
        // Act
        var result = PagedResult<string>.Empty(pageNumber: 3, pageSize: 25);

        // Assert
        result.PageNumber.Should().Be(3);
        result.PageSize.Should().Be(25);
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public void TotalPages_ShouldBe0_WhenTotalCountIs0()
    {
        // Arrange & Act
        var result = PagedResult<int>.Create(new List<int>(), 0, 1, 10);

        // Assert
        result.TotalPages.Should().Be(0);
    }
}

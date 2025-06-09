import React from "react";

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
  const renderPagination = () => {
    const pageNumbers = new Set();
    const maxVisiblePages = 2;

    // Always include first and last page
    pageNumbers.add(1);
    pageNumbers.add(totalPages);

    // Add range around current page
    for (
      let i = currentPage - maxVisiblePages;
      i <= currentPage + maxVisiblePages;
      i++
    ) {
      if (i > 1 && i < totalPages) {
        pageNumbers.add(i);
      }
    }

    const sortedPages = [...pageNumbers].sort((a, b) => a - b);

    return (
      <div className="flex gap-2">
        {/* Previous Button */}
        <button
          onClick={() => {
            if (currentPage > 1) {
              handlePageChange(currentPage - 1);
            }
          }}
          disabled={currentPage <= 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-400 cursor-pointer"
          }`}
        >
          &lt;
        </button>

        {/* Page Numbers with ellipsis */}
        {sortedPages.map((page, index) => {
          const prevPage = sortedPages[index - 1];
          const isEllipsis = prevPage && page - prevPage > 1;

          return (
            <React.Fragment key={`fragment-${page}`}>
              {isEllipsis && (
                <span
                  key={`ellipsis-${page}`}
                  className="px-3 py-1 text-gray-500"
                >
                  ...
                </span>
              )}
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md cursor-pointer ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => {
            if (currentPage > 1) {
              handlePageChange(currentPage + 1);
            }
          }}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-400 cursor-pointer"
          }`}
        >
          &gt;
        </button>
      </div>
    );
  };

  return <div className="pagination-container">{renderPagination()}</div>;
};

export default Pagination;

"use client"

const Pagination = ({ meta, setPage }) => {
    const { currentPage, totalPages } = meta

    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return (
        <div className="flex justify-between items-center mt-4">
            <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
            </button>

            <div className="flex space-x-2">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                            page === currentPage
                                ? "bg-blue-800 text-white font-medium"
                                : "bg-white text-blue-800 border border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                Next
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}

export default Pagination

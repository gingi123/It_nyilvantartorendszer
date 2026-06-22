import { BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Button } from "reactstrap";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return { pages, start, end };
  };

  const { pages, start, end } = getPageNumbers();

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
      <Button
        data-testid="first-page-btn"
        className="btn btn-primary-custom"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        <BsChevronDoubleLeft />
      </Button>

      <Button
        data-testid="page-back-btn"
        className="btn btn-primary-custom"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <BsChevronLeft />
      </Button>

      {start > 1 && (
        <>
          <Button
            className="btn btn-primary-custom"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {start > 2 && <span>...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          color={page === currentPage ? "btn btn-primary-custom px-3 py-2" : "btn btn-secondary px-3 py-2"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span>...</span>}
          <Button
            className="btn btn-primary-custom"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        data-testid="page-forward-btn"
        className="btn btn-primary-custom"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <BsChevronRight />
      </Button>

      <Button
        data-testid="last-page-btn"
        className="btn btn-primary-custom"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        <BsChevronDoubleRight />
      </Button>
    </div>
  );
};

export default Pagination;
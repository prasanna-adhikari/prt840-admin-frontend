import ReactPaginate from "react-paginate";

const Pagination = ({
  pageCount,
  onPageChange,
  currentPage,
  marginPagesDisplayed = 2,
  pageRangeDisplayed = 3,
}) => {
  return (
    <ReactPaginate
      previousLabel={"← Previous"}
      nextLabel={"Next →"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={marginPagesDisplayed}
      pageRangeDisplayed={pageRangeDisplayed}
      onPageChange={onPageChange}
      containerClassName={"pagination flex"}
      pageClassName={"page-item mx-1"}
      pageLinkClassName={
        "page-link px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-blue-500 hover:text-white"
      }
      previousClassName={currentPage === 0 ? "hidden" : "page-item mx-1"}
      previousLinkClassName={
        "page-link px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-blue-500 hover:text-white"
      }
      nextClassName={currentPage + 1 >= pageCount ? "hidden" : "page-item mx-1"}
      nextLinkClassName={
        "page-link px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-blue-500 hover:text-white"
      }
      breakClassName={"page-item mx-1"}
      breakLinkClassName={
        "page-link px-3 py-2 rounded-md bg-white text-gray-700"
      }
      activeClassName={"active"}
      activeLinkClassName={
        "page-link px-3 py-2 rounded-md bg-blue-700 text-white"
      }
      forcePage={currentPage}
    />
  );
};

export default Pagination;

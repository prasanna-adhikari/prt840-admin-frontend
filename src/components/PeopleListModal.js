import React from "react";
import Modal from "react-modal";
import * as XLSX from "xlsx";

const PeopleListModal = ({ isVisible, onClose, title, peopleList }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      peopleList.map((person) => ({
        Name: person.name,
        Email: person.email,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "People");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  return (
    <Modal
      isOpen={isVisible}
      onRequestClose={onClose}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      shouldCloseOnOverlayClick={true}
    >
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-auto h-5/6 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        >
          &#10005;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center">{title}</h2>
        <button
          onClick={exportToExcel}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600"
        >
          Export to Excel
        </button>
        {peopleList.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>
              {title.includes("Interested")
                ? "No interested users."
                : "No users going."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {peopleList.map((person) => (
              <li
                key={person._id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100"
              >
                <div className="flex-shrink-0">
                  {person.profileImage ? (
                    <img
                      src={`http://localhost:7000/${person.profileImage
                        .replace("src\\", "")
                        .replace(/\\/g, "/")}`}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-white">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{person.name}</p>
                  <p className="text-gray-600 text-sm">{person.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default PeopleListModal;

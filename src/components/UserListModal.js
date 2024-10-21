import React from "react";
import Modal from "react-modal";

const UserListModal = ({ isVisible, onClose, title, users }) => {
  if (!isVisible) return null;

  return (
    <Modal
      isOpen={isVisible}
      onRequestClose={onClose}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-auto h-5/6 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
        >
          &#10005;
        </button>

        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {/* User List */}
        {users.length > 0 ? (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user._id} className="flex items-center space-x-3">
                <img
                  src={user.avatar || "https://via.placeholder.com/50"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span>{user.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </Modal>
  );
};

export default UserListModal;

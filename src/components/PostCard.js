import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import WarningModal from "./WarningModal";
import { BsDot } from "react-icons/bs";
import PeopleListModal from "./PeopleListModal";

const PostCard = ({ clubId, token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [peopleList, setPeopleList] = useState([]);
  const [peopleTitle, setPeopleTitle] = useState("");

  useEffect(() => {
    // Set app element for modal accessibility
    if (typeof window !== "undefined") {
      const nextAppElement = document.querySelector("#__next");
      if (nextAppElement) {
        Modal.setAppElement(nextAppElement);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}clubs/${clubId}/posts`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [clubId, token]);

  // Manage body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      setIsWarningVisible(false);
    } catch (err) {
      console.error("Error deleting post:", err.message);
    }
  };

  const openWarningModal = (postId) => {
    setPostToDelete(postId);
    setIsWarningVisible(true);
  };

  const closeWarningModal = () => {
    setIsWarningVisible(false);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      handleDeletePost(postToDelete);
    }
  };

  const openModal = (media) => {
    const formattedMedia = media.map((mediaItem) => ({
      original: `http://localhost:7000/${mediaItem
        .replace("src\\", "")
        .replace(/\\/g, "/")}`,
      thumbnail: `http://localhost:7000/${mediaItem
        .replace("src\\", "")
        .replace(/\\/g, "/")}`,
    }));
    setSelectedMedia(formattedMedia);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia([]);
    setIsModalOpen(false);
  };

  const openPeopleModal = (list, title) => {
    setPeopleList(list);
    setPeopleTitle(title);
    setIsPeopleModalOpen(true);
  };

  const closePeopleModal = () => {
    setIsPeopleModalOpen(false);
    setPeopleList([]);
  };

  const renderImageGrid = (media) => {
    const displayedImages = media.slice(0, 4);

    if (media.length === 1) {
      return (
        <div className="w-full h-96">
          <img
            src={`http://localhost:7000/${media[0]
              .replace("src\\", "")
              .replace(/\\/g, "/")}`}
            alt="Post media"
            className="object-cover w-full h-full cursor-pointer rounded-md"
            onClick={() => openModal(media)}
          />
        </div>
      );
    }

    if (media.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {media.map((mediaItem, index) => (
            <div key={index} className="w-full h-96">
              <img
                src={`http://localhost:7000/${mediaItem
                  .replace("src\\", "")
                  .replace(/\\/g, "/")}`}
                alt="Post media"
                className="object-cover w-full h-full cursor-pointer rounded-md"
                onClick={() => openModal(media)}
              />
            </div>
          ))}
        </div>
      );
    }

    // Add conditions for 3, 4, and more than 4 images as needed.
    // Only 1-4 image renderers are shown for brevity.

    if (media.length > 4) {
      return (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="col-span-2 w-full h-96">
            <img
              src={`http://localhost:7000/${media[0]
                .replace("src\\", "")
                .replace(/\\/g, "/")}`}
              alt="Post media"
              className="object-cover w-full h-full cursor-pointer rounded-md"
              onClick={() => openModal(media)}
            />
          </div>
          <div className="grid grid-rows-3 gap-2 h-96">
            {displayedImages.slice(1, 4).map((mediaItem, index) => (
              <div key={index} className="w-full h-full relative">
                <img
                  src={`http://localhost:7000/${mediaItem
                    .replace("src\\", "")
                    .replace(/\\/g, "/")}`}
                  alt="Post media"
                  className="object-cover w-full h-full cursor-pointer rounded-md"
                  onClick={() => openModal(media)}
                />
                {index === 2 && media.length > 4 && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 text-white flex items-center justify-center rounded-md cursor-pointer"
                    onClick={() => openModal(media)}
                  >
                    +{media.length - 4} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const toggleExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const renderContent = (content, isExpanded, postId) => {
    const paragraphs = content.split("\n");

    return (
      <div className="text-gray-700 mb-4">
        {isExpanded
          ? paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
          : paragraphs.slice(0, 1).map((para, idx) => (
              <p key={idx} className="line-clamp-2">
                {para}
              </p>
            ))}
        {content.length > 150 && (
          <button
            className="text-gray-500"
            onClick={() => toggleExpand(postId)}
          >
            {isExpanded ? "show less" : "show more"}
          </button>
        )}
      </div>
    );
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-10">
      <div className="mt-6 space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white shadow-lg p-6 rounded-lg mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-3">
                <img
                  src={`http://localhost:7000/${post.clubId.clubImage
                    .replace("src\\", "")
                    .replace(/\\/g, "/")}`}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-md font-semibold text-gray-800">
                    {post.clubId.name}
                  </h3>
                  <div className="flex items-center text-xs">
                    {post.isEvent ? (
                      <>
                        <span>{post.eventDetails.eventName}</span>
                        <BsDot className="mx-1" color="gray-500" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => openWarningModal(post._id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {renderContent(post.content, expandedPost === post._id, post._id)}
            {post.media.length > 0 && renderImageGrid(post.media)}

            {post.isEvent && (
              <div className="mt-4">
                <p className="text-gray-600">
                  Event Date:{" "}
                  {new Date(post.eventDetails.eventDate).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Location: {post.eventDetails.location}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <span className="text-gray-600">
                  👍 {post.likes.length} Likes
                </span>
                <span className="text-gray-600">
                  🔄 {post.shares.length} Shares
                </span>
                <span className="text-gray-600">
                  💬 {post.comments.length} Comments
                </span>
              </div>

              {post.isEvent && (
                <div>
                  <span
                    className="text-gray-600 cursor-pointer"
                    onClick={() =>
                      openPeopleModal(
                        post.eventDetails.interested,
                        "Interested Users"
                      )
                    }
                  >
                    👍 {post.eventDetails.interested.length} Interested
                  </span>
                  <span
                    className="ml-4 text-gray-600 cursor-pointer"
                    onClick={() =>
                      openPeopleModal(post.eventDetails.going, "Going Users")
                    }
                  >
                    🎉 {post.eventDetails.going.length} Going
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-gray-500 text-center">
          <p>No posts or events found for this club.</p>
        </div>
      )}

      <WarningModal
        isVisible={isWarningVisible}
        onClose={closeWarningModal}
        onConfirm={confirmDelete}
      />
      <PeopleListModal
        isVisible={isPeopleModalOpen}
        onClose={closePeopleModal}
        title={peopleTitle}
        peopleList={peopleList}
      />

      {selectedMedia.length > 0 && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
          shouldCloseOnOverlayClick={true}
        >
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-auto h-5/6 overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
            >
              &#10005;
            </button>
            <ImageGallery
              items={selectedMedia}
              showThumbnails={true}
              showFullscreenButton={true}
              showPlayButton={false}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PostCard;

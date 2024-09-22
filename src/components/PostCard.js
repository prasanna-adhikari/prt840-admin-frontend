import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import WarningModal from "./WarningModal";
import { BsDot } from "react-icons/bs";
const PostCard = ({ clubId, token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  useEffect(() => {
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
        console.log(response);

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
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable scroll on the background
    } else {
      document.body.style.overflow = "auto"; // Re-enable scroll
    }

    // Cleanup when the component unmounts
    return () => {
      document.body.style.overflow = "auto"; // Reset overflow
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

      // Remove the deleted post from the list
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      setIsWarningVisible(false);
    } catch (err) {
      console.error("Error deleting post:", err.message);
    }
  };

  const openWarningModal = (postId) => {
    console.log("Wat");
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

  const renderImageGrid = (media) => {
    const displayedImages = media.slice(0, 4); // Show only up to 4 images

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

    if (media.length === 3) {
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
          <div className="grid grid-rows-2 gap-2 h-96">
            {media.slice(1, 3).map((mediaItem, index) => (
              <div key={index} className="w-full h-full">
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
        </div>
      );
    }

    if (media.length === 4) {
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
            {media.slice(1, 4).map((mediaItem, index) => (
              <div key={index} className="w-full h-full">
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
        </div>
      );
    }

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

  const postCount = posts.length;
  const eventCount = posts.filter((post) => post.isEvent).length;
  console.log(posts);

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-semibold text-gray-800">
        Posts ({postCount})
      </h2>
      {eventCount > 0 && (
        <h3 className="text-lg text-gray-600 mt-2">Events ({eventCount})</h3>
      )}

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
                    {/* {post.isEvent ? post.eventDetails.eventName : "User Name"} */}
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
                  <p className="text-xs text-gray-500"></p>
                </div>
              </div>
              <button
                onClick={() => openWarningModal(post._id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Post Content */}
            {renderContent(post.content, expandedPost === post._id, post._id)}

            {/* Display Media Grid if Available */}
            {post.media.length > 0 && renderImageGrid(post.media)}

            {/* Event Details */}
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

            {/* Likes, Shares, and Comments Section */}
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
                  <span className="text-gray-600">
                    👍 {post.eventDetails.interested.length} Interested
                  </span>
                  <span className="ml-4 text-gray-600">
                    🎉 {post.eventDetails.going.length} Going
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {postCount === 0 && (
        <div className="text-gray-500 text-center">
          <p>No posts or events found for this club.</p>
        </div>
      )}
      <WarningModal
        isVisible={isWarningVisible}
        onClose={closeWarningModal}
        onConfirm={confirmDelete}
      />
      {/* Modal for Viewing Full-Size Media */}
      {selectedMedia.length > 0 && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
          shouldCloseOnOverlayClick={true}
        >
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-auto h-5/6 overflow-y-auto">
            {/* Close (X) Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
            >
              &#10005;
            </button>

            {/* Image Gallery */}
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

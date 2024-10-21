import React from "react";
import Modal from "./Modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const ImageGalleryModal = ({ isVisible, onClose, mediaItems }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <ImageGallery
        items={mediaItems}
        showThumbnails={true}
        showFullscreenButton={true}
        showPlayButton={false}
      />
    </Modal>
  );
};

export default ImageGalleryModal;

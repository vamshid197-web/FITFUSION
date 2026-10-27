import React from 'react';
import PhotoUploadExperience from './PhotoUploadExperience.jsx';

/**
 * CameraExperience (Deprecated: Camera access removed in favor of Kolors AI Photo Try-On)
 * Automatically delegates to PhotoUploadExperience with zero camera access or getUserMedia requests.
 */
export default function CameraExperience({
  onPhotoConfirmed,
  onPhotoUploaded
}) {
  return (
    <PhotoUploadExperience
      onPhotoConfirmed={onPhotoConfirmed}
      onPhotoUploaded={onPhotoUploaded}
    />
  );
}

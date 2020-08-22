import React from 'react';
import PropTypes from 'prop-types';

/**
 * Selects a photo to upload from the user's computer
 * @param {Function} changeHandler function that changes the file
 * @param {File} file the file that is being uploaded
 */
const PhotoUpload = ({ changeHandler, file }) => (
  <div>
    <input onChange={changeHandler} type="file" accept=".jpg, .png, .jpeg" />
    {!file ? 'Select an Image' : <img src={file.url} alt="upload" />}
  </div>
);

export default PhotoUpload;

PhotoUpload.propTypes = {
  changeHandler: PropTypes.func.isRequired,
  file: PropTypes.array,
};

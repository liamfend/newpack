import React, { useCallback } from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';

export default function File({ selectedFile, setSelectedFile }) {
  const handleClickDeleteFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="file-wrap">
      <div className="file-wrap__file">
        <span className="file-wrap__file-icon-wrap">
          <Icon type="file-excel" className="file-wrap__file-icon" />
        </span>
        <span className="file-wrap__file-info">
          <span className="file-wrap__file-name">
            { selectedFile.name }
          </span>
          <button
            type="button"
            className="file-wrap__delete-btn"
            onClick={ handleClickDeleteFile }
          >
            <Icon type="delete" className="file-wrap__delete-icon" />
          </button>
        </span>
      </div>
    </div>
  );
}

File.propTypes = {
  selectedFile: PropTypes.object,
  setSelectedFile: PropTypes.func.isRequired,
};

File.defaultProps = {
  selectedFile: {},
  setSelectedFile: () => {},
};

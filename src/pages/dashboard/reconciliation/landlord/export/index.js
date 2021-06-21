import React from 'react';
import { Icon } from 'antd';
import useExport from './use-export';

/* eslint-disable   */ 
const Export = React.memo(({ getApiParams, filters, landlordId, getlist }) => {
  const { handleExportVisible } = useExport({ getApiParams, filters, landlordId, getlist });

  return ( 
    <Icon
      type="export"
      className="icons"
      onClick={ handleExportVisible }
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.filters === nextProps.filters &&
    prevProps.landlordId === nextProps.landlordId;
});

export default Export;


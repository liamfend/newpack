import React, { useRef } from 'react';
import { Upload, Icon, message } from 'antd';
import usePageInfo from '~pages/dashboard/reconciliation/booking-details/pageInfo';
import endpoints from '~settings/endpoints';
import cookies from 'js-cookie';

/* eslint-disable   */
export default function FileUpload(props) {
  
  const MAXFILESCOUNT = 20;
  const session = cookies.get('CMSACCESSSESSION');
  const filesCounter = useRef(0)
  const  pageInfo = usePageInfo() 

  const fileProps = {
    name: 'document',
    accept:'image/*',
    multiple: true,
    headers: {
      Authorization: `Bearer ${session}`,
    },
    action: `${endpoints.updatePendingNoteFile.url()}`,
    beforeUpload: (file, fileList) =>
      new Promise((resolve) => {
        const isImages =
          file.type === 'image/jpeg' ||
          file.type === 'image/png' ||
          file.type === 'image/jpg';
        if (!isImages) {
          message.error(pageInfo.filesUpload.fileTpe);
          return false
        }
        const isLt15M = file.size / 1024 / 1024 < 15;
        if (!isLt15M) {
          message.error(pageInfo.filesUpload.limit);
          return false
        }
        if (isImages && isLt15M) {
           
          if ( filesCounter.current  < MAXFILESCOUNT  ) {
            filesCounter.current++
            resolve(file);
          }
        }
      }), 

    onChange(info) {
      const { status } = info.file;
      if (status === 'done') { 
        props.doneFile&&props.doneFile(info.fileList)
      } else if (status === 'error') { 
      } else if (status === 'removed') {
        props.doneFile&&props.doneFile(info.fileList.filter(f => f.uid !== info.file.uid))
        filesCounter.current.value-- ;
      }
    },
  };

  return (
        <Upload.Dragger
          {...fileProps}
        >
          <div className="reconciliation-bkdetails__files" >
            <div className="files-uploadbox">
              <Icon type="plus" className="files-icons-add" />
              <div className="files-box-desc">
                <div>{pageInfo.modal.uploadLabel}</div>
                <div>{pageInfo.modal.uploadLimit}</div>
              </div>
            </div>
          </div>
        </Upload.Dragger>
     
  );
}

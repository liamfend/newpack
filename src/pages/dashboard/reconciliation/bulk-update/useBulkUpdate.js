import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { get, toString } from 'lodash';
import { message } from 'antd';
import i18next from 'i18next';
import { bulkUpdateOppLandlordBookingsErrors as errorCodes } from '~constants/errors';
import { GRAPH_URL } from '~settings/endpoints';
import * as queries from '~actions/reconciliation/queries';
import { getHeader } from '~helpers';

const useBulkUpdate = ({ selectedFile }) => {
  const {
    INVALID_EXCEL_HEADER,
    BEYOND_QUANTITY_LIMIT,
    REPEAT_REFERENCE_ID,
    BELOW_QUANTITY_LIMIT,
  } = errorCodes;
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClickConfirmUpload = useCallback(() => {
    // The operation contains the mutation itself as "query"
    // and the variables that are associated with the arguments
    // The file variable is null because we can only pass text
    // in operation variables
    const operation = {
      query: queries.bulkUpdateOppLandlordBookingStatusByExcel,
      variables: {
        input: {
          file: null,
        },
      },
    };
    // This map is used to associate the file saved in the body
    // of the request under "0" with the operation variable "variables.input.file"
    const map = {
      0: ['variables.input.file'],
    };

    // This is the body of the request
    // the FormData constructor builds a multipart/form-data request body
    // Here we add the operation, map, and file to upload
    const body = new FormData();
    body.append('operations', JSON.stringify(operation));
    body.append('map', JSON.stringify(map));
    body.append(0, selectedFile);

    setIsLoading(true);
    axios.post(GRAPH_URL, body, { headers: getHeader() })
      .then((res) => {
        setIsLoading(false);

        if (get(res, ['data', 'errors'])) {
          const errorMessage = JSON.parse(get(res, ['data', 'errors', 0, 'message']));
          const errorCode = get(errorMessage, 'error');
          const errorDescription = get(errorMessage, 'description');

          if (errorCode === INVALID_EXCEL_HEADER) {
            message.error(i18next.t('cms.reconciliation.booking.bulk_update_modal.invalid_excel_header.error'));
          } else if (errorCode === BEYOND_QUANTITY_LIMIT) {
            message.error(i18next.t('cms.reconciliation.booking.bulk_update_modal.beyond_quantity_limit.error'));
          } else if (errorCode === REPEAT_REFERENCE_ID) {
            message.error(
              <React.Fragment>
                <span>{ i18next.t('cms.reconciliation.booking.bulk_update_modal.repeat_reference_id.error') }</span>
                <div>{ toString(errorDescription) }</div>
              </React.Fragment>, 5,
            );
          } else if (errorCode === BELOW_QUANTITY_LIMIT) {
            message.error(i18next.t('cms.reconciliation.booking.bulk_update_modal.below_quantity_limit.error'));
          } else {
            message.error(i18next.t('cms.reconciliation.booking.bulk_update_modal.upload.error'));
          }
        } else {
          setIsUploadSuccess(true);
        }
      }).catch((err) => {
        console.log('upload excel err:', err);
        setIsLoading(false);
        message.error(i18next.t('cms.reconciliation.booking.bulk_update_modal.upload.error'));
      });
  }, [selectedFile]);

  return {
    handleClickConfirmUpload,
    isLoading,
    isUploadSuccess,
  };
};

export default useBulkUpdate;

import React from 'react';
import PropTypes from 'prop-types';
import {
  ContractEmptyLandlord as ContractEmptyLandlordIcon,
  ContractRecordLandlord as ContractRecordLandlordIcon,
} from "~components/svgs";
import ContractFileList from '~components/contract-file-list';

export default class RecordLandlord extends React.PureComponent {
  render() {
    const { t, fileArray } = this.props;
    return (
      <div className="record-landlord">
        <Choose>
          <When condition={ fileArray.length === 0 }>
            <ContractEmptyLandlordIcon className="record-landlord__empty-icon" />
            <div className="record-landlord__empty-header">
              { t('cms.property.record_landlord.empty.header') }
            </div>
            <div className="record-landlord__empty-description">
              { t('cms.property.record_landlord.empty.description') }
            </div>
          </When>
          <Otherwise>
            <ContractRecordLandlordIcon className="record-landlord__uploaded-icon" />
            <div className="record-landlord__uploaded-header">
              { t('cms.property.record_landlord.uploaded.header') }
            </div>
            <div className="record-landlord__uploaded-description">
              { t('cms.property.record_landlord.uploaded.description') }
            </div>

            <div className="record-landlord__files-wrap">
              <h3 className="record-landlord__files-title">
                {t('cms.property.record.update_contract.file_title')}
              </h3>
              <ContractFileList files={ fileArray } />
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

RecordLandlord.propTypes = {
  t: PropTypes.func.isRequired,
  fileArray: PropTypes.array.isRequired,
};

RecordLandlord.defaultProps = {
  t: () => {},
  fileArray: [],
};

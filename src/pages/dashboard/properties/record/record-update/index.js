import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { PropertyContract as PropertyContractIcon } from "~components/svgs";
import ContractFileList from '~components/contract-file-list';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

export default class RecordUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { t, property } = this.props;
    return (
      <div className="record-update">
        <div className="record-change">
          <PropertyContractIcon className="record-update__header-icon" />
          <div className="record-update__text-box">
            <div className="record-update__stage-action">
              <div className="record-update__stage-text">
                {t('cms.property.record.contract_stage.text')}:&nbsp;
                <span>{property.contractStage ? t(`cms.property.record.form_modal.stage.${property.contractStage.toLowerCase()}`) : ''}</span>
              </div>
              <If condition={ showElementByAuth(
                platformEntity.PROPERTIES_PROPERTIES,
                entityAction.UPDATE,
              ) }
              >
                <Button
                  className="record-update__update-btn"
                  type="primary"
                  onClick={ () => this.props.openModal('add') }
                >
                  {t('cms.property.record.update_contract.btn')}
                </Button>
              </If>
            </div>
            <div className="record-update__tips">
              {t('cms.property.record.update_contract.tips')}
            </div>
          </div>
          <If condition={ this.props.fileArray.length > 0 && property.contractStage === 'DUALLY_SIGNED' }>
            <div className="record-update__file">
              <h3 className="record-update__file--title">
                {t('cms.property.record.update_contract.file_title')}
              </h3>
              <ContractFileList files={ this.props.fileArray } />
            </div>
          </If>
        </div>
      </div>
    );
  }
}

RecordUpdate.propTypes = {
  openModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  fileArray: PropTypes.array.isRequired,
};

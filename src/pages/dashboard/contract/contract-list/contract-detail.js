import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Icon, Popconfirm } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { handlePropertyGroup, getPropertyOrder } from '~helpers/property-edit';
import ContractFileList from '~components/contract-file-list';
import showElementByAuth from '~helpers/auth';
import { showEffectiveToDate, calContractStatus } from '~helpers/contract';
import { platformEntity, entityAction, contractStatus } from '~constants';

class ContractDetail extends React.Component {
  render() {
    const { contract, t } = this.props;
    const status = calContractStatus(contract.effectiveFrom, contract.effectiveTo);

    return (
      <div className="contract-detail">
        <span className={ classNames('contract-detail__status', {
          'contract-detail__status--active': status === contractStatus.ACTIVE,
          'contract-detail__status--inactive': status === contractStatus.INACTIVE,
          'contract-detail__status--expired': status === contractStatus.EXPIRED }) }
        >
          { t(`cms.contract.status.${status.toLowerCase()}`) }
        </span>
        <div className="contract-detail__header-container">
          <p className="contract-detail__title">{ t('cms.contract.detail.title.contract_details') }</p>
        </div>
        <div className="contract-detail__content-container">
          <div className="contract-detail__block">
            <p className="contract-detail__block-title">{ t('cms.contract.detail.block_title.contract_info') }</p>
            <Row className="contract-detail__info-row">
              <Col span={ 7 } className="contract-detail__info-label">{ t('cms.contract.detail.info_label.landlord_name') }</Col>
              <Col span={ 17 } className="contract-detail__info-content">{ contract.landlord ? contract.landlord.name : '' }</Col>
            </Row>
            <Row className="contract-detail__info-row">
              <Col span={ 7 } className="contract-detail__info-label">{ t('cms.contract.detail.info_label.signed_date') }</Col>
              <Col span={ 17 } className="contract-detail__info-content">{ moment(contract.signedDate).format('DD/MM/YYYY') }</Col>
            </Row>
            <Row className="contract-detail__info-row">
              <Col span={ 7 } className="contract-detail__info-label">{ t('cms.contract.detail.info_label.effective_date') }</Col>
              <Col span={ 17 } className="contract-detail__info-content">
                { `${moment(contract.effectiveFrom).format('DD/MM/YYYY')} ~ ${showEffectiveToDate(contract.effectiveTo)}` }
              </Col>
            </Row>
          </div>

          <div className="contract-detail__block">
            <p className="contract-detail__block-title">{ t('cms.contract.detail.block_title.upload_contract') }</p>
            <div className="contract-detail__contract-list">
              <ContractFileList files={ contract.files } />
            </div>
          </div>

          <div className="contract-detail__block">
            <p className="contract-detail__block-title">{ t('cms.contract.detail.block_title.property_name') }</p>
            <div className="contract-detail__property-list">
              <For each="propertyGroup" index="groupKey" of={ handlePropertyGroup(contract.properties) }>
                <Row key={ groupKey } className="contract-detail__property-list-row">
                  <For each="property" index="key" of={ propertyGroup }>
                    <Col span={ 12 } key={ key }>
                      <div className="contract-detail__property-name">
                        <span className="contract-detail__property-count">
                          { `${getPropertyOrder(groupKey, key)}.` }
                        </span>
                        { `${property.name}` }
                      </div>
                    </Col>
                  </For>
                </Row>
              </For>

            </div>
          </div>

        </div>
        <div className="contract-detail__footer-container" >
          <If condition={ showElementByAuth(
            platformEntity.PROPERTIES_CONTRACTS,
            entityAction.UPDATE,
          ) }
          >
            <button
              type="button"
              className="contract-detail__btn contract-detail__btn--edit"
              onClick={ () => this.props.handleEditContract(this.props.contract) }
            >
              <Icon type="edit" className="contract-detail__btn-icon" />
              { t('cms.contract.detail.btn.edit') }
            </button>
          </If>

          <If condition={ showElementByAuth(
            platformEntity.PROPERTIES_CONTRACTS,
            entityAction.DELETE,
          ) }
          >
            <span className="contract-detail__divider">|</span>
            <Popconfirm
              title={ t('cms.contract.detail.message.delete') }
              onConfirm={ () => this.props.handleDeleteContract(this.props.contract) }
              getPopupContainer={ () => this.deleteBtn }
              overlayStyle={ { width: '300px' } }
              placement="topRight"
            >
              <button
                ref={ (node) => { this.deleteBtn = node; } }
                type="button"
                className="contract-detail__btn contract-detail__btn--delete"
              >
                <Icon type="delete" className="contract-detail__btn-icon" />
                { t('cms.contract.detail.btn.delete') }
              </button>
            </Popconfirm>
          </If>
        </div>
      </div>
    );
  }
}

ContractDetail.propTypes = {
  t: PropTypes.func,
  contract: PropTypes.object.isRequired,
  handleEditContract: PropTypes.func.isRequired,
  handleDeleteContract: PropTypes.func.isRequired,
};

ContractDetail.defaultProps = {
  t: () => {},
};

export default ContractDetail;

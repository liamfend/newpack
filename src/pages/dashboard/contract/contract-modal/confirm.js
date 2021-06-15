import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Col, Row, Tooltip, Popconfirm } from 'antd';
import moment from 'moment';
import { handlePropertyGroup, getPropertyOrder } from '~helpers/property-edit';
import { showEffectiveToDate, calContractStatus } from '~helpers/contract';
import { ContractPdf as ContractPdfIcon } from "~components/svgs";

export default class Confirm extends React.Component {
  constructor() {
    super();

    this.pdfFiles = [];
  }

  render() {
    const { contract, t } = this.props;
    const status = calContractStatus(contract.effectiveFrom, contract.effectiveTo);
    const validateProperties = contract.properties ?
      contract.properties.filter(property => property.node.commissionTierCount !== 0) :
      [];
    const invalidateProperties = contract.properties ?
      contract.properties.filter(property => property.node.commissionTierCount === 0) :
      [];

    return (
      <div className="contract-confirm-container">
        <div className="contract-confirm-container__header-container">
          <p className="contract-confirm-container__title">{ t('cms.contract.confirm.title.confirm_to_properties') }</p>
          <Popconfirm
            trigger="click"
            visible={ this.props.showPopConfirm }
            title={ this.props.t('cms.property.commission_form_modal.close.tips.title') }
            placement="left"
            onConfirm={ () => { this.props.handleContractModal(false); } }
            onCancel={ this.props.closePopModal }
            okText={ this.props.t('cms.properties.edit.btn.yes') }
            cancelText={ this.props.t('cms.properties.edit.btn.no') }
          >
            <button type="button" onClick={ this.props.closeContractModal } className="contract-modal-container__btn">
              <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
            </button>
          </Popconfirm>
        </div>
        <div className="contract-confirm-container__content-container">
          <div className="contract-confirm-container__block">
            <p className="contract-confirm-container__block-title">{ t('cms.contract.confirm.block_title.contract_information') }</p>
            <table className="contract-confirm-container__container">
              <tbody>
                <tr className="contract-confirm-container__row">
                  <td className="contract-confirm-container__col contract-confirm-container__label">{ t('cms.contract.confirm.label.landlord_name') }</td>
                  <td className="contract-confirm-container__col contract-confirm-container__content">{ contract.landlord ? contract.landlord.name : '' }</td>
                  <td className="contract-confirm-container__col contract-confirm-container__label">{ t('cms.contract.confirm.label.contract_status') }</td>
                  <td className="contract-confirm-container__col contract-confirm-container__content">{ t(`cms.contract.status.${status.toLowerCase()}`) }</td>
                </tr>
                <tr className="contract-confirm-container__row">
                  <td className="contract-confirm-container__col contract-confirm-container__label" >{ t('cms.contract.confirm.label.contract_signed_date') }</td>
                  <td className="contract-confirm-container__col contract-confirm-container__content" >{ moment(contract.signedDate).format('DD/MM/YYYY') }</td>
                  <td className="contract-confirm-container__col contract-confirm-container__label">{ t('cms.contract.confirm.label.contract_effective_date') }</td>
                  <td className="contract-confirm-container__col contract-confirm-container__content">{
                    `${moment(contract.effectiveFrom).format('DD/MM/YYYY')} ~ ${showEffectiveToDate(contract.effectiveTo)}`
                  }</td>
                </tr>
                <tr className="contract-confirm-container__row">
                  <td className="contract-confirm-container__label">{ t('cms.contract.confirm.label.contract') }</td>
                  <td colSpan={ 3 } className="contract-confirm-container__col contract-confirm-container__content--img">
                    <If condition={ contract.files }>
                      <For each="file" index="index" of={ contract.files } >
                        <Choose>
                          <When condition={ file.contentType === 'application/pdf' || file.content_type === 'application/pdf' }>
                            <Tooltip
                              getPopupContainer={ () => this.pdfFiles[index] }
                              title={ file.name }
                              key={ index }
                            >
                              <div
                                className="contract-confirm-container__file"
                                ref={ (node) => { this.pdfFiles[index] = node; } }
                              >
                                <ContractPdfIcon className="contract-confirm-container__file-pdf" />
                              </div>
                            </Tooltip>
                          </When>
                          <Otherwise>
                            <img key={ index } className="contract-confirm-container__img" src={ file.url } alt={ file.name } />
                          </Otherwise>
                        </Choose>
                      </For>
                    </If>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="contract-confirm-container__block">
            <p className="contract-confirm-container__block-title">{ t('cms.contract.confirm.block_title.property_information') }</p>
            <div className="contract-confirm-container__properties-container">
              <If condition={ !this.props.editContract || this.props.checked }>
                <p className="contract-confirm-container__notice">
                  <Icon type="exclamation-circle" theme="filled" className="contract-confirm-container__icon" />
                  <span>
                    { t('cms.contract.confirm.notice.part_1') }
                    <b>{ t('cms.contract.confirm.notice.part_2') }</b>
                    { t('cms.contract.confirm.notice.part_3') }
                  </span>
                </p>
              </If>
              <For
                each="propertyGroup"
                index="groupKey"
                of={ handlePropertyGroup(this.props.checked ?
                  validateProperties : contract.properties,
                ) }
              >
                <Row key={ groupKey } className="contract-confirm-container__property-list-row">
                  <For each="property" index="key" of={ propertyGroup }>
                    <Col span={ 12 } key={ key }>
                      <div className="contract-confirm-container__property-name">
                        <span className="contract-confirm-container__property-count">
                          { `${getPropertyOrder(groupKey, key)}.` }
                        </span>
                        { `${property && property.node ? property.node.name : ''}` }
                      </div>
                    </Col>
                  </For>
                </Row>
              </For>
            </div>
            <If condition={
              (!this.props.editContract || this.props.checked) &&
              invalidateProperties.length > 0 }
            >
              <div className="contract-confirm-container__invalidate-properties-container">
                <p className="contract-confirm-container__invalidate-notice">
                  <Icon type="exclamation-circle" theme="filled" className="contract-confirm-container__icon" />
                  <span>
                    { t('cms.contract.confirm.invalidate_notice.part_1') }
                  </span>
                </p>
                <For
                  each="propertyGroup"
                  index="groupKey"
                  of={ handlePropertyGroup(invalidateProperties) }
                >
                  <Row key={ groupKey } className="contract-confirm-container__property-list-row">
                    <For each="property" index="key" of={ propertyGroup }>
                      <Col span={ 12 } key={ key }>
                        <div className="contract-confirm-container__property-name">
                          <span className="contract-confirm-container__property-count">
                            { `${getPropertyOrder(groupKey, key)}.` }
                          </span>
                          { `${property && property.node ? property.node.name : ''}` }
                        </div>
                      </Col>
                    </For>
                  </Row>
                </For>
              </div>
            </If>
          </div>
        </div>
        <div className="contract-confirm-container__footer-container">
          <button
            type="button"
            onClick={ this.props.handleClickBack }
            className="contract-confirm-container__btn contract-confirm-container__btn--back"
          >
            { t('cms.contract.confirm.btn.back')}
          </button>
          <button
            type="button"
            onClick={ this.props.handleClickConfirm }
            className="contract-confirm-container__btn contract-confirm-container__btn--confirm"
          >
            { t('cms.contract.confirm.btn.confirm')}
          </button>
        </div>
      </div>
    );
  }
}

Confirm.propTypes = {
  contract: PropTypes.object,
  t: PropTypes.func,
  handleClickBack: PropTypes.func,
  handleClickConfirm: PropTypes.func,
  editContract: PropTypes.object,
  checked: PropTypes.bool.isRequired,
  showPopConfirm: PropTypes.bool.isRequired,
  handleContractModal: PropTypes.func.isRequired,
  closePopModal: PropTypes.func.isRequired,
  closeContractModal: PropTypes.func.isRequired,
};

Confirm.defaultProps = {
  contract: {},
  t: () => {},
  editContract: {},
  handleClickBack: () => {},
  handleModalClose: () => {},
  handleClickConfirm: () => {},
};

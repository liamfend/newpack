import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Row, Col, Modal, Divider } from 'antd';
import LandlordModal from '~pages/dashboard/landlord/modal';
import { platformEntity, entityAction } from '~constants';
import { viewLandlordAccountOwnerRoleArr } from '~constants/landlord';
import showElementByAuth from '~helpers/auth';

export default class LandlordDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      isShowModal: false,
      groupAutoConfirmProperties: [],
      autoConfirmPropertiesModal: {},
    };
  }

  componentDidMount() {
    const { landlord } = this.props;
    this.handleGroupAutoConfirmProperties(landlord.properties);
  }

  handleClickEdit = () => {
    this.setState({
      isShowModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isShowModal: false,
    });
  };

  handleGroupAutoConfirmProperties = (properties) => {
    let autoConfirmProperties = [];

    if (properties && properties.edges && properties.edges.length > 0) {
      properties.edges.map((property) => {
        if (
          property && property.node
          && property.node.autoConfirmSettings
          && property.node.autoConfirmSettings.bookingAutoConfirm
        ) {
          const countdownDays = property.node.autoConfirmSettings.countdownDays;

          const countdownDaysData =
          autoConfirmProperties.find(item => item.countdownDays === countdownDays);

          autoConfirmProperties =
          autoConfirmProperties.filter(item => item.countdownDays !== countdownDays);

          if (!autoConfirmProperties.find(item => item.countdownDays === countdownDays)) {
            this.state.autoConfirmPropertiesModal[countdownDays] = false;
          }

          autoConfirmProperties.push({
            countdownDays: property.node.autoConfirmSettings.countdownDays,
            propertyIds: countdownDaysData && countdownDaysData.propertyIds ?
              [property.node].concat(countdownDaysData.propertyIds) : [property.node],
          });
        }

        return true;
      });
    }

    this.setState({
      groupAutoConfirmProperties: autoConfirmProperties,
    });
  }

  handleAutoConfirmPropertiesModal = (countdownDays, trigger) => {
    if (typeof this.state.autoConfirmPropertiesModal[countdownDays] !== 'undefined') {
      this.state.autoConfirmPropertiesModal[countdownDays] = trigger;
      this.setState(this.state);
    }
  }

  getProperties = (count) => {
    const { landlord } = this.props;
    const selectCountProperties = [];

    if (landlord.properties && landlord.properties.edges
      && landlord.properties.edges.length > 0) {
      landlord.properties.edges.map((property) => {
        if (
          property && property.node &&
          property.node.autoConfirmSettings &&
          property.node.autoConfirmSettings.countdownDays === count
        ) {
          selectCountProperties.push(property.node);
        }

        return true;
      });
    }

    return selectCountProperties;
  }

  landlordNameField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.landlord_name.label')}: </label>
      { this.props.landlord.name || '-' }
    </Col>
  );

  accountOwnerField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.account_owner.label')}: </label>
      { this.props.landlord.accountManager || '-' }
    </Col>
  )

  billingCityField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.billing_city.label')}: </label>
      { this.props.landlord.billingCity || '-' }
    </Col>
  )

  billingAddressField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.billing_address.label')}: </label>
      { this.props.landlord.billingAddress || '-' }
    </Col>
  )

  billingCountryField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.billing_country.label')}: </label>
      { this.props.landlord.billingCountry || '-' }
    </Col>
  )

  billingPostalCodeField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.billing_zip_code.label')}: </label>
      { this.props.landlord.billingPostalCode || '-' }
    </Col>
  )

  longtailField = () => (
    <Col span={ 12 } className="landlord-detail__field">
      <label>{this.props.t('cms.landlord.detail.longtail.label')}: </label>
      { this.props.landlord.isLongtail ? 'True' : 'False' }
    </Col>
  )

  render() {
    const { t, landlord, updateLandlordStatus, landlordNameList, currentRoleSlug } = this.props;
    return (
      <div className="landlord-detail">
        <div className="landlord-detail__content-wrap">
          <section className="landlord-detail__section">
            <p className="landlord-detail__title">{ t('cms.landlord.detail.basic_info.title') }</p>
            <Choose>
              <When
                condition={ viewLandlordAccountOwnerRoleArr.includes(currentRoleSlug) }
              >
                <Row gutter={ 16 }>
                  { this.landlordNameField() }
                  { this.accountOwnerField() }
                </Row>
                <Row gutter={ 16 }>
                  { this.billingCityField() }
                  { this.billingAddressField() }
                </Row>
                <Row gutter={ 16 }>
                  { this.billingCountryField() }
                  { this.billingPostalCodeField() }
                </Row>
                <Row gutter={ 16 }>
                  { this.longtailField() }
                </Row>
              </When>
              <Otherwise>
                <Row gutter={ 16 }>
                  { this.landlordNameField() }
                  { this.billingCityField() }
                </Row>
                <Row gutter={ 16 }>
                  { this.billingAddressField() }
                  { this.billingCountryField() }
                </Row>
                <Row gutter={ 16 }>
                  { this.billingPostalCodeField() }
                  { this.longtailField() }
                </Row>
              </Otherwise>
            </Choose>
          </section>
          <Divider className="landlord-detail__divider" />
          <section className="landlord-detail__section">
            <section className="landlord-detail__section">
              <p className="landlord-detail__title">{ t('cms.landlord.detail.billing_and_reconciliation.title') }</p>
              <Row gutter={ 16 }>
                <Col span={ 12 } className="landlord-detail__field">
                  <label>{t('cms.landlord.detail.reconciliation_preference.label')}: </label>
                  { landlord.reconciliationPreference ?
                    t(`cms.landlord.modal.${landlord.reconciliationPreference.toLowerCase()}.option`) : '-' }
                </Col>
                <Col span={ 12 } className="landlord-detail__field">
                  <label>{t('cms.landlord.detail.reconciliation_frequency.label')}: </label>
                  { landlord.reconciliationFrequency ?
                    t(`cms.landlord.modal.${landlord.reconciliationFrequency.toLowerCase()}.option`) : '-' }
                </Col>
              </Row>
              <Row gutter={ 16 }>
                <Col span={ 12 } className="landlord-detail__field">
                  <label>{t('cms.landlord.detail.reconciliation_option.label')}: </label>
                  { landlord.reconciliationOption ?
                    t(`cms.landlord.modal.reconciliation_option.${landlord.reconciliationOption.toLowerCase()}.option`) : '-' }
                </Col>
                <Col span={ 12 } className="landlord-detail__field">
                  <label>{t('cms.landlord.detail.booking_auto_confirm.label')}: </label>
                  { landlord.bookingAutoConfirm ? 'On' : 'Off' }
                </Col>
              </Row>

              <If condition={ landlord.bookingAutoConfirm }>
                <div className="landlord-detail__row">
                  <For of={ this.state.groupAutoConfirmProperties } each="item" index="key">
                    <p className="landlord-detail__auto-confirm-info" key={ key }>
                      {t('cms.landlord.landlord_details.auto_complete_info.content_1', {
                        number: item.propertyIds.length,
                      })}
                      <span className="landlord-detail__auto-confirm-info-blod">{item.countdownDays}</span>
                      {t('cms.landlord.landlord_details.auto_complete_info.content_2')}
                      <button
                        className="landlord-detail__show-detail-btn"
                        onClick={ () => {
                          this.handleAutoConfirmPropertiesModal(item.countdownDays, true);
                        } }
                      >
                        {t('cms.landlord.landlord_details.auto_complete_info.btn')}
                      </button>
                      <Modal
                        visible={ this.state.autoConfirmPropertiesModal[item.countdownDays] }
                        footer={ null }
                        className="landlord-detail__properties-modal"
                        onCancel={ () => {
                          this.handleAutoConfirmPropertiesModal(item.countdownDays, false);
                        } }
                      >
                        <div className="landlord-detail__properties-container">
                          <p className="landlord-detail__properties-container-title">{t('cms.landlord.landlord_details.properties_list.title')}</p>
                          <For of={ this.getProperties(item.countdownDays) } each="property" index="propertyIndex">
                            <p
                              className={ classNames('landlord-detail__property-line', {
                                'landlord-detail__property-line--first': propertyIndex === 0,
                              }) }
                              key={ property.id }
                            >
                              <span className="landlord-detail__property-index" >{propertyIndex + 1}.</span>
                              { property.name }
                            </p>
                          </For>
                        </div>
                      </Modal>
                    </p>
                  </For>
                </div>
              </If>
            </section>
            <Divider className="landlord-detail__divider" />
            <p className="landlord-detail__title">{ t('cms.landlord.detail.landlord_type.title') }</p>
            <Row gutter={ 16 }>
              <Col span={ 12 } className="landlord-detail__field">
                <label>{t('cms.landlord.detail.booking_journey.label')}: </label>
                { landlord.bookingJourney ? t(`cms.landlord.modal.booking_journey.${landlord.bookingJourney.toLowerCase()}.option`) : '-' }
              </Col>
              <If condition={ landlord.bookingJourney === 'SEMI_AUTOMATIC' }>
                <Col span={ 12 } className="landlord-detail__field">
                  <label>{t('cms.landlord.detail.ap_category.label')}: </label>
                  { landlord.apCategory ? t(`cms.landlord.modal.ap_category.${landlord.apCategory.toLowerCase()}.option`) : '-' }
                </Col>
              </If>
            </Row>
          </section>
          <Divider className="landlord-detail__divider" />
          <section className="landlord-detail__section">
            <p className="landlord-detail__title">{ t('cms.landlord.detail.invoicing_details.title') }</p>
            <Row gutter={ 16 }>
              <Col span={ 12 } className="landlord-detail__field">
                <label>{t('cms.landlord.detail.purchase_order_required.label')}: </label>
                { landlord.purchaseOrderRequired ? 'Yes' : 'No' }
              </Col>
              <Col span={ 12 } className="landlord-detail__field">
                <label>{t('cms.landlord.detail.invoicing_frequency.label')}: </label>
                {
                  landlord.invoicingFrequency ?
                    t(`cms.landlord.modal.${landlord.invoicingFrequency.toLowerCase()}.option`) : '-'
                }
              </Col>
            </Row>
          </section>
          <Divider className="landlord-detail__divider" />
          <section className="landlord-detail__section">
            <p className="landlord-detail__title">{ t('cms.landlord.detail.landlord_integration.title') }</p>
            <Row gutter={ 16 }>
              <Col span={ 12 } className="landlord-detail__field">
                <label>{t('cms.landlord.detail.system_provider.label')}: </label>
                {
                  landlord.systemProvider ?
                    t(`cms.landlord.modal.${landlord.systemProvider.toLowerCase()}.option`) : '-'
                }
              </Col>
              <Col span={ 12 } className="landlord-detail__field">
                <label>{t('cms.landlord.detail.system_provider_comment.label')}: </label>
                <span className="landlord-detail__field-value">{ landlord.systemProviderComment || '-' }</span>
              </Col>
            </Row>
          </section>
        </div>
        <If condition={ showElementByAuth(
          platformEntity.LANDLORDS_LANDLORDS,
          entityAction.UPDATE,
        ) }
        >
          <div className="landlord-detail__action">
            <Button
              type="primary"
              size="large"
              icon="edit"
              onClick={ this.handleClickEdit }
            >
              { t('cms.landlord.detail.edit.button') }
            </Button>
          </div>
        </If>
        <If condition={ this.state.isShowModal }>
          <LandlordModal
            activeModal
            t={ t }
            type="edit"
            landlord={ landlord }
            handleCloseModal={ this.handleCloseModal }
            updateLandlord={ this.props.updateLandlord }
            confirmStatus={ updateLandlordStatus }
            setCurrentLandlord={ this.props.setCurrentLandlord }
            landlordNameList={ landlordNameList }
            bindAutoConfirmSettings={ this.props.bindAutoConfirmSettings }
            getLandlord={ this.props.getLandlord }
            accountOwners={ this.props.accountOwners }
            getAccountOwners={ this.props.getAccountOwners }
            currentRoleSlug={ this.props.currentRoleSlug }
            isGettingAccountOwners={ this.props.isGettingAccountOwners }
          />
        </If>
      </div>
    );
  }
}

LandlordDetail.propTypes = {
  t: PropTypes.func.isRequired,
  landlord: PropTypes.object,
  updateLandlord: PropTypes.func.isRequired,
  updateLandlordStatus: PropTypes.string,
  setCurrentLandlord: PropTypes.func,
  landlordNameList: PropTypes.array,
  bindAutoConfirmSettings: PropTypes.func,
  getLandlord: PropTypes.func,
  currentRoleSlug: PropTypes.string,
  accountOwners: PropTypes.array,
  getAccountOwners: PropTypes.func,
  isGettingAccountOwners: PropTypes.bool,
};

LandlordDetail.defaultProps = {
  t: () => {},
  landlord: {},
  updateLandlord: () => {},
  updateLandlordStatus: '',
  setCurrentLandlord: () => {},
  landlordNameList: [],
  bindAutoConfirmSettings: () => {},
  getLandlord: () => {},
  currentRoleSlug: '',
  accountOwners: [],
  getAccountOwners: () => {},
  isGettingAccountOwners: false,
};

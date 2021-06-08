import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Input, Row, Col, Icon, Radio, Select, Button, message, Popconfirm } from 'antd';
import modal from '~components/modal';
import MyMap from '~components/my-map';
import { billingCountries } from '~constants/billing-country';
import BillingAndReconciliationfrom from '~pages/dashboard/landlord/modal/billing-and-reconciliation';
import {
  invoicingFrequencies,
  includeRoleArr,
  viewLandlordAccountOwnerRoleArr,
  editLandlordAccountOwnerRoleArr,
} from '~constants/landlord';
import { communicationStatus } from '~constants';
import { isRegionalSupplyHeadRole, isAdminRole } from '~helpers/auth';
import AccountOwnerSearch from '~modules/account-owner-search';
import { getSystemProviderList } from '~actions/landlord';


const mapStateToProps = ({ dashboard: { landlord } }) => {
  const { systemProviderList, communication } = landlord.toJS();

  return {
    systemProviders: systemProviderList,
    isFetchingSystemProvider:
      communication.getSystemProviderList.status === communicationStatus.FETCHING,
    isFetchingReconciliationPreference:
      communication.getReconciliationPreferenceList.status === communicationStatus.FETCHING,
  };
};

const mapDispatchToProps = dispatch => ({
  getSystemProviderList: (params, successCallback) => {
    dispatch(getSystemProviderList(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@modal({
  className: 'landlord-action-modal',
}, true)
class LandlordModal extends React.Component {
  constructor(props) {
    super(props);
    this.initialLandlordName = props.landlord.name;

    this.state = {
      confirmSettings: [],
      showPropertiesTransfer: false,
    };

    this.props.getSystemProviderList();
  }

  componentDidMount() {
    document.addEventListener('googleApiMounted', this.searchGoogleMap);
  }

  componentWillUnmount() {
    document.removeEventListener('googleApiMounted', this.searchGoogleMap);
  }

  searchGoogleMap = () => {
    if (this.billingAddressInput && this.billingAddressInput.input) {
      const request = {
        types: ['address'],
      };
      const searchAddressService =
        new google.maps.places.Autocomplete(this.billingAddressInput.input, request);
      searchAddressService.addListener('place_changed', () => {
        const place = searchAddressService.getPlace();

        const postalCodeComponent = place.address_components.find(item => item.types.includes('postal_code'));

        this.props.form.setFieldsValue({
          billingAddress: place.formatted_address,
          billingPostalCode: postalCodeComponent ? postalCodeComponent.long_name : '',
        });
      });
    }
    if (this.billingCityInput && this.billingCityInput.input) {
      const request = {
        types: ['(cities)'],
      };
      const searchCityService =
        new google.maps.places.Autocomplete(this.billingCityInput.input, request);
      searchCityService.addListener('place_changed', () => {
        const place = searchCityService.getPlace();

        this.props.form.setFieldsValue({
          billingCity: place.name,
        });
      });
    }
  };

  setConfirmSettings = (params) => {
    this.setState({
      confirmSettings: params,
    });
  }

  setShowPropertiesTransfer = (bool) => {
    this.setState({
      showPropertiesTransfer: bool,
    });
  }

  handleClickConfirm = () => {
    const { type, landlord, t } = this.props;

    this.props.form.validateFieldsAndScroll(
      (err) => {
        if (!err) {
          const params = this.props.form.getFieldsValue();
          params.purchaseOrderRequired = params.purchaseOrderRequired === 'Yes';
          Object.keys(params).map((key) => {
            if (typeof params[key] === 'string') {
              params[key] = params[key].trim();
            }
            return true;
          });

          if (type === 'create') {
            this.props.createLandlord(params, () => {
              this.props.handleCloseModal();
              this.props.initLandlords();
              message.success(t('cms.message.landlord.created_success'));
            });
          }

          if (type === 'edit') {
            params.id = landlord.id;
            this.props.updateLandlord(params, (updateLandlord) => {
              if (updateLandlord && updateLandlord.landlord && !params.bookingAutoConfirm) {
                this.props.setCurrentLandlord(updateLandlord.landlord);
              }

              if (
                params.reconciliationOption === 'BOOKING_COMPLETED'
                && params.bookingAutoConfirm
              ) {
                this.props.bindAutoConfirmSettings({
                  confirmSettings: this.state.confirmSettings,
                  landlordId: landlord.id,
                }, () => {
                  this.props.getLandlord(landlord.slug);
                });
              }

              this.props.handleCloseModal();
              message.success(t('cms.message.landlord.updated_success'));
            });
          }
        }
      },
    );
  };

  handleChangeLandlordName = (e) => {
    // forbid chinese character
    e.target.value = e.target.value.replace(/[\u4e00-\u9fa5]/g, '');
  };

  isLandlordNameAleadyExists = (name) => {
    const { landlordNameList } = this.props;
    return landlordNameList.some(item => item.name === name && name !== this.initialLandlordName);
  }

  landlordNameField = () => (
    <Col span={ 12 }>
      <Form.Item
        label={ this.props.t('cms.landlord.detail.landlord_name.label') }
        colon={ false }
      >
        {this.props.form.getFieldDecorator('name', {
          rules: [
            {
              required: true,
              message: this.props.t('cms.landlord.modal.error.blank'),
            },
            {
              max: 150,
              message: this.props.t('cms.landlord.modal.error.landlord_name.limit'),
            },
            {
              message: '',
              validator: (rule, value, callback) => {
                if (this.isLandlordNameAleadyExists(value)) {
                  callback(this.props.t('cms.landlord.modal.error.landlord_name.already_exists'));
                } else {
                  callback();
                }
              },
            },
          ],
          initialValue: this.props.landlord.name || '',
          validateTrigger: 'onBlur',
        })(
          <Input
            placeholder={ this.props.t('cms.landlord.modal.landlord_name.placeholder') }
            onChange={ this.handleChangeLandlordName }
          />,
        )}
      </Form.Item>
    </Col>
  )

  accountOwnerField = () => (
    <Col span={ 12 }>
      <AccountOwnerSearch
        labelPlaceholder={ this.props.t('cms.landlord.detail.account_owner.label') }
        inputPlaceholder={ this.props.t('cms.landlord.modal.landlord_account_owner.placeholder') }
        includeRoleArr={ includeRoleArr }
        accountOwners={ this.props.accountOwners }
        isDisabled={ !editLandlordAccountOwnerRoleArr.includes(this.props.currentRoleSlug) }
        form={ this.props.form }
        t={ this.props.t }
        isFetching={ this.props.isGettingAccountOwners }
        accountManager={ this.props.landlord.accountManager }
        isNeedInit={ this.props.type === 'edit' }
        getAccountOwners={ this.props.getAccountOwners }
      />
    </Col>
  )

  billingAddressField = () => (
    <Col span={ 12 }>
      <Form.Item
        label={ this.props.t('cms.landlord.detail.billing_address.label') }
        colon={ false }
      >
        { this.props.form.getFieldDecorator('billingAddress', {
          rules: [
            {
              required: true,
              message: this.props.t('cms.landlord.modal.error.blank'),
            },
          ],
          initialValue: this.props.landlord.billingAddress,
          validateTrigger: 'onBlur',
        })(
          <Input
            ref={ (node) => { this.billingAddressInput = node; } }
            placeholder={ this.props.t('cms.landlord.modal.billing_address.placeholder') }
          />,
        )}
      </Form.Item>
    </Col>
  )

  billingPostalCodeField = () => (
    <Col span={ 12 }>
      <Form.Item
        label={ this.props.t('cms.landlord.detail.billing_zip_code.label') }
        colon={ false }
      >
        { this.props.form.getFieldDecorator('billingPostalCode', {
          rules: [
            {
              max: 10,
              message: this.props.t('cms.landlord.modal.error.billing_postal_code'),
            },
            {
              required: true,
              message: this.props.t('cms.landlord.modal.error.blank'),
            },
          ],
          initialValue: this.props.landlord.billingPostalCode,
          validateTrigger: 'onBlur',
        })(
          <Input placeholder={ this.props.t('cms.landlord.modal.billing_zip_code.placeholder') } />,
        )}
      </Form.Item>
    </Col>
  )

  billingCityField = () => (
    <Col span={ 12 }>
      <Form.Item
        label={ this.props.t('cms.landlord.detail.billing_city.label') }
        colon={ false }
      >
        { this.props.form.getFieldDecorator('billingCity', {
          rules: [
            {
              required: true,
              message: this.props.t('cms.landlord.modal.error.blank'),
            },
          ],
          initialValue: this.props.landlord.billingCity,
          validateTrigger: 'onBlur',
        })(
          <Input
            ref={ (node) => { this.billingCityInput = node; } }
            placeholder={ this.props.t('cms.landlord.modal.billing_city.placeholder') }
          />,
        )}
      </Form.Item>
    </Col>
  )

  billingCountryField = () => (
    <Col span={ 12 }>
      <Form.Item
        label={ this.props.t('cms.landlord.detail.billing_country.label') }
        colon={ false }
      >
        { this.props.form.getFieldDecorator('billingCountry', {
          rules: [
            {
              required: true,
              message: this.props.t('cms.landlord.modal.error.blank'),
            },
          ],
          initialValue: this.props.landlord.billingCountry,
          validateTrigger: 'onBlur',
        })(
          <Select showSearch placeholder={ this.props.t('cms.landlord.modal.billing_country.placeholder') }>
            <For of={ billingCountries } each="billingCountry" index="index">
              <Select.Option key={ index } value={ billingCountry }>
                { billingCountry }
              </Select.Option>
            </For>
          </Select>,
        )}
      </Form.Item>
    </Col>
  )

  longtailField = () => (
    <Col span={ 12 }>
      <Form.Item
        label={ this.props.t('cms.landlord.detail.longtail.label') }
        colon={ false }
      >
        { this.props.form.getFieldDecorator('isLongtail', {
          initialValue: !!this.props.landlord.isLongtail,
        })(
          <Radio.Group name="radiogroup">
            <Radio value>{ this.props.t('cms.form.value.yes') }</Radio>
            <Radio value={ false }>{ this.props.t('cms.form.value.no') }</Radio>
          </Radio.Group>,
        )}
      </Form.Item>
    </Col>
  )

  render() {
    const {
      t,
      type,
      landlord,
      form,
      confirmStatus,
      currentRoleSlug,
      isFetchingReconciliationPreference,
      isFetchingSystemProvider,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <div className="landlord-info">
        <div className="landlord-info__header">
          { t(`cms.landlord.modal.${type}_landlord_information.title`) }
          <Choose>
            <When condition={ this.props.form.isFieldsTouched() }>
              <Popconfirm
                title={ t('cms.property.commission_form_modal.close.tips.title') }
                placement="left"
                onConfirm={ this.props.handleCloseModal }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <Icon
                  type="close"
                  className="landlord-info__close-button"
                />
              </Popconfirm>
            </When>
            <Otherwise>
              <Icon
                type="close"
                className="landlord-info__close-button"
                onClick={ this.props.handleCloseModal }
              />
            </Otherwise>
          </Choose>
        </div>
        <div className="landlord-info__body">
          <MyMap
            t={ t }
            style={ { display: 'none' } }
            lastSearched={ {
              lat: 0,
              lng: 0,
            } }
            form={ this.props.form }
            value={ {
              action: 'default',
              value: { lat: 0, lng: 0 },
            } }
          />
          <Form className="landlord-info__form">
            <section className="landlord-info__section">
              <p
                className="landlord-info__section-title"
                ref={ (node) => { this.basicInfoContainer = node; } }
              >
                { t('cms.landlord.detail.basic_info.title') }
              </p>
              <Choose>
                <When condition={
                  viewLandlordAccountOwnerRoleArr.includes(currentRoleSlug) &&
                  this.props.type === 'edit'
                }
                >
                  <Row gutter={ 24 }>
                    { this.landlordNameField() }
                    { this.accountOwnerField() }
                  </Row>
                  <Row gutter={ 24 }>
                    { this.billingAddressField() }
                    { this.billingPostalCodeField() }
                  </Row>
                  <Row gutter={ 24 }>
                    { this.billingCityField() }
                    { this.billingCountryField() }
                  </Row>
                  <Row gutter={ 24 }>
                    { this.longtailField() }
                  </Row>
                </When>
                <Otherwise>
                  <Row gutter={ 24 }>
                    { this.landlordNameField() }
                    { this.billingAddressField() }
                  </Row>
                  <Row gutter={ 24 }>
                    { this.billingPostalCodeField() }
                    { this.billingCityField() }
                  </Row>
                  <Row gutter={ 24 }>
                    { this.billingCountryField() }
                    { this.longtailField() }
                  </Row>
                </Otherwise>
              </Choose>
            </section>
            <BillingAndReconciliationfrom
              t={ t }
              landlord={ landlord }
              form={ form }
              type={ type }
              setConfirmSettings={ this.setConfirmSettings }
              confirmSettings={ this.state.confirmSettings }
              showPropertiesTransfer={ this.state.showPropertiesTransfer }
              setShowPropertiesTransfer={ this.setShowPropertiesTransfer }
            />
            <section className="landlord-info__section">
              <p className="landlord-info__section-title" ref={ (node) => { this.landlordTypeContainer = node; } }>
                { t('cms.landlord.detail.landlord_type.title') }
              </p>
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.detail.booking_journey.label') }
                    colon={ false }
                  >
                    { getFieldDecorator('bookingJourney', {
                      initialValue: landlord.bookingJourney || 'MANUAL',
                    })(
                      <Select getPopupContainer={ () => this.landlordTypeContainer }>
                        <Select.Option value="MANUAL">
                          { t('cms.landlord.modal.booking_journey.manual.option') }
                        </Select.Option>
                        <Select.Option value="SEMI_AUTOMATIC">
                          { t('cms.landlord.modal.booking_journey.semi_automatic.option') }
                        </Select.Option>
                        <Select.Option value="FULL_AUTOMATIC">
                          { t('cms.landlord.modal.booking_journey.full_automatic.option') }
                        </Select.Option>
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
                <If condition={ getFieldValue('bookingJourney') === 'SEMI_AUTOMATIC' }>
                  <Col span={ 12 }>
                    <Form.Item
                      label={ t('cms.landlord.detail.ap_category.label') }
                      colon={ false }
                    >
                      { getFieldDecorator('apCategory', {
                        initialValue: landlord.apCategory || 'STANDARD',
                      })(
                        <Select
                          disabled={ !(isRegionalSupplyHeadRole() || isAdminRole()) }
                          getPopupContainer={ () => this.landlordTypeContainer }
                        >
                          <Select.Option value="STANDARD">
                            { t('cms.landlord.modal.ap_category.standard.option') }
                          </Select.Option>
                          <Select.Option value="KEY">
                            { t('cms.landlord.modal.ap_category.key.option') }
                          </Select.Option>
                        </Select>,
                      )}
                    </Form.Item>
                  </Col>
                </If>
              </Row>
            </section>
            <section className="landlord-info__section">
              <p className="landlord-info__section-title" ref={ (node) => { this.invoicingDetailsContainer = node; } }>
                { t('cms.landlord.detail.invoicing_details.title') }
              </p>
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.detail.purchase_order_required.label') }
                    colon={ false }
                  >
                    { getFieldDecorator('purchaseOrderRequired', {
                      initialValue: landlord.purchaseOrderRequired ? 'Yes' : 'No',
                    })(
                      <Select
                        getPopupContainer={ () => this.invoicingDetailsContainer }
                        placeholder={ t('cms.landlord.modal.not_specific.placeholder') }
                      >
                        <Select.Option value="Yes">
                          { t('cms.form.value.yes') }
                        </Select.Option>
                        <Select.Option value="No">
                          { t('cms.form.value.no') }
                        </Select.Option>
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.detail.invoicing_frequency.label') }
                    colon={ false }
                  >
                    { getFieldDecorator('invoicingFrequency', {
                      initialValue: landlord.invoicingFrequency ?
                        landlord.invoicingFrequency.toUpperCase() :
                        undefined,
                    })(
                      <Select
                        getPopupContainer={ () => this.invoicingDetailsContainer }
                        placeholder={ t('cms.landlord.modal.not_specific.placeholder') }
                      >
                        <For of={ invoicingFrequencies } each="option" index="index">
                          <Select.Option key={ index } value={ option }>
                            { t(`cms.landlord.modal.${option.toLowerCase()}.option`) }
                          </Select.Option>
                        </For>
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </section>
            <section className="landlord-info__section">
              <p className="landlord-info__section-title">
                { t('cms.landlord.detail.landlord_integration.title') }
              </p>
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.detail.system_provider.label') }
                    colon={ false }
                  >
                    { getFieldDecorator('systemProvider', {
                      initialValue: landlord.systemProvider ?
                        landlord.systemProvider.toUpperCase() :
                        undefined,
                    })(
                      <Select
                        getPopupContainer={ () => this.invoicingDetailsContainer }
                        placeholder={ t('cms.landlord.modal.not_specific.placeholder') }
                        loading={ this.props.isFetchingSystemProvider }
                      >
                        <For of={ this.props.systemProviders } each="option" index="index">
                          <Select.Option key={ index } value={ option }>
                            { t(`cms.landlord.modal.${option.toLowerCase()}.option`) }
                          </Select.Option>
                        </For>
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.detail.system_provider_comment.label') }
                    colon={ false }
                  >
                    {getFieldDecorator('systemProviderComment', {
                      rules: [
                        {
                          max: 150,
                          message: t('cms.landlord.modal.error.system_provider_comment'),
                        },
                      ],
                      initialValue: landlord.systemProviderComment,
                      validateTrigger: 'onBlur',
                    })(
                      <Input placeholder={ t('cms.landlord.modal.system_provider_comment.placeholder') } />,
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </section>
          </Form>
        </div>
        <div className="landlord-info__footer">
          <Choose>
            <When condition={ this.props.form.isFieldsTouched() }>
              <Popconfirm
                title={ t('cms.property.commission_form_modal.close.tips.title') }
                placement="left"
                onConfirm={ this.props.handleCloseModal }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <Button
                  ghost
                  type="primary"
                  size="large"
                  className="landlord-info__cancel-button"
                >
                  { t('cms.landlord.modal.cancel.button') }
                </Button>
              </Popconfirm>
            </When>
            <Otherwise>
              <Button
                ghost
                type="primary"
                size="large"
                className="landlord-info__cancel-button"
                onClick={ this.props.handleCloseModal }
              >
                { t('cms.landlord.modal.cancel.button') }
              </Button>
            </Otherwise>
          </Choose>
          <Button
            type="primary"
            size="large"
            onClick={ this.handleClickConfirm }
            loading={ confirmStatus === communicationStatus.FETCHING }
            disabled={ (this.state.showPropertiesTransfer &&
              !!this.props.form.getFieldValue('bookingAutoConfirm')) ||
              isFetchingReconciliationPreference ||
              isFetchingSystemProvider
            }
          >
            { t('cms.landlord.modal.confirm.button') }
          </Button>
        </div>
      </div>
    );
  }
}

LandlordModal.propTypes = {
  t: PropTypes.func.isRequired,
  type: PropTypes.oneOf([
    'create',
    'edit',
  ]),
  landlord: PropTypes.object,
  handleCloseModal: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
    validateFieldsAndScroll: PropTypes.func.isRequired,
    getFieldsValue: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    isFieldsTouched: PropTypes.func.isRequired,
  }).isRequired,
  createLandlord: PropTypes.func.isRequired,
  updateLandlord: PropTypes.func.isRequired,
  confirmStatus: PropTypes.string,
  setCurrentLandlord: PropTypes.func,
  initLandlords: PropTypes.func,
  landlordNameList: PropTypes.array,
  bindAutoConfirmSettings: PropTypes.func,
  getLandlord: PropTypes.func,
  accountOwners: PropTypes.array,
  getAccountOwners: PropTypes.func,
  currentRoleSlug: PropTypes.string,
  isGettingAccountOwners: PropTypes.bool,
  systemProviders: PropTypes.array,
  getSystemProviderList: PropTypes.func,
  isFetchingSystemProvider: PropTypes.bool,
  isFetchingReconciliationPreference: PropTypes.bool,
};

LandlordModal.defaultProps = {
  t: () => {},
  type: 'create',
  landlord: {},
  handleCloseModal: () => {},
  form: {
    getFieldDecorator: () => {},
    setFieldsValue: () => {},
    validateFieldsAndScroll: () => {},
    getFieldsValue: () => {},
    getFieldValue: () => {},
    isFieldsTouched: () => {},
  },
  createLandlord: () => {},
  updateLandlord: () => {},
  confirmStatus: '',
  setCurrentLandlord: () => {},
  initLandlords: () => {},
  landlordNameList: [],
  bindAutoConfirmSettings: () => {},
  getLandlord: () => {},
  accountOwners: [],
  getAccountOwners: () => {},
  currentRoleSlug: '',
  isGettingAccountOwners: false,
  systemProviders: [],
  getSystemProviderList: () => {},
  isFetchingSystemProvider: false,
  isFetchingReconciliationPreference: false,
};

export default Form.create({
  name: 'cms_landlord_modal',
})(LandlordModal);

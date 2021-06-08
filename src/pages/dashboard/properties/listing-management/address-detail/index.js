import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Input, Row, Col } from 'antd';
import lookup from 'country-code-lookup';
import enhanceForm from '~hocs/enhance-form';
import MyMap from '~components/my-map';
import SearchInput from '~components/search-input';
import { fetch } from '~helpers/graphql';
import { renameObjectKey } from '~helpers/index';
import * as queries from '~settings/queries';
import RecommendedUniversities from '~pages/dashboard/properties/listing-management/address-detail/recommended-universities';
import { formatAddressFromPlace } from '~helpers/google-map';
import PropertyDetailWrapper from '~components/property-detail-wrapper';
import AutocompleteInput from '~components/search-input/autocomplete-input';

@enhanceForm()
export default class AddressDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onlyShowAddress: !props.property.address,
      lastSearchedCoordinate: { lat: props.property.latitude, lng: props.property.longitude },
      showGoogleMap: false,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  handleImgOnError = () => {
    this.setState({
      showGoogleMap: false,
    });
  }

  handleImgOnload = () => {
    this.setState({
      showGoogleMap: true,
    });
  }

  handleSearchInputChange = (place) => {
    const data = formatAddressFromPlace(place);
    if (data) {
      this.props.form.setFieldsValue(data);
    }
  }

  handleSave = (callback = () => {}) => {
    this.props.form.validateFieldsAndScroll((errors) => {
      if (!errors || errors.length === 0) {
        const { afterSave, property, changeFields } = this.props;
        const fieldsValue = this.props.form.getFieldsValue();
        const requests = [];
        const addressParams = {};

        if (fieldsValue.address) {
          addressParams.address = fieldsValue.address;
        }
        if (fieldsValue.addressLine_2 || fieldsValue.addressLine_2 === '') {
          addressParams.addressLine_2 = fieldsValue.addressLine_2;
        }
        if (fieldsValue.coordinates) {
          addressParams.latitude = fieldsValue.coordinates.value.lat;
          addressParams.longitude = fieldsValue.coordinates.value.lng;
        }
        if (fieldsValue.shippingCity) {
          addressParams.shippingCity = fieldsValue.shippingCity;
        }
        if (fieldsValue.postalCode || fieldsValue.postalCode === '') {
          addressParams.postalCode = fieldsValue.postalCode || null;
        }
        if (fieldsValue.country && lookup.byCountry(fieldsValue.country)) {
          addressParams.country = lookup.byCountry(fieldsValue.country).iso2;
        }

        if (Object.keys(addressParams).length !== 0) {
          addressParams.id = property.id;
          requests.push(fetch(queries.updatePropertyAddress(addressParams)));
        }
        if (changeFields.universities) {
          requests.push(fetch(queries.bindPropertyUniversities({
            propertyId: property.id,
            universityIds: changeFields.universities.map(item => item.key),
          })));
        }
        Promise.all(requests).then(() => {
          afterSave(Object.assign(
            {},
            renameObjectKey(addressParams, 'postalCode', 'zipCode'),
            renameObjectKey(addressParams, 'addressLine_2', 'addressLine2'),
            changeFields.universities ?
              { universities: changeFields.universities.map(
                item => ({ id: item.key, name: item.label })) }
              : {},
          ));

          callback({ status: 'success', isUpdated: true });
        }).catch((e) => {
          callback({ status: 'err', err: e });
        });
      } else {
        callback({ status: 'success', isUpdated: false });
      }
    });
  }

  render() {
    const { t, property, form: { getFieldDecorator } } = this.props;

    return (
      <PropertyDetailWrapper
        t={ t }
        isPublished={ property.status === 'PUBLISHED' }
        onClickSave={ this.handleSave }
        loading={ this.state.isSaving }
      >
        <Form layout="vertical">
          <div className="address-detail">
            <Row gutter={ 16 }>
              <SearchInput
                t={ t }
                onChange={ this.handleSearchInputChange }
              />
            </Row>
            <Row gutter={ 16 }>
              <Col span={ 12 }>
                <Form.Item label={ t('cms.properties.edit.address.address_line1') }>
                  {
                    getFieldDecorator('address', {
                      initialValue: property.address,
                      rules: [{
                        required: true,
                        message: this.props.t('cms.properties.edit.error.blank') }],
                    })(
                      <Input placeholder={ t('cms.properties.edit.address.address_line_hint') } autoComplete="off" />,
                    )
                  }
                </Form.Item>
              </Col>
              <Col span={ 12 }>
                <Form.Item label={ t('cms.properties.edit.address.address_line2') }>
                  {
                    getFieldDecorator('addressLine_2', {
                      initialValue: property.addressLine2,
                    })(
                      <Input placeholder={ t('cms.properties.edit.address.address_line_hint') } autoComplete="off" />,
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={ 16 }>
              <Col span={ 6 }>
                <Form.Item
                  className="property-edit__label"
                  label={ t('cms.properties.edit.address.city') }
                >
                  {
                    getFieldDecorator('shippingCity', {
                      initialValue: property.shippingCity,
                      rules: [{
                        required: true,
                        message: this.props.t('cms.properties.edit.error.blank') }],
                    })(
                      <AutocompleteInput
                        inputProps={ {
                          placeholder: t('cms.properties.edit.address.city_hint'),
                        } }
                        type="city"
                      />,
                    )
                  }
                </Form.Item>
              </Col>
              <Col span={ 6 }>
                <Form.Item
                  className="property-edit__label"
                  label={ t('cms.properties.edit.address.country') }
                >
                  {
                    getFieldDecorator('country', {
                      initialValue: property.country && lookup.byIso(property.country) ?
                        lookup.byIso(property.country).country : '',
                      rules: [{
                        required: true,
                        message: this.props.t('cms.properties.edit.error.blank') }],
                    })(
                      <AutocompleteInput
                        inputProps={ {
                          placeholder: t('cms.properties.edit.address.country_hint'),
                        } }
                        type="country"
                      />,
                    )
                  }
                </Form.Item>
              </Col>
              <Col span={ 12 }>
                <Form.Item label={ t('cms.properties.edit.address.zip_code') }>
                  {
                    getFieldDecorator('postalCode', {
                      initialValue: property.zipCode,
                    })(
                      <Input placeholder={ t('cms.properties.edit.address.zip_code_hint') } autoComplete="off" />,
                    )
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={ 16 }>
              <Col span={ 24 }>
                <div className={ classNames('address-detail__map', { 'address-detail__map--hide': this.state.onlyShowAddress, 'address-detail__map--no-vpn': !this.state.showGoogleMap }) }>
                  {/* this img is for without vpn condition */}
                  <img
                    style={ { display: 'none', position: 'fixed', zIndex: -100 } }
                    src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_160x56dp.png"
                    onLoad={ this.handleImgOnload }
                    onError={ this.handleImgOnError }
                    alt="google icon"
                  />
                  <If condition={ this.state.showGoogleMap }>
                    <Form.Item>
                      {
                        getFieldDecorator('coordinates', {
                          initialValue: {
                            value: {
                              lat: property.latitude === null ?
                                (property.city && property.city.latitude) : property.latitude,
                              lng: property.longitude === null ?
                                (property.city && property.city.longitude) : property.longitude,
                            },
                            action: 'default',
                          },
                          trigger: 'onChange',
                          required: true,
                          rules: [
                            {
                              validator: (rule, value, callback) => {
                                if (this.map) {
                                  if (value.value.lat.toFixed(6) === '0.000000' && value.value.lng.toFixed(6) === '0.000000' && value.action === 'default') {
                                    callback('error');
                                  }
                                }

                                callback();
                              },
                              message: this.props.t('cms.properties.edit.address.weak_error'),
                            },
                          ],
                        })(
                          <MyMap
                            t={ t }
                            lastSearched={ this.state.lastSearchedCoordinate }
                            ref={ (node) => { this.map = node; } }
                            form={ this.props.form }
                            mapHeight={ '17.8rem' }
                          />,
                        )
                      }
                    </Form.Item>
                  </If>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={ 24 }>
                <RecommendedUniversities
                  t={ t }
                  form={ this.props.form }
                  property={ this.props.property }
                />
              </Col>
            </Row>
          </div>
        </Form>
      </PropertyDetailWrapper>
    );
  }
}

AddressDetail.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object, // eslint-disable-line react/require-default-props
  property: PropTypes.object.isRequired,
  afterSave: PropTypes.func,
  onRef: PropTypes.func.isRequired,
  changeFields: PropTypes.object,
};

AddressDetail.defaultProps = {
  t: () => { },
  property: {
    city: {
      name: '',
      country: {
        name: '',
      },
    },
  },
  afterSave: () => {},
  onRef: () => {},
  changeFields: {},
};

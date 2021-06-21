import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Input, Select } from 'antd';
import MyMap from '~components/my-map';
import CustomAutoComplete from '~pages/dashboard/properties/edit/address-tab/custom-auto-complete';
import RecommendedUniversities from '~pages/dashboard/properties/edit/address-tab/recommended-universities';
import { setEditedFields, removeUntouchedFields } from '~helpers/property-edit';
import { isLandlordRole } from '~helpers/auth';


class AddressTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPermission: ['ALL', 'CN', 'ROW'],
      searchAgain: !props.property.address,
      onlyShowAddress: !props.property.address,
      switchStatusCanBe: true,
      selectValueCanBe: ['ALL', 'CN', 'ROW'],
      lastSearchedCoordinate: { lat: props.property.latitude, lng: props.property.longitude },
      showGoogleMap: false,
    };
  }


  getAddressLabel = () => {
    if (this.state.onlyShowAddress) {
      return this.props.t('cms.properties.edit.address.start_search');
    }
    if (!this.state.searchAgain) {
      return (
        <span className="address-tab__custom-label">
          <span>{this.props.t('cms.properties.edit.address.address_line1')}</span>
          <a href="" onClick={ this.handleSearchAgainClick }>
            {this.props.t('cms.properties.edit.address.search_again')}
          </a>
        </span>
      );
    }
    return this.props.t('cms.properties.edit.address.address_line1');
  }

  handleSearchAgainClick = (e) => {
    e.preventDefault();
    this.setState({
      searchAgain: true,
    });
  }


  handleTransitData = (value) => {
    if (value === null) {
      this.setState({
        searchAgain: false,
        onlyShowAddress: false,
      });
    } else {
      this.setState({
        searchAgain: false,
        onlyShowAddress: false,
        lastSearchedCoordinate: value.location,
      }, () => {
        this.props.form.setFieldsValue({
          coordinates: {
            value: value.location,
            action: 'search',
          },
          postalCode: value.zipCode,
          shippingCity: value.shippingCity,
        });
      });
    }
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

  render() {
    const { t, property, form: { getFieldDecorator } } = this.props;

    return (
      <Form layout="vertical">
        <div className={ classNames('address-tab') }>
          <div className="address-tab__left-col">
            <Form.Item
              label={ this.getAddressLabel() }
            >
              {getFieldDecorator('address', {
                rules: [{ required: true, message: t('Please input your address!') }],
                initialValue: property.address,
                trigger: 'onChange',
              })(
                <CustomAutoComplete
                  t={ t }
                  ref={ ((autoComplete) => { this.autoComplete = autoComplete; }) }
                  className={ this.state.searchAgain ? '' : null }
                  handleSelect={ this.handleTransitData }
                  defaultOpen
                  location={ {
                    lng: property.city ? property.city.longitude : null,
                    lat: property.city ? property.city.latitude : null,
                  } }
                  isSearching={ this.state.searchAgain }
                />)}
            </Form.Item>
            <div className={ classNames({ 'address-tab__hide-fields': this.state.onlyShowAddress }) }>
              <Form.Item label={ t('cms.properties.edit.address.address_line2') }>
                {
                  getFieldDecorator('addressLine_2', {
                    initialValue: property.addressLine2,
                  })(
                    <Input placeholder={ t('cms.properties.edit.address.address_line_hint') } autoComplete="off" />,
                  )
                }
              </Form.Item>
              <Form.Item label={ t('cms.properties.edit.address.zip_code') }>
                {
                  getFieldDecorator('postalCode', {
                    initialValue: property.zipCode,
                  })(
                    <Input placeholder={ t('cms.properties.edit.address.zip_code_hint') } autoComplete="off" />,
                  )
                }
              </Form.Item>
              <Form.Item label={ t('cms.properties.edit.address.select_an_area') }>
                {
                  getFieldDecorator('areaId', {
                    initialValue: property.area ? property.area.id : null,
                  })(
                    <Select placeholder={ t('cms.properties.edit.address.select_an_area_hint') }>
                      <For of={ property.city ? property.city.areas.edges : [] } each="areaItem" index="index">
                        <Select.Option
                          key={ index }
                          value={ areaItem.node.id }
                        >
                          {areaItem.node.name}
                        </Select.Option>
                      </For>
                    </Select>,
                  )
                }
              </Form.Item>
              <Form.Item
                className="property-edit__label--disable"
                label={ t('cms.properties.edit.address.city') }
              >
                {
                  getFieldDecorator('shippingCity', {
                    initialValue: property.shippingCity,
                  })(
                    <Select
                      placeholder={ t('cms.properties.edit.address.city_hint') }
                      disabled
                    />,
                  )
                }
              </Form.Item>
              <Form.Item
                className="property-edit__label--disable"
                label={ t('cms.properties.edit.address.country') }
              >
                {
                  getFieldDecorator('country', {
                    initialValue: property.city ? property.city.country.name : null,
                  })(
                    <Select
                      placeholder={ t('cms.properties.edit.address.country_hint') }
                      disabled
                    />,
                  )
                }
              </Form.Item>
              <If condition={ !isLandlordRole() }>
                <RecommendedUniversities
                  t={ t }
                  form={ this.props.form }
                  property={ this.props.property }
                />
              </If>
            </div>
          </div>
          <div className={ classNames('address-tab__right-col', { 'address-tab__right-col--hide': this.state.onlyShowAddress, 'address-tab__right-col--no-vpn': !this.state.showGoogleMap }) }>
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
                    />,
                  )
                }
              </Form.Item>
            </If>
          </div>

        </div>
      </Form>
    );
  }
}

AddressTab.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  property: PropTypes.object.isRequired,
};

AddressTab.defaultProps = {
  t: () => { },
  form: {
    getFieldDecorator: () => {},
  },
  property: {
    city: {
      name: '',
      country: {
        name: '',
      },
    },
  },
};

const checkLinksVaidate = value => !value.find(item => !!item.urlError || !!item.switchError);

const linksCleaner = links =>
  links.map(item => ({
    link: item.link,
    enabled: item.enabled,
    displayRegion: item.displayRegion,
    id: item.id }));

const onFieldsChange = (props, changedFields) => {
  let fields = removeUntouchedFields(changedFields, 'address');

  if (Object.keys(changedFields).includes('coordinates')) {
    const coordinates = changedFields.coordinates;
    if (!coordinates.value || !coordinates.value.value) {
      return false;
    }
    delete fields.coordinates;
    fields = Object.assign(
      {},
      fields,
      {
        latitude: {
          value: coordinates.value.value.lat,
          errors: coordinates.value.value.lat === 0 &&
            coordinates.value.value.lng === 0 &&
            coordinates.value.action === 'default' ? 'error' : null,
          touched: coordinates.value.action !== 'default',
          name: 'latitude',
          dirty: coordinates.dirty },
        longitude: {
          value: coordinates.value.value.lng,
          errors: coordinates.value.value.lat === 0 &&
            coordinates.value.value.lng === 0 &&
            coordinates.value.action === 'default' ? 'error' : null,
          touched: coordinates.value.action !== 'default',
          name: 'longitude',
          dirty: coordinates.dirty,
        },
      });
  }
  if (Object.keys(fields).includes('links')) {
    const validate = checkLinksVaidate(fields.links.value);
    fields.links.value = linksCleaner(fields.links.value);
    fields.links.touched = true;
    fields.links.errors = validate ? null : 'error';
  }
  if (Object.keys(fields).includes('postalCode')) {
    fields.postalCode.touched = true;
  }

  if (Object.keys(changedFields).includes('areaId')) {
    fields = Object.assign({}, fields, {
      area: {
        value: props.property.city.areas.edges.find(
          area => area.node.id === fields.areaId.value,
        ).node,
        touched: true,
        dirty: false,
        errors: null,
        name: 'area',
      },
    });
  }

  if (Object.keys(changedFields).includes('shippingCity')) {
    fields.shippingCity.touched = true;
  }

  setEditedFields('address', fields);
  props.setFieldsHaveChanged();
  return true;
};

export default Form.create({ name: 'addressTab', onFieldsChange })(AddressTab);

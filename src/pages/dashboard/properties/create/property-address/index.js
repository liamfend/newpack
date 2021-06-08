import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Row, Col, Icon, Input } from 'antd';
import MyMap from '~components/my-map';


class PropertyAddress extends React.Component {
  constructor() {
    super();
    this.state = {
      showAddressSearch: false,
      showNoResult: false,
    };
    this.fieldsData = {
      search: null,
      city: null,
      country: null,
      countryShortName: null,
      addressLine: null,
      zipCode: null,
      coordinates: {
        value: {
          lat: 0,
          lng: 0,
        },
        action: 'default',
      },
    };

    this.belongsToChina = ['HK', 'TW', 'MO'];
  }

  componentDidMount() {
    // To init google address
    this.initGoogle();
    document.addEventListener('click', this.bindSearchBlur);
    if (this.props.propertyAddressData && Object.keys(this.props.propertyAddressData).length > 0) {
      this.props.form.setFieldsValue(this.props.propertyAddressData);
    }

    const target = document.querySelector('.property-create');
    target.addEventListener('scroll', () => {
      const googleDropdownList = document.querySelector('.pac-container');
      if (googleDropdownList.style.display !== 'none') {
        target.style.overflowY = 'hidden';
      }
    });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.bindSearchBlur);
    document.removeEventListener('googleApiMounted', this.initGoogle);
    const target = document.querySelector('.property-create');
    target.removeEventListener('scroll', () => {});

    this.autoComplete.input.removeEventListener('input', e => this.inputLocation(e, service));
    this.autoComplete.input.removeEventListener('focus', this.focusLocation);
  }

  initGoogle = () => {
    if (typeof google !== 'undefined') {
      const autocomplete = new google.maps.places.Autocomplete(this.autoComplete.input);

      autocomplete.addListener('place_changed', () => {
        this.handleSearchData(autocomplete.getPlace());
      });

      this.initSearchResult();
    } else {
      document.addEventListener('googleApiMounted', this.initGoogle);
    }
  }

  inputLocation = (e, service) => {
    const displaySuggestions = (_, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        this.state.showNoResult = true;
        const noResultDom = document.querySelector('.pac-container--no-result');
        if (!noResultDom) {
          this.addNoResultDom();
        }
      } else {
        this.state.showNoResult = false;
        this.removeNoResultDom();
      }
      this.setState(this.state);
    };

    if (e.target.value !== '') {
      service.getPlacePredictions({
        input: e.target.value,
      }, displaySuggestions);
    }
  };

  focusLocation = () => {
    if (this.state.showNoResult) {
      this.addNoResultDom();
    }
  };

  initSearchResult = () => {
    const service = new google.maps.places.AutocompleteService();

    this.autoComplete.input.addEventListener('input', e => this.inputLocation(e, service));
    this.autoComplete.input.addEventListener('focus', this.focusLocation);
  };

  handleSearchExpand = () => {
    if (!this.state.showAddressSearch) {
      this.setState({ showAddressSearch: true });
    }
  }

  bindSearchBlur = (e) => {
    if (this.state.showAddressSearch && this.searchContainer && !this.searchContainer.contains(e.target) && !this.props.form.getFieldValue('search')) {
      this.setState({ showAddressSearch: false });
    }
  }

  handleSearchData = (data) => {
    if (data.address_components &&
      data.formatted_address &&
      data.geometry.location &&
      data.geometry &&
      data.name
    ) {
      const { setFieldsValue, resetFields } = this.props.form;
      data.address_components.map((component) => {
        if (component.types.indexOf('country') !== -1 && this.belongsToChina.indexOf(component.short_name) !== -1) {
          this.fieldsData.city = component.long_name;
          this.fieldsData.country = 'China';
          this.fieldsData.countryShortName = component.short_name;
        } else {
          if (component.types.indexOf('postal_town') !== -1 || component.types.indexOf('locality') !== -1) {
            this.fieldsData.city = component.long_name;
          }
          if (component.types.indexOf('country') !== -1) {
            this.fieldsData.country = component.long_name;
            this.fieldsData.countryShortName = component.short_name;
          }
        }

        if (component.types.indexOf('postal_code') !== -1) {
          this.fieldsData.zipCode = component.long_name;
        }
        this.fieldsData.search = data.name;
        this.fieldsData.addressLine = data.formatted_address.replace(this.fieldsData.zipCode, '');
        this.fieldsData.coordinates.value.lat = data.geometry.location.lat();
        this.fieldsData.coordinates.value.lng = data.geometry.location.lng();
        this.fieldsData.coordinates.action = 'change';
        return true;
      });
      resetFields(['coordinates', 'zipCode', 'city', 'country', 'countryShortName', 'addressLine']);
      setFieldsValue(this.fieldsData);
    }
  }

  showScrollTab = () => {
    const target = document.querySelector('.property-create');
    target.style.overflowY = 'scroll';

    this.removeNoResultDom();
  }

  addNoResultDom = () => {
    const googleDropdownList = document.querySelectorAll('.pac-container');

    const newNoResultDom = document.createElement('div');
    newNoResultDom.className = 'pac-container pac-container--no-result';

    const pacItem = document.createElement('div');
    pacItem.addEventListener('click', () => {
      this.props.form.setFieldsValue({ search: '' });
    });

    pacItem.className = 'pac-item pac-item--no-result';
    pacItem.innerHTML = this.props.t('cms.message.auto_complete.no_result');

    newNoResultDom.appendChild(pacItem);

    if (googleDropdownList) {
      const { left, top } = googleDropdownList[googleDropdownList.length - 1].style;
      newNoResultDom.style.left = left;
      newNoResultDom.style.top = top;
    }

    document.body.appendChild(newNoResultDom);
  };

  removeNoResultDom = () => {
    const noResultDom = document.querySelector('.pac-container--no-result');

    if (noResultDom) {
      setTimeout(() => {
        noResultDom.remove();
      }, 150);
    }
  };

  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue, getFieldError } = this.props.form;

    return (
      <div className="property-address">
        <Form>
          {/* Need to consider */}
          <Row className="property-address__google-search-container" >
            <Col span={ 24 }>
              <div
                className={ classNames('property-address__search-container', {
                  'property-address__search-container--expand': this.state.showAddressSearch,
                }) }
                role={ 'presentation' }
                onClick={ this.handleSearchExpand }
                ref={ (node) => { this.searchContainer = node; } }
              >
                <div className={ classNames('property-address__search-icon-container', {
                  'property-address__search-icon-container--expand': this.state.showAddressSearch,
                }) }
                >
                  <Icon
                    type="search"
                    className={ classNames('property-address__search-icon', {
                      'property-address__search-icon--expand': this.state.showAddressSearch,
                    }) }
                  />
                  <Form.Item className={ classNames('property-address__search-autocomplete', {
                    'property-address__search-autocomplete--expand': this.state.showAddressSearch,
                  }) }
                  >
                    { getFieldDecorator('search', {})(
                      <Input
                        ref={ (node) => { this.autoComplete = node; } }
                        onBlur={ this.showScrollTab }
                      />,
                    ) }
                  </Form.Item>
                </div>
                <span className={ classNames('property-address__search-label', {
                  'property-address__search-label--expand': this.state.showAddressSearch,
                }) }
                >{ t('cms.properties.create.property_address.search_address') }</span>
              </div>
            </Col>
          </Row>

          <Row gutter={ 16 } className="property-address__row">
            <Col span={ 12 }>
              <label className="property-address__label">
                { t('cms.properties.create.property_address.address_line') }
              </label>
              <Form.Item>
                { getFieldDecorator('addressLine', {
                  rules: [{
                    required: true,
                    message: t('cms.properties.edit.error.blank'),
                  }],
                })(
                  <Input placeholder={ t('cms.properties.create.property_address.placeholder.address_line') } />,
                ) }
              </Form.Item>
            </Col>
            <Col span={ 12 }>
              <label className="property-address__label">
                { t('cms.properties.create.property_address.zip_code') }
              </label>
              <Form.Item>
                { getFieldDecorator('zipCode', {
                  rules: [{
                    required: true,
                    validator: (rule, value, callback) => {
                      if (value && /^[a-zA-Z0-9\-\s]+$/g.test(value)) {
                        callback();
                      } else if (value) {
                        callback(t('cms.properties.create.property_address.error.zipcode_invalid'));
                      } else {
                        callback(t('cms.properties.edit.error.blank'));
                      }
                    },
                  }],
                })(
                  <Input placeholder={ t('cms.properties.create.property_address.placeholder.zip_code') } />,
                ) }
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={ 16 } className="property-address__row">
            <Col span={ 12 }>
              <label className="property-address__label">
                { t('cms.properties.create.property_address.city') }
              </label>
              <Form.Item>
                { getFieldDecorator('city', {
                  rules: [{
                    required: true,
                    message: t('cms.properties.create.property_address.city_error'),
                  }],
                })(
                  <Input disabled placeholder={ t('cms.properties.create.property_address.placeholder.city') } />,
                ) }
              </Form.Item>
            </Col>
            <Col span={ 12 }>
              <label className="property-address__label">
                { t('cms.properties.create.property_address.country') }
              </label>
              <Form.Item>
                { getFieldDecorator('country', {
                  rules: [{
                    required: true,
                    message: t('cms.properties.create.property_address.country_error'),
                  }],
                })(
                  <Input disabled placeholder={ t('cms.properties.create.property_address.placeholder.country') } />,
                ) }
              </Form.Item>
              <Form.Item className="property-address__hidden">
                { getFieldDecorator('countryShortName', {})(
                  <Input type="hidden" />,
                ) }
              </Form.Item>
            </Col>
          </Row>

          <Row className="property-address__row">
            <Col span={ 24 }>
              {
                getFieldDecorator('coordinates', {
                  initialValue: {
                    value: {
                      lat: 0,
                      lng: 0,
                    },
                    action: 'default',
                  },
                  rules: [{
                    required: true,
                    validator: (rule, value, callback) => {
                      if (getFieldValue('coordinates').value.lat.toFixed(6) === '0.000000' &&
                      getFieldValue('coordinates').value.lng.toFixed(6) === '0.000000'
                      ) {
                        callback('error');
                      }
                      callback();
                    },
                    message: this.props.t('cms.properties.edit.address.weak_error'),
                  }],
                  trigger: 'onChange',
                })(
                  <MyMap
                    t={ this.props.t }
                    lastSearched={ {
                      lat: 0,
                      lng: 0,
                    } }
                    form={ this.props.form }
                    mapHeight={ '288px' }
                  />,
                )}
              <If condition={ getFieldError('coordinates') }>
                <span className="property-address__map-error ant-form-explain">
                  { this.props.t('cms.properties.edit.address.weak_error') }
                </span>
              </If>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

const PropertyAddressForm = Form.create({
  name: 'property_address_form',
  onFieldsChange: (props, changedFields) => {
    Object.keys(changedFields).map((key) => {
      if (!changedFields[key].errors) {
        if (key === 'coordinates' && !changedFields[key].value) {
          props.setPropertyData('propertyAddress', {
            [key]: {
              value: {
                lat: 0,
                lng: 0,
              },
              action: 'default',
            },
          });
        } else {
          props.setPropertyData('propertyAddress', {
            [key]: changedFields[key].value,
          });
        }
      }
      return true;
    });
  },

})(PropertyAddress);

PropertyAddress.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  propertyAddressData: PropTypes.object.isRequired,
  // setPropertyData: PropTypes.func.isRequired,
};

PropertyAddress.defaultProps = {
  t: () => {},
};

export default PropertyAddressForm;

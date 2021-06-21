import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, Form, Input, AutoComplete, message, Tooltip, Button } from 'antd';
import modal from '~components/modal';
import MyMap from '~components/my-map';
import * as universityActions from '~actions/location/university';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { communicationStatus } from '~constants';
import TableColumnSearch from '~components/table-column-search';
import { universityTextSearch, universityGeocoding } from '~helpers/google-map';

const mapStateToProps = state => ({
  university: state.dashboard.university.get('university').toJS(),
  communication: state.dashboard.university.get('communication').toJS().create,
});

const mapDispatchToProps = dispatch => ({
  checkUniversityExist: (slug, onSuccess) => {
    dispatch(universityActions.checkUniversityExist(slug, onSuccess));
  },
  createUniversity: (data) => {
    dispatch(universityActions.createUniversity(data));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@modal({ className: 'add-new-university-modal' }, true)
class AddNewUniversity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: null,
      showGoogleMap: false,
      showSearchAddresss: false,
      searchedCoordinate: {
        lat: 0,
        lng: 0,
      },
      isRepeated: false,
      noRepeated: false,
      isFetchingUniversity: false,
      universityExist: false,
      isFocus: false,
      results: [],
      cityId: null,
      cityName: null,
      isSave: false,
      university: {
        universityName: null,
        countryName: null,
        cityName: null,
        streetNumber: null,
        streetName: null,
        universityZipCode: null,
        universityAddress: null,
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.university.payload
      && this.props.university.payload !== nextProps.university.payload
    ) {
      this.setState({
        isRepeated: true,
        noRepeated: true,
      }, () => {
        this.props.form.validateFields(['universitySlug']);
      });
    }

    if (this.props.university.payload === null && nextProps.university.payload === null) {
      this.setState({
        isRepeated: false,
      });
    }

    if (
      nextProps.communication.status === communicationStatus.IDLE
        && this.props.communication.status === communicationStatus.FETCHING
    ) {
      message.success(this.props.t('cms.location.table.add_new.success', { tableType: 'University' }));
      this.props.createSuccess();
    }
  }

  handleImgOnError = () => {
    this.setState({
      showGoogleMap: false,
    });
  }

  handleSearchExpand = () => {
    this.setState({
      showSearchAddresss: true,
    });
  };

  handleImgOnload = () => {
    this.setState({
      showGoogleMap: true,
    });
  }

  textUniversitySearch = () => {
    const input = document.getElementById('cityName');
    const request = {
      types: ['(cities)'],
    };
    const service = new google.maps.places.Autocomplete(input, request);
    service.setFields(['address_component', 'place_id', 'geometry', 'name']);

    service.addListener('place_changed', () => { this.fillInAddress(service); });
  };

  fillInAddress = (autocomplete) => {
    const place = autocomplete.getPlace();
    const countryItem = place.address_components.find(item => item.types.includes('country'));

    if (place) {
      this.setState({
        searchedCoordinate: {
          lat: place.geometry ? place.geometry.location.lat() : 0,
          lng: place.geometry ? place.geometry.location.lng() : 0,
        },
        searchCountry: {
          name: countryItem ? countryItem.long_name : '',
          slug: countryItem ? countryItem.short_name : '',
        },
      });
    }
  }

  handleSearch = (slug, cityData) => {
    this.props.form.setFieldsValue({
      city: cityData.name,
    });

    if (cityData) {
      this.setState({
        cityId: cityData.id,
      });
    }
  }

  handleGenerateBtn = () => {
    this.setState({
      isSave: false,
    });
    const universityName = this.props.form.getFieldValue('universityName');
    if (universityName && this.isValidate(universityName)) {
      const generateSlug = universityName.trim().toLowerCase().replace(/\s+/g, '-');
      this.props.form.setFieldsValue({
        universitySlug: generateSlug,
      });

      this.setState({
        isFetchingUniversity: true,
        universityExist: false,
      });
      this.props.checkUniversityExist(generateSlug, (data) => {
        if (data && data.university) {
          this.props.form.setFields({
            universitySlug: {
              errors: [new Error(this.props.t('cms.location.table.add_new.slug_already_exists.message'))],
            },
          });
          this.state.universityExist = true;
        }

        this.state.isFetchingUniversity = false;
        this.setState(this.state);
      });
    } else {
      // If no name clear input and show error
      this.props.form.resetFields(['universitySlug']);
      this.props.form.validateFields(['universitySlug']);
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    const universitySlug = this.props.form.getFieldValue('universitySlug');

    if (!universitySlug && !this.props.form.getFieldsError(['universitySlug']).universitySlug) {
      this.setState({
        isSave: true,
      });
    }

    this.props.form.validateFields((err, values) => {
      if (!err && !this.state.isRepeated) {
        const universityData = {};
        universityData.name = values.universityName;
        universityData.slug = values.universitySlug;
        universityData.address = values.street.trim();
        universityData.published = false;
        universityData.zipCode = values.zipCode;
        universityData.cityId = this.state.cityId;

        if (values.coordinates.value && values.coordinates.value.lat) {
          universityData.latitude = values.coordinates.value.lat;
        }
        if (values.coordinates.value && values.coordinates.value.lng) {
          universityData.longitude = values.coordinates.value.lng;
        }

        this.props.createUniversity(universityData);
      }
    });
  }

  searchUniversity = (value) => {
    universityTextSearch(value).then((results) => {
      this.setState({
        results,
      });
    });

    this.setState({
      isRepeated: false,
      isSave: false,
    });
  }

  onUniversitySelect = (value) => {
    this.props.form.resetFields(['coordinates']);
    this.props.form.resetFields(['zipCode']);
    this.props.form.resetFields(['street']);

    if (value) {
      universityGeocoding(value).then((
        { country, city, location, address, zipCode, streetNumber, streetName },
      ) => {
        this.setState({
          university: {
            countryName: country,
            cityName: city,
            universityAddress: address,
            universityZipCode: zipCode,
            streetNumber,
            streetName,
          },
          searchedCoordinate: location,
        });

        this.props.form.setFieldsValue({
          street: `${streetNumber}  ${streetName}`.trim(),
          zipCode,
        });
      });
    }
  };

  isValidate = (value) => {
    if (value) {
      return (/^[A-Za-z\s0-9-]+$/g.test(value.trim()));
    }
    return false;
  };

  isCorrectSlug = (inputSlug) => {
    if (inputSlug) {
      if (!(/^[a-z0-9-]+$/g.test(inputSlug.trim()))) {
        return this.props.t('cms.location.table.add_new.slug.message');
      }
    }

    return false;
  }

  handleSlugFocus = () => {
    this.setState({
      isFocus: true,
    });
  }

  handleSlugBlur = () => {
    const universitySlug = this.props.form.getFieldValue('universitySlug');
    if (universitySlug) {
      const generateSlug = universitySlug.toLowerCase().replace(/\s+/g, '-');
      this.props.form.setFieldsValue({
        universitySlug: generateSlug,
      });
    }
    this.setState({
      isFetchingUniversity: true,
      universityExist: false,
    });
    this.props.checkUniversityExist(universitySlug, (data) => {
      if (data && data.university) {
        this.props.form.setFields({
          universitySlug: {
            errors: [new Error(this.props.t('cms.location.table.add_new.slug_already_exists.message'))],
          },
        });
        this.state.universityExist = true;
      }

      this.state.isFetchingUniversity = false;
      this.setState(this.state);
    });

    this.props.form.validateFields(['universitySlug']);
  }

  resetValue = (searchType) => {
    if (searchType === 'city') {
      this.props.form.resetFields(['city']);
    }
  }

  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsError } = this.props.form;
    const { searchedCoordinate } = this.state;
    return (
      <div className="add-new-university">
        <h2 className="add-new-university__title">
          {this.props.t('cms.location.table.add_new_university.button')}
        </h2>
        <button onClick={ this.props.onClose } className="add-new-university__close-btn">
          <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
        </button>
        <Form className="add-new-university__form" onSubmit={ this.handleSave }>
          <div className="add-new-university__form-left">
            <h3 className="add-new-university__general-title">
              <div className="add-new-university__general-title-block" />
              {t('cms.location.table.add_new.general')}
            </h3>

            <Form.Item>
              <span className="add-new-university__label">
                { t('cms.location.table.add_new.university_name') }
              </span>
              { getFieldDecorator('universityName', {
                rules: [
                  {
                    required: true,
                    message: t('cms.location.table.add_new.university_name.message'),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (value && value.length > 150) {
                        callback('error');
                      }
                      callback();
                    },
                    message: t('cms.location.table.add_new.university_name.error_length'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Input
                  placeholder={ t('cms.location.table.add_new.university_name.placeholder') }
                />
                ,
              )}
            </Form.Item>
            <Form.Item>
              <span
                className={ classNames('add-new-university__label', {
                  'add-new-university__label-disabled': !this.isValidate(getFieldValue('universityName')),

                }) }
              >
                { t('cms.location.table.add_new.university_slug') }
              </span>
              <Tooltip
                defaultVisible={ !getFieldValue('universitySlug') }
                placement="top"
                title={ getFieldValue('universitySlug') }
                overlayClassName="add-new-university__slug-tips"
              >
                {
                  getFieldDecorator('universitySlug', {
                    rules: [{
                      required: true,
                      message: t('cms.location.table.add_new.university_slug.placeholder'),
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (
                          (value && this.state.isRepeated) || this.isCorrectSlug(value)
                        ) {
                          callback(t('cms.location.table.add_new.slug.message'));
                        } else {
                          callback();
                        }
                      },
                    },
                    ],
                    trigger: 'onChange',
                  })(

                    <Input
                      disabled={
                        this.state.isSave ?
                          this.state.isSave :
                          !this.state.universityExist
                        && !getFieldsError(['universitySlug']).universitySlug
                        && (!getFieldValue('universityName') || this.isValidate(getFieldValue('universityName')))
                      }
                      className="add-new-university__city-slug"
                      placeholder={ t('cms.city.add_new_city.generate.placeholder') }
                      onBlur={ this.handleSlugBlur }
                      onFocus={ this.handleSlugFocus }
                      suffix={
                        <Button
                          className={ classNames('add-new-university__city-slug-btn', {
                            'add-new-university__city-slug-btn--disable': !this.isValidate(getFieldValue('universityName')),
                          }) }
                          onClick={ this.handleGenerateBtn }
                          disabled={ !this.isValidate(getFieldValue('universityName')) }
                        >
                          {t('cms.city.add_new_city.table.city_slug.btn_text')}
                        </Button>
                      }
                    />,
                  )}
              </Tooltip>
            </Form.Item>
            <Form.Item>
              <span className="add-new-university__label"> { t('cms.table.column.city') } </span>
              {
                getFieldDecorator('city', {
                  rules: [{
                    required: true,
                    message: t('cms.city.add_new_city.table.city_name.message'),
                  }],
                  trigger: 'onChange',
                })(
                  <TableColumnSearch
                    searchType="city"
                    isLocaitonCustom
                    showCountry
                    placeholder={ t('cms.location.table.add_new_area.search_city.placeholder') }
                    onSearch={ (slug, e) => { this.handleSearch(slug, e); } }
                    t={ t }
                    resetValue={ this.resetValue }
                  />
                  ,
                )}
            </Form.Item>
            <h3 className="add-new-university__address-title">
              <div className="add-new-university__address-title-block" />
              {t('cms.location.table.add_new.address')}
            </h3>
            <div
              className={ classNames('add-new-university__search-container', {
                'add-new-university__search-container--expand': this.state.showSearchAddresss,
              }) }
              role={ 'presentation' }
              onClick={ this.handleSearchExpand }
              ref={ (node) => { this.searchContainer = node; } }
            >
              <div className={ classNames('add-new-university__search-icon-container', {
                'add-new-university__search-icon-container--expand': this.state.showSearchAddresss,
              }) }
              >
                <Icon
                  type="search"
                  className={ classNames('add-new-university__search-icon', {
                    'add-new-university__search-icon--expand': this.state.showSearchAddresss,
                  }) }
                />
                <AutoComplete
                  className={ classNames('add-new-university__search-autocomplete', {
                    'add-new-university__search-autocomplete--expand': this.state.showSearchAddresss,
                  }) }
                  suffix={ <Icon type="search" /> }
                  style={ { height: 32 } }
                  onSelect={ (value, option) => { this.onUniversitySelect(value, option); } }
                  onChange={ this.searchUniversity }
                  placeholder={ t('cms.location.table.add_new.search_address.placeholder') }
                >
                  <If condition={ this.state.results && this.state.results.length > 0 }>
                    <For each="item" of={ this.state.results }>
                      <AutoComplete.Option key={ item.address }>{ item.name }</AutoComplete.Option>
                    </For>
                  </If>
                </AutoComplete>
              </div>
              <span className={ classNames('add-new-university__search-label', {
                'add-new-university__search-label--expand': this.state.showAddressSearch,
              }) }
              >{ t('cms.location.table.add_new.search_address.placeholder') }</span>
            </div>

            <Form.Item>
              <span className="add-new-university__label"> { t('cms.edit.details.label.street_address') } </span>
              { getFieldDecorator('street', {
                rules: [{
                  required: true,
                  message: t('cms.edit.details.label.street_address.message'),
                },
                {
                  validator: (rule, value, callback) => {
                    if (value.trim() === '') {
                      callback('error');
                    }
                    callback();
                  },
                  message: t('cms.edit.details.label.street_address.message'),
                },
                ],
                trigger: 'onChange',
              })(
                <Input
                  className="details-form__name-input"
                  placeholder={ t('cms.location.table.add_new.street.placeholder') }
                />,
              )}
            </Form.Item>
            <Form.Item>
              <span className="add-new-university__label"> { t('cms.location.table.add_new.zip_code') } </span>
              { getFieldDecorator('zipCode', {
                rules: [{
                  required: true,
                  message: t('cms.location.table.add_new.zip_code.message'),
                }],
                trigger: 'onChange',
              })(
                <Input
                  className="details-form__name-input"
                  placeholder={ t('cms.location.table.add_new.zipcode.placeholder') }
                />,
              )}
            </Form.Item>
          </div>
          <div className="add-new-university__map">
            <h3 className="add-new-university__general-title">
              <div className="add-new-university__general-title-block" />
              {t('cms.special_offer.create.state.map')}
            </h3>
            <span className="add-new-university__label">{t('cms.location.table.university.map.title')}</span>
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
                      value: { lat: searchedCoordinate.lat, lng: searchedCoordinate.lng },
                      action: 'default',
                    },
                    trigger: 'onChange',
                    rules: [{
                      required: true,
                      validator: (rule, value, callback) => {
                        if (this.map) {
                          if (value.value.lat.toFixed(6) === '0.000000' && value.value.lng.toFixed(6) === '0.000000' && value.action === 'default') {
                            callback('error');
                          }
                        }

                        callback();
                      },
                      message: t('cms.properties.edit.address.weak_error'),
                    }],
                  })(
                    <MyMap
                      t={ t }
                      zoom={ 14 }
                      lastSearched={ searchedCoordinate }
                      ref={ (node) => { this.map = node; } }
                      form={ this.props.form }
                      hiddenLabel
                      type="AddNewUniversity"
                      cityName={ this.state.university.cityName }
                      countryName={ this.state.university.countryName }
                    />,
                  )
                }
              </Form.Item>
            </If>
          </div>
          <hr className="add-new-city__line" />
          <button type="submit" className="add-new-city__save-btn">
            { t('cms.form.button.save') }
          </button>
        </Form>
      </div>
    );
  }
}

AddNewUniversity.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  university: PropTypes.object,
  communication: PropTypes.object,
  checkUniversityExist: PropTypes.func,
  createUniversity: PropTypes.func,
  createSuccess: PropTypes.func.isRequired,
};
AddNewUniversity.defaultProps = {
  t: () => {},
  university: {},
  communication: {},
  checkUniversityExist: () => {},
  createUniversity: () => {},
  createSuccess: () => {},
};

const AddNewUniversityForm = Form.create()(AddNewUniversity);

export default AddNewUniversityForm;

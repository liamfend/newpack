import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Button, Icon, Select, Form, Input, message } from 'antd';
import modal from '~components/modal';
import MyMap from '~components/my-map';
import * as countryActions from '~actions/location/country';
import * as cityActions from '~actions/location/city';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { communicationStatus } from '~constants';

const mapStateToProps = state => ({
  countryList: state.dashboard.country.get('list').toJS(),
  communication: state.dashboard.city.get('communication').toJS().create,
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(countryActions.initialize());
  },

  getNoPropertiescountriesList: (filters) => {
    dispatch(countryActions.getNoPropertiescountriesList(filters));
  },

  createCity: (input) => {
    dispatch(cityActions.createCity(input));
  },

  checkCityExist: (slug, onSuccess) => {
    dispatch(cityActions.checkCityExist(slug, onSuccess));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@modal({ className: 'add-new-city-modal' }, true)
class AddNewCity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearchCity: false,
      isFetchingCity: false,
      cityExist: false,
      showGoogleMap: false,
      searchedCoordinate: {
        lat: 0,
        lng: 0,
      },
      searchCountry: {
        name: null,
        slug: null,
      },
      isRepeated: false,
      isFocus: false,
      isSave: false,
    };
  }

  componentDidMount() {
    this.props.initialize();
    this.props.getNoPropertiescountriesList({ pageNumber: 1, pageSize: 999 });
    document.addEventListener('googleApiMounted', this.textCitySearch);
  }

  componentWillUnmount() {
    document.removeEventListener('googleApiMounted', this.textCitySearch);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.communication.status === communicationStatus.IDLE
        && this.props.communication.status === communicationStatus.FETCHING
    ) {
      message.success(this.props.t('cms.location.table.add_new.success', { tableType: 'City' }));
      this.props.createSuccess();
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

  textCitySearch = () => {
    const input = document.getElementById('cityName');
    const request = {
      types: ['(cities)'],
    };
    const service = new google.maps.places.Autocomplete(input, request);
    service.setFields(['address_component', 'place_id', 'geometry', 'name']);
    service.addListener('place_changed', () => {
      this.fillInAddress(service);
    });
  };

  fillInAddress = (autocomplete) => {
    this.props.form.resetFields(['coordinates']);
    const place = autocomplete.getPlace();
    this.props.form.resetFields(['citySlug']); // Will reset slug when name change

    if (place && place.address_components) {
      const countryItem = place.address_components.find(item => item.types.includes('country'));
      this.setState({
        isSearchCity: true,
        searchCountry: {
          name: countryItem ? countryItem.long_name : '',
          slug: countryItem ? countryItem.short_name : '',
        },
        searchedCoordinate: {
          lat: place.geometry ? place.geometry.location.lat() : 0,
          lng: place.geometry ? place.geometry.location.lng() : 0,
        },
      });
    }

    this.props.form.setFieldsValue({
      cityName: place.name,
    });
  }

  handleSearch = () => {
    this.props.form.resetFields(['citySlug']); // Will reset slug when name change
    this.setState({
      isRepeated: false,
      cityExist: false,
      isSave: false,
    });
  }

  handleGenerateBtn = () => {
    this.setState({
      isSave: false,
    });
    const cityName = this.props.form.getFieldValue('cityName');
    if (cityName && this.isValidate(cityName)) {
      const generateSlug = cityName.trim().toLowerCase().replace(/\s+/g, '-');
      this.props.form.setFieldsValue({
        citySlug: generateSlug,
      });

      this.setState({
        isFetchingCity: true,
        cityExist: false,
      });
      this.props.checkCityExist(generateSlug, (data) => {
        if (data && data.city) {
          this.props.form.setFields({
            citySlug: {
              errors: [new Error(this.props.t('cms.location.table.add_new.slug_already_exists.message'))],
            },
          });
          this.state.cityExist = true;
        }

        this.state.isFetchingCity = false;
        this.setState(this.state);
      });
    } else {
      // If no name clear input and show error
      this.props.form.resetFields(['citySlug']);
      this.props.form.validateFields(['citySlug']);
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    const citySlug = this.props.form.getFieldValue('citySlug');

    if (!citySlug && !this.props.form.getFieldsError(['citySlug']).citySlug) {
      this.setState({
        isSave: true,
      });
    }

    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err && !this.state.isRepeated) {
        const cityData = {};
        cityData.name = values.cityName;
        cityData.slug = values.citySlug;
        if (this.props.countryList.payload && this.props.countryList.payload.length > 0) {
          const countryData =
          this.props.countryList.payload.find(item => item.name === values.country);
          cityData.countryId = countryData.id;
        }
        cityData.latitude = values.coordinates.value.lat;
        cityData.longitude = values.coordinates.value.lng;

        this.props.createCity(cityData);
      }
    });
  }

  handleSlugFocus = () => {
    this.setState({
      isFocus: true,
    });
  }

  handleSlugBlur = () => {
    const citySlug = this.props.form.getFieldValue('citySlug');
    if (citySlug) {
      const generateSlug = citySlug.toLowerCase().replace(/\s+/g, '-');
      this.props.form.setFieldsValue({
        citySlug: generateSlug,
      });
    }
    this.setState({
      isFetchingCity: true,
      cityExist: false,
    });
    this.props.checkCityExist(citySlug, (data) => {
      if (data && data.city) {
        this.props.form.setFields({
          citySlug: {
            errors: [new Error(this.props.t('cms.location.table.add_new.slug_already_exists.message'))],
          },
        });
        this.state.cityExist = true;
      }

      this.state.isFetchingCity = false;
      this.setState(this.state);
    });

    this.props.form.validateFields(['citySlug']);
  }

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

  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsError } = this.props.form;
    const { searchedCoordinate, country } = this.state;
    return (
      <div className="add-new-city">
        <h2 className="add-new-city__title">
          {this.props.t('cms.location.table.add_new_city.button')}
        </h2>
        <button onClick={ this.props.onClose } className="add-new-city__close-btn">
          <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
        </button>
        <Form className="add-new-city__form" onSubmit={ this.handleSave }>
          <div className="add-new-city__form-left">
            <Form.Item>
              <span className="add-new-city__label">{ t('cms.table.header.city_name') }</span>
              { getFieldDecorator('cityName', {
                rules: [
                  {
                    required: true,
                    message: t('cms.city.add_new_city.table.city_name.message'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Input
                  className="add-new-city__name-input"
                  suffix={ <Icon type="search" /> }
                  onChange={ this.handleSearch }
                  placeholder={ t('cms.location.table.add_new.search_city.placeholder') }
                />,
              )}
            </Form.Item>
            <Form.Item>
              <span
                className={ classNames('add-new-city__label', {
                  'add-new-city__label-disabled': !this.isValidate(getFieldValue('cityName')),

                }) }
              >
                { t('cms.table.header.city_slug') }
              </span>
              {
                getFieldDecorator('citySlug', {
                  rules: [{
                    required: true,
                    message: t('cms.city.add_new_city.table.city_slug.placeholder'),
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
                  validateTrigger: 'onBlur',
                })(

                  <Input
                    disabled={
                      this.state.isSave ?
                        this.state.isSave :
                        !this.state.cityExist
                      && !getFieldsError(['citySlug']).citySlug
                      && (!getFieldValue('cityName') || this.isValidate(getFieldValue('cityName')))
                    }
                    className="add-new-city__city-slug"
                    placeholder={ t('cms.city.add_new_city.generate.placeholder') }
                    onBlur={ this.handleSlugBlur }
                    onFocus={ this.handleSlugFocus }
                    suffix={
                      <Button
                        className={ classNames('add-new-city__city-slug-btn', {
                          'add-new-city__city-slug-btn--disable': !this.isValidate(getFieldValue('cityName')),
                        }) }
                        onClick={ this.handleGenerateBtn }
                        disabled={ !this.isValidate(getFieldValue('cityName')) }
                      >
                        { t('cms.city.add_new_city.table.city_slug.btn_text') }
                      </Button>
                    }
                  />,
                )}
            </Form.Item>
            <Form.Item>
              <div className="filter">
                <div>
                  <span className="add-new-city__label"> { t('cms.table.column.country') } </span>
                  {
                    getFieldDecorator('country', {
                      rules: [{
                        required: true,
                        message: t('cms.city.add_new_city.table.country_name.message'),
                      }],
                      initialValue: getFieldValue('country'),
                      trigger: 'onChange',
                    })(
                      <Select
                        placeholder={ t('cms.city.add_new_city.table.country_name.placeholder') }
                        className="add-new-city__select"
                      >
                        <For of={ this.props.countryList.payload } each="country">
                          <Select.Option
                            key={ country.originalName }
                            value={ country.originalName }
                          >
                            { country.originalName }
                          </Select.Option>
                        </For>
                      </Select>,
                    )}
                </div>
              </div>
            </Form.Item>
          </div>
          <div className="add-new-city__map">
            <span className="add-new-city__label">{t('cms.city.add_new_city.table.map.title')}</span>
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
                      zoom={ 8 }
                      lastSearched={ searchedCoordinate }
                      ref={ (node) => { this.map = node; } }
                      form={ this.props.form }
                      hiddenLabel
                      disabled
                      type="addNewCity"
                      countryName={ this.state.searchCountry.name }
                      mapHeight={ '15rem' }
                    />,
                  )
                }
              </Form.Item>
            </If>
          </div>
          <hr className="add-new-city__line" />
          <button
            type="submit"
            className={ classNames('add-new-city__save-btn', {
              'add-new-city__save-btn--disabled': this.state.isFetchingCity,
            }) }
            disabled={ this.state.isFetchingCity }
          >
            { t('cms.form.button.save') }
          </button>
        </Form>
      </div>
    );
  }
}

AddNewCity.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  countryList: PropTypes.object,
  initialize: PropTypes.func,
  createCity: PropTypes.func,
  communication: PropTypes.object,
  getNoPropertiescountriesList: PropTypes.func,
  createSuccess: PropTypes.func,
  checkCityExist: PropTypes.func,
};
AddNewCity.defaultProps = {
  t: () => {},
  initialize: () => {},
  getNoPropertiescountriesList: () => {},
  countryList: {},
  createCity: () => {},
  communication: {},
  createSuccess: () => {},
  checkCityExist: () => {},
};

const AddNewCityForm = Form.create('add_new_city_form')(AddNewCity);

export default AddNewCityForm;

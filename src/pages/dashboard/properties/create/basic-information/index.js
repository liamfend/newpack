import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Tooltip, Icon } from 'antd';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import Svg from '~components/svg';
import TableColumnSearch from '~components/table-column-search';
import CurrencyBar from '~components/currency-bar';


@withTranslation()

class BasicInformation extends React.Component {
  constructor() {
    super();

    this.autoInputValue = {
      cityValue: '',
      landlordValue: '',
    };

    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.basicInfo && Object.keys(this.props.basicInfo).length > 0) {
      this.props.form.setFieldsValue({
        name: this.props.basicInfo.name,
        city: this.props.basicInfo.city.slug,
        landlord: this.props.basicInfo.landlord.name,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(this.props.basicInfo) !== JSON.stringify(nextProps.basicInfo) &&
      nextProps.basicInfo.landlord
    ) {
      this.props.form.setFieldsValue({
        landlord: nextProps.basicInfo.landlord.name,
      });
    }
  }

  handleSearch = (slug, value, type = true) => {
    if (type === 'landlord') {
      this.props.form.setFieldsValue({
        landlord: value.name,
      });
      this.props.setPropertyData('basicInfo', {
        landlord: value,
      }, true);
    } else {
      this.props.form.setFieldsValue({
        city: slug || '',
      });
      this.props.setPropertyData('basicInfo', {
        city: value,
      }, true);
    }
  }

  changeCurrencyState = (state, data) => {
    this.props.setCountryData(state, data);
    this.props.setPropertyData('basicInfo', {
      countryData: data,
    });
  }

  resetValue = (searchType) => {
    if (searchType === 'city') {
      this.props.form.resetFields(['city']);
    } else {
      this.props.form.resetFields(['landlord']);
    }
  }

  saveSearchValue = (value, searchType) => {
    this.props.changeLeaveAlert();
    if (searchType === 'city') {
      this.autoInputValue.cityValue = value;
    } else {
      this.autoInputValue.landlordValue = value;
    }
  }

  typeSelect = (index) => {
    this.props.handleApartmentType(index);
    this.props.changeLeaveAlert();
    this.setState({ apartmentIndex: index });
  }

  render() {
    const { t, apartmentIndex, basicInfo, countryData, propertyType } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;

    return (
      <div className={ 'basic-info' }>
        <div className="basic-info__apartment-container">
          <span className="basic-info__label">
            { t('cms.properties.create.basic_information.apartment_type') }
          </span>
          <div className="basic-info__apartment-box">
            <div className="basic-info__apartment">
              <For index="index" each="item" of={ propertyType }>
                <div key={ index } className="basic-info__apartment-item">
                  <span role="button" tabIndex={ 0 } className={ classNames('basic-info__apartment-border', { 'basic-info__apartment-border--green': index === apartmentIndex }) } onClick={ () => this.typeSelect(index) }>
                    <Svg
                      className={ classNames('basic-info__apartment-type', { 'basic-info__apartment-type--green': index === apartmentIndex }) }
                      hash={ item.toLowerCase().replace('_', '-') }
                    />
                    <If condition={ index === apartmentIndex }>
                      <span className="basic-info__apartment-tick">
                        <Svg hash="create-tick" className="basic-info__check" />
                      </span>
                    </If>
                  </span>
                  <div className="basic-info__apartment-text">
                    { t(`cms.properties.create.basic_information.apartment.type.${item.toLowerCase()}`) }
                  </div>
                </div>
              </For>
            </div>
            <If condition={ apartmentIndex === 100 }>
              <div className="basic-info__apartment-error">
                {t('cms.properties.edit.error.blank')}
              </div>
            </If>
          </div>
        </div>
        <Form className="basic-info__form">
          <Form.Item>
            <span className="basic-info__label">
              { t('cms.properties.create.basic_information.apartment_name_label') }
            </span>
            {
              getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: t('cms.properties.edit.error.blank'),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const emojiRegex = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
                      if (value && emojiRegex.test(value)) {
                        callback('error');
                      }
                      callback();
                    },
                    message: t('cms.properties.create.create_confirmation.error_emoji'),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (value && value.length > 250) {
                        callback('error');
                      }
                      callback();
                    },
                    message: t('cms.properties.create.create_confirmation.error_length'),
                  },
                ],
                validateTrigger: 'onBlur',
              })(
                <Input
                  placeholder={ t('cms.properties.create.basic_information.apartment_name_placeholder') }
                  onChange={ this.props.changeLeaveAlert }
                />,
              )
            }
          </Form.Item>
          <Form.Item>
            <div className="basic-info__city" ref={ (node) => { this.basicInfoCity = node; } }>
              <span className="basic-info__label">
                { t('cms.properties.create.basic_information.apartment_city_label') }
                <Tooltip title={ t('cms.properties.create.basic_information.apartment_city_tooltip') } placement="right">
                  <Icon className="basic-info__circle" type="exclamation-circle" />
                </Tooltip>
              </span>
              {
                getFieldDecorator('city', {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (this.autoInputValue.cityValue && !getFieldValue('city')) {
                          callback('error');
                        }
                        callback();
                      },
                      message: t('cms.properties.create.basic_information.apartment_city_invalid'),
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (!getFieldValue('city')) {
                          callback('error');
                        }
                        callback();
                      },
                      message: t('cms.properties.edit.error.blank'),
                    },
                  ],
                  trigger: 'onChange',
                })(
                  <TableColumnSearch
                    searchType="city"
                    publishedStatus="PUBLISHED"
                    isLocaitonCustom
                    showCountry
                    onSearch={ (slug, value, type) => { this.handleSearch(slug, value, type); } }
                    t={ t }
                    changeCurrencyState={ this.changeCurrencyState }
                    placeholder={ t('cms.properties.create.basic_information.apartment_city_placeholder') }
                    basicType="basicCity"
                    valueData={ basicInfo.city ? `${basicInfo.city.name}, ${basicInfo.city.countryName}` : '' }
                    resetValue={ this.resetValue }
                    saveSearchValue={ this.saveSearchValue }
                    parrentNode={ this.basicInfoCity }
                  />,
                )
              }
              <CurrencyBar
                t={ t }
                countryData={ countryData.data ? countryData.data : null }
              />
            </div>
          </Form.Item>
          <Form.Item>
            <div className="filter">
              <div className="basic-info__landlord" ref={ (node) => { this.basicInfoLandlord = node; } }>
                <span className="basic-info__label"> { t('cms.properties.create.basic_information.apartment_landlord_label') }
                  <Tooltip title={ t('cms.properties.create.basic_information.apartment_landlord_tooltip') } placement="right">
                    <Icon className="basic-info__circle" type="exclamation-circle" />
                  </Tooltip>
                </span>
                {
                  getFieldDecorator('landlord', {
                    rules: [{
                      validator: (rule, value, callback) => {
                        if (this.autoInputValue.landlordValue && !getFieldValue('landlord')) {
                          callback('error');
                        }
                        callback();
                      },
                      message: t('cms.properties.create.basic_information.apartment_landlord_invalid'),
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (!getFieldValue('landlord')) {
                          callback('error');
                        }
                        callback();
                      },
                      message: t('cms.properties.edit.error.blank'),
                    }],
                    trigger: 'onChange',
                  })(
                    <TableColumnSearch
                      searchType="landlord"
                      isLocaitonCustom
                      onSearch={ (slug, value, type) => { this.handleSearch(slug, value, type); } }
                      t={ t }
                      placeholder={ t('cms.properties.create.basic_information.apartment_landlord_placeholder') }
                      valueData={ basicInfo.landlord ? basicInfo.landlord.name : '' }
                      resetValue={ this.resetValue }
                      saveSearchValue={ this.saveSearchValue }
                      parrentNode={ this.basicInfoLandlord }
                    />,
                  )}
              </div>
            </div>
          </Form.Item>
        </Form>
        <If condition={ false }>
          <div className="basic-info__tips">
            <div className="basic-info__tips-title">
              <Svg
                className="basic-info__tips-icon"
                hash="create-tips"
              />
              <span className="basic-info__tips-text">
                {t('cms.properties.create.basic_information.apartment_tips_title')}
              </span>
            </div>
            <div className="basic-info__tips-content">
              {t('cms.properties.create.basic_information.apartment_tips_content')}
            </div>
          </div>
        </If>
      </div>
    );
  }
}

BasicInformation.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  handleApartmentType: PropTypes.func.isRequired,
  basicInfo: PropTypes.object.isRequired,
  setPropertyData: PropTypes.func.isRequired,
  apartmentIndex: PropTypes.number,
  setCountryData: PropTypes.func.isRequired,
  countryData: PropTypes.object.isRequired,
  propertyType: PropTypes.array.isRequired,
  changeLeaveAlert: PropTypes.func.isRequired,
};

BasicInformation.defaultProps = {
  t: () => {},
  apartmentIndex: null,
};

const BasicInformationForm = Form.create({
  name: 'basic_information_form',
  onFieldsChange: (props, changedFields) => {
    Object.keys(changedFields).map((key) => {
      if (!changedFields[key].errors) {
        if (key === 'name' && props.basicInfo
        && props.basicInfo.name !== changedFields[key].value) {
          props.setPropertyData('basicInfo', {
            [key]: changedFields[key].value,
          }, true);
        }
      }
      return true;
    });
  },
})(BasicInformation);

export default BasicInformationForm;

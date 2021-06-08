import React from 'react';
import PropTypes from 'prop-types';
import { Input, Select } from 'antd';
import countries from '~constants/countries';

export default class PhoneNumber extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.phoneSplitor(props.value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      if (nextProps.value !== this.phoneJoin(this.state)) {
        this.setState(this.phoneSplitor(nextProps.value));
      }
    }
  }

  phoneSplitor = (phone) => {
    const { countrySlug } = this.props;
    const country = countries.list.find(item => item.iso2Code === countrySlug);

    if (!phone) {
      return {
        phoneCode: country ? country.phoneCode : '+86',
        phoneNumber: '',
      };
    }
    const index = phone.indexOf(' ');
    if (index < 0) {
      return {
        phoneCode: country ? country.phoneCode : '+86',
        phoneNumber: phone,
      };
    }
    return {
      phoneCode: phone.substr(0, index),
      phoneNumber: phone.substr(index + 1, phone.length - index - 1),
    };
  }

  phoneJoin = ({ phoneCode, phoneNumber }) => {
    if (phoneNumber) return `${phoneCode} ${phoneNumber}`;
    return `${phoneCode} `;
  }

  getPhoneCodeSelector = () => (
    <Select
      style={ { width: 100 } }
      value={ this.state.phoneCode }
      onChange={ this.handleSelectorChange }
    >
      <For index="index" each="item" of={ countries.list }>
        <Select.Option value={ item.phoneCode } key={ index }>{item.phoneCode}</Select.Option>
      </For>
    </Select>
  )

  handleInputChange=(value) => {
    if (isNaN(value)) {
      return;
    }
    this.state.phoneNumber = value;
    this.setState(this.state);
    this.props.onChange(this.phoneJoin(this.state));
  }

  handleSelectorChange = (value) => {
    this.state.phoneCode = value;
    this.setState(this.state);
    this.props.onChange(this.phoneJoin(this.state));
    this.props.checkValid();
  }

  render() {
    const { t, checkValid } = this.props;
    return (
      <Input
        placeholder={ t('cms.properties.edit.others.phone_number') }
        value={ this.state.phoneNumber }
        onChange={ (e) => { this.handleInputChange(e.target.value); } }
        onBlur={ checkValid }
        addonBefore={ this.getPhoneCodeSelector() }
      />
    );
  }
}

PhoneNumber.propTypes = {
  t: PropTypes.func.isRequired,
  checkValid: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.string,
  countrySlug: PropTypes.string,
};

PhoneNumber.defaultProps = {
  t: () => { },
  checkValid: () => {},
  onChange: () => {},
  value: '',
  countrySlug: '',
};

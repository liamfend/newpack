import { Radio, DatePicker } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import { endDate } from '~constants';
import moment from 'moment';

const RadioGroup = Radio.Group;

export default class EndDatePicker extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return nextProps.value || {};
    }
    return null;
  }

  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      hasEndDate: value.hasEndDate || endDate.yes,
      endDateValue: value.endDateValue || undefined,
    };
  }

  handleRadioChange = (e) => {
    if (!('value' in this.props)) {
      this.setState({
        hasEndDate: e.target.value,
      });
    }
    const hasEndDate = e.target.value;
    this.triggerChange({ hasEndDate });
  }

  triggerChange = (changedValue) => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }

  disabledEndDate = (endValue) => {
    const startValue = this.props.startDate;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  handlePickerChange = (value) => {
    if (!('value' in this.props)) {
      this.setState({
        endDateValue: value,
        hasEndDate: endDate.yes,
      });
    }
    const endDateValue = value;
    const hasEndDate = endDate.yes;
    this.triggerChange({ endDateValue, hasEndDate });
  }

  render() {
    return (
      <div>
        <RadioGroup defaultValue={ this.props.value.hasEndDate } onChange={ this.handleRadioChange } className="create-offer-content__radio" >
          <Radio value={ endDate.yes }>{this.props.t('cms.special_offer.form.select_date')}</Radio>
          <Radio value={ endDate.no }>{this.props.t('cms.special_offer.form.open_date')}</Radio>
        </RadioGroup>
        <If condition={ this.props.value.hasEndDate === endDate.yes }>
          <div className="special-offer__map-admin-picker">
            <DatePicker
              defaultValue={ this.props.value.endDateValue }
              className="create-offer-content__input"
              onChange={ this.handlePickerChange }
              disabledDate={ this.disabledEndDate }
              format={ 'DD/MM/YYYY' }
            />
          </div>
        </If>
      </div>
    );
  }
}

EndDatePicker.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.object, // eslint-disable-line
  startDate: PropTypes.object,
};

EndDatePicker.defaultProps = {
  t: () => {},
  onChange: () => {},
  startDate: moment(),
};

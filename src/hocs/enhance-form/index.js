import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

const enhanceForm = () => Component => class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      changeFields: {},
    };
    this.form = Form.create({
      onFieldsChange: this.onFieldsChange,
    })(Component);
  }

  static propTypes = {
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: null,
  };
  // address: {
  //   name: "address"
  //   value: "tim test address 0416ae"
  //   touched: true
  //   dirty: false
  // }
  // =>
  // address: "tim test address 0416ae"
  formatChangeFields = (changedFields) => {
    const formatedFields = {};
    Object.keys(changedFields).forEach((key) => {
      formatedFields[key] = changedFields[key].value;
    });
    return formatedFields;
  }

  onFieldsChange = (_, changedFields) => {
    const changeFields = Object.assign(
      {},
      this.state.changeFields,
      this.formatChangeFields(changedFields),
    );
    this.setState({
      changeFields,
    });

    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  render() {
    const EnhanceForm = this.form;
    return <EnhanceForm { ...this.props } changeFields={ this.state.changeFields } />;
  }
};

export default enhanceForm;

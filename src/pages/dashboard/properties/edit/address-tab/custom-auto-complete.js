import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Input, Icon, AutoComplete } from 'antd';
import { debounce } from '~helpers/throttle';
import { textSearch, geocoding } from '~helpers/google-map';

const Option = AutoComplete.Option;
export default class CustomAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
      dataSource: [],
      googleMapApiData: [],
      autoCompleteValue: props.defaultInputValue,
      value: props.value,  // eslint-disable-line
    };
    this.autocompleteSearchDebounced = debounce(500, this.handleSearch);
    this.autoCompleteRef = null;
  }

  changeQuery = (value) => {
    this.autocompleteSearchDebounced(value);
  }

  addAddressManually = (e) => {
    e.preventDefault();
    this.props.handleSelect(null);
  }

  handleSelect = (value, option) => {
    const selected = option.props.object;
    if (selected) {
      if (selected.address) {
        geocoding(selected.address).then(({ address, zipCode, shippingCity }) => {
          this.props.handleSelect({ location: selected.location, zipCode, shippingCity });
          this.props.onChange(address);
          this.setState({ value: address });
        }).catch(() => {
          this.props.handleSelect({ location: selected.location });
          this.props.onChange(selected.address);
          this.setState({ value: selected.address });
        });
      } else {
        // comfirm add address option
        this.props.handleSelect(null);
      }
    }
  }

  textWrapper =(text, keyword) => {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index > -1) {
      const matched = text.slice(index, index + keyword.length);
      return text.replace(matched, `<b>${matched}</b> `);
    }
    return text;
  }

  generateSelectorOptions = (searchText, results) => results.map((item, index) => (
    <Option
      key={ item.id }
      value={ Array(index + 1).fill(' ').join('') }
      object={ item }
    >
      <span
        className="certain-search-item"
      >
        <span
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={ {
            __html: this.textWrapper(item.name, searchText),
          } }
        />
      </span>
    </Option>
  )).concat([
    <Option
      key="all"
      className="show-all"
      value={ searchText }
      object={ {} }
    >
      <a
        href=""
        rel="noopener noreferrer"
        onClick={ this.addAddressManually }
      >
        {this.props.t('cms.properties.edit.address.add_manually')}
      </a>
    </Option>,
  ]);

  generateSelectorLoading = () => [(
    <Option className="show-all" key="loading" value="loading">
      {this.props.t('cms.properties.edit.address.loading')}
    </Option>)]

  handleSearch = (value) => {
    if (!value) {
      this.setState({
        dataSource: [],
      });
      return;
    }
    this.setState({
      dataSource: this.generateSelectorLoading(),
    });
    textSearch(value, this.props.location).then((results) => {
      this.setState({
        dataSource: this.generateSelectorOptions(value, results),
      });
    });
  }

  handleChange = (value) => {
    this.setState({
      autoCompleteValue: value,
      value,
    });
    this.props.onChange(value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSearching === true && this.props.isSearching === false) {
      this.setState({
        autoCompleteValue: this.state.value,
        showOptions: true,
        dataSource: [] }, () => {
        this.autoCompleteRef.props.onSearch(this.state.value);
      });
    }
  }

  inputChange = (e) => {
    this.setState({ value: e.target.value });
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
  }

  handleFocus = () => {
    this.setState({ showOptions: true });
  }

  handleBlur =() => {
    this.setState({ showOptions: false });
  }

  render() {
    const { t, isSearching } = this.props;
    return (
      <div className="certain-category-search">
        <If condition={ isSearching }>
          <AutoComplete
            ref={ (component) => { this.autoCompleteRef = component; } }
            dropdownClassName="certain-category-search-dropdown"
            dropdownMatchSelectWidth
            style={ { height: '32px' } }
            dataSource={ this.state.dataSource }
            placeholder={ t('cms.properties.edit.address.auto_complete_hint') }
            optionLabelProp="value"
            onSelect={ this.handleSelect }
            onSearch={ this.changeQuery }
            onChange={ this.handleChange }
            value={ this.state.autoCompleteValue }
            defaultValue={ this.state.autoCompleteValue }
            open={ this.state.showOptions }
          >
            <Input
              suffix={ <Icon type="search" /> }
              onFocus={ this.handleFocus }
              onBlur={ this.handleBlur }
            />
          </AutoComplete>
        </If>
        <Input
          className={ classNames({ 'certain-category-search--hide': isSearching }) }
          placeholder={ t('cms.properties.edit.address.address_line_hint') }
          value={ this.state.value }
          onChange={ this.inputChange }
        />
      </div>
    );
  }
}

CustomAutoComplete.propTypes = {
  t: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  defaultInputValue: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  isSearching: PropTypes.bool,
  onChange: PropTypes.func,
};

CustomAutoComplete.defaultProps = {
  t: () => {},
  handleSelect: () => {},
  defaultInputValue: '',
  location: {},
  isSearching: true,
  onChange: () => {},
};

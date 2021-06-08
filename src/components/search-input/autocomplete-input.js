import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const placeTypes = {
  address: 'address',
  city: '(cities)',
  country: '(regions)',
};

export default class AutocompleteInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNoResult: false,
      inputValue: props.value || '',
    };
  }

  componentDidMount() {
    document.addEventListener('googleApiMounted', this.searchGoogleMap);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ inputValue: nextProps.value });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('googleApiMounted', this.searchGoogleMap);
  }

  handleInputBlur = () => {
    this.setState({
      showNoResult: false,
    });
  }

  searchGoogleMap = () => {
    if (this.autoComplete && this.autoComplete.input) {
      this.searchAddressService =
        new google.maps.places.Autocomplete(this.autoComplete.input, {
          types: [placeTypes[this.props.type]],
        });

      this.searchAddressService.addListener('place_changed', () => {
        // google return result refers to:
        // https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
        const place = this.searchAddressService.getPlace();

        const country = place.address_components.find(address => address.types.includes('country'));
        if (this.props.type === 'country' && country) {
          this.setState({ inputValue: country.long_name });
          this.props.onChange(country.long_name);
        } else {
          this.setState({ inputValue: place.name });
          this.props.onChange(place.name);
        }
        this.props.onSelect(place);
      });
    }
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
    this.props.onChange(e.target.value);
  }

  render() {
    const { t, inputProps } = this.props;
    return (
      <div className={ 'autocomplete-input' } >
        <Input
          ref={ (node) => { this.autoComplete = node; } }
          onBlur={ this.handleInputBlur }
          onChange={ this.handleInputChange }
          value={ this.state.inputValue }
          { ...inputProps }
        />
        <If condition={ this.state.showNoResult }>
          <div className="pac-container pac-container--no-result">
            <div className="pac-item pac-item--no-result">
              {t('cms.message.auto_complete.no_result')}
            </div>
          </div>
        </If>
      </div>
    );
  }
}


AutocompleteInput.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  type: PropTypes.oneOf(['address', 'city', 'country']).isRequired,
  inputProps: PropTypes.object,
  value: PropTypes.string,
};

AutocompleteInput.defaultProps = {
  t: () => {},
  onChange: () => {},
  onSelect: () => {},
  type: 'address',
  inputProps: {},
  value: '',
};

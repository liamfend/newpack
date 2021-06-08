import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Row, Col } from 'antd';
import { compose, withProps, lifecycle, withState } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import { fireCustomEvent } from '~helpers/custom-events';

const MyMap = compose(
  withProps(props => ({
    loadingElement: <div style={ { height: props.mapHeight } } />,
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAo3z-iOKf-Mto5TsHcsjXylWdxCt7zZDk&v=3.exp&libraries=geometry,drawing,places&language=en-GB&region=GB',
    containerElement: <div style={ { position: 'relative' } } />,
    mapElement: <div style={ { height: props.mapHeight, border: '#c8c9cb solid 1px', backgroundColor: '#c8c9cb' } } />,
  })),
  withState('currentCenter', '', props => props.value),
  lifecycle({
    componentWillMount() {
      const refs = {};
      this.props.setCurrentCenter(this.props.value);
      this.setState({
        currentCenter: this.props.value,
        onMapMounted: (ref) => {
          refs.map = ref;
          this.props.bindMapElement(refs.map);
          fireCustomEvent('googleApiMounted');
        },
        onBoundsChanged: (currentCenter) => {
          const currentLat = refs.map.getCenter() ? refs.map.getCenter().lat() : 0;
          const currentLng = refs.map.getCenter() ? refs.map.getCenter().lng() : 0;
          if (currentLat !== currentCenter.lat || currentLng !== currentCenter.lng) {
            this.props.setCurrentCenter({
              value: {
                lat: currentLat,
                lng: currentLng,
              },
              action: 'change',
            });
            this.setState({
              currentCenter: {
                value: {
                  lat: currentLat,
                  lng: currentLng,
                },
                action: 'change',
              },
            });
          }
        },
        resetPin: (defaultCenter) => {
          refs.map.panTo({
            lat: defaultCenter.lat, lng: defaultCenter.lng,
          });
          this.props.onChange({ action: 'reset', value: { lat: defaultCenter.lat, lng: defaultCenter.lng } });
        },
        onChangeEnd: () => {
          const currentLat = refs.map.getCenter() ? refs.map.getCenter().lat() : 0;
          const currentLng = refs.map.getCenter() ? refs.map.getCenter().lng() : 0;
          this.props.onChange({ action: 'change', value: { lat: currentLat, lng: currentLng } });
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap,
)(props => (
  <div className="my-map-container">
    <GoogleMap
      ref={ props.onMapMounted }
      defaultZoom={ props.zoom }
      defaultOptions={ {
        disableDefaultUI: true,
        zoomControl: !props.disabled,
        draggable: !props.disabled,
      } }
      center={ props.value.value }
      getCenter={ props.getCenter }
      onDragEnd={ props.onChangeEnd }
      onBoundsChanged={ () => { props.onBoundsChanged(props.currentCenter); } }
      onZoomChanged={ props.onChangeEnd }
    >
      <img
        alt=""
        src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png"
        style={ { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)' } }
      />
    </GoogleMap>
  </div>
));
export default class MapWrapper extends React.Component {
  constructor() {
    super();
    this.state = {
      currentCenter: {
        action: 'default',
        value: {
          lng: 0,
          lat: 0,
        },
      },
    };

    this.map = null;
  }

  getCurrentCenter = () => this.state.currentCenter

  setCurrentCenter = (center) => {
    this.setState({ currentCenter: center });
  };

  bindMapElement = (ref) => {
    this.map = ref;
  };

  handleClickResetPin = () => {
    if (this.map) {
      this.map.panTo({ lat: this.props.lastSearched.lat, lng: this.props.lastSearched.lng });
      this.props.onChange({ action: 'reset', value: { lat: this.props.lastSearched.lat, lng: this.props.lastSearched.lng } });
      this.setState({ currentCenter: { action: 'reset', value: { lat: this.props.lastSearched.lat, lng: this.props.lastSearched.lng } } });
    }
    this.props.form.resetFields(['coordinates']);
  }

  showCoordinateError = () => (this.state.currentCenter.value.lat === null ||
    this.state.currentCenter.value.lng === null ||
    (
      this.state.currentCenter.value.lng
      && this.state.currentCenter.value.lat
      && this.state.currentCenter.value.lat.toFixed(6) === '0.000000'
      && this.state.currentCenter.value.lng.toFixed(6) === '0.000000')
  )
    && !this.props.form.getFieldError('coordinates')

  render() {
    // eslint-disable-next-line react/prop-types
    const { t, value, onChange, lastSearched, disabled, zoom, mapHeight } = this.props;

    return (
      <div className="address__map" >
        <If condition={ !this.props.hiddenLabel }>
          <div className="map-label">
            <span>{this.props.t('cms.properties.edit.address.map.label')}</span>
            <If condition={ !disabled }>
              <span role="button" tabIndex="0" onClick={ this.handleClickResetPin } className="reset-pin-btn">{t('cms.properties.edit.address.reset_pin')}</span>
            </If>
            <If condition={ this.showCoordinateError() }>
              <p className="address__map__coordinate-error-weak">
                <Icon
                  type="exclamation-circle"
                  className="address__map__coordinate-error-weak-icon"
                  theme="filled"
                  style={ {
                    width: '14px',
                    height: '14px',
                    color: '#faad14',
                  } }
                />
                { t('cms.properties.edit.address.weak_error') }
              </p>
            </If>
          </div>
        </If>
        <MyMap
          t={ t }
          value={ value }
          onChange={ onChange }
          lastSearched={ lastSearched }
          setCurrentCenter={ this.setCurrentCenter }
          bindMapElement={ this.bindMapElement }
          countryName={ this.props.countryName }
          disabled={ disabled }
          zoom={ zoom }
          mapHeight={ mapHeight }
        />
        <div className="address__map__coordinate">
          <Row>
            <Col span={ 12 }>
              <span className="address__map__coordinate--lng">
                {t('cms.properties.edit.address.map.longitude')}:&nbsp;
                {
                  this.state.currentCenter.value.lng
                  && this.state.currentCenter.value.lng !== null ?
                    this.state.currentCenter.value.lng.toFixed(6) : ''
                }
              </span>
            </Col>
            <Col span={ 12 }>
              <span className="address__map__coordinate--lat">
                {t('cms.properties.edit.address.map.latitude')}:&nbsp;
                {
                  this.state.currentCenter.value.lat
                && this.state.currentCenter.value.lat !== null ?
                    this.state.currentCenter.value.lat.toFixed(6) : ''
                }
              </span>
            </Col>
          </Row>
          <Row>

            <If condition={ this.props.cityName }>
              <Col span={ 12 }>
                <span className="address__map__coordinate--city">
                  {t('cms.table.column.city')}:&nbsp;{ this.props.cityName }
                </span>
              </Col>
              <Col span={ 12 }>
                <span className="address__map__coordinate--city">
                  {t('cms.table.column.country')}:&nbsp;{ this.props.countryName }
                </span>
              </Col>
            </If>
            <If condition={ this.props.countryName && !this.props.cityName }>
              <Col span={ 12 }>
                <span className="address__map__coordinate--country">
                  {t('cms.table.column.country')}:&nbsp;{ this.props.countryName }
                </span>
              </Col>
            </If>
          </Row>
        </div>
      </div>
    );
  }
}

MapWrapper.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  lastSearched: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  hiddenLabel: PropTypes.bool,
  countryName: PropTypes.string,
  cityName: PropTypes.string,
  disabled: PropTypes.bool,
  zoom: PropTypes.number,
  mapHeight: PropTypes.string,
};

MapWrapper.defaultProps = {
  t: () => { },
  onChange: () => {},
  hiddenLabel: false,
  countryName: '',
  cityName: '',
  disabled: false,
  zoom: 18,
  mapHeight: '23.6875rem',
};


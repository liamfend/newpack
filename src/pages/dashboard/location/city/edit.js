import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Spin, message } from 'antd';
import * as imageActions from '~actions/location/image';
import * as actions from '~actions/location/city';
import { locationType, communicationStatus, platformEntity, entityAction } from '~constants';
import { withTranslation } from 'react-i18next';
import EditLayout from '~components/edit-layout/index';
import EditTab from '~components/edit-tab/index';
import DetailsForm from '~components/details-form/index';
import ContentForm from '~components/content-form/index';
import SEOForm from '~components/seo-form/index';
import { handleSaveData, successMessageAction } from '~helpers/location';
import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  city: state.dashboard.city.get('city').toJS(),
  baseCity: state.dashboard.city.get('baseCity').toJS(),
  communicationStatus: state.dashboard.city.getIn(['communication', 'city']).toJS(),
});

const mapDispatchToProps = dispatch => ({
  getCityDetail: (slug) => {
    dispatch(actions.getCityDetail({ slug }));
  },
  initialCity: () => {
    dispatch(actions.setCityDetail({ city: null }));
  },
  updateCity: (data, onSuccess, onError) => {
    dispatch(actions.updateCity(data, onSuccess, onError));
  },
  updateLocationImage: (params, errorAction) => {
    dispatch(imageActions.updateLocationImage(params, errorAction));
  },
  deletedLocationImage: (params, errorAction) => {
    dispatch(imageActions.deletedLocationImage(params, errorAction));
  },
  createLocationImage: (params, errorAction) => {
    dispatch(imageActions.createLocationImage(params, errorAction));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.LOCATIONS_CITIES, entityAction.READ)
export default class CityEdit extends React.Component {
  constructor() {
    super();
    this.state = {
      details: null,
      content: null,
      seo: null,
      isSeoErr: false,
    };
  }

  componentDidMount() {
    this.props.initialCity();
    this.props.getCityDetail(this.props.match.params.slug);
  }

  setTabStatus = (field) => {
    const key = Object.keys(field)[0];
    this.state[key] = Object.assign({}, this.state[key], field[key]);
    this.setState(this.state);
  };

  getEditTabSource = () => [
    {
      name: this.props.t('cms.edit.tab.details'),
      key: 'details',
      render: (<DetailsForm
        ref={ (node) => { this.detailsForm = node; } }
        data={ this.props.city.payload }
        type={ locationType.CITY_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
    {
      name: this.props.t('cms.edit.tab.content'),
      key: 'content',
      render: (<ContentForm
        ref={ (node) => { this.contentForm = node; } }
        data={ this.props.city.payload }
        type={ locationType.CITY_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
    {
      name: this.props.t('cms.edit.tab.seo'),
      key: 'seo',
      render: (<SEOForm
        ref={ (node) => { this.seoForm = node; } }
        data={ this.props.city.payload }
        type={ locationType.CITY_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
  ];

  allFormValidate = (callback) => {
    const detailsValidator = this.detailsForm.validateFields();
    const contentValidator = this.contentForm.validateFields();
    const seoValidator = this.seoForm.validateFields();

    this.getSeoTabsState();
    Promise.all([detailsValidator, contentValidator, seoValidator]).then(() => {
      callback(true);
    }).catch(() => {
      callback(false);
    });
  };

  getSeoTabsState = () => {
    let state = false;
    this.seoForm.validateFields((err) => {
      if (err) {
        state = true;
      }
    });

    this.setState({
      isSeoErr: state,
    });
  };

  handleSave = (published = null) => {
    if (this.props.city.payload) {
      const updateData = handleSaveData(
        this.props.city.payload,
        this.props.baseCity.payload,
        locationType.CITY_TYPE,
        this.state,
        published,
      );

      if (updateData) {
        const updateCitypromise = new Promise((resolve, reject) => {
          ['heroImage', 'smallHeroImage'].map((type) => {
            if (Object.keys(updateData).includes(type)) {
              this.handleImage(
                updateData,
                type,
                () => { reject('update city image error'); },
              );
              delete updateData[type];
            }
            return true;
          });

          this.props.updateCity(updateData,
            (response) => { resolve(response); },
            () => { reject('update city error'); },
          );
        });

        updateCitypromise.then(
          (result) => {
            successMessageAction(this.props.city, locationType.CITY_TYPE, result.published);
            this.setState({
              details: null,
              content: null,
              seo: null,
            });
          },
          (error) => {
            console.log('error: ', error);
            message.error(this.props.t('cms.properties.edit.toast.error'));
          },
        );
      }
    }
  }

  handleImage = (updateData, type, errorAction) => {
    if (this.props.baseCity.payload[type] === null && updateData[type] !== null) {
      this.props.createLocationImage(updateData[type], errorAction);
    }

    if (this.props.baseCity.payload[type] !== null && updateData[type] === null) {
      this.props.deletedLocationImage({
        id: this.props.baseCity.payload[type].id,
        [`${locationType.CITY_TYPE.toLowerCase()}Id`]: this.props.city.payload.id,
      },
      errorAction,
      );
    }

    if (this.props.baseCity.payload[type] !== null &&
      updateData[type] !== null &&
      this.props.baseCity.payload[type].imageHash !== updateData[type].imageHash) {
      this.props.updateLocationImage(updateData[type], errorAction);
    }
  }

  handleReview = (callback) => {
    this.allFormValidate(callback);
  };

  render() {
    return (
      <div className="city-edit">
        <Choose>
          <When condition={ this.props.communicationStatus.status !== communicationStatus.IDLE } >
            <div className="city-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <EditLayout
              className="city-edit__layout"
              name={ this.props.city.payload ? this.props.city.payload.name : '' }
              published={ this.props.city.payload ? this.props.city.payload.published : false }
              onSave={ this.handleSave }
              onReview={ this.handleReview }
              data={ this.props.city.payload }
              type={ locationType.CITY_TYPE }
              t={ this.props.t }
              changeFields={ this.state }
            >
              <EditTab
                dataSource={ this.getEditTabSource() }
                onChange={ this.changeEditTab }
                fields={ this.state }
                t={ this.props.t }
                isSeoErr={ this.state.isSeoErr }
              />
            </EditLayout>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

CityEdit.propTypes = {
  city: PropTypes.object,
  match: PropTypes.object.isRequired,
  getCityDetail: PropTypes.func,
  initialCity: PropTypes.func,
  updateCity: PropTypes.func,
  t: PropTypes.func,
  baseCity: PropTypes.object,
  communicationStatus: PropTypes.shape({
    status: PropTypes.string,
  }),
  createLocationImage: PropTypes.func,
  updateLocationImage: PropTypes.func,
  deletedLocationImage: PropTypes.func,
};

CityEdit.defaultProps = {
  city: {},
  getCityDetail: () => {},
  initialCity: () => {},
  updateCity: () => {},
  t: () => {},
  baseCity: {},
  communicationStatus: {
    status: '',
  },
  createLocationImage: () => {},
  updateLocationImage: () => {},
  deletedLocationImage: () => {},
};

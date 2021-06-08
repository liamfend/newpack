import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Spin, message } from 'antd';
import * as imageActions from '~actions/location/image';
import * as actions from '~actions/location/area';
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
  area: state.dashboard.area.get('area').toJS(),
  baseArea: state.dashboard.area.get('baseArea').toJS(),
  communicationStatus: state.dashboard.area.getIn(['communication', 'area']).toJS(),
});

const mapDispatchToProps = dispatch => ({
  getAreaDetail: (slug) => {
    dispatch(actions.getAreaDetail({ slug }));
  },
  initialArea: () => {
    dispatch(actions.setAreaDetail({ area: null }));
  },
  updateArea: (data, onError) => {
    dispatch(actions.updateArea(data, onError));
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
@authControl(platformEntity.LOCATIONS_AREAS, entityAction.READ)
export default class AreaEdit extends React.Component {
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
    this.props.initialArea();
    this.props.getAreaDetail(this.props.match.params.slug);
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
        data={ this.props.area.payload }
        type={ locationType.AREA_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
    {
      name: this.props.t('cms.edit.tab.content'),
      key: 'content',
      render: (<ContentForm
        ref={ (node) => { this.contentForm = node; } }
        data={ this.props.area.payload }
        type={ locationType.AREA_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
    {
      name: this.props.t('cms.edit.tab.seo'),
      key: 'seo',
      render: (<SEOForm
        ref={ (node) => { this.seoForm = node; } }
        data={ this.props.area.payload }
        type={ locationType.AREA_TYPE }
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

  handleSave = (published = null) => {
    if (this.props.area.payload) {
      const updateData = handleSaveData(
        this.props.area.payload,
        this.props.baseArea.payload,
        locationType.AREA_TYPE,
        this.state,
        published,
      );

      if (updateData) {
        const updateAreaPromise = new Promise((resolve, reject) => {
          ['heroImage', 'smallHeroImage'].map((type) => {
            if (Object.keys(updateData).includes(type)) {
              this.handleImage(
                updateData,
                type,
                () => { reject('update area image error'); },
              );
              delete updateData[type];
            }

            return true;
          });

          this.props.updateArea(updateData,
            (response) => { resolve(response); },
            () => { reject('update area error'); },
          );
        });

        updateAreaPromise.then(
          (result) => {
            successMessageAction(this.props.area, locationType.AREA_TYPE, result.published);
            this.setState({
              details: null,
              content: null,
              seo: null,
            });
          },
          (error) => {
            console.log('error: ', error); // to out put error log
            message.error(this.props.t('cms.properties.edit.toast.error'));
          },
        );
      }
    }
  }

  handleImage = (updateData, type, errorAction) => {
    if (this.props.baseArea.payload[type] === null && updateData[type] !== null) {
      this.props.createLocationImage(updateData[type], errorAction);
    }

    if (this.props.baseArea.payload[type] !== null && updateData[type] === null) {
      this.props.deletedLocationImage({
        id: this.props.baseArea.payload[type].id,
        [`${locationType.AREA_TYPE.toLowerCase()}Id`]: this.props.area.payload.id,
      },
      errorAction,
      );
    }

    if (this.props.baseArea.payload[type] !== null &&
      updateData[type] !== null &&
      this.props.baseArea.payload[type].imageHash !== updateData[type].imageHash) {
      this.props.updateLocationImage(updateData[type], errorAction);
    }
  }

  handleReview = (callback) => {
    this.allFormValidate(callback);
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

  render() {
    return (
      <div className="area-edit">
        <Choose>
          <When condition={ this.props.communicationStatus.status !== communicationStatus.IDLE } >
            <div className="area-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <EditLayout
              className="area-edit__layout"
              name={ this.props.area.payload ? this.props.area.payload.name : '' }
              published={ this.props.area.payload ? this.props.area.payload.published : false }
              onSave={ this.handleSave }
              onReview={ this.handleReview }
              data={ this.props.area.payload }
              type={ locationType.AREA_TYPE }
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

AreaEdit.propTypes = {
  area: PropTypes.object,
  match: PropTypes.object.isRequired,
  getAreaDetail: PropTypes.func,
  initialArea: PropTypes.func,
  updateArea: PropTypes.func,
  t: PropTypes.func,
  baseArea: PropTypes.object,
  communicationStatus: PropTypes.shape({
    status: PropTypes.string,
  }),
  createLocationImage: PropTypes.func,
  updateLocationImage: PropTypes.func,
  deletedLocationImage: PropTypes.func,
};

AreaEdit.defaultProps = {
  area: {},
  baseArea: {},
  getAreaDetail: () => {},
  initialArea: () => {},
  updateArea: () => {},
  t: () => {},
  communicationStatus: {
    status: '',
  },
  createLocationImage: () => {},
  updateLocationImage: () => {},
  deletedLocationImage: () => {},
};

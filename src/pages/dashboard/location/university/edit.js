import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import * as actions from '~actions/location/university';
import { withTranslation } from 'react-i18next';
import { Spin, message } from 'antd';
import * as imageActions from '~actions/location/image';
import { locationType, communicationStatus, platformEntity, entityAction } from '~constants';
import EditLayout from '~components/edit-layout';
import EditTab from '~components/edit-tab';
import DetailsForm from '~components/details-form';
import ContentForm from '~components/content-form';
import SEOForm from '~components/seo-form';
import { handleSaveData, successMessageAction } from '~helpers/location';

import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  university: state.dashboard.university.get('university').toJS(),
  baseUniversity: state.dashboard.university.get('baseUniversity').toJS(),
  communicationStatus: state.dashboard.university.getIn(['communication', 'university']).toJS(),
});

const mapDispatchToProps = dispatch => ({
  getUniversityDetail: (slug) => {
    dispatch(actions.getUniversityDetail({ slug }));
  },
  initialUniversity: () => {
    dispatch(actions.setUniversityDetail({ university: null }));
  },
  updateUniversity: (data, onSuccess, onError) => {
    dispatch(actions.updateUniversity(data, onSuccess, onError));
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
@authControl(platformEntity.UNIVERSITIES_UNIVERSITIES, entityAction.READ)
export default class UniversityEdit extends React.Component {
  constructor() {
    super();

    this.state = {
      details: null,
      content: null,
      seo: null,
      isSeoErr: false,
      commonNamesError: false,
    };
  }

  componentDidMount() {
    this.props.initialUniversity();
    this.props.getUniversityDetail(this.props.match.params.slug);
  }

  setTabStatus = (field) => {
    const key = Object.keys(field)[0];
    this.state[key] = Object.assign({}, this.state[key], field[key]);
    if (
      this.state[key].commonNames
      && this.state[key].commonNames.value
      && this.state[key].commonNames.value.length > 10
    ) {
      this.state[key].commonNames.validate = false;
    } else {
      this.state.commonNamesError = false;
    }
    this.setState(this.state);
  };

  getEditTabSource = () => [
    {
      name: this.props.t('cms.edit.tab.details'),
      key: 'details',
      render: (<DetailsForm
        ref={ (node) => { this.detailsForm = node; } }
        data={ this.props.university.payload }
        type={ locationType.UNIVERSITY_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
    {
      name: this.props.t('cms.edit.tab.content'),
      key: 'content',
      render: (<ContentForm
        ref={ (node) => { this.contentForm = node; } }
        data={ this.props.university.payload }
        type={ locationType.UNIVERSITY_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
    {
      name: this.props.t('cms.edit.tab.seo'),
      key: 'seo',
      render: (<SEOForm
        ref={ (node) => { this.seoForm = node; } }
        data={ this.props.university.payload }
        type={ locationType.UNIVERSITY_TYPE }
        setTabStatus={ this.setTabStatus }
        t={ this.props.t }
      />),
    },
  ];

  allFormValidate = (callback) => {
    const detailsValidator = this.detailsForm.validateFields();
    const contentValidator = this.contentForm.validateFields();
    const seoValidator = this.seoForm.validateFields();
    const universityPayload = this.props.university.payload;

    this.getSeoTabsState();
    Promise.all([detailsValidator, contentValidator, seoValidator]).then(() => {
      if (
        universityPayload && universityPayload.commonNames
        && universityPayload.commonNames.length > 10
      ) {
        this.setState({ commonNamesError: true });
        callback(false);
      } else {
        this.setState({ commonNamesError: false });
        callback(true);
      }
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
    if (this.props.university.payload) {
      const updateData = handleSaveData(
        this.props.university.payload,
        this.props.baseUniversity.payload,
        locationType.UNIVERSITY_TYPE,
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
                () => { reject('update university image error'); },
              );
              delete updateData[type];
            }
            return true;
          });

          this.props.updateUniversity(updateData,
            (response) => { resolve(response); },
            () => { reject('update university error'); },
          );
        });

        updateCitypromise.then(
          (result) => {
            successMessageAction(
              this.props.university,
              locationType.UNIVERSITY_TYPE,
              result.published,
            );
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
  };

  handleImage = (updateData, type, errorAction) => {
    if (this.props.baseUniversity.payload[type] === null && updateData[type] !== null) {
      this.props.createLocationImage(updateData[type], errorAction);
    }

    if (this.props.baseUniversity.payload[type] !== null && updateData[type] === null) {
      this.props.deletedLocationImage({
        id: this.props.baseUniversity.payload[type].id,
        [`${locationType.UNIVERSITY_TYPE.toLowerCase()}Id`]: this.props.university.payload.id,
      },
      errorAction,
      );
    }

    if (this.props.baseUniversity.payload[type] !== null &&
      updateData[type] !== null &&
      this.props.baseUniversity.payload[type].imageHash !== updateData[type].imageHash) {
      this.props.updateLocationImage(updateData[type], errorAction);
    }
  }

  handleReview = (callback) => {
    this.allFormValidate(callback);
  };

  render() {
    return (
      <div className="university-edit">
        <Choose>
          <When condition={ this.props.communicationStatus.status !== communicationStatus.IDLE } >
            <div className="university-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <EditLayout
              className="university-edit__layout"
              name={ this.props.university.payload ? this.props.university.payload.name : '' }
              published={ this.props.university.payload ?
                this.props.university.payload.published : false
              }
              onSave={ this.handleSave }
              onReview={ this.handleReview }
              data={ this.props.university.payload }
              type={ locationType.UNIVERSITY_TYPE }
              t={ this.props.t }
              changeFields={ this.state }
            >
              <EditTab
                dataSource={ this.getEditTabSource() }
                onChange={ this.changeEditTab }
                fields={ this.state }
                t={ this.props.t }
                isSeoErr={ this.state.isSeoErr }
                commonNamesError={ this.state.commonNamesError }
              />
            </EditLayout>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

UniversityEdit.propTypes = {
  t: PropTypes.func.isRequired,
  university: PropTypes.object,
  match: PropTypes.object.isRequired,
  getUniversityDetail: PropTypes.func,
  initialUniversity: PropTypes.func,
  baseUniversity: PropTypes.object,
  updateUniversity: PropTypes.func,
  communicationStatus: PropTypes.shape({
    status: PropTypes.string,
  }),
  createLocationImage: PropTypes.func,
  updateLocationImage: PropTypes.func,
  deletedLocationImage: PropTypes.func,
};

UniversityEdit.defaultProps = {
  university: {},
  baseUniversity: {},
  getUniversityDetail: () => {},
  updateUniversity: () => {},
  initialUniversity: () => {},
  t: () => {},
  communicationStatus: {
    status: '',
  },
  createLocationImage: () => {},
  updateLocationImage: () => {},
  deletedLocationImage: () => {},
};

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Steps, Button, message, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import * as actions from '~actions/properties/property-list';
import CreateConfirmation from '~pages/dashboard/properties/create/create-confirmation';
import PropertySuccess from '~pages/dashboard/properties/create/property-success';
import BasicInformation from '~pages/dashboard/properties/create/basic-information';
import PropertyAddress from '~pages/dashboard/properties/create/property-address';
import LeaveAlert from '~components/leave-alert';
import generatePath from '~settings/routing';
import { platformEntity, entityAction } from '~constants';
import authControl from '~components/auth-control';
import { isEmptyObject } from '~helpers/property-edit';

const { Step } = Steps;

const mapStateToProps = state => ({
  list: state.dashboard.propertyList.get('list').toJS(),
});

const mapDispatchToProps = dispatch => ({
  createProperty: (params, successCallback, failedCallback) => {
    dispatch(actions.createProperty(params, successCallback, failedCallback));
  },
  getPropertyList: (params, successCallback) => {
    dispatch(actions.getPropertyList(params, successCallback));
  },
});

@withTranslation()
@connect(mapStateToProps, mapDispatchToProps)
@authControl(platformEntity.PROPERTIES_PROPERTIES, entityAction.CREATE)
export default class PropertyCreate extends React.Component {
  constructor() {
    super();

    this.formData = {
      basicInfo: {},
      propertyAddress: {},
    };

    this.propertyType = ['STUDENT_ACCOMMODATION', 'MULTI_FAMILY', 'LONG_TAIL', 'HOTEL_HOSTEL', 'SERVICED_APARTMENT'];

    this.state = {
      current: 0,
      successFlag: false,
      apartmentIndex: null, // number
      countryData: {},
      leaveAlert: false,
      exist: false,
      firstClick: true,
      showModal: false,
      disableBtn: false,
    };
  }

  componentDidMount() {
    // add browser alert
    window.onbeforeunload = (e) => {
      const msg = this.props.t('cms.properties.edit.leave_alert.content');
      // eslint-disable-next-line no-param-reassign
      e = e || window.event;
      if (e) {
        e.returnValue = msg;
      }

      return msg;
    };
    const { history } = this.props;
    if (
      history &&
      history.location &&
      history.location.state &&
      history.location.state.landlord
    ) {
      this.formData.basicInfo = {
        landlord: history.location.state.landlord,
      };
    }
  }

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  changeLeaveAlert = () => {
    const { leaveAlert } = this.state;
    if (!leaveAlert) {
      this.setState({
        leaveAlert: true,
      });
    }
  }

  handleApartmentType = (index) => {
    if (index !== this.state.apartmentIndex) {
      this.setState({ apartmentIndex: index, firstClick: true });
    }
    this.formData.basicInfo.type = this.propertyType[index];
  }

  nextStep = () => {
    const { current, apartmentIndex } = this.state;

    if (apartmentIndex === null) {
      this.setState({ apartmentIndex: 100 });
    }

    if (current === 0) {
      this.validateFrom(current);
    } else if (current === 1) {
      this.validateFrom(current);
    } else {
      const index = current + 1;
      this.setState({ current: index });
    }
  }

  // TODO: to add more info
  // this.formData.propertyAddress.country
  formPropertyData = () => ({
    address: this.formData.propertyAddress.addressLine,
    country: this.formData.propertyAddress.countryShortName,
    currency: this.formData.basicInfo.countryData.currency,
    landlordId: this.formData.basicInfo.landlord.id,
    latitude: this.formData.propertyAddress.coordinates &&
      this.formData.propertyAddress.coordinates.value &&
      this.formData.propertyAddress.coordinates.value.lat,
    longitude: this.formData.propertyAddress.coordinates &&
      this.formData.propertyAddress.coordinates.value &&
      this.formData.propertyAddress.coordinates.value.lng,
    name: this.formData.basicInfo.name,
    postalCode: this.formData.propertyAddress.zipCode,
    propertyType: this.formData.basicInfo.type,
    shippingCity: this.formData.propertyAddress.city,
    cityId: this.formData.basicInfo.city.id,
  });

  setPropertyData = (formName, data, ischange = false) => {
    if (isEmptyObject(Object.values(data)[0])) {
      delete this.formData[formName][Object.keys(data)[0]];
    } else {
      this.formData[formName] = Object.assign({}, this.formData[formName], data);
    }

    this.setState({ firstClick: ischange });
  };

  prevStep = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  validateFrom = (current) => {
    const { apartmentIndex } = this.state;
    let validateForm = '';
    if (current === 0) {
      validateForm = this.basicInfo.validateFields();
    } else if (current === 1) {
      validateForm = this.propertyAddressForm.validateFields();
    }
    const validatePromise = Promise.all([validateForm]);
    validatePromise.then(() => {
      if (current === 0 && (apartmentIndex === null || apartmentIndex === 100)) {
        return;
      }

      if (current === 0 && this.state.firstClick) {
        this.checkPropertyExist();
      } else {
        const index = current + 1;
        this.setState({ current: index });
      }
    }).catch(() => false);
  };

  handleConfirm = () => {
    this.setState({ disableBtn: true });
    const propertyData = this.formPropertyData();
    this.props.createProperty(propertyData, () => {
      this.setState({
        successFlag: true,
        current: 100, // have finished
      });
    }, () => {
      message.error(this.props.t('cms.auth.login.alert.clienterror'));
    });
  };

  changeStep = (target) => {
    const { current } = this.state;
    if (target < current) {
      this.setState({
        current: target,
      });
    }
  }

  setCountryData = (state, data) => {
    const formatData = data && Object.keys(data).length !== 0 ? data : undefined;
    this.setState({
      countryData: { state, data: formatData },
    });
  }

  checkPropertyExist = () => {
    const propertyData = {};
    propertyData.citySlug = this.formData.basicInfo.city.slug;
    propertyData.landlordSlug = this.formData.basicInfo.landlord.slug;
    propertyData.fullName = this.formData.basicInfo.name;
    propertyData.propertyType = this.formData.basicInfo.type;

    this.props.getPropertyList(
      propertyData, () => {
        if (this.props.list.total > 0) {
          this.setState({ current: 0, exist: this.props.list.total > 0, showModal: true });
        } else {
          this.setState({ current: 1, exist: this.props.list.total > 0, showModal: false });
        }
      },
    );
  }

  render() {
    const { t } = this.props;
    const { current, leaveAlert } = this.state;
    const steps = [
      {
        index: 0,
        title: t('cms.properties.create.step_basic'),
        content: <BasicInformation
          ref={ (basic) => { this.basicInfo = basic; } }
          handleApartmentType={ this.handleApartmentType }
          apartmentIndex={ this.state.apartmentIndex }
          countryData={ this.state.countryData }
          propertyType={ this.propertyType }
          setPropertyData={ this.setPropertyData }
          basicInfo={ this.formData.basicInfo }
          setCountryData={ this.setCountryData }
          changeLeaveAlert={ this.changeLeaveAlert }
        />,
      },
      {
        index: 1,
        title: t('cms.properties.create.step_address'),
        content: <PropertyAddress
          t={ t }
          ref={ (node) => { this.propertyAddressForm = node; } }
          setPropertyData={ this.setPropertyData }
          propertyAddressData={ this.formData.propertyAddress }
        />,
      },
      {
        index: 2,
        title: t('cms.properties.create.step_confirmation'),
        content: <CreateConfirmation
          formData={ this.formData }
        />,
      },
    ];

    return (
      <div className="property-create-box">
        <div className="property-create">
          <LeaveAlert
            history={ this.props.history }
            t={ t }
            when={ current !== 100 && leaveAlert }
            contentType="create"
          />
          <If condition={ !this.state.successFlag }>
            <div className="property-create__headline">
              <Link className="property-create__edit" to={ generatePath('properties') }>
                <Icon type="left" />
                { t('cms.properties.create.header.exit')}
              </Link>
              <h1 className="property-create__title">
                { t('cms.properties.create.header.title') }
              </h1>
            </div>
            <div className="property-create__steps">
              <Steps current={ current } onChange={ this.changeStep }>
                {steps.map(item => (
                  <Step key={ item.title } title={ item.title } />
                ))}
              </Steps>
              <div className="steps-content">{steps[current].content}</div>
              <div className="steps-action">
                {current < steps.length - 1 && (
                  <Popconfirm
                    overlayStyle={ { maxWidth: 400 } }
                    placement="top"
                    arrowPointAtCenter
                    title={ t('cms.properties.create.step_next.popover.title') }
                    okText={ t('cms.properties.create.step_next.popover.continue_creating.btn') }
                    cancelText={ t('cms.properties.create.step_next.popover.close.btn') }
                    visible={ this.state.current === 0 && this.state.showModal }
                    onConfirm={ () => {
                      this.setState({ current: 1, showModal: false, firstClick: false });
                    } }
                    onCancel={ () => {
                      this.setState({ current: 0, showModal: false, firstClick: false });
                    } }
                  >
                    <Button
                      type="primary"
                      onClick={ () => this.nextStep() }
                      className="steps-action__button steps-action__button--right"
                    >
                      { t('cms.properties.create.step_next') }
                    </Button>
                  </Popconfirm>
                )}
                {current === steps.length - 1 && (
                  <Button type="primary" className={ 'steps-action__button steps-action__button--right' } onClick={ this.handleConfirm } disabled={ this.state.disableBtn }>
                    { t('cms.properties.create.step_confirm') }
                  </Button>
                )}
                {current > 0 && (
                  <Button className={ 'steps-action__button steps-action__button--back' } onClick={ () => this.prevStep() }>
                    <Icon type="left" />
                    { t('cms.properties.create.step_back') }
                  </Button>
                )}
              </div>
            </div>
          </If>
          <If condition={ this.state.successFlag }>
            <PropertySuccess />
          </If>
        </div >
        <If condition={ current === 0 }>
          <img className="property-create__basic-bg" src="/public/basic-bg.png" alt="" />
        </If>
        <If condition={ current === 1 }>
          <img className="property-create__basic-bg" src="/public/address-bg.png" alt="" />
        </If>
      </div>
    );
  }
}

PropertyCreate.propTypes = {
  t: PropTypes.func.isRequired,
  createProperty: PropTypes.func,
  history: PropTypes.object.isRequired,
  getPropertyList: PropTypes.func,
  list: PropTypes.object,
};

PropertyCreate.defaultProps = {
  t: () => {},
  createProperty: () => {},
  getPropertyList: () => {},
  list: {},
};

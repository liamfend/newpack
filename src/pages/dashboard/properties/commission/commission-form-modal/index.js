import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Form, Popconfirm, Tooltip } from 'antd';
import { trim } from 'lodash';
import Svg from '~components/svg';
import modal from '~components/modal';
import moment from 'moment';
import DetailsForm from '~pages/dashboard/properties/commission/commission-form-modal/details-form';
import ExtraRequirementForm from '~pages/dashboard/properties/commission/commission-form-modal/extra-requirement-form';
import CommissionCapForm from '~pages/dashboard/properties/commission/commission-form-modal/commission-cap-form';
import NoteForm from '~pages/dashboard/properties/commission/commission-form-modal/note-form';
import PropertiesForm from '~pages/dashboard/properties/commission/commission-form-modal/properties-form';
import { allCommissionCategories, numBookings, tenancyLength, flatFee, defaultField } from '~constants/commission';
import * as commissionActions from '~actions/properties/commission';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

const mapDispatchToProps = dispatch => ({
  createCommission: (data) => {
    dispatch(commissionActions.createCommission(data));
  },
  updateCommission: (data) => {
    dispatch(commissionActions.updateCommission(data));
  },
  deleteCommission: (data) => {
    dispatch(commissionActions.deleteCommission(data));
  },
  bulkCreateCommissionTiers: (commissionTiers) => {
    dispatch(commissionActions.bulkCreateCommissionTiers(commissionTiers));
  },
});

@connect(null, mapDispatchToProps)
@modal({ className: 'commission-from-modal' }, true)
class CommissionFormModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commissionDetails: null,
      isFieldsChange: false,
    };

    this.dataTypes = ['effectiveFrom', 'effectiveTo',
      'checkInDateFrom', 'checkInDateTo'];
  }

  componentDidMount() {
    this.getCommissionDetails();
    // add browser alert
    window.onbeforeunload = (e) => {
      if (this.props.form.isFieldsTouched()) {
        const msg = this.props.t('cms.properties.edit.leave_alert.content');
        // eslint-disable-next-line no-param-reassign
        e = e || window.event;
        if (e) {
          e.returnValue = msg;
        }

        return msg;
      }
      return null;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.commissionCategory !== prevProps.commissionCategory) {
      this.getCommissionDetails(true);
    }
  }

  getCommissionDetails = (isChange) => {
    if (
      this.props.correlationId
      && this.props.commissionTiers
    ) {
      const details = this.props.commissionTiers.find((commissionTier) => {
        if (commissionTier.id === this.props.correlationId) {
          return commissionTier;
        }

        return null;
      });

      const newDetails = { ...details };

      if (isChange) {
        newDetails.category = this.props.commissionCategory;
      }

      this.setState({
        commissionDetails: newDetails,
      });

      this.setModalDetails(newDetails);
    }

    if (this.props.modalType === 'addNew') {
      this.setModalDetails(this.props.form.getFieldsValue());
    }
  }

  setModalDetails = (details) => {
    const commissionDetails = { ...details };
    const formFields = this.getAllFields();
    const data = {};
    formFields.map((field) => {
      if (!(field === 'capType' && !commissionDetails[field])) {
        data[field] = commissionDetails[field];
      }

      if (
        ['bonus', 'fullyCalculatable', 'retrospectiveCommission'].indexOf(field) !== -1
        && !commissionDetails[field]
      ) {
        data[field] = false;
      }
      return true;
    });

    if (this.props.modalType !== 'addNew' && commissionDetails) {
      data.fullyCalculatable = !commissionDetails.fullyCalculatable;

      this.dataTypes.map((type) => {
        if (commissionDetails[type]) {
          data[type] = commissionDetails[type] ?
            moment(commissionDetails[type]) : null;
        }
        return true;
      });
    }

    if (this.props.modalType === 'addNew') {
      if (this.props.commissionCategory) {
        data.category = this.props.commissionCategory;
      }
    }

    if (this.props.modalType === 'copy') {
      data.name = this.props.t('cms.property.commission_form_modal.copy.title', { name: data.name });
    }

    if (data !== {}) {
      this.props.form.setFieldsValue(data);
    }
  }

  getAllFields = () => {
    let allFields = defaultField;

    if (this.props.commissionCategory === allCommissionCategories.TENANCY_LENGTH) {
      allFields = allFields.concat(tenancyLength);
    }

    if (this.props.commissionCategory === allCommissionCategories.FLAT_FEE) {
      allFields = allFields.concat(flatFee);
    }

    if (this.props.commissionCategory === allCommissionCategories.NUM_BOOKINGS) {
      allFields = allFields.concat(numBookings);
    }

    if (!this.props.commissionCategory && this.props.modalType === 'addNew') {
      allFields = allFields.concat(['fullyCalculatable', 'retrospectiveCommission']);
    }

    if (this.props.modalType !== 'edit') {
      allFields = allFields.concat('landlordProperties');
    }

    return allFields;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const formField = this.getAllFields();

    this.props.form.validateFieldsAndScroll(
      formField,
      { scroll: { offsetTop: 70, offsetBottom: 70 },
      }, (err, values) => {
        if (!err) {
          if (values) {
            const data = values;
            data.name = trim(data.name);
            data.retrospectiveCommission = !!values.retrospectiveCommission;
            data.fullyCalculatable = !values.fullyCalculatable;
            if (values.tenancyUnit === 'NOT_SPECIFIC') {
              data.tenancyUnit = null;
            }

            if (values.capType === 'NOT_SPECIFIC') {
              data.capType = null;
            }

            this.dataTypes.map((dataType) => {
              if (data[dataType] && values[dataType]) {
                data[dataType] = moment(values[dataType]).format('YYYY-MM-DD');
              }
              return true;
            });

            if (this.props.modalType === 'edit' && this.props.correlationId) {
              data.id = this.props.correlationId;
              this.props.updateCommission(data);
            } else {
              data.propertyId = this.props.property.id;

              if (this.props.form.getFieldValue('applyType') === 'moreProperties') {
                const commissionTiers = [];
                const targetPropertyIds = this.props.form.getFieldValue('landlordProperties');

                if (targetPropertyIds) {
                  targetPropertyIds.map((propertyId) => {
                    commissionTiers.push(Object.assign({}, data, { propertyId }));
                    return true;
                  });
                } else {
                  commissionTiers.push(Object.assign({}, data));
                }
                this.props.bulkCreateCommissionTiers(commissionTiers);
              } else {
                this.props.createCommission(data);
              }
            }
            this.props.onClose();
          }
        }
      });
  }

  closePopModal = () => {
    this.setState({
      isFieldsChange: false,
    });
  }

  closeCommissionModal =() => {
    this.setState({
      isFieldsChange: this.props.form.isFieldsTouched(),
    });

    if (!this.props.form.isFieldsTouched()) {
      this.props.onClose();
    }
  }

  handleDuplicate = () => {
    const data = this.props.form.getFieldsValue();
    data.id = this.props.correlationId;

    if (data) {
      if (data.retrospectiveCommission) {
        data.retrospectiveCommission = !!data.retrospectiveCommission;
      }

      this.dataTypes.map((dataType) => {
        if (data[dataType]) {
          data[dataType] = moment(data[dataType]).format('YYYY-MM-DD');
        }
        return true;
      });
    }

    if (document.querySelector('.commission-from-modal')) {
      document.querySelector('.commission-from-modal').classList.add('commission-from-modal__animation');
    }

    const copyName = this.props.t('cms.property.commission_form_modal.copy.title', { name: data.name });
    this.props.form.setFieldsValue({ name: copyName });

    setTimeout(() => {
      this.props.openModal('copy', data);
    }, 1000);
  }

  handleDeleteCommission = () => {
    const { correlationId } = this.props;
    this.props.onClose();
    this.props.deleteCommission({ id: correlationId });
  };

  render() {
    const { t, property, modalType, commissionCategory, landlordProperties } = this.props;

    return (
      <div className="commission-from">
        <h2 className="commission-from__title">
          <Choose>
            <When condition={ modalType === 'edit' }>
              { t('cms.property.commission.create.create_commission_modal.edit.title') }
            </When>
            <Otherwise>
              { t('cms.property.commission.create.create_commission_modal.add.title') }
            </Otherwise>
          </Choose>
        </h2>
        <Popconfirm
          trigger="click"
          visible={ this.state.isFieldsChange }
          title={ t('cms.property.commission_form_modal.close.tips.title') }
          placement="left"
          onConfirm={ this.props.onClose }
          onCancel={ this.closePopModal }
          okText={ t('cms.properties.edit.btn.yes') }
          cancelText={ t('cms.properties.edit.btn.no') }
        >
          <button
            onClick={ this.closeCommissionModal }
            className="commission-from__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </Popconfirm>
        <div className="commission-from__content">
          <If condition={ modalType === 'edit' }>
            <Svg className="commission-from__country-icon" hash="property-country" />
            <span className="commission-from__property-name">
              { property.name }
            </span>
          </If>
          <Form className="ant-advanced-search-form">
            <DetailsForm
              t={ t }
              form={ this.props.form }
              property={ property }
              modalType={ modalType }
            />
            <ExtraRequirementForm t={ t } form={ this.props.form } />
            <If condition={ commissionCategory !== allCommissionCategories.REBOOKERS_COMMISSION }>
              <CommissionCapForm t={ t } form={ this.props.form } />
            </If>
            <If condition={ commissionCategory !== allCommissionCategories.REBOOKERS_COMMISSION }>
              <NoteForm t={ t } form={ this.props.form } />
            </If>
            <If condition={ modalType !== 'edit' }>
              <PropertiesForm
                t={ t }
                form={ this.props.form }
                propertyId={ property.id }
                landlordProperties={ landlordProperties }
              />
            </If>

            <Choose>
              <When condition={ this.props.form.getFieldValue('applyType') === 'moreProperties' }>
                <Popconfirm
                  trigger="click"
                  overlayStyle={ { maxWidth: 290 } }
                  title={ t('cms.property.commission_form_modal.bulk_create_commission_tiers.tips') }
                  placement="leftBottom"
                  onConfirm={ this.handleSubmit }
                  okText={ t('cms.form.value.yes') }
                  cancelText={ t('cms.form.value.no') }
                >
                  <button
                    type="button"
                    className="commission-from__confirm-btn"
                  >
                    { t('cms.listing.modal.confirm.btn') }
                  </button>
                </Popconfirm>
              </When>
              <Otherwise>
                <button
                  type="button"
                  onClick={ this.handleSubmit }
                  className="commission-from__confirm-btn"
                >
                  { t('cms.listing.modal.confirm.btn') }
                </button>
              </Otherwise>
            </Choose>
          </Form>
        </div>
        <div className="commission-from__footer">
          <If condition={ modalType === 'edit' &&
            showElementByAuth(platformEntity.COMMISSION_COMISSION_TIERS, entityAction.CREATE) }
          >
            <Choose>
              <When condition={ this.props.form.isFieldsTouched() }>
                <Tooltip
                  placement="top"
                  title={ t('cms.property.commission_form_modal.copy.tips') }
                >
                  <button className="commission-from__duplicate-btn commission-from__duplicate-btn--disable" type="button">
                    <Icon type="copy" className="commission-from__copy-icon" />
                  </button>
                </Tooltip>
              </When>
              <Otherwise>
                <button
                  type="button"
                  className="commission-from__duplicate-btn"
                  onClick={ this.handleDuplicate }
                  disabled={ this.props.form.isFieldsTouched() }
                >
                  <Icon type="copy" className="commission-from__copy-icon" />
                </button>
              </Otherwise>
            </Choose>
            <span className="commission-from__separator" />
            <Popconfirm
              placement="topLeft"
              title={ this.props.t('cms.properties.edit.commission.delete_commission_hint') }
              onConfirm={ (e) => { e.stopPropagation(); this.handleDeleteCommission(); } }
              onCancel={ (e) => { e.stopPropagation(); } }
              okType="danger"
              okText={ this.props.t('cms.properties.edit.btn.yes') }
              cancelText={ this.props.t('cms.properties.edit.btn.no') }
            >
              <Icon
                className="commission-from__delete-commission-btn"
                type="delete"
                style={ { color: '#38b2a6' } }
                onClick={ (e) => { e.stopPropagation(); } }
              />
            </Popconfirm>
          </If>
        </div>
      </div>
    );
  }
}

CommissionFormModal.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  form: PropTypes.object,
  property: PropTypes.object,
  commissionCategory: PropTypes.string,
  modalType: PropTypes.string,
  correlationId: PropTypes.string,
  updateCommission: PropTypes.func,
  createCommission: PropTypes.func,
  commissionTiers: PropTypes.array,
  openModal: PropTypes.func,
  deleteCommission: PropTypes.func.isRequired,
  landlordProperties: PropTypes.array,
  bulkCreateCommissionTiers: PropTypes.func.isRequired,
};

CommissionFormModal.defaultProps = {
  t: () => {},
  form: {},
  property: {},
  onClose: () => {},
  commissionCategory: '',
  modalType: '',
  correlationId: '',
  updateCommission: () => {},
  createCommission: () => {},
  commissionTiers: [],
  openModal: () => {},
  deleteCommission: () => {},
  landlordProperties: [],
  bulkCreateCommissionTiers: () => {},
};

export default Form.create({
  name: 'commission_form',
  onFieldsChange: (props, changedFields) => {
    if (changedFields && changedFields.category) {
      props.oncommissionCategory(changedFields.category.value);
    }

    if (
      changedFields
      && (
        changedFields.tenancyLengthTo
        || changedFields.tenancyLengthFrom
        || changedFields.capType
      )
    ) {
      if (
        !props.form.getFieldValue('tenancyLengthFrom')
        && !props.form.getFieldValue('tenancyLengthTo')
        && props.form.getFieldValue('capType') !== 'LENGTH'
      ) {
        props.form.resetFields(['tenancyUnit']);
      }
    }
  },
})(CommissionFormModal);

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { get } from 'lodash';
import modal from '~components/modal';
import { propertyStatus } from '~constants/listing-management';
import enhanceForm from '~hocs/enhance-form';
import { Button, Icon, Popconfirm } from 'antd';
import ModalForm from '~pages/dashboard/properties/listing-management/listing-detail/listing-modal/form';
import { communicationStatus } from '~constants';

const mapStateToProps = (state) => {
  const { communication } = state.dashboard.listingManagement.toJS();
  return {
    communication,
  };
};
@connect(mapStateToProps)
@enhanceForm()
@modal({ className: 'listing-details-modal' }, false)
export default class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.openEndDate = '9999-12-31T00:00:00+00:00';
    this.allFields = ['moveIn', 'moveInType', 'moveOut', 'moveOutType', 'tenancyLengthType',
      'tenancyLengthValueMin', 'tenancyLengthValueMax', 'availability', 'priceMin', 'priceMax',
      'priceType', 'discountType', 'discountValue', 'liveOn', 'liveUntil', 'autoPriceAllowed',
      'autoAvailAllowed', 'copyListingToRoom'];
  }

  componentDidMount() {
    this.setPMSModalData(this.props.listingData);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.listingData !== this.props.listingData) {
      this.setPMSModalData(this.props.listingData);
    }
  }

  setPMSModalData = (listing) => {
    const { property, t } = this.props;
    const isLongtail = get(property, 'landlord.bookingJourney') === 'SEMI_AUTOMATIC';

    if (!listing) {
      return true;
    }

    const data = {
      autoAvailAllowed: listing.autoAvailAllowed ? listing.autoAvailAllowed : false,
      autoPriceAllowed: listing.autoPriceAllowed ? listing.autoPriceAllowed : false,
    };

    data.liveOn = listing.liveOn ? moment(listing.liveOn) : null;
    data.liveUntil = listing.liveUntil && listing.liveUntil !== this.openEndDate ?
      moment(listing.liveUntil) : null;
    data.availability = listing.availability || 'GOOD';
    data.discountType = listing.discountType || 'NO_DISCOUNT';
    data.moveInType = listing.moveInType || null;
    data.moveOutType = listing.moveOutType || null;
    data.placeHolder = !!(listing.type && listing.type === 'PLACEHOLDER');
    data.tenancyLengthType = listing.tenancyLengthType || null;

    if (listing.tenancyLengthValue) {
      if (isNaN(Number(listing.tenancyLengthValue))) {
        const [min, max] = listing.tenancyLengthValue.split('-');
        [data.tenancyLengthValueMin, data.tenancyLengthValueMax] = [Number(min), Number(max)];
      } else {
        data.tenancyLengthValueMin = Number(listing.tenancyLengthValue);
        this.props.form.resetFields(['tenancyLengthValueMin']);
      }
    } else {
      this.props.form.resetFields(['tenancyLengthValueMin', 'tenancyLengthValueMax']);
    }

    data.moveIn = listing.moveIn ? moment(listing.moveIn) : null;
    data.moveOut = listing.moveOut ? moment(listing.moveOut) : null;

    if (listing.priceMin && listing.discountValue && listing.discountType === 'ABSOLUTE') {
      data.currentPrice = listing.priceMin - listing.discountValue;
      data.discountValue = listing.discountValue;
    } else if (listing.priceMin && listing.discountValue && listing.discountType === 'PERCENTAGE') {
      // eslint-disable-next-line  no-mixed-operators
      data.currentPrice = (listing.priceMin * (100 - listing.discountValue) / 100);
      data.discountValue = listing.discountValue;
    }

    // When property is longtail type or priceMax not exist, reset priceType and priceMax
    if (isLongtail || !listing.priceMax) {
      data.priceType = 'exact';
      data.priceMax = null;
    } else {
      data.priceType = listing.priceMax !== listing.priceMin ? 'range' : 'exact';
      data.priceMax = Number(listing.priceMax);
    }

    if (listing.priceMin) {
      data.priceMin = Number(listing.priceMin);
      data.originPrice = Number(listing.priceMin);
    }

    this.props.form.setFieldsValue(data);

    // When property is longtail type and priceMax exist, set priceMax force modify error message
    if (isLongtail && get(listing, 'priceMax')) {
      this.props.form.setFields({
        priceMax: {
          errors: [new Error(t('cms.listing.modal.error_message.price_max.forced_to_modify'))],
        },
      });
    }

    return true;
  };

  handleConfirm = () => {
    this.props.form.validateFieldsAndScroll(
      this.allFields,
      {
        scroll: {
          offsetTop: 70,
          offsetBottom: 70,
        },
      }, (err, values) => {
        if (!err) {
          const listingData = this.formatListingData(values);

          this.props.onConfirm(listingData);
        }
      });
  };

  formatListingData = (values) => {
    const data = {};

    data.moveInType = values.moveInType || null;
    data.moveOutType = values.moveOutType || null;
    data.moveIn = values.moveIn ? moment(values.moveIn).format('YYYY-MM-DD') : null;
    data.moveOut = values.moveOut ? moment(values.moveOut).format('YYYY-MM-DD') : null;
    data.availability = values.availability;
    data.discountType = values.discountType === 'NO_DISCOUNT' ? null : values.discountType;
    data.discountValue = values.discountValue ? values.discountValue.toString() : null;
    data.liveOn = moment(values.liveOn).format('YYYY-MM-DDT00:00:00');
    data.liveUntil = this.props.form.getFieldValue('openEnd') ? this.openEndDate : moment(values.liveUntil).format('YYYY-MM-DDT00:00:00');
    data.tenancyLengthType = values.tenancyLengthType || null;
    data.priceMin = values.priceMin ? parseFloat(values.priceMin).toFixed(2) : null;
    data.priceMax = values.priceMax ? parseFloat(values.priceMax).toFixed(2) : null;
    data.type = this.props.form.getFieldValue('placeHolder') ? 'PLACEHOLDER' : 'NOT_SPECIFIC';
    data.autoAvailAllowed = values.autoAvailAllowed;
    data.autoPriceAllowed = values.autoPriceAllowed;

    if (values.tenancyLengthValueMax) {
      data.tenancyLengthValue = `${values.tenancyLengthValueMin}-${values.tenancyLengthValueMax}`;
    } else {
      data.tenancyLengthValue = values.tenancyLengthValueMin ? `${values.tenancyLengthValueMin}` : null;
    }

    if (this.props.type === 'edit') {
      data.listingId = this.props.listingData.id;
    } else {
      data.unitTypeId = this.props.roomData.id;
    }

    if (data.liveUntil === null && values.openEnd) {
      data.liveUntil = this.openEndDate;
    }

    return data;
  };

  isPublished = () => this.props.property.status === propertyStatus.PUBLISHED;

  isLoading = () => {
    const { communication } = this.props;
    const createStatus = get(communication, ['createListing', 'status']);
    const updateStatus = get(communication, ['updateListing', 'status']);

    return createStatus === communicationStatus.FETCHING ||
      updateStatus === communicationStatus.FETCHING;
  }

  render() {
    const { listingData, type, t } = this.props;
    return (
      <div className="listing-form-modal" ref={ (node) => { this.modal = node; } }>
        <div className="listing-form-modal__listing-id">
          <If condition={ listingData && listingData.id && type !== 'copy' && !listingData.unconfirmed }>
            <span className="listing-form-modal__listing-id__text">
              {t('cms.listing.modal.lisitng_id.label', { id: JSON.parse(atob(listingData.id)).id })}
            </span>
          </If>
          <Choose>
            <When condition={ this.props.form.isFieldsTouched() }>
              <Popconfirm
                title={ t('cms.property.listing_management_modal.close.tips.title') }
                placement="left"
                onConfirm={ this.props.onClose }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <button className="listing-form-modal__close-btn" >
                  <Icon type="close" style={ { fontSize: '12px' } } />
                </button>
              </Popconfirm>
            </When>
            <Otherwise>
              <button className="listing-form-modal__close-btn" onClick={ this.props.onClose }>
                <Icon type="close" style={ { fontSize: '12px' } } />
              </button>
            </Otherwise>
          </Choose>
        </div>
        <div
          className="listing-form-modal__content"
        >
          <ModalForm
            property={ this.props.property }
            form={ this.props.form }
            roomData={ this.props.roomData }
            type={ type }
            listing={ listingData }
          />
        </div>
        <div className="listing-form-modal__footer">
          <If condition={ this.isPublished() }>
            <span className="listing-form-modal__publish-tip">
              <Icon
                type="exclamation-circle"
                theme="filled"
                style={ { width: '16px', height: '16px', color: '#f5a623', marginRight: '8px' } }
              />
              { t('cms.properties.edit.rooms.form_modal.copy_with_all_listing.save_tips') }
            </span>
          </If>
          <Button
            className="confirm-button"
            type="primary"
            onClick={ this.handleConfirm }
            loading={ this.isLoading() }
          >
            { t(`cms.properties.edit.rooms.button_save${this.isPublished() ? '.published' : ''}`) }
          </Button>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  property: PropTypes.object,
  onClose: PropTypes.func,
  t: PropTypes.func.isRequired,
  listingData: PropTypes.object,
  form: PropTypes.object, // eslint-disable-line react/require-default-props
  type: PropTypes.string,
  roomData: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  communication: PropTypes.object,
};

Modal.defaultProps = {
  t: () => {},
  listingData: {},
  type: 'create',
  onClose: () => {},
  property: {},
  roomData: {},
  communication: {},
};

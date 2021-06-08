/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import modal from '~components/modal';
import classNames from 'classnames';
import { Button, Icon, Form, Popconfirm, Switch, Tooltip } from 'antd';
import { propertyStatus } from '~constants/listing-management';
import ModalForm from '~pages/dashboard/properties/listing-management/room-detail/room-modal/form';
import { updateMutation } from '~client/constants';

@modal({ className: 'room-details-modal' }, false)
class Modal extends React.Component {
  componentDidMount() {
    this.setModalData(this.props.roomData);
  }

  componentWillReceiveProps(nextProp) {
    if (nextProp.roomData && nextProp.roomData.id !== this.props.roomData.id) {
      this.setModalData(nextProp.roomData);
    }
  }

  setModalData = (roomData) => {
    if (!roomData) {
      return true;
    }

    const dualOccupancy = roomData.dualOccupancy === null ? null : undefined;
    this.handleRoomSize(roomData.roomSize);
    const data = {
      name: roomData.name ? roomData.name : undefined,
      category: roomData.category ? roomData.category : undefined,
      floors: roomData.floors ? roomData.floors : [],
      roomType: roomData.roomType ? roomData.roomType : 'SQM',
      kitchenArrangement: roomData.kitchenArrangement ?
        roomData.kitchenArrangement : undefined,
      bedCount: roomData.bedCount ? roomData.bedCount : undefined,
      viewType: roomData.viewType ? roomData.viewType : undefined,
      maxOccupancy: roomData.maxOccupancy ? roomData.maxOccupancy : undefined,
      dualOccupancy: roomData.dualOccupancy ? roomData.dualOccupancy : dualOccupancy,
      bathroomType: roomData.bathroomType ? roomData.bathroomType : undefined,
      bedroomCountMin: roomData.bedroomCountMin ? roomData.bedroomCountMin : undefined,
      bedroomCountMax: roomData.bedroomCountMax ? roomData.bedroomCountMax : undefined,
      bathroomCount: roomData.bathroomCount ? roomData.bathroomCount : undefined,
      kitchenCount: roomData.kitchenCount ? roomData.kitchenCount : undefined,
      roomArrangement: roomData.roomArrangement ? roomData.roomArrangement : undefined,
      genderMix: roomData.genderMix ? roomData.genderMix : undefined,
      dietaryPreference: roomData.dietaryPreference ? roomData.dietaryPreference : undefined,
      smokingPreference: roomData.smokingPreference ? roomData.smokingPreference : undefined,
      facilities: roomData.facilities ? roomData.facilities : [
        { checked: false, group: null, label: 'Air Conditioning', slug: 'unit_type_air_conditioning' },
        { checked: false, group: null, label: 'Bathroom', slug: 'unit_type_bathroom' },
        { checked: false, group: null, label: 'Chairs', slug: 'unit_type_chairs' },
        { checked: false, group: null, label: 'Closet', slug: 'unit_type_closet' },
        { checked: false, group: null, label: 'Desk', slug: 'unit_type_desk' },
        { checked: false, group: null, label: 'Door Lock', slug: 'unit_type_door_lock' },
        { checked: false, group: null, label: 'Heating', slug: 'unit_type_heating' },
        { checked: false, group: null, label: 'Kitchen', slug: 'unit_type_Kitchen' },
        { checked: false, group: null, label: 'Television', slug: 'unit_type_television' },
        { checked: false, group: null, label: 'WiFi', slug: 'unit_type_wifi' },
      ],
      lastFurnished: roomData.lastFurnished ? moment(roomData.lastFurnished) : null,
      bedSizeType: roomData.bedSizeType ? roomData.bedSizeType : 'UNIFIED', // DIFFERENT
      unitTypeBedSizes: roomData.unitTypeBedSizes ? roomData.unitTypeBedSizes : [],
    };

    if (this.props.type === 'create') {
      data.name = 'Untitled Room';
    }

    if (this.props.type === 'copy') {
      data.name = 'Copy of '.concat(roomData.name);
    }

    this.props.form.setFieldsValue(data);
    return true;
  }

  handleConfirm = () => {
    const { getFieldValue } = this.props.form;
    this.props.form.validateFieldsAndScroll(
      { scroll: { offsetTop: 76, offsetBottom: 76 } },
      (err, values) => {
        if (!err) {
          const newData = {
            bathroomCount: values.bathroomCount,
            bathroomType: values.bathroomType,
            bedCount: Number(values.bedCount),
            bedroomCountMax: values.bedroomCountMax,
            bedroomCountMin: values.bedroomCountMin,
            bedSizeType: values.bedSizeType,
            category: values.category,
            dietaryPreference: values.dietaryPreference,
            dualOccupancy: values.dualOccupancy,
            floors: values.floors,
            genderMix: values.genderMix,
            kitchenArrangement: values.kitchenArrangement,
            kitchenCount: values.kitchenCount,
            lastFurnished: values.lastFurnished && values.lastFurnished.format('YYYY-MM'),
            maxOccupancy: values.maxOccupancy,
            name: values.name,
            roomArrangement: values.roomArrangement,
            roomType: values.roomType,
            smokingPreference: values.smokingPreference,
            unitTypeBedSizes: this.formatUnitTypeBedSizes(values.unitTypeBedSizes),
            unitTypeFacilitySlugs: this.getFacilitySlugs(values.facilities),
            viewType: values.viewType,
          };

          if (getFieldValue('roomSizeType') === 'between' && values.roomSizeMin) {
            newData.roomSize = `${values.roomSizeMin}-${values.roomSizeMax || '-'}`;
          } else if (getFieldValue('roomSizeType') === 'more_than') {
            newData.roomSize = `${values.roomSizeMin}+`;
          } else {
            newData.roomSize = values.roomSizeMin ? `${values.roomSizeMin}` : null;
          }

          if (this.props.type === 'edit') {
            newData.id = this.props.roomData.id;
          } else {
            newData.propertyId = this.props.property.id;
          }

          if (this.props.form.isFieldsTouched() || this.props.type === 'copy') {
            this.props.onConfirm(newData);
          } else {
            this.props.onClose();
          }
        }
      },
    );
  }

  getFacilitySlugs = (facilities) => {
    const slugs = [];
    if (facilities && facilities.length > 0) {
      facilities.map((item) => {
        if (item.checked) {
          slugs.push(item.slug);
        }
        return true;
      });
    }

    return slugs;
  }

  formatUnitTypeBedSizes = (unitTypeBedSizes) => {
    const newData = [];
    if (unitTypeBedSizes && unitTypeBedSizes.length > 0) {
      unitTypeBedSizes.map((item) => {
        if (item.action !== updateMutation.DELETE) {
          newData.push({
            bedCount: item.bedCount,
            length: item.length,
            type: item.type === 'NOT_SPECIFIC' ? null : item.type,
            width: item.width,
          });
        }
        return true;
      });
    }

    return newData;
  }

  handleRoomSize = (roomSize) => {
    const { setFieldsValue } = this.props.form;
    if (/^[0-9.]*-[0-9.]*$/g.test(roomSize)) {
      const roomSizeSplitAnd = roomSize.split('-');
      setFieldsValue({
        roomSizeMin: Number(roomSizeSplitAnd[0]),
        roomSizeMax: Number(roomSizeSplitAnd[1]),
        roomSizeType: 'between',
      });
    } else if (/^[0-9.]*\+$/g.test(roomSize)) {
      const roomSizeSplitMore = roomSize.split('+');
      setFieldsValue({
        roomSizeMin: Number(roomSizeSplitMore[0]),
        roomSizeType: 'more_than',
      });
    } else if (/^[0-9.]*$/g.test(roomSize)) {
      setFieldsValue({
        roomSizeMin: Number(roomSize),
        roomSizeType: 'exact',
      });
    }
  };

  isPublished = () => this.props.property.status === propertyStatus.PUBLISHED;

  render() {
    const { t, roomData, form, type } = this.props;

    return (
      <div className="room-form-modal">
        <div className="room-form-modal__room-id">
          <If condition={ roomData && roomData.id && type !== 'copy' }>
            <span className="room-form-modal__room-id__text">
              {t('cms.properties.edit.rooms.room_id', { roomId: JSON.parse(atob(roomData.id)).id })}
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
                <button className="room-form-modal__close-btn" >
                  <Icon type="close" style={ { fontSize: '12px' } } />
                </button>
              </Popconfirm>
            </When>
            <Otherwise>
              <button className="room-form-modal__close-btn" onClick={ this.props.onClose }>
                <Icon type="close" style={ { fontSize: '12px' } } />
              </button>
            </Otherwise>
          </Choose>
        </div>
        <div className="room-form-modal__content">
          <div className="room-form-modal__type">
            <h3 className="room-form-modal__type-text">
              { t(`cms.properties.edit.rooms.form_modal.${type}`) }
              <If condition={ type === 'copy' }>
                <div className="room-form-modal__copy">
                  <span className="room-form-modal__copy-text">
                    { t('cms.properties.edit.rooms.form_modal.copy_with_all_listing') }
                    <Choose>
                      <When condition={ roomData.listings.length === 0 }>
                        <Tooltip
                          placement="topRight"
                          title={ t('cms.property.listing_management_modal.no_listing.tips') }
                        >
                          <Switch
                            className="room-form-modal__switch-btn"
                            checkedChildren={ <Icon type="check" style={ { fontSize: '12px' } } /> }
                            unCheckedChildren={ <Icon type="close" style={ { fontSize: '12px' } } /> }
                            onClick={ this.props.copyAllListing }
                            disabled
                          />
                        </Tooltip>
                      </When>
                      <Otherwise>
                        <Switch
                          className="room-form-modal__switch-btn"
                          checkedChildren={ <Icon type="check" style={ { fontSize: '12px' } } /> }
                          unCheckedChildren={ <Icon type="close" style={ { fontSize: '12px' } } /> }
                          onClick={ this.props.copyAllListing }
                        />
                      </Otherwise>
                    </Choose>
                  </span>
                </div>
                <span className={ classNames('room-form-modal__copy-text--tips', {
                  'room-form-modal__copy-text--tips-show': this.props.isCopyAllListing,
                }) }
                >
                  { t('cms.properties.edit.rooms.form_modal.copy_with_all_listing.tips') }
                </span>
              </If>
            </h3>
          </div>
          <ModalForm
            t={ t }
            property={ this.props.property }
            roomData={ roomData }
            form={ form }
          />
        </div>
        <div className="room-form-modal__footer">
          <If condition={ this.isPublished() }>
            <span className="room-form-modal__publish-tip">
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
            onClick={ () => { this.handleConfirm(); } }
            loading={ this.props.loading }
          >
            { t(`cms.properties.edit.rooms.button_save${this.isPublished() ? '.published' : ''}`) }
          </Button>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  t: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  roomData: PropTypes.object,
  type: PropTypes.string,
  copyAllListing: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  isCopyAllListing: PropTypes.bool.isRequired,
};

Modal.defaultProps = {
  t: () => { },
  onConfirm: () => { },
  onClose: () => { },
  editedFields: {
    roomsDataChanged: false,
  },
  property: {
    city: {
      country: {
        slut: '',
      },
    },
  },
  roomData: null,
  closeModalPopupVisible: false,
  type: 'create',
  loading: false,
  isCopyAllListing: false,
};

export default Form.create({ name: 'roomsDetails' })(Modal);

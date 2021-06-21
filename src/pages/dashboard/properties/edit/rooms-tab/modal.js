/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Icon, Form, Input, Row, Col, Select, InputNumber, DatePicker, Tooltip, Popconfirm, Checkbox } from 'antd';
import BedSize from '~pages/dashboard/properties/edit/rooms-tab/bed-size';
import Floor from '~pages/dashboard/properties/edit/rooms-tab/floor';
import Facilities from '~pages/dashboard/properties/edit/rooms-tab/facilities';
import { updateMutation, platformEntity, entityAction } from '~client/constants';
import showElementByAuth from '~helpers/auth';

const { Option } = Select;
const { MonthPicker } = DatePicker;
class Modal extends React.PureComponent {
  constructor() {
    super();
    this.doalOccupancyList = ['dual_occupancy_allowed', 'free_dual_occupancy', 'charged_dual_occupancy', 'dual_occupancy_not_allowed', 'not_specific'];
    this.bathroomArrangementList = ['private_non_ensuite', 'private_ensuite', 'shared_non_ensuite', 'shared_ensuite', 'mixed'];
    this.kitchenArrangementList = ['private', 'shared'];
    this.roomArrangementList = ['apartment', 'cluster', 'hotel_style'];
    this.categoryList = ['shared_room', 'private_room', 'entire_place'];
    this.genderMixList = ['male_only', 'female_only', 'mixed'];
  }

  handleCategoryChange = (value) => {
    const { setFieldsValue } = this.props.form;
    switch (value.toLowerCase()) {
      case 'shared_room': {
        setFieldsValue({ category: value, kitchenArrangement: 'SHARED' });
        break;
      }
      case 'private_room': {
        setFieldsValue({ category: value, kitchenArrangement: 'SHARED' });
        break;
      }
      case 'entire_place': {
        setFieldsValue({ category: value, kitchenArrangement: 'PRIVATE' });
        break;
      }
      default: {
        setFieldsValue({ category: value, kitchenArrangement: undefined });
        break;
      }
    }
  }

  handleKitchenArrangementChange = (value) => {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ kitchenArrangement: value.toUpperCase() });
  }

  handleBedCountChange = (value) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    if (Number(value) !== 1 && getFieldValue('dualOccupancy')) {
      setFieldsValue({ dualOccupancy: undefined });
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
    this.props.form.setFieldsValue(data);
    return true;
  }

  handleConfirm = () => {
    const { getFieldValue } = this.props.form;
    this.props.form.validateFieldsAndScroll({ scroll: { offsetTop: 76, offsetBottom: 76 } },
      (err, values) => {
        if (!err) {
          const newData = { ...values };
          newData.lastFurnished = values.lastFurnished && values.lastFurnished.format('YYYY-MM');
          newData.bedCount = Number(newData.bedCount);

          if (getFieldValue('roomSizeType') === 'between' && newData.roomSizeMin) {
            newData.roomSize = `${values.roomSizeMin}-${values.roomSizeMax}`;
          } else if (getFieldValue('roomSizeType') === 'more_than') {
            newData.roomSize = `${values.roomSizeMin}+`;
          } else {
            newData.roomSize = values.roomSizeMin ? `${values.roomSizeMin}` : null;
          }

          let handledListings = this.props.roomData.listings;
          switch (newData.copyListings) {
            case true: {
              handledListings = this.props.roomData.listings.map(listing => ({ ...listing, id: `fake-id-copied-${Math.random()}`, action: 'INSERT', updatedAt: moment().utc().format() }));
              break;
            }
            case false: {
              handledListings = [];
              break;
            }
            default: {
              handledListings = this.props.roomData.listings;
              break;
            }
          }

          this.props.updateRoom(
            this.props.roomData.id,
            {
              id: this.props.roomData.id,
              listings: handledListings,
              links: this.props.roomData.links,
              updatedAt: new Date(),
              ...newData,
            },
            /fake-id/g.test(JSON.parse(atob(this.props.roomData.id)).id) ? updateMutation.INSERT :
              updateMutation.UPDATE,
          );
          this.props.onConfirm();
        }
      },
    );
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

  handleCloseModalPopupConfirm = () => {
    this.props.onControlPopup(false);
    this.props.onClose();
    if (this.props.nextRoom) {
      this.props.onChooseNextRoom();
    }
    this.props.setRoomsDataChanged(false);
  }

  handleCloseModalPopupVisibleChange = (visible) => {
    if (!visible) {
      this.props.onControlPopup(false);
    }
  }

  componentDidMount() {
    this.setModalData(this.props.roomData);
  }

  componentWillReceiveProps(nextProp) {
    if (nextProp.roomData && nextProp.roomData.id !== this.props.roomData.id) {
      this.setModalData(nextProp.roomData);
    }
  }

  categoryLabel = () => (
    <span>
      { this.props.t('cms.properties.edit.rooms.label.category') }
      <Tooltip
        overlayStyle={ { minWidth: 300 } }
        getPopupContainer={ () => this.tipsContainer }
        title={ <span dangerouslySetInnerHTML={ {
          __html: `
          ${this.props.t('cms.properties.edit.rooms.label.category.tips', {
            sharedRoom: `<b>${this.props.t('cms.properties.edit.rooms.category.shared_room.tips')}</b>`,
            entirePlace: `<b><br/>${this.props.t('cms.properties.edit.rooms.category.entire_place.tips')}</b>`,
            privateRoom: `<b><br/>${this.props.t('cms.properties.edit.rooms.category.private_room.tips')}</b>`,
          })}` } }
        /> }
      >
        <Icon type="question-circle" className="rooms-tab__tips-icon" />
      </Tooltip>
    </span>
  );

  getTipsLable = type => (
    <span>
      { this.props.t(`cms.properties.edit.rooms.label.${type}`) }
      <Tooltip
        overlayStyle={ { minWidth: 300 } }
        getPopupContainer={ () => this.tipsContainer }
        title={ this.props.t(`cms.properties.edit.rooms.label.${type}.tips`) }
      >
        <Icon type="question-circle" className="rooms-tab__tips-icon" />
      </Tooltip>
    </span>
  );

  bathroomLable = () => (
    <span>
      { this.props.t('cms.properties.edit.rooms.label.bathroom_arrangement') }
      <Tooltip
        placement="bottom"
        getPopupContainer={ () => this.tipsContainer }
        title={ <span dangerouslySetInnerHTML={ {
          __html: `
          ${this.props.t('cms.properties.edit.rooms.label.bathroom_arrangement.tips', {
            private: `<b>${this.props.t('cms.properties.edit.rooms.arrangement.private.tips')}</b>`,
            privateEnsuite: `<b><br/>${this.props.t('cms.properties.edit.rooms.arrangement.private_ensuite.tips')}</b>`,
            shared: `<b><br/>${this.props.t('cms.properties.edit.rooms.arrangement.shared.tips')}</b>`,
            sharedEnsuite: `<b><br/>${this.props.t('cms.properties.edit.rooms.arrangement.shared_ensuite.tips')}</b>`,
            mix: `<b><br/>${this.props.t('cms.properties.edit.rooms.arrangement.mixed.tips')}</b>`,
          })}` } }
        /> }
      >
        <Icon type="question-circle" className="rooms-tab__tips-icon" />
      </Tooltip>
    </span>
  );

  render() {
    const { t, property, form: { getFieldDecorator, getFieldValue, resetFields }, roomData } =
      this.props;
    return (
      <div className="room-modal" ref={ (node) => { this.tipsContainer = node; } }>
        <div className="rooms-tab__drawer__room-id">
          <If condition={ roomData && roomData.id && !/fake-id/g.test(JSON.parse(atob(roomData.id)).id) }>
            <span className="rooms-tab__drawer__room-id__text">
              {t('cms.properties.edit.rooms.room_id', { roomId: roomData.parsedId })}
            </span>
          </If>
          <Choose>
            <When condition={ this.props.editedFields.roomsDataChanged }>
              <Popconfirm
                visible={ this.props.closeModalPopupVisible }
                onVisibleChange={ this.handleCloseModalPopupVisibleChange }
                title={ t('cms.properties.edit.modal_close_tip') }
                placement="left"
                onConfirm={ this.handleCloseModalPopupConfirm }
                onCancel={ () => { this.props.onControlPopup(false); } }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <button
                  type="button"
                  className="room-modal__btn--close"
                  onClick={ () => {
                    if (this.props.editedFields.roomsDataChanged ||
                      (this.props.roomData.action === updateMutation.NEW)) {
                      this.props.onControlPopup(true);
                    } else {
                      this.props.onControlPopup(false);
                    }
                  } }
                >
                  <Icon type="close" style={ { fontSize: '12px' } } />
                </button>
              </Popconfirm>
            </When>
            <Otherwise>
              <button type="button" className="room-modal__btn--close" onClick={ this.props.onClose }>
                <Icon type="close" style={ { fontSize: '12px' } } />
              </button>
            </Otherwise>
          </Choose>
        </div>
        <div className="rooms-tab__drawer__content">
          <Form layout="vertical">
            <div className="room-details">
              <div className="content-title">
                <span className="content-title__text">{t('cms.properties.edit.rooms.room_details')}</span>
              </div>
              <Form.Item label={ t('cms.properties.edit.rooms.label.room_name') }>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: t('cms.properties.edit.error.blank') }],
                  validateTrigger: 'onBlur',
                })(<Input autoComplete="off" placeholder={ t('cms.properties.edit.rooms.room_name_hint') } />)}
              </Form.Item>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ this.categoryLabel() }>
                    <div ref={ (node) => { this.categoryContainer = node; } }>
                      { getFieldDecorator('category', {
                        rules: [{ required: true, message: t('cms.properties.edit.error.blank') }],
                        validateTrigger: 'onBlur',
                      })(
                        <Select
                          getPopupContainer={ () => this.categoryContainer }
                          placeholder={ t('cms.properties.edit.hint.not_specific') }
                          onChange={ this.handleCategoryChange }
                        >
                          <For of={ this.categoryList } each="categoryItem">
                            <Option key={ categoryItem } value={ categoryItem.toUpperCase() }>{t(`cms.properties.edit.rooms.category.${categoryItem}`)}</Option>
                          </For>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.number_of_beds') }>
                    {getFieldDecorator('bedCount', {
                      rules: [
                        { required: true, message: t('cms.properties.edit.error.blank') },
                        {
                          required: true,
                          validator: (rule, value, callback) => {
                            const unitTypeBedSizes = getFieldValue('unitTypeBedSizes');
                            const totalBedCount = unitTypeBedSizes.map((item) => {
                              if (item.action && item.action === updateMutation.DELETE) {
                                return 0;
                              }
                              return item.bedCount;
                            }).reduce((accumulator, currentUnitTypeBed) =>
                              (accumulator + currentUnitTypeBed), 0);
                            if (getFieldValue('bedSizeType') === 'DIFFERENT' && value < totalBedCount) {
                              callback('error');
                            }
                            callback();
                          },
                          message: t('cms.properties.edit.rooms.number_of_beds.error_hint'),
                        },
                      ],
                      validateTrigger: 'onBlur',
                    })(
                      <InputNumber placeholder="0" onChange={ this.handleBedCountChange } min={ 0 } parser={ value => value && value !== 0 && Math.floor(value.replace(/\D/g, '')) } />,
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={ 16 }>
                <Col span={ 24 }>
                  <label className="room-modal__label">{ t('cms.properties.edit.rooms.label.room_size') }</label>
                  <Input.Group compact>
                    <div style={ { width: '24%' } } ref={ (node) => { this.roomSizeType = node; } }>
                      <Form.Item style={ { width: '100%' } } className="room-modal__room-size-input">
                        {getFieldDecorator('roomSizeType', {
                          initialValue: 'exact',
                        })(
                          <Select getPopupContainer={ () => this.roomSizeType } style={ { width: '100%' } } onChange={ () => { resetFields(['roomSizeMax']); } }>
                            <Option value="exact">{ t('cms.room.modal.room_size_type.option.exact') }</Option>
                            <Option value="between">{ t('cms.room.modal.room_size_type.option.between') }</Option>
                            <Option value="more_than">{ t('cms.room.modal.room_size_type.option.more_than') }</Option>
                          </Select>,
                        )}
                      </Form.Item>
                    </div>

                    <Form.Item style={ { width: '26%' } } className="room-modal__room-size-input">
                      {getFieldDecorator('roomSizeMin', {})(
                        <InputNumber style={ { textAlign: 'center' } } min={ 0 } placeholder="Minimum" type="number" />,
                      )}
                    </Form.Item>
                    <Input
                      className="room-modal__tilde"
                      style={ { width: '4%', borderLeft: 0, borderRight: 0, zIndex: 5 } }
                      placeholder="—"
                      disabled
                    />
                    <Form.Item style={ { width: '26%' } } className="room-modal__room-size-max room-modal__room-size-input">
                      {getFieldDecorator('roomSizeMax', {
                        rules: [{
                          required: getFieldValue('roomSizeMin') && getFieldValue('roomSizeType') === 'between',
                          message: '',
                        }],
                      })(
                        <InputNumber
                          style={ { textAlign: 'center' } }
                          placeholder="Maximum"
                          min={ getFieldValue('roomSizeMin') || 0 }
                          disabled={ getFieldValue('roomSizeType') !== 'between' }
                        />,
                      )}
                    </Form.Item>
                    <div style={ { width: '20%' } } ref={ (node) => { this.roomType = node; } }>
                      <Form.Item style={ { width: '100%' } } className="room-modal__room-size-input">
                        {getFieldDecorator('roomType', {
                          initialValue: 'SQM',
                        })(
                          <Select style={ { width: '100%', borderLeft: 0 } } getPopupContainer={ () => this.roomType }>
                            <Option value="SQM">{t('cms.properties.edit.rooms.room_size.sqm')}</Option>
                            <Option value="SQFT">{t('cms.properties.edit.rooms.room_size.sqft')}</Option>
                          </Select>,
                        )}
                      </Form.Item>
                    </div>
                  </Input.Group>
                </Col>
              </Row>
              <Form.Item
                className="room-details__floor"
                label={ (() =>
                  (<span>{t('cms.properties.edit.rooms.label.label_floor_no')} <span className="label__hint">({t('cms.properties.edit.rooms.floor.label_floor_hint')})</span></span>))() }
              >
                {
                  getFieldDecorator('floors')(
                    <Floor t={ t } />,
                  )
                }
              </Form.Item>
              <Row gutter={ 16 }>
                <Col span={ 24 }>
                  <Form.Item label={ this.getTipsLable('view_type') }>
                    {getFieldDecorator('viewType')(<Input autoComplete="off" maxLength={ 40 } placeholder={ t('cms.properties.edit.rooms.view_type.hint') } />)}
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                className="room-details__bed-size"
                label={ (() =>
                  (<span>{t('cms.properties.edit.rooms.label.label_bed_size')} <span className="label__hint">({t('cms.properties.edit.rooms.bed_size.label_hint')})</span></span>))() }
              >
                {
                  getFieldDecorator('unitTypeBedSizes', {
                    rules: [
                      {
                        required: true,
                        message: t('cms.properties.edit.error.blank'),
                        validator: (rule, value, callback) => {
                          const bedSizeType = getFieldValue('bedSizeType');
                          if (bedSizeType === 'UNIFIED') {
                            if ((!value.length || value[0].type !== null) &&
                            (!value.length || !value[0].type)) {
                              callback('error');
                            }
                            callback();
                          }
                          callback();
                        },
                      },
                      {
                        required: true,
                        message: t('cms.properties.edit.rooms.bed_size.error_hint'),
                        validator: (rule, value, callback) => {
                          const bedSizeType = getFieldValue('bedSizeType');
                          if (bedSizeType === 'DIFFERENT') {
                            const ownTypeItems = value.filter(item =>
                              ((item.type === null && !item.action) &&
                              item.action !== updateMutation.DELETE) ||
                              (!!item.type && !item.action) ||
                              (!!item.type && item.action &&
                                item.action !== updateMutation.DELETE));
                            if (ownTypeItems.length < 2) {
                              callback('error');
                            }
                            callback();
                          }
                          callback();
                        },
                      },
                    ],
                  })(
                    <BedSize
                      t={ t }
                      form={ this.props.form }
                      unitTypeBedSizes={ roomData && roomData.unitTypeBedSizes }
                      bedSizeType={ roomData && roomData.bedSizeType ? roomData.bedSizeType : 'UNIFIED' }
                      countrySlug={ property && property.city && property.city.country.slug }
                      bedCount={ getFieldValue('bedCount') }
                    />,
                  )
                }
              </Form.Item>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ this.getTipsLable('max_occupancy') }>
                    {
                      getFieldDecorator('maxOccupancy')(
                        <InputNumber placeholder="0" min={ 0 } parser={ value => value && value !== 0 && Math.floor(value.replace(/\D/g, '')) } />,
                      )
                    }
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.dual_occupancy') }>
                    <div ref={ (node) => { this.dualOccupancyContainer = node; } }>
                      {
                        getFieldDecorator('dualOccupancy')(
                          <Select
                            getPopupContainer={ () => this.dualOccupancyContainer }
                            placeholder={ t('cms.properties.edit.hint.not_specific') }
                            disabled={ Number(getFieldValue('bedCount')) !== 1 }
                          >
                            <For of={ this.doalOccupancyList } each="dualOccupancyItem" index="dualIdx">
                              <Select.Option
                                value={ dualOccupancyItem !== 'not_specific' ? dualOccupancyItem.toUpperCase() : null }
                                key={ dualIdx }
                              >
                                {t(`cms.properties.edit.rooms.dual_occupancy.${dualOccupancyItem}`)}
                              </Select.Option>
                            </For>
                          </Select>,
                        )
                      }
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ this.bathroomLable() }>
                    <div ref={ (node) => { this.bathroomTypeContainer = node; } }>
                      {
                        getFieldDecorator('bathroomType', {
                          rules: [{ required: true, message: t('cms.properties.edit.error.blank') }],
                        })(
                          <Select
                            getPopupContainer={ () => this.bathroomTypeContainer }
                            placeholder={ t('cms.properties.edit.hint.not_specific') }
                          >
                            <For of={ this.bathroomArrangementList } each="bathroomArrangementItem" index="bathIdx">
                              <Select.Option
                                value={ bathroomArrangementItem.toUpperCase() }
                                key={ bathIdx }
                              >
                                {t(`cms.properties.edit.rooms.arrangement.${bathroomArrangementItem}`)}
                              </Select.Option>
                            </For>
                          </Select>,
                        )
                      }
                    </div>
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.kitchen_arrangement') }>
                    <div ref={ (node) => { this.kitchenArrangementContainer = node; } }>
                      {getFieldDecorator('kitchenArrangement')(
                        <Select
                          getPopupContainer={ () => this.kitchenArrangementContainer }
                          placeholder={ t('cms.properties.edit.hint.not_specific') }
                          onChange={ this.handleKitchenArrangementChange }
                        >
                          <For of={ this.kitchenArrangementList } each="kitchenArrangementItem" index="kitchenIdx">
                            <Select.Option
                              value={ kitchenArrangementItem.toUpperCase() }
                              key={ kitchenIdx }
                            >
                              {t(`cms.properties.edit.rooms.arrangement.${kitchenArrangementItem}`)}
                            </Select.Option>
                          </For>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
            {
              getFieldDecorator('facilities', {
                initialValue: roomData && roomData.facilities,
              })(
                <Facilities t={ t } form={ this.props.form } property={ this.props.property } />,
              )
            }
            <div className="unit-details">
              <div className="content-title">
                <span className="content-title__text">{t('cms.properties.edit.rooms.unitDetails')}</span>
              </div>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ this.getTipsLable('latest_furnished') }>
                    <div ref={ (node) => { this.monthPickerContainer = node; } }>
                      {getFieldDecorator('lastFurnished')(
                        <MonthPicker
                          style={ { width: '100%', fontSize: '14px' } }
                          format="MMM, YYYY"
                          getCalendarContainer={ () => this.monthPickerContainer }
                          disabledDate={ current => (current && current > moment().endOf('month')) }
                        />,
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.room_arrangement') }>
                    <div ref={ (node) => { this.roomArrangementContainer = node; } }>
                      {getFieldDecorator('roomArrangement', {
                        rules: [{ required: true, message: t('cms.properties.edit.error.blank') }],
                      })(
                        <Select
                          getPopupContainer={ () => this.roomArrangementContainer }
                          placeholder={ t('cms.properties.edit.hint.not_specific') }
                        >
                          <For of={ this.roomArrangementList } each="roomArrangementItem" index="roomArrangementIdx">
                            <Option key={ roomArrangementItem } value={ roomArrangementItem.toUpperCase() }>{t(`cms.properties.edit.rooms.arrangement.${roomArrangementItem}`)}</Option>
                          </For>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.min_number_of_bedrooms') }>
                    {getFieldDecorator('bedroomCountMin')(<InputNumber placeholder="0" min={ 0 } parser={ value => value && value !== 0 && Math.floor(value.replace(/\D/g, '')) } />)}
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.max_number_of_bedrooms') }>
                    {getFieldDecorator('bedroomCountMax', {
                      rules: [
                        {
                          validator: (rule, value, callback) => {
                            const bedroomCountMin = getFieldValue('bedroomCountMin');
                            if (value < bedroomCountMin) {
                              callback('error');
                            }
                            callback();
                          },
                          message: t('cms.properties.edit.rooms.max_number_of_beds.error_hint'),
                        },
                      ],
                    })(<InputNumber placeholder="0" min={ 0 } parser={ value => value && value !== 0 && Math.floor(value.replace(/\D/g, '')) } />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.number_of_bathrooms') }>
                    {getFieldDecorator('bathroomCount')(<InputNumber placeholder="0" min={ 0 } />)}
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.number_of_kitchens') }>
                    {getFieldDecorator('kitchenCount')(<InputNumber placeholder="0" min={ 0 } />)}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="unit-rules">
              <div className="content-title">
                <span className="content-title__text">{t('cms.properties.edit.rooms.unitRules')}</span>
              </div>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.gender_mix') }>
                    <div ref={ (node) => { this.genderMixContainer = node; } }>
                      {getFieldDecorator('genderMix')(
                        <Select
                          placeholder={ t('cms.properties.edit.hint.not_specific') }
                          getPopupContainer={ () => this.genderMixContainer }
                        >
                          <Option value={ null }>{t('cms.properties.edit.hint.not_specific')}</Option>
                          <For of={ this.genderMixList } each="genderMixItem" index="genderMixIdx">
                            <Option key={ genderMixIdx } value={ genderMixItem.toUpperCase() }>{t(`cms.properties.edit.rooms.gender_mix.${genderMixItem}`)}</Option>
                          </For>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.smoking_preferences') }>
                    <div ref={ (node) => { this.smokingPreferenceContainer = node; } }>
                      {getFieldDecorator('smokingPreference')(
                        <Select
                          getPopupContainer={ () => this.smokingPreferenceContainer }
                          placeholder={ t('cms.properties.edit.hint.not_specific') }
                        >
                          <Option value={ null }>{t('cms.properties.edit.hint.not_specific')}</Option>
                          <Option value="SMOKING">{t('cms.properties.edit.rooms.smoking_preferences.allow')}</Option>
                          <Option value="NON_SMOKING">{t('cms.properties.edit.rooms.smoking_preferences.not_allow')}</Option>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item label={ t('cms.properties.edit.rooms.label.dietary_preferences') }>
                    <div ref={ (node) => { this.dietaryPreferenceContainer = node; } }>
                      {getFieldDecorator('dietaryPreference')(
                        <Select
                          placeholder={ t('cms.properties.edit.hint.not_specific') }
                          getPopupContainer={ () => this.dietaryPreferenceContainer }
                        >
                          <Option value={ null }>{t('cms.properties.edit.hint.not_specific')}</Option>
                          <Option value={ 'vegetarian'.toUpperCase() }>{t('cms.properties.edit.rooms.dietary_preferences.vegetarian')}</Option>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        </div>
        <div className="rooms-tab__drawer__footer">
          <div className="icons">
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.CREATE,
            ) }
            >
              <Choose>
                <When condition={ roomData && (roomData.action === updateMutation.NEW) }>
                  <Tooltip title={ t('cms.properties.edit.rooms.copy_room_hint') }>
                    <Icon type="copy" className="icon icon-copy" />
                  </Tooltip>
                </When>
                <Otherwise>
                  <Icon type="copy" className="icon icon-copy icon-copy--active" onClick={ () => { this.props.onCopy(roomData); } } />
                </Otherwise>
              </Choose>
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.DELETE,
            ) }
            >
              <Popconfirm
                placement="top"
                title={ t('cms.properties.edit.rooms.delete_room_hint') }
                onConfirm={ () => { this.props.onDelete(roomData); } }
                okText={ t('cms.properties.edit.btn.yes') }
                okType="danger"
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <Icon type="delete" className="icon icon-delete" />
              </Popconfirm>
            </If>

          </div>
          <div>
            <If condition={ roomData && String(JSON.parse(atob(roomData.id)).id).match(/fake-id-copied-/) && roomData.action === updateMutation.NEW }>
              {
                getFieldDecorator('copyListings', { initialValue: false })(
                  <Checkbox disabled={ !roomData.listings.length }>{ t('cms.properties.edit.rooms.copy_with_all_listings') }</Checkbox>,
                )
              }
            </If>
            <Button className="confirm-button" type="primary" onClick={ () => { this.handleConfirm(); } }>
              {t('cms.properties.edit.rooms.button_confirm')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  t: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  updateRoom: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onControlPopup: PropTypes.func.isRequired,
  onChooseNextRoom: PropTypes.func.isRequired,
  setRoomsDataChanged: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  nextRoom: PropTypes.object,
  editedFields: PropTypes.object.isRequired,
  roomData: PropTypes.any,
  closeModalPopupVisible: PropTypes.bool.isRequired,
};

Modal.defaultProps = {
  t: () => { },
  onConfirm: () => { },
  onClose: () => { },
  updateRoom: () => { },
  onCopy: () => { },
  onDelete: () => { },
  onControlPopup: () => { },
  onChooseNextRoom: () => { },
  setRoomsDataChanged: () => { },
  form: {},
  nextRoom: null,
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
};

export default Form.create({
  name: 'rooms',
  onFieldsChange: (props, changedFields) => {
    const changedObj = Object.keys(changedFields)
      .find(fieldName => changedFields[fieldName].touched);
    if (changedObj && !props.editedFields.roomsDataChanged) {
      props.setRoomsDataChanged(true);
    } else if (!changedObj && props.editedFields.roomsDataChanged) {
      props.setRoomsDataChanged(false);
    }
  },
})(Modal);

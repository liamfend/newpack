/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { Icon, Popconfirm } from 'antd';
import { platformEntity, entityAction } from '~client/constants';
import showElementByAuth from '~helpers/auth';
import Svg from '~components/svg';

export default class ViewModal extends React.PureComponent {
formatRoomDetailsData = () => {
  const { roomData } = this.props;
  const roomDetails = [];
  if (roomData) {
    roomDetails.push({ value: roomData.name, label: 'room_name' });
    roomDetails.push({
      value: roomData.category ? this.props.t(`cms.properties.edit.rooms.category.${roomData.category.toLowerCase()}`) : '-',
      label: 'category',
    });
    roomDetails.push({ value: this.formatRoomSizeValue(), label: 'room_size' });
    roomDetails.push({
      value: this.getFloors(roomData.floors),
      label: 'floor_number',
    });
    roomDetails.push({ value: roomData.viewType, label: 'view_type_room' });
    roomDetails.push({ value: roomData.bedCount, label: 'number_of_bads' });
    roomDetails.push({ value: this.getBeds(), label: 'label_bed_size_cm' });
    roomDetails.push({ value: roomData.maxOccupancy, label: 'max_occupancy' });
    roomDetails.push({
      value: roomData.dualOccupancy ? this.props.t(`cms.properties.edit.rooms.dual_occupancy.${roomData.dualOccupancy.toLowerCase()}`) : '-',
      label: 'dual_occupancy',
    });
    roomDetails.push({
      value: roomData.bathroomType ? this.props.t(`cms.properties.edit.rooms.arrangement.${roomData.bathroomType.toLowerCase()}`) : '-',
      label: 'bathroom_arrangement',
    });
    roomDetails.push({
      value: roomData.kitchenArrangement ? this.props.t(`cms.properties.edit.rooms.arrangement.${roomData.kitchenArrangement.toLowerCase()}`) : '-',
      label: 'kitchen_arrangement',
    });
  }

  return roomDetails;
}

getFloors = (floors) => {
  if (!floors) return '';
  const sortedFloors = floors.sort((x, y) => {
    if (x < y) return -1;
    if (x === y) return 0;
    return 1;
  });
  const splitFloors = [];
  let tempArray = [];
  sortedFloors.forEach((floor, index) => {
    if (index > 0) {
      if (floor - sortedFloors[index - 1] !== 1) {
        splitFloors.push(tempArray);
        tempArray = [];
      }
    }
    tempArray.push(floor);
    if (index === sortedFloors.length - 1) {
      splitFloors.push(tempArray);
    }
  });
  return splitFloors.map((item) => {
    if (item.length === 1) return item;
    if (item.length === 2) return item.join('、');
    return `${item[0]}-${item[item.length - 1]}`;
  }).join('、');
}

formatUnitDetailsData = () => {
  const { roomData } = this.props;
  const unitDetails = [];

  if (roomData) {
    unitDetails.push({ value: roomData.lastFurnished ? moment(roomData.lastFurnished).format('MMM,YYYY') : '-', label: 'latest_furnished' });
    unitDetails.push({ value: roomData.roomArrangement ? this.props.t(`cms.properties.edit.rooms.arrangement.${roomData.roomArrangement.toLowerCase()}`) : '', label: 'room_arrangement' });
    unitDetails.push({ value: roomData.bedroomCountMin, label: 'min_number_of_bedrooms' });
    unitDetails.push({ value: roomData.bedroomCountMax, label: 'max_number_of_bedrooms' });
    unitDetails.push({ value: roomData.bathroomCount, label: 'number_of_bathrooms' });
    unitDetails.push({ value: roomData.kitchenCount, label: 'number_of_kitchens' });
  }

  return unitDetails;
}

formatUnitRulesData = () => {
  const { roomData } = this.props;
  const unitRules = [];

  if (roomData) {
    unitRules.push({ value: roomData.genderMix ? this.props.t(`cms.properties.edit.rooms.gender_mix.${roomData.genderMix.toLowerCase()}`) : '', label: 'gender_mix' });
    unitRules.push({ value: roomData.dietaryPreference ? this.props.t(`cms.table.value.dietary_preference.${roomData.dietaryPreference.toLowerCase()}`) : '', label: 'dietary_preferences' });
    unitRules.push({ value: roomData.smokingPreference ? this.props.t(`cms.table.value.smoking_preference.${roomData.smokingPreference.toLowerCase()}`) : '', label: 'smoking_preferences' });
  }

  return unitRules;
}

formatRoomSizeValue = () => {
  const { roomData } = this.props;
  let roomSize = '-';

  if (roomData.roomSize) {
    roomSize = roomData.roomSize.replace('-', '~');
  }

  if (roomData.roomType) {
    roomSize = roomSize.concat(' ', roomData.roomType.toLowerCase());
  }

  return roomSize;
}

getBeds = () => {
  const { unitTypeBedSizes } = this.props.roomData;
  if (!unitTypeBedSizes) return '-';

  const showBedCount = (bedCount) => {
    if (unitTypeBedSizes.length <= 1) {
      return '';
    }

    return bedCount ? ` / ${bedCount}` : ' / -';
  };

  return (<span> {
    unitTypeBedSizes
      .map((item, index) => {
        if (!item.type) {
          return '';
        }

        return (
          <div key={ item.type.concat(index) }>
            {
              `${this.props.t(`cms.properties.edit.rooms.bed_size.${item.type.toLowerCase()}`)}
              ${item.width && item.length ? ` / ${item.width}cm * ${item.length}cm` : ' / -'}${showBedCount(item.bedCount)}`
            }
          </div>
        );
      })
  }</span>);
}

getFacilities = () => {
  if (this.props.roomData && this.props.roomData.facilities) {
    return this.props.roomData.facilities.filter(item => item.checked).map(item => item.label).join('、');
  }
  return '-';
}

render() {
  const { t, roomData } = this.props;
  const facilitiesText = this.getFacilities() || '-';

  return (
    <div className="room-view-modal" ref={ (node) => { this.tipsContainer = node; } }>
      <div className="room-view-modal__room-id">
        <If condition={ roomData && roomData.id }>
          <span className="room-view-modal__room-id__text">
            {t('cms.properties.edit.rooms.room_id', { roomId: JSON.parse(atob(roomData.id)).id })}
          </span>
        </If>
        <button type="button" className="room-view-modal__close-btn" onClick={ this.props.onClose }>
          <Icon type="close" style={ { fontSize: '12px' } } />
        </button>
      </div>
      <div className="room-view-modal__content">
        <div className="room-view-modal__room-detail">
          <div className="room-view-modal__title">
            <span className="room-view-modal__title-text">{t('cms.properties.edit.rooms.room_details')}</span>
          </div>
          <For of={ this.formatRoomDetailsData() } each="item" index="index">
            <div
              className={ classNames(
                'room-view-modal__label',
                { 'room-view-modal__label--flex': item.label === 'label_bed_size_cm' || item.label === 'view_type_room' },
              ) }
              key={ item.label }
            >
              { t(`cms.properties.edit.rooms.label.${item.label}`) }:
              <span className="room-view-modal__label-value">
                { item.value ? item.value : '-' }
              </span>
            </div>
          </For>
        </div>
        <div className="room-view-modal__facilities">
          <div className="room-view-modal__title">
            <span className="room-view-modal__title-text">{t('cms.properties.edit.rooms.facilities')}</span>
          </div>
          <div className="room-view-modal__label" key="facilities">
            <span className="room-view-modal__label-value">
              { facilitiesText }
            </span>
          </div>
        </div>
        <div className="room-view-modal__room_details">
          <div className="room-view-modal__title">
            <span className="room-view-modal__title-text">{t('cms.properties.edit.rooms.unitDetails')}</span>
          </div>
          <For of={ this.formatUnitDetailsData() } each="item" index="index">
            <div className="room-view-modal__label" key={ item.label }>
              { t(`cms.properties.edit.rooms.label.${item.label}`) }:
              <span className="room-view-modal__label-value">
                { item.value ? item.value : '-' }
              </span>
            </div>
          </For>
        </div>
        <div className="room-view-modal__room_details">
          <div className="room-view-modal__title">
            <span className="room-view-modal__title-text">{t('cms.properties.edit.rooms.unitRules')}</span>
          </div>
          <For of={ this.formatUnitRulesData() } each="item" index="index">
            <div className="room-view-modal__label" key={ item.label }>
              { t(`cms.properties.edit.rooms.label.${item.label}`) }:
              <span className="room-view-modal__label-value">
                { item.value ? item.value : '-' }
              </span>
            </div>
          </For>
        </div>
      </div>
      <div className="room-view-modal__footer">
        <div className="room-view-modal__btns">
          <If condition={ showElementByAuth(
            platformEntity.PROPERTIES_UNIT_TYPES,
            entityAction.DELETE,
          ) }
          >
            <button
              className="room-view-modal__btn"
              onClick={ () => { this.props.openModal('edit'); } }
            >
              <Svg hash="edit" className="room-view-modal__btn-icon" />
            </button>
            <span className="room-view-modal__btns-line" />
          </If>
          <If condition={ showElementByAuth(
            platformEntity.PROPERTIES_UNIT_TYPES,
            entityAction.CREATE,
          ) }
          >
            <button
              className="room-view-modal__btn"
              onClick={ () => { this.props.openModal('copy'); } }
            >
              <Svg hash="copy" className="room-view-modal__btn-icon" />
            </button>
            <span className="room-view-modal__btns-line" />
          </If>
          <If condition={ showElementByAuth(
            platformEntity.PROPERTIES_UNIT_TYPES,
            entityAction.DELETE,
          ) }
          >
            <Popconfirm
              title={ t('cms.properties.edit.room.deleted_tip') }
              placement="topRight"
              onConfirm={ () => { this.props.onDelete(roomData); this.props.onClose(); } }
              okText={ t('cms.properties.edit.btn.yes') }
              cancelText={ t('cms.properties.edit.btn.no') }
              okType="danger"
            >
              <button className="room-view-modal__btn">
                <Svg hash="delete" className="room-view-modal__btn-icon" />
              </button>
            </Popconfirm>
          </If>
        </div>
      </div>
    </div>
  );
}
}

ViewModal.propTypes = {
  t: PropTypes.func.isRequired,
  roomData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  openModal: PropTypes.func,
};

ViewModal.defaultProps = {
  t: () => {},
  onDelete: () => {},
  openModal: () => {},
  roomData: {},
};

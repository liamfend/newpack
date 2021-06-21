import React from 'react';
import PropTypes from 'prop-types';
import RoomListingReviewItem from '~components/property-review/room-listing-item';
import moment from 'moment';
import { updateMutation } from '~client/constants';


export default class RoomListingReview extends React.Component {
  constructor(props) {
    super(props);

    this.roomFormatOption = {
      roomDetails: {
        category: { tKey: 'category', getValue: this.getCategory },
        roomSize: { tKey: 'room_size', getValue: this.getRoomSize },
        floors: { tKey: 'label_floor_no', getValue: this.getFloors },
        viewType: { tKey: 'view_type' },
        bedCount: { tKey: 'number_of_beds' },
        maxOccupancy: { tKey: 'max_occupancy' },
        dualOccupancy: { tKey: 'dual_occupancy', getValue: this.getDualOccupancy },
        bathroomType: { tKey: 'bathroom_arrangement', getValue: this.getArrangement },
        kitchenArrangement: { tKey: 'kitchen_arrangement', getValue: this.getArrangement },
        unitTypeBedSizes: { tKey: 'label_bed_size_cm', getValue: this.getBeds },
      },
      facilities: this.getFacilities,
      unitDetails: {
        lastFurnished: { tKey: 'latest_furnished', getValue: this.getLastFurnished },
        roomArrangement: { tKey: 'room_arrangement', getValue: this.getRoomArrangement },
        bedroomCountMin: { tKey: 'min_number_of_bedrooms' },
        bedroomCountMax: { tKey: 'max_number_of_bedrooms' },
        bathroomCount: { tKey: 'number_of_bathrooms' },
        kitchenCount: { tKey: 'number_of_kitchens' },
      },
      unitRules: {
        genderMix: { tKey: 'gender_mix', getValue: this.getGenderMix },
        dietaryPreference: { tKey: 'dietary_preferences', getValue: this.getDietaryPreference },
        smokingPreference: { tKey: 'smoking_preferences', getValue: this.getSmokingPreference },
      },
    };

    this.fullData = this.formatFullData(props.changedData || props.originalData);
    this.changedData = props.changedData ?
      this.getChangedData(props.changedData, props.originalData) : [];
  }

  getBeds = (value) => {
    if (!value) return '';
    return value
      .filter(item => item._action !== updateMutation.DELETE) // eslint-disable-line
      .map((item) => {
        if (!item.type) {
          return '';
        }

        return (
          `${this.props.t(`cms.properties.edit.rooms.bed_size.${item.type.toLowerCase()}`)
          }${item.width && item.length ? `: ${item.width}x${item.length}` : ''}${item.bedCount ? ` (${item.bedCount})` : ''}`
        );
      }).join('、');
  }

  getCategory = value => (value ? this.props.t(`cms.properties.edit.rooms.category.${value.toLowerCase()}`) : '')


  getRoomSize = (value, room) =>
    (value && room.roomType ? `${value} ${this.props.t(`cms.properties.edit.rooms.room_size.${room.roomType.toLowerCase()}`)}` : '')


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

  getArrangement = value =>
    (value ? this.props.t(`cms.properties.edit.rooms.arrangement.${value.toLowerCase()}`) : '');

  getDualOccupancy = value =>
    (value ? this.props.t(`cms.properties.edit.rooms.dual_occupancy.${value.toLowerCase()}`) : '');

  getFacilities = (value) => {
    if (!value) return '';
    return value.filter(item => item.checked).map(item => item.label).join('、');
  }

  getLastFurnished = value => (value ? moment(value).format('ll') : '')

  getRoomArrangement = value =>
    (value ? this.props.t(`cms.properties.edit.rooms.arrangement.${value.toLowerCase()}`) : '');


  getGenderMix = value =>
    (value ? this.props.t(`cms.properties.edit.rooms.gender_mix.${value.toLowerCase()}`) : '');

  getDietaryPreference = value =>
    (value ? this.props.t(`cms.table.value.dietary_preference.${value.toLowerCase()}`) : '');

  getSmokingPreference = value =>
    (value ? this.props.t(`cms.table.value.smoking_preference.${value.toLowerCase()}`) : '');

  formatFullData = data => data.filter(room => room.node.action !== updateMutation.DELETE)
    .map((room) => {
      const formatedRoom = this.formatRoomDetail(room.node, data);
      formatedRoom.listings = formatedRoom.listings ?
        formatedRoom.listings.filter(listing => listing.action !== updateMutation.DELETE) : [];
      return formatedRoom;
    })

  formatRoomDetail = (room) => {
    const result = [];
    Object.keys(this.roomFormatOption).map((topicName) => {
      const topicOption = this.roomFormatOption[topicName];
      let topic = [];
      if (topicName === 'facilities') {
        topic = topicOption(room.facilities);
      } else {
        Object.keys(topicOption).map((fieldName) => {
          const fieldOption = topicOption[fieldName];
          const fieldValue =
            fieldOption.getValue ? fieldOption.getValue(room[fieldName], room) : room[fieldName];
          topic.push({
            key: fieldName,
            fieldName: this.props.t(`cms.properties.edit.rooms.label.${fieldOption.tKey}`),
            text: fieldValue || '',
          });
          return true;
        });
      }
      result.push({ name: topicName, value: topic });
      return true;
    });

    return Object.assign({}, room, { roomDetails: result });
  }

  removeUnchangedInDetail = (originalRoom, updatedRoom) => {
    const result = [];
    updatedRoom.roomDetails.forEach((topicItem, topicIndex) => {
      const originalTopic = originalRoom.roomDetails[topicIndex];
      const updatedTopic = topicItem;
      let topic = [];
      if (updatedTopic.name === 'facilities') {
        topic = originalTopic.value === updatedTopic.value
          ? null : updatedTopic.value;
      } else {
        updatedTopic.value.forEach((updatedItem, index) => {
          const originalItem = originalTopic.value[index];
          if (updatedItem.text !== originalItem.text) {
            topic.push(updatedItem);
          }
        });
      }
      result.push({ name: updatedTopic.name, value: topic });
    });

    return Object.assign({}, updatedRoom, { roomDetails: result });
  }

  getChangedData = (changedData, originalData) => {
    const filtered = changedData.filter(
      room => !!room.node.action || !!room.node.listings.find(item => item.action));
    return filtered.map((item) => {
      const room = item.node;
      let result = {};
      switch (room.action) {
        case updateMutation.INSERT:
          result = this.formatRoomDetail(room);
          break;
        case updateMutation.UPDATE: {
          const originalRoom = this.formatRoomDetail(this.findOriginalRoom(originalData, room));
          const updatedRoom = this.formatRoomDetail(room);
          result = this.removeUnchangedInDetail(originalRoom, updatedRoom);
          break;
        }
        case updateMutation.DELETE: {
          const listings = room.listings.map(listing =>
            Object.assign({}, listing, { action: updateMutation.DELETE }));
          result = Object.assign({}, room, { listings });
          break;
        }
        default: {
          // 更新了listing,没更新room detail的room
          result = Object.assign({}, room,
            { roomDetails: [{ name: 'roomDetails' }, { name: 'facilities' }, { name: 'unitDetails' }, { name: 'unitRules' }] });
        }
      }

      if (result.listings) {
        result.listings = result.listings.filter(listing => !!listing.action);
      }
      return result;
    });
  }

  findOriginalRoom = (data, room) => {
    if (room.type !== updateMutation.INSERT) {
      return data.find(item => item.node.id === room.id).node;
    }
    return null;
  }

  render() {
    const { t, isChangedVersion, property } = this.props;
    const data = isChangedVersion ? this.changedData : this.fullData;
    return (
      <div className="room-review">
        <Choose>
          <When condition={ data && data.length > 0 }>
            <div className="room-review__container">
              <For index="index" each="item" of={ data }>
                <If condition={ !item.isChangedByLink }>
                  <RoomListingReviewItem
                    key={ item.id }
                    room={ item }
                    isChangedVersion={ isChangedVersion }
                    property={ property }
                    t={ t }
                  />
                </If>
              </For>
            </div>
          </When>
          <Otherwise>
            <div className="property-review__empty-topic">{t('cms.properties.edit.review_modal.topic.empty')}</div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}


RoomListingReview.propTypes = {
  t: PropTypes.func,
  isChangedVersion: PropTypes.bool,
  originalData: PropTypes.array,
  changedData: PropTypes.array,
  property: PropTypes.object.isRequired,
};

RoomListingReview.defaultProps = {
  t: () => {},
  originalData: null,
  changedData: null,
  isChangedVersion: false,
  data: [],
};

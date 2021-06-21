import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Icon } from 'antd';
import {
  changeLogSections,
  changeLogUnitType,
  changeLogListingType,
  changeLogPropertyType,
} from '~constants/change-log';
import RichText from '~pages/dashboard/properties/change-log/listing-management/rich-text';
import { isEmptyObject } from '~helpers/property-edit';
import { cloneObject } from '~helpers';

const roomDetailsRange = [
  'name',
  'categorySlug',
  'bedCount',
  'roomSize',
  'roomType',
  'floors',
  'viewType',
  'bedSizeType',
  'maxOccupancy',
  'dualOccupancy',
  'bathroomType',
  'kitchenArrangement',
];

const unitDetailsRange = [
  'lastFurnished',
  'arrangement',
  'bedroomCountMin',
  'bedroomCountMax',
  'bathroomCount',
  'kitchenCount',
];

const unitRulesRange = [
  'genderMix',
  'dietaryPreference',
  'smokingPreference',
];

const tenancyDetailsRange = [
  'moveInType',
  'moveIn',
  'tenancyLengthType',
  'tenancyLengthValue',
  'moveOutType',
  'moveOut',
  'billingCycle',
];

const availabilityAndPriceRange = [
  'availability',
  'priceType',
  'priceMin',
  'priceMax',
  'discountType',
  'discountValue',
];

const generalSettingRange = [
  'liveOn',
  'liveUntil',
  'priceFeedControlled',
  'availabilityFeedControlled',
];

const detailAddressRange = [
  'propertyType',
  'name',
  'slug',
  'status',
  'landlordName',
  'displayCity',
  'displayCountry',
  'currency',
  'billingCycle',
  'totalBeds',
  'freeCancellationPeriod',
  'cancellationPeriod',
  'cancellationProcess',
  'headlineCn',
  'descriptionCn',
  'headline',
  'description',
  'rankingType',
  'rank',
  'address',
  'addressLine2',
  'postalCode',
  'shippingCity',
  'latitude',
  'longitude',
  'displayarea',
  'recommendedUniversities',
  'noPlaceNoPay',
  'noVisaNoPay',
];

const facilitySlugArr = [
  'bike_storage', 'cinema', 'communal_kitchen',
  'elevators', 'entertainment_area', 'gym',
  'library_study_area', 'onsite_manager', 'personal_contents_insurance_included',
  'reception', 'refrigrator', 'shuttle_bus_to_university',
  'wifi',
  'fully_furnished', 'furnished_additional_fee', 'unfurnished', 'furnished_no_service',
  'laundry', 'laundry_coin', 'laundry_free', 'laundry_facilities_no_service',
  'others',
  'cleaning_service_charge_seperately', 'cleaning_service_free', 'cleaning_service_no_service',
  'contents_insurance_charge_seperately', 'contents_insurance_free', 'contents_insurance_no_service',
  'electricity_charge_seperately', 'electricity_free', 'electricity_free_within_usage_capacity', 'electricity_no_service',
  'gas_charge_seperately', 'gas_free', 'gas_free_within_usage_capacity', 'gas_no_service',
  'heating_charge_seperately', 'heating_free', 'heating_free_within_usage_capacity', 'heating_no_service',
  'meals_included_all_meals', 'meals_included_flexi_meals', 'meals_included_half_board', 'meals_included_no_service',
  'water_charge_seperately', 'water_free', 'water_free_within_usage_capacity', 'water_no_service',
  'wifi_charge_seperately', 'wifi_free', 'wifi_free_within_usage_capacity', 'wifi_no_service',
  'cctv', 'security_alarm',
  'controlled_access_gate_24_hour', 'controlled_access_gate_fob_key', 'controlled_access_gate_locked_gate', 'controlled_access_gate_swipe_key', 'controlled_access_gate_no_service',
  'maintenance_team_24_hour_on_call', 'maintenance_team_24_hour_on_site', 'maintenance_team_daytime_only', 'maintenance_team_no_service',
  'security_officer_24_hour_patrol', 'security_officer_night_patrol', 'security_officer_no_service',
  'family_friendly', 'no_alcohol', 'no_pets',
  'no_smoking', 'no_under_18',
];

const openEndDate = '9999-12-31T00:00:00';

export default class DetailModal extends React.PureComponent {
  getTagLabel = () => {
    const { logSection } = this.props.activeChangeLog;
    if (changeLogSections[logSection] === 'rooms') {
      return this.props.t('cms.change_log.detail.room_id.tag');
    }
    if (changeLogSections[logSection] === 'listings') {
      return this.props.t('cms.change_log.detail.listing_id.tag');
    }

    return this.props.t('cms.change_log.detail.property_id.tag');
  };

  formatBedSize = (bedSize, index) => {
    const { t } = this.props;
    const { width, length, type, bedCount } = bedSize;

    return (
      <span>
        <span className="active-change-log__bed-size-type">
          { type && type[index] ? t(`cms.properties.edit.rooms.bed_size.${type[index]}`) : '-' }
        </span>
        <span className="active-change-log__bed-size-value">
          { `${width && width[index] ? `${width[index]}(W)` : '-'} / ${length && length[index] ? `${length[index]}(L)` : '-'}` }
        </span>
        <span className="active-change-log__bed-size-value">
          { bedCount && bedCount[index] ? `(${bedCount[index]})` : '-' }
        </span>
      </span>
    );
  };

  formatFieldValue = (field, value) => {
    const { t } = this.props;
    let formatedFieldValue = '';
    if (value === null || value === '') {
      return '-';
    }
    switch (field) {
      case 'floors':
        formatedFieldValue = value.length === 0 ? '-' : value.join('、');
        break;
      case 'lastFurnished':
      case 'moveIn':
      case 'moveOut':
      case 'liveOn':
        formatedFieldValue = moment(value).format('ll');
        break;
      case 'liveUntil':
        formatedFieldValue = moment(value).isSame(openEndDate) ?
          t('cms.change_log.detail.open_end.field_value') : moment(value).format('ll');
        break;
      case 'categorySlug':
      case 'kitchenArrangement':
      case 'bathroomType':
      case 'arrangement':
      case 'genderMix':
      case 'dualOccupancy':
      case 'dietaryPreference':
      case 'smokingPreference':
      case 'tenancyLengthType':
      case 'moveOutType':
      case 'moveInType':
      case 'availability':
      case 'priceType':
      case 'discountType':
      case 'freeCancellationPeriod':
      case 'propertyType':
      case 'billingCycle':
      case 'status':
      case 'bedSizeType':
        formatedFieldValue = t(`cms.change_log.detail.${value.toString().toLowerCase().replace(/-/g, '_')}.field_value`);
        break;
      case 'priceFeedControlled':
      case 'availabilityFeedControlled':
      case 'noPlaceNoPay':
      case 'noVisaNoPay':
        formatedFieldValue = value === true ? 'True' : 'False';
        break;
      case 'descriptionCn':
      case 'description':
      case 'cancellationProcess':
        formatedFieldValue = <RichText t={ t } unsafeHTML={ value } />;
        break;
      default:
        formatedFieldValue = value;
    }
    return formatedFieldValue;
  }

  formatRoomChanges = () => {
    const { t } = this.props;
    const { changes } = this.props.activeChangeLog;
    const changeRowArr = [];

    if (!changes) {
      return [];
    }

    // Room details category
    const roomDetailsFields = this.filterSortFields(changes.unitType, roomDetailsRange);
    if (roomDetailsFields.roomType) {
      if (!roomDetailsFields.roomSize) {
        roomDetailsFields.roomSize = [];
      }
      const oldRoomSize = roomDetailsFields.roomSize[0] || '-';
      const oldRoomType =
        roomDetailsFields.roomType[0] ?
          t(`cms.change_log.detail.${roomDetailsFields.roomType[0]}.field_value`) : '-';

      const newRoomSize = roomDetailsFields.roomSize[1] || '-';
      const newRoomType =
        roomDetailsFields.roomType[1] ?
          t(`cms.change_log.detail.${roomDetailsFields.roomType[1]}.field_value`) : '-';

      roomDetailsFields.roomSize[0] = `${oldRoomSize} (${oldRoomType})`;
      roomDetailsFields.roomSize[1] = `${newRoomSize} (${newRoomType})`;

      delete roomDetailsFields.roomType;
    } else if (roomDetailsFields.roomSize) {
      roomDetailsFields.roomSize[0] = `${roomDetailsFields.roomSize[0] || '-'} (-)`;
      roomDetailsFields.roomSize[1] = `${roomDetailsFields.roomSize[1] || '-'} (-)`;
    }
    if (changes.bedSize || Object.keys(roomDetailsFields).length > 0) {
      changeRowArr.push({
        field: t('cms.properties.edit.rooms.room_details'),
      });
      if (Object.keys(roomDetailsFields).length > 0) {
        Object.keys(roomDetailsFields).map((field, index) => {
          // Insert bedSize changes
          if (
            index === 0 &&
            roomDetailsRange.indexOf(Object.keys(roomDetailsFields)[index]) >= 8
          ) {
            changes.bedSize.map((bedSizeItem) => {
              changeRowArr.push({
                field: t('cms.change_log.detail.bed_size.field'),
                oldValue: this.formatBedSize(bedSizeItem, 0),
                newValue: this.formatBedSize(bedSizeItem, 1),
              });
              return true;
            });
          }
          changeRowArr.push({
            field: t(`cms.properties.edit.rooms.label.${changeLogUnitType[field]}`),
            oldValue: this.formatFieldValue(field, roomDetailsFields[field][0]),
            newValue: this.formatFieldValue(field, roomDetailsFields[field][1]),
          });
          // Insert bedSize changes
          if (
            changes.bedSize &&
            roomDetailsRange.indexOf(Object.keys(roomDetailsFields)[index]) <= 7 &&
            (
              roomDetailsRange.indexOf(Object.keys(roomDetailsFields)[index + 1]) >= 8 ||
              !Object.keys(roomDetailsFields)[index + 1]
            )
          ) {
            changes.bedSize.map((bedSizeItem) => {
              changeRowArr.push({
                field: t('cms.change_log.detail.bed_size.field'),
                oldValue: this.formatBedSize(bedSizeItem, 0),
                newValue: this.formatBedSize(bedSizeItem, 1),
              });
              return true;
            });
          }
          return true;
        });
      } else if (changes.bedSize) {
        changes.bedSize.map((bedSizeItem) => {
          changeRowArr.push({
            field: t('cms.change_log.detail.bed_size.field'),
            oldValue: this.formatBedSize(bedSizeItem, 0),
            newValue: this.formatBedSize(bedSizeItem, 1),
          });
          return true;
        });
      }
    }

    // Facilities in this room
    if (changes.facility) {
      changeRowArr.push({
        field: t('cms.properties.edit.rooms.facilities'),
      });
      changes.facility.map((facility) => {
        changeRowArr.push({
          field: facility.name,
          oldValue: facility.change[0] ? 'True' : 'False',
          newValue: facility.change[1] ? 'True' : 'False',
        });
        return true;
      });
    }

    // Unit details category
    const unitDetailsFields = this.filterSortFields(changes.unitType, unitDetailsRange);
    if (Object.keys(unitDetailsFields).length > 0) {
      changeRowArr.push({
        field: t('cms.properties.edit.rooms.unitDetails'),
      });
      Object.keys(unitDetailsFields).map((field) => {
        changeRowArr.push({
          field: t(`cms.properties.edit.rooms.label.${changeLogUnitType[field]}`),
          oldValue: this.formatFieldValue(field, unitDetailsFields[field][0]),
          newValue: this.formatFieldValue(field, unitDetailsFields[field][1]),
        });
        return true;
      });
    }

    // Unit rules category
    const unitRulesFields = this.filterSortFields(changes.unitType, unitRulesRange);
    if (Object.keys(unitRulesFields).length > 0) {
      changeRowArr.push({
        field: t('cms.properties.edit.rooms.unitRules'),
      });
      Object.keys(unitRulesFields).map((field) => {
        changeRowArr.push({
          field: t(`cms.properties.edit.rooms.label.${changeLogUnitType[field]}`),
          oldValue: this.formatFieldValue(field, unitRulesFields[field][0]),
          newValue: this.formatFieldValue(field, unitRulesFields[field][1]),
        });
        return true;
      });
    }

    return changeRowArr;
  };

  formatListingChanges = () => {
    const { t } = this.props;
    const { changes, entryType } = cloneObject(this.props.activeChangeLog);
    const changeRowArr = [];

    if (!changes) {
      return [];
    }
    if (changes.type && Array.isArray(changes.type)) {
      if (changes.type[0] !== 'placeholder' && changes.type[1] !== 'placeholder') {
        delete changes.type;
      } else if (changes.type[0] !== 'placeholder' && changes.type[1] === 'placeholder') {
        delete changes.availability;
      } else if (
        changes.type[0] === 'placeholder' &&
        changes.type[1] !== 'placeholder' &&
        changes.availability
      ) {
        changes.availability[0] = 'placeholder';
      }
    }

    if (changes.type) {
      let oldValue = '';
      if (entryType.toLowerCase() === 'create') {
        oldValue = '-';
      } else {
        oldValue = changes.type[0] === 'placeholder' ? 'True' : 'False';
      }

      changeRowArr.push({
        field: t('cms.change_log.detail.type.field'),
        oldValue,
        newValue: changes.type[1] === 'placeholder' ? 'True' : 'False',
      });
    }
    // Tenancy details category
    const tenancyDetailsFields = this.filterSortFields(changes, tenancyDetailsRange);
    if (Object.keys(tenancyDetailsFields).length > 0) {
      changeRowArr.push({
        field: t('cms.listing.modal.tenancy_details.title'),
      });
      Object.keys(tenancyDetailsFields).map((field) => {
        changeRowArr.push({
          field: t(`cms.change_log.detail.${changeLogListingType[field]}.field`),
          oldValue: this.formatFieldValue(field, tenancyDetailsFields[field][0]),
          newValue: this.formatFieldValue(field, tenancyDetailsFields[field][1]),
        });
        return true;
      });
    }
    // Availability and price category
    const availabilityAndPriceFields = this.filterSortFields(changes, availabilityAndPriceRange);
    if (Object.keys(availabilityAndPriceFields).length > 0) {
      changeRowArr.push({
        field: t('cms.listing.modal.availability_and_price.title'),
      });
      Object.keys(availabilityAndPriceFields).map((field) => {
        changeRowArr.push({
          field: t(`cms.change_log.detail.${changeLogListingType[field]}.field`),
          oldValue: this.formatFieldValue(field, availabilityAndPriceFields[field][0]),
          newValue: this.formatFieldValue(field, availabilityAndPriceFields[field][1]),
        });
        return true;
      });
    }
    // General setting category
    const generalSettingFields = this.filterSortFields(changes, generalSettingRange);
    if (Object.keys(generalSettingFields).length > 0) {
      changeRowArr.push({
        field: t('cms.listing.modal.general_setting.label'),
      });
      Object.keys(generalSettingFields).map((field) => {
        changeRowArr.push({
          field: t(`cms.change_log.detail.${changeLogListingType[field]}.field`),
          oldValue: this.formatFieldValue(field, generalSettingFields[field][0]),
          newValue: this.formatFieldValue(field, generalSettingFields[field][1]),
        });
        return true;
      });
    }

    return changeRowArr;
  };

  filterSortFields = (changes, fieldKeyArr) => {
    if (!changes) {
      return {};
    }
    const cloneChanges = cloneObject(changes);
    const filterSortChanges = {};

    Object.keys(cloneChanges).filter(field => fieldKeyArr.includes(field))
      .sort((field1, field2) => fieldKeyArr.indexOf(field1) - fieldKeyArr.indexOf(field2))
      .map((field) => {
        filterSortChanges[field] = cloneChanges[field];
        return true;
      });
    return filterSortChanges;
  }

  sortFacilities = (changes, slugArr) => {
    if (!changes || !Array.isArray(changes)) {
      return [];
    }

    const sortedFacilities = [];
    slugArr.map((slug) => {
      if (slug === 'others') {
        changes.map((change) => {
          if (change.group === 'others' && slug === 'others') {
            sortedFacilities.push(change);
          }
          return true;
        });
      } else {
        const facilityChange = changes.find(change => change.slug === slug);
        if (facilityChange) {
          sortedFacilities.push(facilityChange);
        }
      }
      return true;
    });

    return sortedFacilities;
  };

  formatPropertyChanges = () => {
    const { t } = this.props;
    const { changes } = cloneObject(this.props.activeChangeLog);
    const changeRowArr = [];

    if (!changes) {
      return [];
    }

    // Insert formated ranking type params
    if (changes.property) {
      if (
        Object.keys(changes.property).includes('rankBlacksheep') &&
        !Object.keys(changes.property).includes('rankStar')
      ) {
        let oldValue = '';
        let newValue = '';
        if (changes.property.rankBlacksheep[0]) {
          oldValue = t('cms.change_log.detail.blacksheep.field_value');
          newValue = t('cms.change_log.detail.normal.field_value');
        } else {
          oldValue = t('cms.change_log.detail.normal.field_value');
          newValue = t('cms.change_log.detail.blacksheep.field_value');
        }
        changes.property.rankingType = [oldValue, newValue];
      }
      if (
        !Object.keys(changes.property).includes('rankBlacksheep') &&
        Object.keys(changes.property).includes('rankStar')
      ) {
        let oldValue = '';
        let newValue = '';
        if (changes.property.rankStar[0]) {
          oldValue = t('cms.change_log.detail.star.field_value');
          newValue = t('cms.change_log.detail.normal.field_value');
        } else {
          oldValue = t('cms.change_log.detail.normal.field_value');
          newValue = t('cms.change_log.detail.star.field_value');
        }
        changes.property.rankingType = [oldValue, newValue];
      }
      if (
        Object.keys(changes.property).includes('rankBlacksheep') &&
        Object.keys(changes.property).includes('rankStar')
      ) {
        let oldValue = '';
        let newValue = '';
        if (
          changes.property.rankStar[1] === false &&
          changes.property.rankBlacksheep[1] === false
        ) {
          oldValue = '-';
          newValue = t('cms.change_log.detail.normal.field_value');
        }
        if (
          changes.property.rankStar[0] === true &&
          changes.property.rankBlacksheep[1] === true
        ) {
          oldValue = t('cms.change_log.detail.star.field_value');
          newValue = t('cms.change_log.detail.blacksheep.field_value');
        }
        if (
          changes.property.rankBlacksheep[0] === true &&
          changes.property.rankStar[1] === true
        ) {
          oldValue = t('cms.change_log.detail.blacksheep.field_value');
          newValue = t('cms.change_log.detail.star.field_value');
        }
        changes.property.rankingType = [oldValue, newValue];
      }
    }

    // Insert formated recommended universities
    if (changes.universities && Array.isArray(changes.universities.name)) {
      const oldValue = changes.universities.name[0].join('、');
      const newValue = changes.universities.name[1].join('、');
      if (!changes.property) {
        changes.property = {};
      }
      changes.property.recommendedUniversities = [oldValue, newValue];
    }

    const propertyFields = this.filterSortFields(changes.property, detailAddressRange);
    // Detail and address
    if (Object.keys(propertyFields).length > 0) {
      Object.keys(propertyFields).map((field) => {
        changeRowArr.push({
          field: t(`cms.change_log.detail.${changeLogPropertyType[field]}.field`),
          oldValue: this.formatFieldValue(field, propertyFields[field][0]),
          newValue: this.formatFieldValue(field, propertyFields[field][1]),
        });
        return true;
      });
    }

    // Failities
    if (Array.isArray(changes)) {
      this.sortFacilities(changes, facilitySlugArr).map((facilityField) => {
        const { group, label, change } = facilityField;
        if (group) {
          const facilityGroupName = t(`cms.properties.edit.facilities.item.label.${group}`);
          changeRowArr.push({
            field: `${facilityGroupName}(${label})`,
            oldValue: change[0] ? 'True' : 'False',
            newValue: change[1] ? 'True' : 'False',
          });
        } else {
          changeRowArr.push({
            field: label,
            oldValue: change[0] ? 'True' : 'False',
            newValue: change[1] ? 'True' : 'False',
          });
        }
        return true;
      });
    }

    return changeRowArr;
  };

  getFormatedChanges = () => {
    const { logSection } = this.props.activeChangeLog;
    if (changeLogSections[logSection] === 'rooms') {
      return this.formatRoomChanges();
    }
    if (changeLogSections[logSection] === 'listings') {
      return this.formatListingChanges();
    }

    return this.formatPropertyChanges();
  };

  render() {
    const { t, activeChangeLog } = this.props;
    const { modelId, accountName, logDate, entryType } = activeChangeLog;

    if (isEmptyObject(activeChangeLog)) {
      return null;
    }
    return (
      <div className="active-change-log">
        <div className="active-change-log__header">
          <span className="active-change-log__id-tag">
            { this.getTagLabel() }{ modelId }
          </span>
          <button
            type="button"
            className="active-change-log__close"
            onClick={ this.props.onClose }
          >
            <Icon type="close" style={ { fontSize: '12px' } } />
          </button>
        </div>
        <h3 className="active-change-log__title">
          { t('cms.change_log.detail.title') }
        </h3>
        <div className="active-change-log__general-description">
          <span className="active-change-log__name-and-date">
            <span>{ `${accountName && accountName.firstName} ${accountName && accountName.lastName}` }</span>
            <span className="active-change-log__line" />
            <span>{ logDate ? moment(logDate).format('DD/MM/YY HH:mm') : null }</span>
          </span>
          <span className="active-change-log__entry-type">
            { t('cms.change_log.detail.entry_type.label') }
            <span className="active-change-log__entry-type-text">
              { t(`cms.change_log.entry_type.${entryType.toLowerCase()}`) }
            </span>
          </span>
        </div>
        <table className="active-change-log__field-table">
          <thead>
            <tr>
              <th>{ t('cms.change_log.detail.field_name.table_header') }</th>
              <th>{ t('cms.change_log.detail.old_value.table_header') }</th>
              <th>{ t('cms.change_log.detail.new_value.table_header') }</th>
            </tr>
          </thead>
          <tbody>
            <For each="row" of={ this.getFormatedChanges() } index="index">
              <If condition={ Object.keys(row).length === 1 }>
                <tr key={ index }>
                  <td colSpan="3" className="active-change-log__category-tag">
                    { row.field }
                  </td>
                </tr>
              </If>
              <If condition={ Object.keys(row).length !== 1 }>
                <tr key={ index }>
                  <td className="active-change-log__first-column">{ row.field }</td>
                  <td>{ row.oldValue }</td>
                  <td>{ row.newValue }</td>
                </tr>
              </If>
            </For>
          </tbody>
        </table>
      </div>
    );
  }
}

DetailModal.propTypes = {
  activeChangeLog: PropTypes.object,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

DetailModal.defaultProps = {
  activeChangeLog: {},
  t: () => {},
  onClose: () => {},
};

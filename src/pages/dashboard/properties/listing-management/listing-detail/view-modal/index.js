/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { Icon, Popconfirm, Popover } from 'antd';
import { platformEntity, entityAction } from '~client/constants';
import showElementByAuth from '~helpers/auth';
import { Edit as EditIcon, Copy as CopyIcon, Delete as DeleteIcon } from "~components/svgs";
import handleTenancy from '~helpers/tenancy-preview';
import formatPrice from '~helpers/currency';

const openEndDate = '9999-12-31T00:00:00+00:00';

export default class ViewModal extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      copyListingPopoverVisible: false,
    };
  }

  formatListingData = () => {
    const { listingData } = this.props;
    const tenancyDetails = [];
    const availabilityAndPrice = [];
    const generalSetting = [];

    if (listingData) {
      tenancyDetails.push({
        value: this.getTenancyLength().moveIn || '--',
        keyLabel: 'move_in',
      });
      tenancyDetails.push({
        value: this.getTenancyLength().moveOut || '--',
        keyLabel: 'move_out',
      });
      tenancyDetails.push({
        value: this.getTenancyLength().stay || '--',
        keyLabel: 'tenancy_length',
      });

      if (listingData.type === 'PLACEHOLDER') {
        availabilityAndPrice.push({
          value: this.props.t('cms.listing.modal.place_holder.label'),
          keyLabel: 'availability',
        });
      } else {
        availabilityAndPrice.push({
          value: listingData.availability ? this.props.t(`cms.listing.modal.availability.option.${listingData.availability.toLowerCase()}`) : '-',
          keyLabel: 'availability',
        });
      }

      availabilityAndPrice.push({
        value: this.props.t(`cms.listing.modal.price_type.option.${
          listingData.priceMin && listingData.priceMax && listingData.priceMax !== listingData.priceMin ? 'range' : 'exact'
        }`),
        keyLabel: 'price_type',
      });
      availabilityAndPrice.push({
        value: listingData.priceMin ? formatPrice(listingData.priceMin, this.props.property.currency) : '-',
        keyLabel: 'price_min' },
      );
      availabilityAndPrice.push({
        value: listingData.priceMax ? formatPrice(listingData.priceMax, this.props.property.currency) : '-',
        keyLabel: 'price_max' },
      );
      availabilityAndPrice.push({
        value: listingData.discountType ?
          this.props.t(`cms.listing.modal.discount_type.options.${listingData.discountType.toLowerCase()}`) :
          this.props.t('cms.listing.modal.discount_type.options.no_discount'),
        keyLabel: 'discount_type',
      });
      availabilityAndPrice.push({ value: listingData.discountValue, keyLabel: 'discount_value' });
      availabilityAndPrice.push({
        value: formatPrice(listingData.priceMin, this.props.property.currency),
        keyLabel: 'original_price',
      });
      availabilityAndPrice.push({ value: this.getCurrentPrice(), keyLabel: 'current_price' });

      generalSetting.push({ value: listingData.liveOn ? moment(listingData.liveOn).format('YYYY.MM.DD') : '-', keyLabel: 'live_on' });
      generalSetting.push({
        value: this.formatLiveUntil(listingData.liveUntil),
        keyLabel: 'live_until',
      });
      generalSetting.push({ value: listingData.autoPriceAllowed ? 'Yes' : 'No', keyLabel: 'auto_price' });
      generalSetting.push({ value: listingData.autoAvailAllowed ? 'Yes' : 'No', keyLabel: 'auto_avail' });
    }

    const newData = [
      { keyTitle: 'tenancy_details', data: tenancyDetails },
      { keyTitle: 'availability_and_price', data: availabilityAndPrice },
      { keyTitle: 'general_setting', data: generalSetting },
    ];

    return newData;
  }

  formatLiveUntil = (liveUntil) => {
    if (!liveUntil) {
      return '-';
    }

    if (liveUntil === openEndDate) {
      return this.props.t('cms.listing.modal.live_until.open_end');
    }

    return moment(liveUntil).format('YYYY.MM.DD');
  }

  getTenancyLength = () => {
    const { listingData, property } = this.props;
    let tenancyLengthValueMin;
    let tenancyLengthValueMax;
    if (listingData.tenancyLengthValue && isNaN(Number(listingData.tenancyLengthValue))) {
      const [min, max] = listingData.tenancyLengthValue.split('-');
      [tenancyLengthValueMin, tenancyLengthValueMax] = [Number(min), Number(max)];
    } else if (listingData.tenancyLengthValue) {
      tenancyLengthValueMin = Number(listingData.tenancyLengthValue);
    }

    const tenancy = handleTenancy(
      listingData.moveIn,
      listingData.moveOut,
      listingData.moveInType,
      listingData.moveOutType,
      property.billingCycle,
      listingData.tenancyLengthType,
      tenancyLengthValueMin,
      tenancyLengthValueMax,
    );

    return tenancy;
  }

  getCurrentPrice = () => {
    const { listingData, property } = this.props;
    let currentPrice = '-';
    if (listingData.priceMin && listingData.discountValue && listingData.discountType === 'ABSOLUTE') {
      currentPrice = formatPrice(
        listingData.priceMin - listingData.discountValue,
        property.currency,
      );
    } else if (listingData.priceMin && listingData.discountValue && listingData.discountType === 'PERCENTAGE') {
      // eslint-disable-next-line  no-mixed-operators
      currentPrice = formatPrice(
        (listingData.priceMin * ((100 - listingData.discountValue) / 100)),
        property.currency,
      );
    }

    return currentPrice;
  }

  extractListingId = originalStr => JSON.parse(atob(originalStr)).id;

  handleCopyListingPopoverVisible = (visible) => {
    this.setState({
      copyListingPopoverVisible: visible,
    });
  }

  formatUnconfirmedListingId = (id) => {
    let formatedId = id;
    const copyFromListingIndex = formatedId.indexOf('_copy-from-listing');

    if (copyFromListingIndex !== -1) {
      formatedId = formatedId.slice(0, copyFromListingIndex);
    }

    return formatedId.replace('unconfirmed_', '');
  }

  render() {
    const { t, listingData, unitData } = this.props;

    return (
      <div className="listing-view-modal" ref={ (node) => { this.tipsContainer = node; } }>
        <div className="listing-view-modal__listing-id">
          <If condition={ listingData && listingData.id }>
            <span className="listing-view-modal__listing-id__text">
              {t('cms.listing.modal.lisitng_id.label', {
                id: listingData.unconfirmed ?
                  this.extractListingId(this.formatUnconfirmedListingId(listingData.id)) :
                  this.extractListingId(listingData.id),
              })}
            </span>
          </If>
          <button type="button" className="listing-view-modal__close-btn" onClick={ this.props.onClose }>
            <Icon type="close" style={ { fontSize: '12px' } } />
          </button>
        </div>
        <div className="listing-view-modal__content">
          <div className="listing-view-modal__listing-detail">
            <For of={ this.formatListingData() } each="item" index="index">
              <div key={ item.keyTitle }>
                <div className="listing-view-modal__title">
                  <span className="listing-view-modal__title-text">{t(`cms.listing.modal.${item.keyTitle}.title`)}</span>
                </div>
                <For of={ item.data } each="label" index="index">
                  <div
                    key={ label.keyLabel }
                    className={ classNames(
                      'listing-view-modal__label',
                      { 'listing-view-modal__label--flex': label.keyLabel === 'label_bed_size_cm' },
                    ) }
                  >
                    { t(`cms.listing.modal.${label.keyLabel}.label`) }
                    <If condition={
                      ['price_min', 'price_max', 'original_price', 'current_price'].includes(label.keyLabel)
                    }
                    >
                      ({ this.props.property.currency })
                    </If>
                    :
                    <span className={ classNames('listing-view-modal__label-value',
                      { 'listing-view-modal__label-value--red':
                        label.keyLabel === 'availability' &&
                        label.value === t('cms.listing.modal.place_holder.label') },
                    ) }
                    >
                      { label.value ? label.value : '-' }
                    </span>
                  </div>
                </For>
              </div>
            </For>
          </div>
        </div>
        <div className="listing-view-modal__footer">
          <div className="listing-view-modal__btns">
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.DELETE,
            ) }
            >
              <button
                className="listing-view-modal__btn"
                onClick={ () => { this.props.openModal('edit'); } }
              >
                <EditIcon className="listing-view-modal__btn-icon" />
              </button>
              <span className="listing-view-modal__btns-line" />
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.CREATE,
            ) }
            >
              <Choose>
                <When condition={ listingData && listingData.unconfirmed }>
                  <button
                    className="listing-view-modal__btn"
                    disabled={ listingData && listingData.unconfirmed }
                  >
                    <CopyIcon className="listing-view-modal__btn-icon" />
                  </button>
                </When>
                <Otherwise>
                  <Popover
                    content={
                      <div>
                        <div
                          className="listing-view-modal__copy-to-room"
                          role="presentation"
                          onClick={ () => {
                            this.setState({ copyListingPopoverVisible: false });
                            this.props.openModal('copy');
                          } }
                        >
                          { t('cms.property.listing_management.copy_to_current_room.btn') }
                        </div>
                        <div
                          className="listing-view-modal__copy-to-room"
                          role="presentation"
                          onClick={ () => {
                            this.setState({ copyListingPopoverVisible: false });
                            this.props.onOpenOtherRoomsModal(listingData);
                          } }
                        >
                          { t('cms.property.listing_management.copy_to_other_rooms.btn') }
                        </div>
                      </div>
                    }
                    trigger="click"
                    overlayClassName="listing-view-modal__copy-listing-wrap"
                    visible={
                      this.state.copyListingPopoverVisible
                    }
                    onVisibleChange={
                      visible => this.handleCopyListingPopoverVisible(visible)
                    }
                  >
                    <button
                      className="listing-view-modal__btn"
                      disabled={ listingData && listingData.unconfirmed }
                    >
                      <CopyIcon className="listing-view-modal__btn-icon" />
                    </button>
                  </Popover>
                </Otherwise>
              </Choose>
              <span className="listing-view-modal__btns-line" />
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.DELETE,
            ) }
            >
              <Popconfirm
                title={ t('cms.property.listing_management.delete_listing.tip') }
                placement="topRight"
                onConfirm={ () => {
                  this.props.onDelete(listingData.id, unitData.id, listingData.unconfirmed);
                  this.props.onClose();
                } }
                okType="danger"
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <button className="listing-view-modal__btn">
                  <DeleteIcon className="listing-view-modal__btn-icon" />
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
  listingData: PropTypes.object,
  property: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  openModal: PropTypes.func,
  unitData: PropTypes.object,
  onOpenOtherRoomsModal: PropTypes.func.isRequired,
};

ViewModal.defaultProps = {
  t: () => {},
  onDelete: () => {},
  openModal: () => {},
  listingData: {},
  property: {},
  unitData: '',
  onOpenOtherRoomsModal: () => {},
};

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Checkbox, Button, Icon, Table, Popconfirm, Drawer, message, Tooltip, Popover } from 'antd';
import moment from 'moment';
import { Edit as EditIcon, Copy as CopyIcon, Delete as DeleteIcon } from "~components/svgs";
import showElementByAuth from '~helpers/auth';
import handleTenancy from '~helpers/tenancy-preview';
import formatPrice from '~helpers/currency';
import { platformEntity, entityAction } from '~constants';
import { propertyStatus } from '~constants/listing-management';
import { cloneObject } from '~helpers';
import ViewModal from '~pages/dashboard/properties/listing-management/listing-detail/view-modal';
import Modal from '~pages/dashboard/properties/listing-management/listing-detail/listing-modal';
import SearchComponent from '~components/search-component';
import EditSelectModal from '~pages/dashboard/properties/listing-management/listing-detail/bulk-modal';
import OtherRoomsModal from '~pages/dashboard/properties/listing-management/listing-detail/other-rooms-modal';

export default class ListingDetail extends React.Component {
  constructor(props) {
    super(props);

    this.formatedCopiedRooms = this.formatCopiedRooms(props.copiedRoomListings);
    this.formatedRooms = this.formatRooms(props.property);

    this.state = {
      filters: {
        withListings: false,
        roomNameList: [],
      },
      filteredRooms: this.formatedRooms,
      expandedRowUnitIds: this.initExpandedUnitIds(props.copiedRoomListings),
      indeterminate: false,
      checkAll: false,
      selectedListingIds: [],
      selectedRoomIds: [],
      selectedListings: [],
      showViewModal: false,
      currentListing: null,
      showModal: false,
      currentRoom: null,
      showEditSelectModal: false,
      deleteListingId: '',
      deleteRoomId: '',
      deletePopupVisible: false,
      searchComponentTarget: null,
      copyListingPopoverVisible: false,
      copyListing: null, // expected to be copied listing
      showOtherRoomsModal: false,
    };
  }

  initExpandedUnitIds = roomListings => (roomListings.map(copiedRoom => copiedRoom.unitId));

  formatCopiedRooms = (copiedRoomListings) => {
    const formatedCopiedRooms = {};

    copiedRoomListings.map((copiedRoom) => {
      formatedCopiedRooms[copiedRoom.unitId] = copiedRoom.listings;
      return true;
    });

    return formatedCopiedRooms;
  }

  formatRooms = (property) => {
    const formatedRooms = [];
    if (property.unitTypes && property.unitTypes.edges.length > 0) {
      property.unitTypes.edges.map((unit) => {
        if (Object.keys(this.formatedCopiedRooms).includes(unit.node.id)) {
          const clonedUnit = cloneObject(unit.node);

          if (!clonedUnit.listings) {
            clonedUnit.listings = [];
          }
          this.formatedCopiedRooms[unit.node.id].map((listing) => {
            const clonedListing = cloneObject(listing);
            clonedListing.id = `unconfirmed_${listing.id}`;
            clonedListing.unconfirmed = true;
            clonedUnit.listings.unshift(clonedListing);

            return true;
          });
          clonedUnit.unconfirmed = true;
          formatedRooms.push(clonedUnit);
        } else {
          formatedRooms.push(unit.node);
        }
        return true;
      });
    }

    return formatedRooms;
  };

  handleClickEditSelected = () => {
    this.setState({
      showEditSelectModal: !this.state.showEditSelectModal,
    });
  }

  filterRooms = () => {
    const { filters } = this.state;
    let filteredRooms = [];

    filteredRooms = this.formatedRooms.filter((room) => {
      let selectedRoomName = filters.roomNameList.some(selectRoom => selectRoom.id === room.id);

      if (filters.roomNameList.length === 0) {
        selectedRoomName = true;
      }

      if (filters.withListings) {
        const isWithListings = room.listings.length > 0;
        return selectedRoomName && isWithListings;
      }

      return selectedRoomName;
    });

    const newSelectedRoomIds = [];
    let newSelectedListings = [];
    let newSelectedListingIds = [];
    filteredRooms.map((room) => {
      if (this.state.selectedRoomIds.includes(room.id)) {
        newSelectedRoomIds.push(room.id);
      }
      newSelectedListings = [
        ...newSelectedListings,
        ...room.listings.filter(listing => this.state.selectedListingIds.includes(listing.id)),
      ];
      newSelectedListingIds = newSelectedListings.map(listing => listing.id);

      return true;
    });

    const selectedRoomNum = newSelectedRoomIds.length;
    const optionalRoomNum = filteredRooms.filter(room => room.listings.length > 0).length;
    this.state.checkAll = selectedRoomNum === optionalRoomNum && selectedRoomNum > 0;
    this.state.indeterminate = selectedRoomNum > 0 && selectedRoomNum < optionalRoomNum;

    this.setState({
      filteredRooms,
      checkAll: this.state.checkAll,
      indeterminate: this.state.indeterminate,
      selectedRoomIds: newSelectedRoomIds,
      selectedListingIds: newSelectedListingIds,
      selectedListings: newSelectedListings,
    });
  }

  onCheckWithListings = (e) => {
    this.state.filters.withListings = e.target.checked;
    this.setState(this.state, () => {
      this.filterRooms();
    });
  }

  columnsRowSelection = () => ({
    onSelect: (record, selected) => {
      if (selected) {
        this.state.selectedRoomIds.push(record.id);

        record.listings.map((listing) => {
          this.state.selectedListingIds.push(listing.id);
          this.state.selectedListings.push(listing);

          return true;
        });
      } else {
        this.state.selectedRoomIds.splice(this.state.selectedRoomIds.indexOf(record.id), 1);

        record.listings.map((listing) => {
          this.state.selectedListingIds.splice(
            this.state.selectedListingIds.indexOf(listing.id), 1,
          );

          this.state.selectedListings.splice(
            this.state.selectedListings.indexOf(listing), 1,
          );
          return true;
        });
      }
      const selectedRoomNum = this.state.selectedRoomIds.length;
      const optionalRoomNum = this.formatedRooms.filter(room => room.listings.length > 0).length;
      this.state.checkAll = selectedRoomNum === optionalRoomNum;
      this.state.indeterminate = selectedRoomNum > 0 && selectedRoomNum < optionalRoomNum;

      this.setState(this.state);
    },
    getCheckboxProps: record => ({
      // Column configuration disabled
      disabled: !record.listings || record.listings.length === 0 || record.unconfirmed,
      name: record.name,
      indeterminate: this.isRoomIndeterminate(record),
    }),
    selectedRowKeys: this.state.selectedRoomIds,
  })

  isRoomIndeterminate = (room) => {
    const allListingNum = room.listings.length;
    const selectedListingNum = room.listings
      .filter(listing => this.state.selectedListingIds.includes(listing.id)).length;
    return selectedListingNum > 0 && selectedListingNum < allListingNum;
  };

  handleAddRoomListing = (record) => {
    setTimeout(() => {
      this.openListingFormModal('create', {}, record);
    }, 10);
  }

  getTableColumns = () => {
    const { t } = this.props;
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        className: 'listing-detail__column',
        render: (text, record) => (
          <React.Fragment>
            <span className={ classNames('listing-detail__table-room-name', {
              'listing-detail__table-room-name--warning-icon': Object.keys(this.formatedCopiedRooms).includes(record.id),
            }) }
            >
              { record.name }
            </span>
            <If condition={ Object.keys(this.formatedCopiedRooms).includes(record.id) }>
              <Tooltip
                placement="top"
                title={ t('cms.property.listing_management.unconfirmed_lisitings.tips') }
              >
                <Icon type="info-circle" theme="filled" className="listing-detail__warning-icon" />
              </Tooltip>
            </If>
          </React.Fragment>
        ),
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        className: 'listing-detail__column',
        render: (text, record) => (
          <If condition={ showElementByAuth(
            platformEntity.LISTINGS_LISTINGS,
            entityAction.CREATE,
          ) }
          >
            <button
              className="listing-detail__add-listing-btn"
              onClick={ () => { this.handleAddRoomListing(record); } }
              ref={ (node) => { this.addRoomListingBtn = node; } }
            >
              { t('cms.listing.add_listing.btn') }
            </button>
          </If>
        ),
      },
    ];
  }

  handleClickViewModal = (record, unit) => {
    if (this.state.currentRoom || this.state.currentListing) {
      this.setState({
        showViewModal: false,
      }, () => {
        setTimeout(() => {
          this.setState({
            showViewModal: true,
            currentListing: record,
            currentRoom: unit || null,
          });
        }, 300);
      });
    } else {
      this.setState({
        showViewModal: true,
        currentListing: record,
        currentRoom: unit || null,
      });
    }
  }

  handleCloseViewModal = () => {
    this.setState({
      showViewModal: false,
      currentListing: null,
      currentRoom: null,
    });
  }

  openListingFormModal = (type, record, unit) => {
    this.setState({
      showViewModal: false,
      showModal: !this.state.showModal,
      modalType: type,
      currentListing: record || this.state.currentListing,
      currentRoom: unit || this.state.currentRoom,
    });
  }

  onExpand = (record, expanded) => {
    if (expanded) {
      this.state.expandedRowUnitIds.splice(this.state.expandedRowUnitIds.indexOf(record.id), 1);
    } else {
      this.state.expandedRowUnitIds.push(record.id);
    }
    this.setState(this.state);
  };

  handleExpandIcon = (props) => {
    if (props.record.listings && props.record.listings.length > 0) {
      return (
        <span
          role="presentation"
          className={ `ant-table-row-expand-icon ${
            props.expanded ? 'ant-table-row-expanded' : 'ant-table-row-collapsed'
          }` }
          onClick={ () => this.onExpand(props.record, props.expanded) }
          ref={ (node) => { this.expandIcon = node; } }
        />
      );
    }

    return true;
  }

  handleCopyListingPopoverVisible = (visible, listing) => {
    this.setState({
      copyListingPopoverVisible: visible,
      copyListing: listing,
    });
  }

  handleOpenOtherRoomsModal = (listing) => {
    this.setState({
      showOtherRoomsModal: true,
      copyListingPopoverVisible: false,
      copyListing: listing || this.state.copyListing,
    });
  }

  getSubColumns = (unit) => {
    const { t, property } = this.props;
    return [
      {
        key: 'tenancy',
        width: '22%',
        className: 'listing-detail__sub-column',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record, unit); },
        }),
        render: (text, record) => {
          const tenancy = handleTenancy(
            record.moveIn,
            record.moveOut,
            record.moveInType,
            record.moveOutType,
            this.props.property.billingCycle,
            record.tenancyLengthType,
            null,
            null,
          );

          return (
            <div className="listing-detail__sub-column-content">
              <p className="listing-detail__sub-column-content--move-in">
                {
                  t('cms.listing.sub_table.move_in_label', {
                    moveInDesc: tenancy.moveIn || '--',
                  })
                }
              </p>
              <p className="listing-detail__sub-column-content--move-out">
                {
                  t('cms.listing.sub_table.move_out_label', {
                    moveOutDesc: tenancy.moveOut || '--',
                  })
                }
              </p>
            </div>
          );
        },
      },
      {
        dataIndex: 'stay',
        width: '18%',
        key: 'stay',
        className: 'listing-detail__sub-column',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record, unit); },
        }),
        render: (text, record) => {
          let tenancyLengthValueMin; let
            tenancyLengthValueMax;
          if (record.tenancyLengthValue && isNaN(Number(record.tenancyLengthValue))) {
            const [min, max] = record.tenancyLengthValue.split('-');
            [tenancyLengthValueMin, tenancyLengthValueMax] = [Number(min), Number(max)];
          } else if (record.tenancyLengthValue) {
            tenancyLengthValueMin = Number(record.tenancyLengthValue);
          }

          const tenancy = handleTenancy(
            record.moveIn,
            record.moveOut,
            record.moveInType,
            record.moveOutType,
            this.props.property.billingCycle,
            record.tenancyLengthType,
            tenancyLengthValueMin,
            tenancyLengthValueMax,
          );

          return (
            <div className="listing-detail__sub-column-content">
              <p className="listing-detail__sub-column-content--tenancy">{tenancy.stay || '--'}</p>
            </div>
          );
        },
      },
      {
        dataIndex: 'price',
        key: 'price',
        width: '18%',
        className: 'listing-detail__sub-column',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record, unit); },
        }),
        render: (text, record) => {
          let currentPrice = record.priceMin;
          if (record.priceMin && record.discountValue && record.discountType === 'ABSOLUTE') {
            currentPrice = record.priceMin - record.discountValue;
          } else if (record.priceMin && record.discountValue && record.discountType === 'PERCENTAGE') {
            // eslint-disable-next-line  no-mixed-operators
            currentPrice = (record.priceMin * (100 - record.discountValue) / 100);
          }

          return (
            <div className="listing-detail__sub-column-content">
              <p className="listing-detail__sub-column-content--price">
                { formatPrice(currentPrice, property.currency) || '--' }
                <If condition={ record.discountType && record.discountType !== 'NO_DISCOUNT' }>
                  <span className="listing-detail__sub-column-content--origin-price">
                    { formatPrice(record.priceMin, property.currency) }
                  </span>
                </If>
              </p>
            </div>
          );
        },
      },
      {
        dataIndex: 'availability',
        key: 'availability',
        width: '12%',
        className: 'listing-detail__sub-column',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record, unit); },
        }),
        render: (text, record) => (
          <div className="listing-detail__sub-column-content">
            <If condition={ record.type !== 'PLACEHOLDER' }>
              <p className="listing-detail__sub-column-content--availability">
                <span className={ classNames('listing-detail__status-icon', {
                  'listing-detail__status-icon--good': record.availability === 'GOOD',
                  'listing-detail__status-icon--limited': record.availability === 'LIMITED',
                  'listing-detail__status-icon--sold-out': record.availability === 'SOLD_OUT',
                }) }
                />
                { t(`cms.listing.modal.availability.option.${
                  record.availability ? record.availability.toLowerCase() : 'good'
                }`)}
              </p>
            </If>
            <If condition={ record.type === 'PLACEHOLDER' }>
              <p className="listing-detail__sub-column-content--place-holder">
                { t('cms.listing.modal.place_holder.label') }
              </p>
            </If>
          </div>),
      },
      {
        dataIndex: 'updateTime',
        width: '18%',
        key: 'updateTime',
        className: 'listing-detail__sub-column',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record, unit); },
        }),
        render: (text, listing) => (
          <div className="listing-detail__sub-column-content">
            <p className="listing-detail__sub-column-content--update-time">
              { moment(listing.updatedAt).format('MM/DD/YYYY HH:mm') || '--' }
            </p>
          </div>
        ),
      },
      {
        key: 'actions',
        className: 'listing-detail__sub-column',
        width: '12%',
        render: (text, record) => (
          <div className="listing-detail__action-wrap">
            <If condition={ showElementByAuth(
              platformEntity.LISTINGS_LISTINGS,
              entityAction.UPDATE,
            ) }
            >
              <button
                className="listing-detail__icon-wrap"
                onClick={ () => { this.openListingFormModal('edit', record, unit); } }
              >
                <EditIcon className="listing-detail__action-icon" />
              </button>
              <If condition={
                showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.CREATE) ||
                  showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.DELETE)
              }
              >
                <em className="listing-detail__line" />
              </If>
            </If>
            <If condition={ showElementByAuth(
              platformEntity.LISTINGS_LISTINGS,
              entityAction.CREATE,
            ) }
            >
              <Choose>
                <When condition={ record && record.unconfirmed }>
                  <button
                    className="listing-detail__icon-wrap"
                    disabled={ record && record.unconfirmed }
                  >
                    <CopyIcon className="listing-detail__action-icon" />
                  </button>
                </When>
                <Otherwise>
                  <Popover
                    content={
                      <div>
                        <div
                          className="listing-detail__copy-to-room"
                          role="presentation"
                          onClick={ () => {
                            this.setState({ copyListingPopoverVisible: false });
                            this.openListingFormModal('copy', record, unit);
                          } }
                        >
                          { t('cms.property.listing_management.copy_to_current_room.btn') }
                        </div>
                        <div
                          className="listing-detail__copy-to-room"
                          role="presentation"
                          onClick={ () => {
                            this.handleOpenOtherRoomsModal(record);
                          } }
                        >
                          { t('cms.property.listing_management.copy_to_other_rooms.btn') }
                        </div>
                      </div>
                    }
                    trigger="click"
                    overlayClassName="listing-detail__copy-listing-wrap"
                    visible={
                      this.state.copyListingPopoverVisible &&
                      this.state.copyListing.id === record.id
                    }
                    onVisibleChange={
                      visible => this.handleCopyListingPopoverVisible(visible, record)
                    }
                  >
                    <button
                      className="listing-detail__icon-wrap"
                      disabled={ record && record.unconfirmed }
                    >
                      <CopyIcon className="listing-detail__action-icon" />
                    </button>
                  </Popover>
                </Otherwise>
              </Choose>
            </If>
            <If condition={ showElementByAuth(
              platformEntity.LISTINGS_LISTINGS,
              entityAction.DELETE,
            ) }
            >
              <If condition={
                showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.UPDATE) ||
                  showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.CREATE)
              }
              >
                <em className="listing-detail__line" />
              </If>
              <Popconfirm
                visible={
                  this.state.deletePopupVisible &&
                    this.state.deleteListingId === record.id &&
                    this.state.deleteRoomId === unit.id
                }
                onVisibleChange={ this.handleDeletePopup }
                title={ t('cms.property.listing_management.delete_listing.tip') }
                placement="left"
                okType="danger"
                onConfirm={ () => {
                  this.confirmDeleteListing(record.id, unit.id, record.unconfirmed);
                } }
                onCancel={ this.cancelDeleteListing }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <button
                  className="listing-detail__icon-wrap"
                  onClick={ () => { this.handleClickDelete(unit, record.id); } }
                >
                  <DeleteIcon className="listing-detail__action-icon" />
                </button>
              </Popconfirm>
            </If>
          </div>
        ),
      },
    ];
  }

  subColumnsRowSelection = unit => ({
    onSelect: (record, selected, selectedRows) => {
      if (selected) {
        this.state.selectedListingIds.push(record.id);
        this.state.selectedListings.push(record);
      } else {
        this.state.selectedListingIds.splice(this.state.selectedListingIds.indexOf(record.id), 1);
        this.state.selectedListings.splice(this.state.selectedListings.indexOf(record), 1);
      }
      if (unit.listings.length === selectedRows.length) {
        this.state.selectedRoomIds.push(unit.id);
      } else {
        this.state.selectedRoomIds = this.state.selectedRoomIds.filter(id => id !== unit.id);
      }

      const selectedRoomNum = this.state.selectedRoomIds.length;
      const optionalRoomNum = this.state.filteredRooms
        .filter(room => room.listings.length > 0).length;
      this.state.checkAll = selectedRoomNum === optionalRoomNum;
      this.state.indeterminate = selectedRoomNum > 0 && selectedRoomNum < optionalRoomNum;

      this.setState(this.state);
    },
    getCheckboxProps: record => ({
      disabled: unit.unconfirmed,
      name: record.name,
    }),
    selectedRowKeys: this.state.selectedListingIds,
  })

  expandedRowRender = (unit) => {
    if (unit.listings.length === 0) {
      return null;
    }

    return (
      <Table
        rowSelection={ this.subColumnsRowSelection(unit) }
        columns={ this.getSubColumns(unit) }
        dataSource={ unit.listings }
        pagination={ false }
        showHeader={ false }
        className="listing-detail__sub-table"
        rowClassName={ (record) => {
          if (
            this.state.currentListing &&
            this.state.currentListing.id === record.id &&
            this.state.currentRoom &&
            this.state.currentRoom.id === unit.id
          ) {
            return 'listing-detail__selected-row';
          }
          if (record.unconfirmed) {
            return 'listing-detail__unconfirmed-listing';
          }
          return '';
        } }
        rowKey="id"
      />
    );
  }

  onCheckAllChange = (e) => {
    const selectedRoomIds = [];
    const selectedListingIds = [];
    const selectedListings = [];
    if (e.target.checked) {
      this.state.filteredRooms.map((unit) => {
        if (unit.listings && !unit.unconfirmed && unit.listings.length > 0) {
          selectedRoomIds.push(unit.id);

          unit.listings.map((listing) => {
            selectedListingIds.push(listing.id);
            selectedListings.push(listing);
            return true;
          });
        }

        return true;
      });
    }
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
      selectedRoomIds,
      selectedListingIds,
      selectedListings,
    });
  };

  closeListingFormModal = () => {
    this.setState({
      showModal: !this.state.showModal,
      currentListing: null,
      currentRoom: null,
    });
  }

  isPublished = () => this.props.property.status === propertyStatus.PUBLISHED;

  handleConfirm = (data) => {
    if (this.state.modalType === 'edit' && this.state.currentListing.unconfirmed) {
      const confirmedListing = cloneObject(data);
      delete confirmedListing.listingId;
      confirmedListing.unitTypeId = this.state.currentRoom.id;

      this.props.createListing(confirmedListing, (res) => {
        message.success(this.props.t(`cms.property.listing_management.create_listing${
          this.isPublished() ? '.published' : ''
        }.toast`));

        const createdListing = res && res.createListing && res.createListing.listing;
        const listingPayload = Object.assign({}, data, {
          id: createdListing.id,
          updatedAt: createdListing.updatedAt,
        });
        delete listingPayload.listingId;
        const updateUnitId = this.state.currentRoom && this.state.currentRoom.id;

        this.refreshCopiedRoomListings(data.listingId, updateUnitId);
        this.refreshListing(listingPayload, updateUnitId, 'create');
        this.setState({
          checkAll: false,
          indeterminate: this.state.selectedListingIds.length > 0,
        });
        this.closeListingFormModal();
      });
      return;
    }

    if (this.state.modalType === 'edit') {
      this.props.updateListing(data, () => {
        message.success(this.props.t(`cms.property.listing_management.update_listing${
          this.isPublished() ? '.published' : ''
        }.toast`));

        const listingPayload = Object.assign({}, data, {
          id: data.listingId,
        });
        delete listingPayload.listingId;
        const updateUnitId = this.state.currentRoom && this.state.currentRoom.id;

        this.refreshListing(listingPayload, updateUnitId, 'update');
        this.closeListingFormModal();
      });
    }
    if (this.state.modalType === 'create' || this.state.modalType === 'copy') {
      this.props.createListing(data, (res) => {
        message.success(this.props.t(`cms.property.listing_management.create_listing${
          this.isPublished() ? '.published' : ''
        }.toast`));

        const createdListing = res && res.createListing && res.createListing.listing;
        const updateUnitId = this.state.currentRoom && this.state.currentRoom.id;

        this.refreshListing(createdListing, updateUnitId, 'create');
        this.setState({
          checkAll: false,
          indeterminate: this.state.selectedListingIds.length > 0,
        });
        this.closeListingFormModal();
      });
    }
  }

  refreshListing = (newListing, updateUnitId, type) => {
    const { property } = this.props;
    const updatedProperty = cloneObject(property);

    if (type === 'update') {
      updatedProperty.unitTypes.edges.map((unit) => {
        if (updateUnitId === unit.node.id) {
          unit.node.listings.map((listing) => {
            if (listing.id === newListing.id) {
              Object.assign(listing, newListing);
            }
            return true;
          });
        }
        return true;
      });
    }
    if (type === 'create') {
      updatedProperty.unitTypes.edges.map((unit) => {
        if (updateUnitId === unit.node.id) {
          unit.node.listings.unshift(newListing);
        }
        return true;
      });
    }
    if (type === 'delete') {
      updatedProperty.unitTypes.edges = updatedProperty.unitTypes.edges.map((unit) => {
        if (updateUnitId === unit.node.id) {
          const clonedUnit = cloneObject(unit);
          clonedUnit.node.listings = clonedUnit.node.listings
            .filter(listing => listing.id !== newListing);
          return clonedUnit;
        }
        return unit;
      });
    }
    const formatedUpdatedRooms = this.formatRooms(updatedProperty);
    this.formatedRooms = formatedUpdatedRooms;
    this.props.setProperty({ property: updatedProperty });
    this.filterRooms();
  };

  refreshBulkListing = (bulkEditListing) => {
    const clonedBulkEditListing = Object.assign({}, bulkEditListing);
    delete clonedBulkEditListing.ids;
    const updatedProperty = cloneObject(this.props.property);

    updatedProperty.unitTypes.edges.map((unit) => {
      unit.node.listings.map((listing) => {
        if (this.state.selectedListingIds.includes(listing.id)) {
          Object.assign(listing, clonedBulkEditListing);
        }
        return true;
      });
      return true;
    });

    const formatedUpdatedRooms = this.formatRooms(updatedProperty);
    this.formatedRooms = formatedUpdatedRooms;
    this.props.setProperty({ property: updatedProperty });
    this.filterRooms();
  };

  confirmDeleteListing = (listingId, unitId, unconfirmed) => {
    if (unconfirmed) {
      this.refreshCopiedRoomListings(listingId, unitId);
      setTimeout(() => {
        this.packUpUnitRow(unitId);
      }, 0);
      return;
    }

    this.props.deleteListing(listingId, () => {
      message.success(this.props.t(`cms.property.listing_management.delete_listing${
        this.isPublished() ? '.published' : ''
      }.toast`));

      this.refreshListing(listingId, unitId, 'delete');
      this.resetSelected(listingId, unitId);
      this.packUpUnitRow(unitId);
    });
  }

  resetSelected = (listingId, unitId) => {
    this.state.selectedListingIds = this.state.selectedListingIds.filter(id => id !== listingId);
    this.state.selectedListings = this.state.selectedListings
      .filter(listing => listing.id !== listingId);

    const deleteFromRoom = this.state.filteredRooms.find(room => room.id === unitId);
    if (
      deleteFromRoom &&
      deleteFromRoom.listings.length === 0
    ) {
      this.state.selectedRoomIds.splice(this.state.selectedRoomIds.indexOf(unitId), 1);

      if (this.state.selectedRoomIds.length === 0) {
        this.state.indeterminate = false;
        this.state.checkAll = false;
      }
    }
    if (
      deleteFromRoom &&
      deleteFromRoom.listings.length > 0 &&
      deleteFromRoom.listings.every(listing => this.state.selectedListingIds.includes(listing.id))
    ) {
      this.state.selectedRoomIds.push(unitId);

      if (
        this.state.selectedRoomIds.length ===
        this.state.filteredRooms.filter(room => room.listings.length > 0).length
      ) {
        this.state.indeterminate = false;
        this.state.checkAll = true;
      }
    }

    this.setState(this.state);
  }

  // pack up unit row after delete the last listing
  packUpUnitRow = (unitId) => {
    const sourceUnit = this.state.filteredRooms.find(unit => unit.id === unitId);
    if (!sourceUnit) {
      return;
    }

    if (sourceUnit.listings.length === 0) {
      const emptyUnitRow = document.querySelector(`[data-row-key="${unitId}"]`);

      if (emptyUnitRow) {
        emptyUnitRow.click();
      }
    }
  }

  refreshCopiedRoomListings = (listingId, unitId) => {
    const { copiedRoomListings, property } = this.props;
    let clonedRoomListings = cloneObject(copiedRoomListings);

    clonedRoomListings = clonedRoomListings.map((roomListing) => {
      if (roomListing.unitId === unitId) {
        const deletedListings = roomListing.listings
          .filter(listing => !listingId.includes(listing.id));
        if (deletedListings.length === 0) {
          return null;
        }
        return { unitId, listings: deletedListings };
      }
      return roomListing;
    });
    clonedRoomListings = clonedRoomListings.filter(roomListing => roomListing);

    this.props.setCopyRoomListing(clonedRoomListings);
    this.formatedCopiedRooms = this.formatCopiedRooms(clonedRoomListings);
    this.formatedRooms = this.formatRooms(property);
    this.filterRooms();
  }

  isPublished = () => this.props.property.status === propertyStatus.PUBLISHED;

  handleClickDelete = (unit, listingId) => {
    this.setState({
      deletePopupVisible: true,
      deleteListingId: listingId,
      deleteRoomId: unit.id,
    });
  }

  cancelDeleteListing = () => {
    this.setState({
      deletePopupVisible: false,
    });
  }

  handleDeletePopup = (visible) => {
    this.setState({
      deletePopupVisible: visible,
    });
  }

  handleCloseEditSelectModal = () => {
    this.setState({
      showEditSelectModal: !this.state.showEditSelectModal,
    });
  }

  getSearchComponentOptions = () => this.props.property.unitTypes.edges.map(room => ({
    name: room.node.name,
    id: room.node.id,
  }));


  setSearchComponentTarget = (node) => {
    if (!this.state.searchComponentTarget) {
      this.setState({ searchComponentTarget: node });
    }
  };

  handleCloseOtherRoomsModal = () => {
    this.setState({
      showOtherRoomsModal: false,
      copyListing: null,
    });
  }

  handleCopyListingToRooms = (toUnitIds) => {
    const { copiedRoomListings, property } = this.props;
    const { copyListing } = this.state;
    const clonedRoomListings = cloneObject(copiedRoomListings);

    toUnitIds.forEach((toUnitId) => {
      const roomListing = clonedRoomListings.find(item => item.unitId === toUnitId);

      if (roomListing) {
        // generate unique listing id by add copy-from-listing[number]
        // for each listing can be delete without the same id
        roomListing.listings.push(Object.assign({}, copyListing, {
          id: `${copyListing.id}_copy-from-listing${roomListing.listings.length}`,
        }));

        return;
      }

      clonedRoomListings.push({
        unitId: toUnitId,
        listings: [Object.assign({}, copyListing, {
          id: `${copyListing.id}_copy-from-listing0`,
        })],
      });
    });

    this.props.setCopyRoomListing(clonedRoomListings);

    // re-render rooms with cipied listings
    this.formatedCopiedRooms = this.formatCopiedRooms(clonedRoomListings);
    this.formatedRooms = this.formatRooms(property);
    this.filterRooms();
  }

  render() {
    const { t, property } = this.props;
    let totalCount = 0;
    this.state.filteredRooms.map((room) => {
      totalCount += room.listings.length;
      return true;
    });

    return (
      <div className="listing-detail" ref={ (node) => { this.listingContainer = node; } }>
        <div className="listing-detail__header">
          <span className="listing-detail__total">
            {
              t('cms.property.listing_management.room_config.total.hint', {
                number: totalCount,
              })
            }
          </span>
          <span className="listing-detail__header-right">
            <Checkbox
              checked={ this.state.filters.withListings }
              onChange={ this.onCheckWithListings }
            >
              { t('cms.property.listing_management.room.checkbox') }
            </Checkbox>
            <div
              className="listing-detail__rooms-filter"
              ref={ (node) => { this.searchContainer = node; } }
            >
              <span
                ref={ (node) => { this.setSearchComponentTarget(node); } }
              >
                <If condition={ this.state.filters.roomNameList.length > 0 }>
                  <span className="listing-detail__rooms-filter-content">
                    { this.props.t('cms.listing.filter_room.room_selcted', {
                      number: this.state.filters.roomNameList.length,
                    })}
                  </span>
                </If>

                <If condition={ this.state.filters.roomNameList.length === 0 }>
                  <span className="listing-detail__rooms-filter-content">
                    { this.props.t('cms.listing.filter_room.content') }
                  </span>
                </If>
                <Icon
                  className="listing-detail__rooms-filter-icon"
                  type="down"
                  style={ { fontSize: '12px' } }
                />
              </span>
              <SearchComponent
                ref={ (node) => { this.searchComponent = node; } }
                t={ this.props.t }
                targetInput={ this.state.searchComponentTarget }
                container={ this.searchContainer }
                options={ this.getSearchComponentOptions() }
                onChange={ (value) => {
                  this.state.filters.roomNameList = value.value;
                  this.setState(this.state, () => {
                    this.filterRooms();
                  });
                } }
                keyValue="id"
                className="listing-detail__rooms-filter-search-component"
              />
            </div>

            <If condition={
              this.state.selectedListingIds.length > 0 &&
              showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.UPDATE)
            }
            >
              <Button
                type="primary"
                className="listing-detail__bulk-edit"
                onClick={ this.handleClickEditSelected }
              >
                <Icon type="plus" />
                { t('cms.property.listing_management.bulk_edit.button') }
              </Button>
            </If>
          </span>
        </div>
        <div className="listing-detail__table-wrap">
          <div className="listing-detail__table-header">
            <Checkbox
              indeterminate={ this.state.indeterminate }
              onChange={ this.onCheckAllChange }
              checked={ this.state.checkAll }
              className="listing-detail__check-all"
              disabled={
                this.state.filteredRooms.filter(room => room.listings.length > 0).length === 0
              }
            />
            <span className="listing-detail__header-column">
              { t('cms.property.listing_management.column.tenancy') }
            </span>
            <span className="listing-detail__header-column">
              { t('cms.property.listing_management.column.stay') }
            </span>
            <span className="listing-detail__header-column">
              {
                t('cms.listing.sub_table.title.price', {
                  billingCycle: t(`cms.listing.billing_cycle.per_${
                    property.billingCycle ? property.billingCycle.toLowerCase() : 'weekly'
                  }`),
                })
              }
            </span>
            <span className="listing-detail__header-column">
              { t('cms.property.listing_management.column.availability') }
            </span>
            <span className="listing-detail__header-column">
              { t('cms.property.listing_management.column.update_time') }
            </span>
            <span className="listing-detail__header-column">
              { t('cms.property.listing_management.column.actions') }
            </span>
          </div>
          <Table
            onRow={
              record => ({
                onClick: (e) => {
                  if (!e.target.classList.contains('ant-table-row-expanded') &&
                    this.state.expandedRowUnitIds.indexOf(record.id) === -1 &&
                    record.listings.length > 0
                  ) {
                    this.state.expandedRowUnitIds.push(record.id);
                    this.setState(this.state);
                  } else if ((this.state.expandedRowUnitIds.indexOf(record.id) !== -1) &&
                    !e.target.classList.contains('ant-table-row-collapsed') &&
                    !e.target.classList.contains('listing-detail__add-listing-btn')) {
                    this.state.expandedRowUnitIds.splice(
                      this.state.expandedRowUnitIds.indexOf(record.id), 1,
                    );
                    this.setState(this.state);
                  }
                },
              })
            }
            className="listing-detail__table"
            showHeader={ false }
            columns={ this.getTableColumns() }
            dataSource={ this.state.filteredRooms }
            pagination={ false }
            expandedRowRender={ record => this.expandedRowRender(record) }
            expandedRowKeys={ this.state.expandedRowUnitIds }
            rowKey="id"
            rowSelection={ this.columnsRowSelection() }
            rowClassName="listing-detail__rooms-row"
            expandIcon={ this.handleExpandIcon }
          />
        </div>

        <If condition={ !this.state.showModal }>
          <Drawer
            mask={ false }
            destroyOnClose
            placement="right"
            visible={ this.state.showViewModal }
            className="listing-detail__drawer"
            closable={ false }
            getContainer={ this.listingContainer }
            width="448"
            style={ { position: 'absolute', zIndex: '1000' } }
            bodyStyle={ { height: '100%', padding: 0 } }
          >
            <ViewModal
              property={ this.props.property }
              t={ t }
              listingData={ this.state.currentListing }
              onClose={ this.handleCloseViewModal }
              openModal={ this.openListingFormModal }
              onDelete={ this.confirmDeleteListing }
              unitData={ this.state.currentRoom }
              onOpenOtherRoomsModal={ this.handleOpenOtherRoomsModal }
            />
          </Drawer>
        </If>

        <If condition={ this.state.showModal }>
          <Modal
            activeModal
            property={ this.props.property }
            t={ t }
            listingData={ this.state.currentListing }
            onClose={ this.closeListingFormModal }
            onConfirm={ this.handleConfirm }
            type={ this.state.modalType }
            roomData={ this.state.currentRoom }
          />
        </If>
        <If condition={ this.state.showOtherRoomsModal }>
          <OtherRoomsModal
            activeModal
            t={ t }
            roomDataSource={ property && property.unitTypes && property.unitTypes.edges }
            onClose={ this.handleCloseOtherRoomsModal }
            onCopyListingToRooms={ this.handleCopyListingToRooms }
          />
        </If>
        <If condition={ this.state.showEditSelectModal }>
          <EditSelectModal
            activeModal
            onClose={ this.handleCloseEditSelectModal }
            selectedListingIds={ this.state.selectedListingIds }
            t={ this.props.t }
            billingCycle={ this.props.property.billingCycle }
            bulkUpdateListings={ this.props.bulkUpdateListings }
            isPublished={ this.isPublished() }
            selectedListings={ this.state.selectedListings }
            refreshBulkListing={ this.refreshBulkListing }
          />
        </If>
      </div>
    );
  }
}

ListingDetail.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  updateListing: PropTypes.func,
  createListing: PropTypes.func,
  deleteListing: PropTypes.func,
  copiedRoomListings: PropTypes.array,
  bulkUpdateListings: PropTypes.func,
  setCopyRoomListing: PropTypes.func,
  setProperty: PropTypes.func,
};

ListingDetail.defaultProps = {
  t: () => {},
  property: {},
  updateListing: () => {},
  createListing: () => {},
  deleteListing: () => {},
  copiedRoomListings: [],
  bulkUpdateListings: () => {},
  setCopyRoomListing: () => {},
  setProperty: () => {},
};

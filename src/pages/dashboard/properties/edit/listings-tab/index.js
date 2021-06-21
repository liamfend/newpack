import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Table, Icon, Drawer, message, Popconfirm, Dropdown, Menu, Tooltip, Checkbox } from 'antd';
import window from 'global/window';
import Modal from '~pages/dashboard/properties/edit/listings-tab/modal';
import PMSEditSelectModal from '~pages/dashboard/properties/edit/listings-tab/edit-select';
import NoRoomPage from '~components/no-room-page';
import { updateMutation, platformEntity, entityAction } from '~client/constants';
import handleTenancy from '~helpers/tenancy-preview';
import formatPrice from '~helpers/currency';
import * as actions from '~actions/properties/property-edit';
import SearchComponent from '~components/search-component';
import showElementByAuth from '~helpers/auth';


const mapDispatchToProps = dispatch => ({
  setListingsDataChanged: (isChanged) => {
    dispatch(actions.setListingsDataChanged(isChanged));
  },
});
const mapStateToProps = state =>
  ({ editedFields: state.dashboard.propertyEdit.toJS().editedFields });

@connect(mapStateToProps, mapDispatchToProps)
export default class ListingsTab extends React.Component {
  constructor(props) {
    super(props);

    this.drawerContainer = null;
    this.copyBtn = {};
    this.editBtn = {};
    this.deleteBtn = {};

    this.columns = [
      {
        title: ' ',
        dataIndex: 'name',
        key: 'name',
        className: 'listings-tab__column listings-tab__column--name',
      },
      {
        title: ' ',
        dataIndex: 'category',
        key: 'category',
        width: '25%',
        className: 'listings-tab__column listings-tab__column--type',
        render: (text, record) => (
          <span className="listings-tab__column-content">
            { this.props.t(`cms.listing.categories.label.${record.category ? record.category.toLowerCase() : ''}`) }
          </span>
        ),
      },
      {
        title: ' ',
        dataIndex: 'updatedAt',
        width: '25%',
        key: 'updatedAt',
        className: 'listings-tab__column listings-tab__column--updated-at',
        render: (text, record) => (
          <span className="listings-tab__column-content">{ this.props.t('cms.listing.last_edit.label', {
            date: moment(this.getLatestUpdateTime(record)).format('DD/MM/YYYY HH:mm'),
          }) }</span>
        ),
      },
      {
        title: ' ',
        width: '20%',
        key: 'actions',
        className: 'listings-tab__column listings-tab__column--action',
        render: (text, record, index) => (
          <If condition={ showElementByAuth(
            platformEntity.LISTINGS_LISTINGS,
            entityAction.CREATE,
          ) }
          >
            <button
              className="listings-tab__add-listing-btn"
              onClick={ () => { this.handleAddRoomListing(record, index); } }
              ref={ (node) => { this.addRoomListingBtn = node; } }
            >
              { props.t('cms.listing.add_listing.btn') }
            </button>
          </If>
        ),
      },
    ];

    this.subColumns = [
      {
        title: 'Tenancy',
        key: 'tenancy',
        width: '25%',
        className: 'listings-tab__sub-column listings-tab__sub-column--tenancy',
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
            <div className="listings-tab__sub-column-content">
              <p className="listings-tab__sub-column-content--move-in">{ this.props.t('cms.listing.sub_table.move_in_label', {
                moveInDesc: tenancy.moveIn || '--',
              }) }</p>
              <p className="listings-tab__sub-column-content--move-out">{ this.props.t('cms.listing.sub_table.move_out_label', {
                moveOutDesc: tenancy.moveOut || '--',
              }) }</p>
            </div>
          );
        },
      },
      {
        title: 'Stay',
        dataIndex: 'stay',
        width: '20%',
        key: 'stay',
        className: 'listings-tab__sub-column listings-tab__sub-column--stay',
        render: (text, record) => {
          let tenancyLengthValueMin; let
            tenancyLengthValueMax;
          if (record.tenancyLengthValue && isNaN(Number(record.tenancyLengthValue))) {
            const tenancyLengthList = record.tenancyLengthValue.split('-');
            let min; let max;
            if (Array.isArray(tenancyLengthList) && tenancyLengthList.length === 2) {
              [min, max] = tenancyLengthList;
            } else {
              [min, max] = record.tenancyLengthValue.split('_');
            }
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
            <div className="listings-tab__sub-column-content">
              <p className="listings-tab__sub-column-content--tenancy">{tenancy.stay || '--'}</p>
            </div>
          );
        },
      },
      {
        title: this.props.t('cms.listing.sub_table.title.price', {
          billingCycle: this.props.t(`cms.listing.billing_cycle.per_${
            props.property.billingCycle ? props.property.billingCycle.toLowerCase() : 'weekly'
          }`),
        }),
        dataIndex: 'price',
        key: 'price',
        width: '20%',
        className: 'listings-tab__sub-column listings-tab__sub-column--price',
        render: (text, record) => {
          let currentPrice = record.priceMin;
          if (record.priceMin && record.discountValue && record.discountType === 'ABSOLUTE') {
            currentPrice = record.priceMin - record.discountValue;
          } else if (record.priceMin && record.discountValue && record.discountType === 'PERCENTAGE') {
            // eslint-disable-next-line  no-mixed-operators
            currentPrice = (record.priceMin * (100 - record.discountValue) / 100);
          }

          return (
            <div className="listings-tab__sub-column-content">
              <p className="listings-tab__sub-column-content--price">
                {formatPrice(currentPrice, props.property.currency) || '--'}
                <If condition={ record.discountType && record.discountType !== 'NO_DISCOUNT' }>
                  <span className="listings-tab__sub-column-content--origin-price">
                    {formatPrice(record.priceMin, props.property.currency)}
                  </span>
                </If>
              </p>
            </div>
          );
        },
      },
      {
        title: this.props.t('cms.listing.sub_table.title.availability'),
        dataIndex: 'availability',
        key: 'availability',
        width: '10%',
        className: 'listings-tab__sub-column listings-tab__sub-column--availability',
        render: (text, record) => (
          <div className="listings-tab__sub-column-content">
            <If condition={ record.type !== 'PLACEHOLDER' }>
              <p className="listings-tab__sub-column-content--availability">
                <span className={ classNames('listings-tab__status-icon', {
                  'listings-tab__status-icon--good': record.availability === 'GOOD',
                  'listings-tab__status-icon--limited': record.availability === 'LIMITED',
                  'listings-tab__status-icon--sold-out': record.availability === 'SOLD_OUT',
                }) }
                />
                { this.props.t(`cms.listing.modal.availability.option.${
                  record.availability ? record.availability.toLowerCase() : 'good'
                }`)}
              </p>
            </If>
            <If condition={ record.type === 'PLACEHOLDER' }>
              <p className="listings-tab__sub-column-content--place-holder">
                { this.props.t('cms.listing.modal.place_holder.label') }
              </p>
            </If>
          </div>),
      },
      {
        title: this.props.t('cms.listing.sub_table.title.actions'),
        key: 'actions',
        className: 'listings-tab__sub-column listings-tab__sub-column--actions',
        render: (text, record, index) => {
          this.editBtn[record.id] = {};
          this.copyBtn[record.id] = {};
          this.deleteBtn[record.id] = {};

          return (<div className="listings-tab__listing-btn-container">
            <If condition={ showElementByAuth(
              platformEntity.LISTINGS_LISTINGS,
              entityAction.UPDATE,
            ) }
            >
              <button
                className="listings-tab__edit-listing-btn"
                onClick={ () => { this.handleEditRoomListing(record, index); } }
                ref={ (node) => { this.editBtn[record.id][index] = node; } }
              >
                <Icon
                  type="edit"
                  style={ {
                    color: '#38b2a6',
                  } }
                />
              </button>
            </If>
            <If condition={ showElementByAuth(
              platformEntity.LISTINGS_LISTINGS,
              entityAction.CREATE,
            ) }
            >
              <button
                className="listings-tab__copy-listing-btn"
                onClick={ () => { this.handleCopyRoomListing(record); } }
                ref={ (node) => { this.copyBtn[record.id][index] = node; } }
              >
                <Icon
                  type="copy"
                  style={ {
                    color: '#38b2a6',
                  } }
                />
              </button>
            </If>
            <If condition={ showElementByAuth(
              platformEntity.LISTINGS_LISTINGS,
              entityAction.DELETE,
            ) }
            >
              <Popconfirm
                placement="topRight"
                title={ props.t('cms.properties.edit.listings.delete_listing_hint') }
                onConfirm={ (e) => { e.stopPropagation(); this.handleDeleteRoomListing(record); } }
                onCancel={ (e) => { e.stopPropagation(); } }
                okText={ props.t('cms.properties.edit.btn.yes') }
                okType="danger"
                cancelText={ props.t('cms.properties.edit.btn.no') }
              >
                <Icon
                  className="listings-tab__delete-listing-btn"
                  type="delete"
                  style={ {
                    color: '#38b2a6',
                  } }
                  onClick={ (e) => { e.stopPropagation(); } }
                />
              </Popconfirm>
            </If>
          </div>);
        },
      },
    ];

    this.updateTimeFilter = (
      <Menu onClick={ (value) => {
        this.filterListingsData(Number(value.key), this.state.roomFilterList);
      } }
      >
        <Menu.Item key={ 0 }>
          <p className="listings-tab__update-filter-item">
            { props.t('cms.properties.edit.rooms.filter.updated_time.all') }
          </p>
        </Menu.Item>
        <Menu.Item key={ 10 }>
          <p className="listings-tab__update-filter-item">
            { props.t('cms.properties.edit.rooms.filter.updated_time.10_mins') }
          </p>
        </Menu.Item>
        <Menu.Item key={ 60 }>
          <p className="listings-tab__update-filter-item">
            { props.t('cms.properties.edit.rooms.filter.updated_time.60_mins') }
          </p>
        </Menu.Item>
        <Menu.Item key={ 720 }>
          <p className="listings-tab__update-filter-item">
            { props.t('cms.properties.edit.rooms.filter.updated_time.720_mins') }
          </p>
        </Menu.Item>
      </Menu>
    );

    this.state = {
      data: [],
      selectedListingsKeys: [],
      selectedListings: [],
      selectedRoomsKeys: [],
      indeterminateRoomsKeys: [],
      showListingModal: false,
      showEditSelectModal: false,
      currentListing: null,
      expandedRowKeys: [],
      updatedTimeValue: 0,
      scrollY: 240,
      closeModalPopupVisible: false,
      nextListing: null,
      roomFilterContainer: null,
      roomFilterTarget: null,
      roomFilterList: [],
      showRoomsWithListings: false,
      activeRooms: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.rooms) !== JSON.stringify(this.props.rooms)) {
      if (prevProps.rooms.length !== this.props.rooms.length) {
        this.state.updatedTimeValue = 0;
        this.state.roomFilterList = [];
        this.clearRoomFilter();
      }

      this.filterListingsData(this.state.updatedTimeValue, this.state.roomFilterList);
      this.getActiveRooms();
    }
  }

  componentDidMount() {
    this.filterListingsData(this.state.updatedTimeValue, this.state.roomFilterList);
    this.getActiveRooms();
    this.setTableScrollY();

    window.onresize = () => {
      this.setTableScrollY();
    };
  }

  getActiveRooms = () => {
    const { rooms } = this.props;
    this.state.activeRooms = rooms.filter((room) => {
      if (room.node && room.node.action !== updateMutation.DELETE) {
        return true;
      }

      return false;
    });
    this.setState(this.state);
  };

  clearRoomFilter = () => {
    if (this.searchComponent) {
      this.searchComponent.handleClear();
    }
  }

  getLatestUpdateTime = (record) => {
    if (Array.isArray(record.listings) && record.listings.length > 0) {
      const resultListing = record.listings.reduce((lastedListing, listing) => {
        if (moment(lastedListing.updatedAt).isBefore(moment(listing.updatedAt))) {
          return listing;
        }

        return lastedListing;
      });

      return resultListing.updatedAt;
    }
    return record.updatedAt;
  };

  setTableScrollY = () => {
    const windowHeight = window.innerHeight;
    this.setState({
      scrollY: windowHeight - 290,
    });
  };

  handleCloseEditSelectModal = () => {
    this.setState({ showEditSelectModal: false });
  };

  handleAddRoomListing = (record) => {
    const newListing = {
      id: `fake-id-new-${moment().format('x')}`,
      roomsId: record.id,
      roomsName: record.name,
      action: updateMutation.NEW,
    };

    this.state.currentListing = newListing;
    this.props.updatePropertyListing(record.id, null, newListing);
    this.state.showListingModal = true;
    this.state.showEditSelectModal = false;
    if (this.state.expandedRowKeys.indexOf(record.key) === -1) {
      this.state.expandedRowKeys.push(record.key);
    }
    this.setState(this.state);
  };

  copyRoomListing = (record) => {
    const copyRecord = Object.assign({}, record);
    copyRecord.id = `fake-id-copied-${moment().format('x')}`;
    copyRecord.roomsName = this.props.t('cms.listing.modal.copy_a_listing');
    copyRecord.action = updateMutation.NEW;
    this.setState({
      showListingModal: true,
      currentListing: copyRecord,
    }, () => {
      this.props.updatePropertyListing(
        copyRecord.roomsId,
        copyRecord.id,
        copyRecord,
      );
      this.props.setListingsDataChanged(true);
    });
  }

  handleCopyRoomListing = (record) => {
    if (this.state.showListingModal) {
      this.setState({ showListingModal: false });
      setTimeout(() => {
        this.copyRoomListing(record);
      }, 200);
    } else {
      this.copyRoomListing(record);
    }

    message.success(this.props.t('cms.listing.toast.copy_success'));
  };

  handleEditRoomListing = (record) => {
    this.state.currentListing = record;
    this.state.showListingModal = true;
    this.state.showEditSelectModal = false;
    this.setState(this.state);
  };

  handleDeleteRoomListing = (record) => {
    const deleteRoom = this.state.data.find(room => room.id === record.roomsId);
    if (deleteRoom && deleteRoom.listings.length === 1) {
      this.state.expandedRowKeys.splice(this.state.expandedRowKeys.indexOf(deleteRoom.key), 1);
      this.setState(this.state);
    }

    // If pass null, will delete listing record
    const data = record;
    data.action = updateMutation.DELETE;
    this.props.updatePropertyListing(
      data.roomsId,
      data.id,
      !record.id.match(/fake-id/g) ? data : null,
    );
    message.success(this.props.t('cms.listing.toast.delete_success'));
  };

  handleCloseModal = () => {
    if (this.state.currentListing && this.state.currentListing.action === updateMutation.NEW) {
      const data = this.state.currentListing;
      data.action = updateMutation.DELETE;
      this.props.updatePropertyListing(
        data.roomsId,
        data.id,
        null,
      );
    }

    this.setState({
      showListingModal: false,
      currentListing: null,
    });
  };

  handleComfirmModal = () => {
    this.state.showListingModal = false;
    this.state.currentListing = null;
    this.setState(this.state);
    message.success(this.props.t('cms.listing.toast.update_success'));
  }

  formatListingsData = (rooms) => {
    const { showRoomsWithListings } = this.state;
    this.state.selectedListingsKeys = [];
    this.state.selectedListings = [];
    this.state.selectedRoomsKeys = [];
    this.state.indeterminateRoomsKeys = [];

    if (rooms) {
      this.state.data = [];
      const newRooms = rooms.filter((room) => {
        if (showRoomsWithListings) {
          const validListings = room.node.listings.filter(listing => listing.action !== 'DELETE');
          return validListings.length && room.node.action !== 'DELETE' && room.node.action !== 'NEW';
        }
        return room.node.action !== 'DELETE' && room.node.action !== 'NEW';
      });
      newRooms.map((unit, index) => {
        const formatUnit = {};
        formatUnit.key = index;
        formatUnit.id = unit.node.id;
        formatUnit.name = unit.node.name;
        formatUnit.category = unit.node.category;
        formatUnit.updatedAt = unit.node.updatedAt;
        formatUnit.listings = [];
        if (unit.node.listings && unit.node.listings.length > 0) {
          const newListings = unit.node.listings.filter(listing => listing.action !== 'DELETE');
          newListings.map((listing) => {
            formatUnit.listings.push({
              key: listing.id,
              id: listing.id,
              roomsId: unit.node.id,
              roomsName: unit.node.name,
              placeHolder: listing.placeHolder,
              availability: listing.availability,
              autoPriceAllowed: listing.autoPriceAllowed,
              autoAvailAllowed: listing.autoAvailAllowed,
              liveOn: listing.liveOn,
              liveUntil: listing.liveUntil,
              priceMin: listing.priceMin,
              priceMax: listing.priceMax,
              discountType: listing.discountType,
              discountValue: listing.discountValue,
              updatedAt: listing.updatedAt,
              type: listing.type,
              moveIn: listing.moveIn,
              moveOut: listing.moveOut,
              moveInType: listing.moveInType,
              moveOutType: listing.moveOutType,
              tenancyLengthType: listing.tenancyLengthType,
              tenancyLengthValue: listing.tenancyLengthValue,
              action: listing.action || null,
            });

            return true;
          });

          formatUnit.listings.sort((a, b) => (
            moment(a.updatedAt).isAfter(moment((b.updatedAt))) ? -1 : 1),
          );
        } else if (this.state.expandedRowKeys.indexOf(index) !== -1) {
          this.state.expandedRowKeys.splice(this.state.expandedRowKeys.indexOf(index), 1);
        }

        this.state.data.push(formatUnit);
        return true;
      });


      this.setState(this.state);
    }
  };

  subColumnsRowSelection = unit => ({
    onSelect: (record, selected, selectedRows) => {
      if (selected) {
        if (this.state.selectedListingsKeys.indexOf(record.key) === -1) {
          this.state.selectedListingsKeys.push(record.key);
          this.state.selectedListings.push(record);
        }

        if (this.state.selectedRoomsKeys.indexOf(unit.key) === -1 &&
        selectedRows.length === unit.listings.length
        ) {
          this.state.selectedRoomsKeys.push(unit.key);
        }
      } else {
        if (this.state.selectedListingsKeys.indexOf(record.key) !== -1) {
          this.state.selectedListingsKeys.splice(
            this.state.selectedListingsKeys.indexOf(record.key), 1,
          );

          this.state.selectedListings.splice(
            this.state.selectedListings.findIndex(item => record.key === item.key), 1,
          );

          if (this.state.selectedListingsKeys.length === 0) {
            this.state.showEditSelectModal = false;
          }
        }

        if (this.state.selectedRoomsKeys.indexOf(unit.key) !== -1) {
          this.state.selectedRoomsKeys.splice(
            this.state.selectedRoomsKeys.indexOf(unit.key), 1,
          );
        }
      }

      if (selectedRows.length !== unit.listings.length &&
        this.state.indeterminateRoomsKeys.indexOf(unit.key) === -1 &&
        selectedRows.length !== 0
      ) {
        this.state.indeterminateRoomsKeys.push(unit.key);
      } else if (selectedRows.length === 0 ||
        (selectedRows.length === unit.listings.length &&
        this.state.indeterminateRoomsKeys.indexOf(unit.key) !== -1)) {
        this.state.indeterminateRoomsKeys.splice(
          this.state.indeterminateRoomsKeys.indexOf(unit.key), 1,
        );
      }
      this.setState(this.state);
    },
    columnWidth: 50,
    columnTitle: ' ',
    selectedRowKeys: this.state.selectedListingsKeys,
  });

  columnsRowSelection = () => ({
    onSelect: (record, selected) => {
      if (selected) {
        // add rooms key to selected keys list
        if (this.state.selectedRoomsKeys.indexOf(record.key) === -1) {
          this.state.selectedRoomsKeys.push(record.key);
        }

        // add listings key to selected keys list
        record.listings.map((listing) => {
          if (this.state.selectedListingsKeys.indexOf(listing.key) === -1) {
            this.state.selectedListingsKeys.push(listing.key);
            this.state.selectedListings.push(listing);
          }
          return true;
        });
      } else {
        if (this.state.selectedRoomsKeys.indexOf(record.key) !== -1) {
          this.state.selectedRoomsKeys.splice(
            this.state.selectedRoomsKeys.indexOf(record.key), 1,
          );
        }
        record.listings.map((listing) => {
          if (this.state.selectedListingsKeys.indexOf(listing.key) !== -1) {
            this.state.selectedListingsKeys.splice(
              this.state.selectedListingsKeys.indexOf(listing.key), 1,
            );

            this.state.selectedListings.splice(
              this.state.selectedListings.findIndex(item => listing.key === item.key), 1,
            );
          }

          if (this.state.selectedListingsKeys.length === 0) {
            this.state.showEditSelectModal = false;
          }
          return true;
        });
      }

      if (this.state.indeterminateRoomsKeys.indexOf(record.key) !== -1) {
        this.state.indeterminateRoomsKeys.splice(
          this.state.indeterminateRoomsKeys.indexOf(record.key), 1,
        );
      }

      this.setState(this.state);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        changeRows.map((record) => {
          // add rooms key to selected keys list
          if (this.state.selectedRoomsKeys.indexOf(record.key) === -1) {
            this.state.selectedRoomsKeys.push(record.key);
          }

          // add listings key to selected keys list
          record.listings.map((listing) => {
            if (this.state.selectedListingsKeys.indexOf(listing.key) === -1) {
              this.state.selectedListingsKeys.push(listing.key);
              this.state.selectedListings.push(listing);
            }
            return true;
          });
          return true;
        });
      } else {
        changeRows.map((record) => {
          this.state.selectedRoomsKeys.splice(this.state.selectedRoomsKeys.indexOf(record.key), 1);
          record.listings.map((listing) => {
            this.state.selectedListingsKeys.splice(
              this.state.selectedListingsKeys.indexOf(listing.key), 1,
            );

            this.state.selectedListings.splice(
              this.state.selectedListings.findIndex(item => record.key === item.key), 1,
            );

            if (this.state.selectedListingsKeys.length === 0) {
              this.state.showEditSelectModal = false;
            }
            return true;
          });
          return true;
        });
      }
      this.state.indeterminateRoomsKeys = [];
      this.setState(this.state);
    },
    getCheckboxProps: record => ({
      disabled: !record.listings || record.listings.length === 0,
      indeterminate: this.state.indeterminateRoomsKeys.indexOf(record.key) !== -1,
    }),
    selectedRowKeys: this.state.selectedRoomsKeys,
  });

  expandedRowRender = unit => (
    <If condition={ unit.listings.length > 0 }>
      <Table
        rowSelection={ this.subColumnsRowSelection(unit) }
        columns={ this.subColumns }
        dataSource={ unit.listings }
        pagination={ false }
        hideDefaultSelections
        rowClassName={ record => classNames('listings-tab__listings-row', {
          'listings-tab__listings-row--active': this.state.currentListing &&
            record.id === this.state.currentListing.id,
        }) }
        onRow={ (record, index) => ({
          onClick: (e) => {
            if (!((this.editBtn[record.id] &&
                this.editBtn[record.id][index] &&
                this.editBtn[record.id][index].contains(e.target)) ||
                (this.copyBtn[record.id] &&
                this.copyBtn[record.id][index] &&
                this.copyBtn[record.id][index].contains(e.target)) ||
                (this.deleteBtn[record.id] &&
                this.deleteBtn[record.id][index] &&
                this.deleteBtn[record.id][index].contains(e.target)))
            ) {
              if (this.state.showEditSelectModal ||
                (this.state.currentListing && record.id === this.state.currentListing.id)
              ) {
                return true;
              }

              if (this.state.showListingModal) {
                if (this.props.editedFields.listingsDataChanged &&
                  record.id !== this.state.currentListing.id) {
                  this.setState({
                    closeModalPopupVisible: true,
                    nextListing: record,
                  });
                  return false;
                }
                this.setState({ showListingModal: false, nextListing: null });
                setTimeout(() => {
                  this.setState({
                    currentListing: record,
                    showListingModal: true,
                  });
                }, 200);
              } else {
                this.setState({
                  currentListing: record,
                  showListingModal: true,
                });
              }
            }

            return true;
          },
        }) }
      />
    </If>
  );

  handleExpandIcon = (props) => {
    if (props.record.listings && props.record.listings.length > 0) {
      return (
        <span
          role="presentation"
          className={ `ant-table-row-expand-icon listings-tab__expand-icon ${
            props.expanded ? 'ant-table-row-expanded' : 'ant-table-row-collapsed'
          }` }
          onClick={ () => this.onExpand(props.record, props.expanded) }
          ref={ (node) => { this.expandIcon = node; } }
        />
      );
    }

    return true;
  }

  saveContainer = (container) => {
    this.drawerContainer = container;
  };

  onExpand = (record, expanded) => {
    if (expanded) {
      this.state.expandedRowKeys.splice(this.state.expandedRowKeys.indexOf(record.key), 1);
    } else {
      this.state.expandedRowKeys.push(record.key);
    }
    this.setState(this.state);
  };

  filterListingsData = (updateTime, roomFilterList) => {
    const { showRoomsWithListings } = this.state;
    let newData = this.filterRoomBySelect(roomFilterList, this.props.rooms);
    newData = this.filterRoomByUpdateTime(updateTime, newData);
    if (showRoomsWithListings) {
      newData = newData.filter((room) => {
        const validListings = room.node.listings.filter(listing => listing.action !== 'DELETE');
        return validListings.length && room.node.action !== 'DELETE' && room.node.action !== 'NEW';
      });
    }
    if (this.state.updatedTimeValue !== updateTime ||
      this.state.roomFilterList !== roomFilterList
    ) {
      this.state.updatedTimeValue = updateTime;
      this.state.roomFilterList = roomFilterList;
      this.state.expandedRowKeys = [];
      this.state.selectedRoomsKeys = [];
      this.state.selectedListingsKeys = [];
      this.state.selectedListings = [];
    }

    this.formatListingsData(newData);
  };

  filterRoomBySelect = (roomList, rooms) => {
    if (roomList.length !== 0) {
      const newData = [];
      roomList.map((item) => {
        rooms.map((room) => {
          if (item.id === room.node.id) {
            newData.push(room);
          }
          return true;
        });
        return true;
      });
      return newData;
    }
    return rooms;
  }

  filterRoomByUpdateTime = (value, rooms) => {
    if (value === 0) {
      return rooms.map(room => room);
    }
    const filterRoom = [];
    rooms.map((room) => {
      const filterListings = room.node.listings && room.node.listings.filter(listing =>
        moment(listing.updatedAt).isAfter(moment().subtract(value, 'm')),
      );
      const isRoomValid = moment(room.node.updatedAt).isAfter(moment().subtract(value, 'm'));
      if ((filterListings && filterListings.length > 0) ||
        (!room.node.listings.length && isRoomValid)) {
        const copyRoom = JSON.parse(JSON.stringify(room));
        copyRoom.node.listings = filterListings;
        filterRoom.push(copyRoom);
      }
      return true;
    });

    return filterRoom;
  }

  handleEditSelected = () => {
    this.setState({ showEditSelectModal: true });
  };

  handleAddRoomBtnClick = () => {
    this.props.handleTabChange('rooms', true);
  };

  handleChooseNextListing = () => {
    setTimeout(() => {
      this.setState(() => ({
        currentListing: this.state.nextListing,
        showListingModal: true,
        closeModalPopupVisible: false,
      }));
    }, 200);
  }
  setRoomFilterContainer = (node, disabled) => {
    if (!this.state.roomFilterContainer && !disabled) {
      this.setState({ roomFilterContainer: node });
    }
  };

  setRoomFilterTarget = (node, disabled) => {
    if (!this.state.roomFilterTarget && !disabled) {
      this.setState({ roomFilterTarget: node });
    }
  };

  getSearchComponentOptions = () => {
    const { showRoomsWithListings } = this.state;
    const newRooms = this.props.rooms.map(room => ({
      name: room.node.name,
      id: room.node.id,
      listings: room.node.listings,
    })).filter(room => room.action !== 'DELETE' && room.action !== 'NEW');
    if (showRoomsWithListings) {
      return newRooms.filter((unit) => {
        const validListings = unit.listings.filter(listing => listing.action !== 'DELETE');
        return validListings.length;
      });
    }
    return newRooms;
  };

  generateHeaderFilter = (disabled = false) => (
    <div className="listings-tab__rooms-filter-container">
      <div
        className={ classNames('listings-tab__rooms-filter', {
          'listings-tab__rooms-filter--disabled': disabled,
        }) }
        ref={ (node) => { this.setRoomFilterContainer(node, disabled); } }
      >
        <Tooltip
          title={ this.props.t('cms.properties.edit.rooms.filter.updated_time.tootips_content') }
          overlayClassName={ classNames('listings-tab__filter-tooltips', {
            'listings-tab__filter-tooltips--disabled': disabled,
          }) }
        >
          <p
            className={ classNames('listings-tab__rooms-filter-content', {
              disabled,
            }) }
            ref={ (node) => { this.setRoomFilterTarget(node, disabled); } }
            disabled={ disabled }
          >
            <If condition={ this.state.roomFilterList.length > 0 }>
              <span className="listings-tab__rooms-filter-content__text">
                { this.props.t('cms.listing.filter_room.room_selcted', {
                  number: this.state.roomFilterList.length,
                })}
              </span>
            </If>

            <If condition={ this.state.roomFilterList.length === 0 }>
              <span className="listings-tab__rooms-filter-content__text">
                { this.props.t('cms.listing.filter_room.content') }
              </span>
            </If>
            <Icon
              className="listings-tab__rooms-filter-icon"
              type="down"
              style={ {
                fontSize: '12px',
              } }
            />
          </p>
        </Tooltip>
        <SearchComponent
          ref={ (node) => { this.searchComponent = node; } }
          t={ this.props.t }
          targetInput={ this.state.roomFilterTarget }
          container={ this.state.roomFilterContainer }
          options={ this.getSearchComponentOptions() }
          type={ 'dropdown' }
          onChange={ (value) => {
            this.filterListingsData(this.state.updatedTimeValue, value.value);
            this.setState({ roomFilterList: value.value });
          } }
          keyValue="id"
          className={ classNames('listings-tab__rooms-filter-search-component', {
            'listings-tab__rooms-filter-search-component--disabled': disabled,
          }) }
        />
      </div>

      <Dropdown
        overlay={ this.updateTimeFilter }
        disabled={ disabled }
        trigger={ ['click'] }
      >
        <div className={ classNames('listings-tab__listing-update-filter', {
          'listings-tab__listing-update-filter--disabled': disabled,
        }) }
        >
          <Tooltip
            title={ this.props.t('cms.properties.edit.rooms.filter.updated_time.tootips_content') }
            overlayClassName={ classNames('listings-tab__filter-tooltips', {
              'listings-tab__filter-tooltips--disabled': disabled,
            }) }
          >
            <span className="listings-tab__listing-update-filter__label">
              { this.props.t(`cms.properties.edit.rooms.filter.updated_time.${this.state.updatedTimeValue}_mins`) }
            </span>
            <Icon className="listings-tab__update-filter-icon" type="down" />
          </Tooltip>
        </div>
      </Dropdown>

      <div className="filter__show-rooms-with-listings">
        <Tooltip
          title={ this.props.t('cms.properties.edit.rooms.filter.updated_time.tootips_content') }
          overlayClassName={ classNames('listings-tab__filter-tooltips', {
            'listings-tab__filter-tooltips--disabled': disabled,
          }) }
        >
          <Checkbox
            checked={ this.state.showRoomsWithListings }
            onChange={ (e) => {
              if (e.target.checked) {
                this.setState({ roomFilterList: [] });
                this.clearRoomFilter();
              }
              this.setState({
                showRoomsWithListings: e.target.checked,
              }, () => {
                this.filterListingsData(this.state.updatedTimeValue, this.state.roomFilterList);
              });
            } }
            disabled={ disabled }
          >
            {this.props.t('cms.properties.edit.rooms.filter.show_rooms_with_listings')}
          </Checkbox>
        </Tooltip>
      </div>
    </div>
  );

  render() {
    const tableParameter = {
      onRow: record => ({
        onClick: (e) => {
          if (!e.target.classList.contains('ant-table-row-expanded') &&
            this.state.expandedRowKeys.indexOf(record.key) === -1 &&
            record.listings.length > 0
          ) {
            this.state.expandedRowKeys.push(record.key);
            this.setState(this.state);
          } else if ((this.state.expandedRowKeys.indexOf(record.key) !== -1) &&
            !e.target.classList.contains('ant-table-row-collapsed') &&
            !e.target.classList.contains('listings-tab__add-listing-btn')) {
            this.state.expandedRowKeys.splice(this.state.expandedRowKeys.indexOf(record.key), 1);
            this.setState(this.state);
          }
        },
      }),
      scroll: { y: this.state.scrollY },
      columns: this.columns,
      dataSource: this.state.data,
      pagination: false,
      expandedRowKeys: this.state.expandedRowKeys,
      rowKey: 'key',
      rowSelection: this.columnsRowSelection(),
      rowClassName: 'listings-tab__rooms-row',
    };

    if (this.state.activeRooms.length !== 0) {
      tableParameter.expandedRowRender = record => this.expandedRowRender(record);
      tableParameter.expandIcon = this.handleExpandIcon;
    } else {
      tableParameter.showHeader = false;
    }

    return (
      <div className="listings-tab" ref={ this.saveContainer }>
        <If condition={ this.props.rooms.length > 0 }>
          <div className="listings-tab__list-container">
            <If condition={ this.state.activeRooms.length !== 0 }>
              <div className="listings-tab__rooms-header-contianer">
                <span className="listings-tab__rooms-select-all-label">{ this.props.t('cms.listing.select_all.label') }</span>
                { this.generateHeaderFilter(
                  this.state.showListingModal || this.state.showEditSelectModal,
                ) }
                <If condition={
                  this.state.selectedListingsKeys.length > 0 && !this.state.showListingModal &&
                  showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.UPDATE)
                }
                >
                  <button className="listings-tab__edit-selected-btn" onClick={ this.handleEditSelected }>
                    { this.props.t('cms.listing.edit_selected.label') }
                  </button>
                </If>
              </div>
            </If>

            <Table { ...tableParameter } />
          </div>

          <Drawer
            visible={ this.state.showListingModal || this.state.showEditSelectModal }
            destroyOnClose
            mask={ false }
            zIndex={ 10000 }
            placement="right"
            className="listings-tab__drawer"
            getContainer={ () => this.drawerContainer }
            closable={ false }
            bodyStyle={ {
              padding: '0',
            } }
            width="40vw"
            style={ {
              position: 'absolute',
            } }
          >
            <If condition={ this.state.showListingModal }>
              <Modal
                handleCloseModal={ this.handleCloseModal }
                handleCopyRoomListing={ this.handleCopyRoomListing }
                handleDeleteRoomListing={ this.handleDeleteRoomListing }
                handleComfirmModal={ this.handleComfirmModal }
                listing={ this.state.currentListing }
                currency={ this.props.property.currency }
                billingCycle={ this.props.property.billingCycle }
                updatePropertyListing={ this.props.updatePropertyListing }
                t={ this.props.t }
                setListingsDataChanged={ this.props.setListingsDataChanged }
                onControlPopup={ (val) => { this.setState({ closeModalPopupVisible: val }); } }
                closeModalPopupVisible={ this.state.closeModalPopupVisible }
                editedFields={ this.props.editedFields }
                nextListing={ this.state.nextListing }
                onChooseNextListing={ this.handleChooseNextListing }
                rooms={ this.props.rooms }
              />
            </If>

            <If condition={ this.state.showEditSelectModal }>
              <div>
                <PMSEditSelectModal
                  handleCloseEditSelectModal={ this.handleCloseEditSelectModal }
                  updatePropertyListing={ this.props.updatePropertyListing }
                  data={ this.state.data }
                  selectedListingsKeys={ this.state.selectedListingsKeys }
                  selectedListings={ this.state.selectedListings }
                  t={ this.props.t }
                  billingCycle={ this.props.property.billingCycle }
                />
              </div>
            </If>
          </Drawer>
        </If>
        <If condition={ this.props.rooms.length === 0 }>
          <NoRoomPage t={ this.props.t } handleAddRoomBtnClick={ this.handleAddRoomBtnClick } />
        </If>
      </div>
    );
  }
}

ListingsTab.propTypes = {
  t: PropTypes.func.isRequired,
  rooms: PropTypes.array,
  property: PropTypes.shape({
    billingCycle: PropTypes.string,
    currency: PropTypes.string,
  }).isRequired,
  updatePropertyListing: PropTypes.func.isRequired,
  setListingsDataChanged: PropTypes.func.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  editedFields: PropTypes.object.isRequired,
  activeTab: PropTypes.string,
};

ListingsTab.defaultProps = {
  t: () => {},
  setListingsDataChanged: () => {},
  rooms: [],
  editedFields: {},
  activeTab: 'listings',
};

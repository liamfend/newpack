import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Button, Icon, Table, Popconfirm, message, Drawer } from 'antd';
import moment from 'moment';
import {
  Edit as EditIcon,
  Copy as CopyIcon,
  Delete as DeleteIcon,
  ContractEmpty as ContractEmptyIcon,
} from "~components/svgs";
import SearchComponent from '~components/search-component';
import ViewModal from '~pages/dashboard/properties/listing-management/room-detail/view-modal';
import { roomCategory, propertyStatus } from '~constants/listing-management';
import Modal from '~pages/dashboard/properties/listing-management/room-detail/room-modal';
import { cloneObject } from '~helpers';
import { platformEntity, entityAction, communicationStatus } from '~constants';
import showElementByAuth from '~helpers/auth';

export default class RoomDetail extends React.Component {
  constructor(props) {
    super(props);

    this.formatedRooms = this.formatRooms(props.property);
    this.roomNameList = this.formatedRooms.map(room => ({ name: room.name, id: room.id }));
    this.defaultFilter = {
      roomId: [],
      category: [],
      order: null,
      withListings: false,
    };

    this.state = {
      filters: JSON.parse(JSON.stringify(this.defaultFilter)),
      filteredRooms: this.formatedRooms,
      roomNameDropDown: false,
      deletePopupVisible: false,
      deleteRoomId: '',
      currentRoom: null,
      showViewModal: false,
      showModal: false,
      modalType: '',
      isCopyAllListing: false,
    };
  }

  handleClickAddRoom = () => {
    this.openRoomFormModal('create', {});
  }

  handleClickDelete = (unitId) => {
    this.setState({
      deletePopupVisible: true,
      deleteRoomId: unitId,
    });
  }

  handleDeletePopup = (visible) => {
    this.setState({
      deletePopupVisible: visible,
    });
  }

  confirmDeleteRoom = (unit) => {
    this.props.deleteRoom(unit.id, () => {
      const { t } = this.props;
      message.success(t(`cms.property.listing_management.delete_room${
        this.isPublished() ? '.published' : ''
      }.toast`));
      this.refreshRoom(unit, 'delete');
    });
  }

  cancelDeleteRoom = () => {
    this.setState({
      deletePopupVisible: false,
    });
  }

  handleClickViewModal = (record) => {
    if (this.state.currentRoom) {
      this.setState({
        showViewModal: false,
      }, () => {
        setTimeout(() => {
          this.setState({
            showViewModal: true,
            currentRoom: record,
          });
        }, 300);
      });
    } else {
      this.setState({
        showViewModal: true,
        currentRoom: record,
      });
    }
  }

  handleCloseViewModal = () => {
    this.setState({
      showViewModal: false,
      currentRoom: null,
    });
  }

  openRoomFormModal = (type, record) => {
    this.setState({
      showViewModal: false,
      showModal: !this.state.showModal,
      modalType: type,
      currentRoom: record || this.state.currentRoom,
    });
  }

  closeRoomFormModal = () => {
    this.setState({
      showModal: !this.state.showModal,
      currentRoom: {},
      isCopyAllListing: false,
    });
  }

  refreshRoom = (newRoom, type) => {
    const { property } = this.props;
    const updatedProperty = cloneObject(property);

    if (type === 'update') {
      updatedProperty.unitTypes.edges = updatedProperty.unitTypes.edges.map((unit) => {
        if (
          newRoom && newRoom.updateRoom &&
          newRoom.updateRoom.unitType &&
          newRoom.updateRoom.unitType.id === unit.node.id
        ) {
          return { node: newRoom.updateRoom.unitType };
        }
        return unit;
      });
    }
    if (type === 'create') {
      updatedProperty.unitTypes.edges.unshift({ node: newRoom.createRoom.unitType });
    }
    if (type === 'delete') {
      updatedProperty.unitTypes.edges = updatedProperty.unitTypes.edges
        .filter(unit => unit.node.id !== newRoom.id);
    }
    const formatedUpdatedRooms = this.formatRooms(updatedProperty);
    this.formatedRooms = formatedUpdatedRooms;
    this.roomNameList = formatedUpdatedRooms.map(room => ({ name: room.name, id: room.id }));
    this.props.setProperty({ property: updatedProperty });
    this.filterRooms();
  };

  isPublished = () => this.props.property.status === propertyStatus.PUBLISHED;

  handleConfirm = (data) => {
    const { t } = this.props;

    if (this.state.modalType === 'edit') {
      this.props.updateRoom(data, (res) => {
        message.success(t(`cms.property.listing_management.update_room${
          this.isPublished() ? '.published' : ''
        }.toast`));

        this.refreshRoom(res, 'update');
        this.closeRoomFormModal();
      });
    } else {
      this.props.createRoom(data, (res) => {
        message.success(t(`cms.property.listing_management.${this.state.modalType}_room${
          this.isPublished() ? '.published' : ''
        }.toast`));

        this.refreshRoom(res, 'create');
        if (res && this.state.modalType === 'copy' && this.state.isCopyAllListing) {
          const newCopyiedRoomListings = [...this.props.copiedRoomListings];
          newCopyiedRoomListings.push({
            unitId: res && res.createRoom && res.createRoom.unitType && res.createRoom.unitType ?
              res.createRoom.unitType.id : '',
            listings: this.state.currentRoom && this.state.currentRoom.listings,
          });

          this.props.setCopyRoomListing(newCopyiedRoomListings);
          this.filterRooms();
        }
        this.closeRoomFormModal();
      });
    }
  }

  getTableColumns = () => {
    const { t } = this.props;
    const { filters } = this.state;
    return [
      {
        title: t('cms.property.listing_management.room_name.table'),
        dataIndex: 'name',
        key: 'name',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record); },
        }),
        width: '40%',
        render: name => name || '-',
        filterDropdown: (
          <React.Fragment>
            <label ref={ (node) => { this.roomNameTargetNode = node; } } />
            <SearchComponent
              t={ t }
              ref={ (node) => { this.searchComponent = node; } }
              targetInput={ this.roomNameTargetNode }
              options={ this.roomNameList }
              onBlur={ (value) => {
                this.state.filters.roomId = [...value.value.map(room => room.id)];
                this.setState(this.state, () => {
                  this.filterRooms();
                });
              } }
              keyValue="id"
              showSelectAll={ false }
              selectList={ filters.roomId }
            />
          </React.Fragment>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={ { color: filters.roomId.length > 0 ? '#38b2a6' : '#c8c9cb' } }
          />
        ),
        filterDropdownVisible: this.state.roomNameDropDown,
        onFilterDropdownVisibleChange: (view) => {
          if (view && this.roomNameTargetNode) {
            setTimeout(() => {
              this.roomNameTargetNode.click();
            }, 0);
          }
          this.setState({
            roomNameDropDown: view,
          });
        },
      },
      {
        title: t('cms.property.listing_management.room_type.table'),
        dataIndex: 'category',
        key: 'category',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record); },
        }),
        width: '20%',
        render: category => t(`cms.property.listing_management.room_category.${category.toLowerCase()}`) || '-',
        filters: [
          { text: t('cms.property.listing_management.room_category.shared_room'), value: roomCategory.SHARED_ROOM },
          { text: t('cms.property.listing_management.room_category.private_room'), value: roomCategory.PRIVATE_ROOM },
          { text: t('cms.property.listing_management.room_category.entire_place'), value: roomCategory.ENTIRE_PLACE },
        ],
        filterMultiple: true,
        filteredValue: filters.category,
        filterIcon: (
          <Icon
            type="filter"
            theme="filled"
            style={ {
              color: filters.category && filters.category.length > 0 ? '#38b2a6' : '#c8c9cb',
            } }
          />
        ),
      },
      {
        title: t('cms.property.listing_management.update_time.table'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        onCell: record => ({
          onClick: () => { this.handleClickViewModal(record); },
        }),
        sorter: true,
        width: '20%',
        render: updatedAt => moment(updatedAt).format('YYYY/MM/DD HH:mm') || '-',
        sortOrder: this.state.filters.order,
      },
      {
        title: t('cms.property.listing_management.actions.table'),
        dataIndex: 'actions',
        width: '20%',
        key: 'actions',
        render: (_, record) => (
          <span className="room-detail__action-wrap">
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.UPDATE,
            ) }
            >
              <button
                className="room-detail__icon-wrap"
                onClick={ () => this.openRoomFormModal('edit', record) }
              >
                <EditIcon className="room-detail__action-icon" />
              </button>
            </If>
            <If condition={
              showElementByAuth(platformEntity.PROPERTIES_UNIT_TYPES, entityAction.CREATE) ||
              showElementByAuth(platformEntity.PROPERTIES_UNIT_TYPES, entityAction.DELETE)
            }
            >
              <em className="room-detail__line" />
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.CREATE,
            ) }
            >
              <button
                className="room-detail__icon-wrap"
                onClick={ () => this.openRoomFormModal('copy', record) }
              >
                <CopyIcon className="room-detail__action-icon" />
              </button>
            </If>
            <If condition={
              showElementByAuth(platformEntity.PROPERTIES_UNIT_TYPES, entityAction.UPDATE) ||
              showElementByAuth(platformEntity.PROPERTIES_UNIT_TYPES, entityAction.CREATE)
            }
            >
              <em className="room-detail__line" />
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.DELETE,
            ) }
            >
              <Popconfirm
                visible={ this.state.deletePopupVisible && this.state.deleteRoomId === record.id }
                onVisibleChange={ this.handleDeletePopup }
                title={ t('cms.property.listing_management.delete_room.tip') }
                placement="left"
                okType="danger"
                onConfirm={ () => this.confirmDeleteRoom(record) }
                onCancel={ this.cancelDeleteRoom }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <button
                  className="room-detail__icon-wrap"
                  onClick={ () => this.handleClickDelete(record.id) }
                >
                  <DeleteIcon className="room-detail__action-icon" />
                </button>
              </Popconfirm>
            </If>
          </span>
        ),
      },
    ];
  }

  formatRooms = (property) => {
    let rooms = [];
    if (property.unitTypes && property.unitTypes.edges.length > 0) {
      rooms = property.unitTypes.edges.map(unit => unit.node);
    }

    return rooms;
  };

  filterRooms = () => {
    const { copiedRoomListings } = this.props;
    const { filters } = this.state;
    let filteredRooms = [];

    filteredRooms = this.formatedRooms.filter((room) => {
      const selectedRoomType =
        filters.category.includes(room.category) || filters.category.length === 0;
      const selectedRoomName = filters.roomId.includes(room.id) || filters.roomId.length === 0;

      if (filters.withListings) {
        const haveUnconfirmedListings = copiedRoomListings
          .some(listing => listing.unitId === room.id && listing.listings.length > 0);
        const isWithListings = room.listings.length > 0 || haveUnconfirmedListings;

        return selectedRoomType && selectedRoomName && isWithListings;
      }

      return selectedRoomType && selectedRoomName;
    });
    filteredRooms.sort((roomA, roomB) => {
      if (filters.order === 'ascend') {
        return moment(roomA.updatedAt).valueOf() - moment(roomB.updatedAt).valueOf();
      }

      return moment(roomB.updatedAt).valueOf() - moment(roomA.updatedAt).valueOf();
    });

    this.setState({ filteredRooms });
  }

  handleTableChange = (_, filters, sorter) => {
    this.state.filters.category = filters.category;
    this.state.filters.order = sorter.order || null;
    this.setState(this.state, () => {
      this.filterRooms();
    });
  }

  onCheckWithListings = (e) => {
    this.state.filters.withListings = e.target.checked;
    this.setState(this.state, () => {
      this.filterRooms();
    });
  }

  handleClickReset = () => {
    this.state.filters.roomId = [];
    this.state.filters.category = [];
    this.state.filters.withListings = false;
    this.setState(this.state, () => {
      this.filterRooms();
    });
    if (this.searchComponent) {
      this.searchComponent.handleClearSearchInput();
    }
  };

  copyAllListing = (bool) => {
    this.setState({
      isCopyAllListing: bool,
    });
  }

  isLoading = () => {
    const { communication } = this.props;
    const { modalType } = this.state;

    if (modalType === 'edit') {
      return communication.updateRoom.status === communicationStatus.FETCHING;
    }
    if (modalType === 'create' || modalType === 'copy') {
      return communication.createRoom.status === communicationStatus.FETCHING;
    }

    return false;
  }

  render() {
    const { t } = this.props;
    const { currentRoom } = this.state;

    return (
      <div className="room-detail" ref={ (node) => { this.roomContainer = node; } }>
        <Choose>
          <When condition={ this.formatedRooms.length === 0 }>
            <div className="room-detail__empty">
              <ContractEmptyIcon className="room-detail__empty-icon" />
              <span className="room-detail__no-room">{ t('cms.property.listing_management.no_room.description') }</span>
              <Button
                type="primary"
                className="room-detail__add-room"
                onClick={ this.handleClickAddRoom }
              >
                <Icon type="plus" />
                { t('cms.property.listing_management.add_room.button') }
              </Button>
            </div>
          </When>
          <Otherwise>
            <div className="room-detail__header">
              <span className="room-detail__header-left">
                <span className="room-detail__total">
                  {
                    t('cms.property.listing_management.room_config.total.hint', {
                      number: this.state.filteredRooms.length,
                    })
                  }
                </span>
                <If
                  condition={
                    this.state.filters.roomId.length !== 0 ||
                    this.state.filters.category.length !== 0 ||
                    this.state.filters.withListings !== false
                  }
                >
                  <span
                    className="room-detail__reset-filter"
                    role="presentation"
                    onClick={ this.handleClickReset }
                  >
                    <Icon type="redo" className="room-detail__reset-filter-icon" />
                    { t('cms.property.listing_management.room_config.clear_filter.button') }
                  </span>
                </If>
              </span>
              <span className="room-detail__header-right">
                <Checkbox
                  checked={ this.state.filters.withListings }
                  onChange={ this.onCheckWithListings }
                >
                  { t('cms.property.listing_management.room.checkbox') }
                </Checkbox>
                <Button
                  type="primary"
                  className="room-detail__add-room"
                  onClick={ this.handleClickAddRoom }
                >
                  <Icon type="plus" />
                  { t('cms.property.listing_management.add_room.button') }
                </Button>
              </span>
            </div>
            <Table
              rowKey="id"
              scroll={ { x: false, y: true } }
              columns={ this.getTableColumns() }
              className="room-detail__table"
              dataSource={ this.state.filteredRooms }
              pagination={ false }
              onChange={ this.handleTableChange }
              rowClassName={ record => (currentRoom && record.id === currentRoom.id ? 'room-detail__selected-row' : '') }
            />
          </Otherwise>
        </Choose>
        <If condition={ !this.state.showModal && this.state.currentRoom }>
          <Drawer
            mask={ false }
            destroyOnClose
            placement="right"
            visible={ this.state.showViewModal }
            className="room-detail__drawer"
            closable={ false }
            getContainer={ this.roomContainer }
            width="448"
            style={ { position: 'absolute', zIndex: '1000' } }
            bodyStyle={ { height: '100%', padding: 0 } }
          >
            <ViewModal
              property={ this.props.property }
              t={ t }
              roomData={ this.state.currentRoom }
              onClose={ this.handleCloseViewModal }
              openModal={ this.openRoomFormModal }
              onDelete={ this.confirmDeleteRoom }
            />
          </Drawer>
        </If>

        <If condition={ this.state.showModal }>
          <Modal
            activeModal
            property={ this.props.property }
            t={ t }
            roomData={ this.state.currentRoom }
            onClose={ this.closeRoomFormModal }
            onConfirm={ this.handleConfirm }
            type={ this.state.modalType }
            copyAllListing={ this.copyAllListing }
            loading={ this.isLoading() }
            isCopyAllListing={ this.state.isCopyAllListing }
            setChangedFields={ this.setChangedFields }
            changedFields={ this.changedFields }
          />
        </If>
      </div>
    );
  }
}

RoomDetail.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  deleteRoom: PropTypes.func.isRequired,
  createRoom: PropTypes.func.isRequired,
  updateRoom: PropTypes.func.isRequired,
  setCopyRoomListing: PropTypes.func.isRequired,
  copiedRoomListings: PropTypes.array,
  setProperty: PropTypes.func.isRequired,
  communication: PropTypes.object.isRequired,
};

RoomDetail.defaultProps = {
  t: () => {},
  property: {},
  copiedRoomListings: [],
  communication: {},
};

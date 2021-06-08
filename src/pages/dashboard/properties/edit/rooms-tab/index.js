/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Drawer, Button, Row, Table, Icon, Popconfirm, message, Checkbox, Dropdown, Menu } from 'antd';
import NoRoomPage from '~components/no-room-page';
import Modal from '~pages/dashboard/properties/edit/rooms-tab/modal';
import { updateMutation, platformEntity, entityAction } from '~client/constants';
import * as actions from '~actions/properties/property-edit';
import showElementByAuth from '~helpers/auth';


const mapDispatchToProps = dispatch => ({
  setRoomsDataChanged: (isChanged) => {
    dispatch(actions.setRoomsDataChanged(isChanged));
  },
});

const mapStateToProps = state =>
  ({ editedFields: state.dashboard.propertyEdit.toJS().editedFields });

@connect(mapStateToProps, mapDispatchToProps)
export default class RoomsTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      closeModalPopupVisible: false,
      tableData: [],
      currentRoom: null,
      nextRoom: null,
      defaultFilterValuer: 'all_categories',
      showRoomsWithListings: false,
    };
    this.drawerContainer = null;
    this.filter = ['all_categories', 'shared_room', 'private_room', 'entire_place'];
    this.columns = [
      {
        title: '',
        dataIndex: 'name',
        key: 'name',
        className: 'room-name-col table-header',
        render: text => <span>{text}</span>,
        width: '30%',
      },
      {
        title: '',
        dataIndex: 'roomCategory',
        key: 'roomCategory',
        width: '25%',
        className: 'table-header',
      },
      {
        title: '',
        dataIndex: 'editTime',
        key: 'editTime',
        width: '25%',
        render: (text, record) => (
          <span>{props.t('cms.listing.last_edit.label', { date: moment(record.updatedAt).format('DD/MM/YYYY HH:mm') })}</span>
        ),
        className: 'table-header',
      },
      {
        title: '',
        width: '20%',
        key: 'editIcons',
        dataIndex: 'editIcons',
        align: 'right',
        className: 'edit-icon-col table-header',
        render: (text, record) => (
          <Row>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.UPDATE,
            ) }
            >
              <Icon type="edit" className="icon icon-edit" onClick={ (e) => { e.stopPropagation(); this.handleRoomEdit(record); } } />
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.CREATE,
            ) }
            >
              <Icon type="copy" className="icon icon-copy" onClick={ (e) => { e.stopPropagation(); this.handleCopyRoom(record); } } />
            </If>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_UNIT_TYPES,
              entityAction.DELETE,
            ) }
            >
              <Popconfirm
                placement="topRight"
                title={ props.t('cms.properties.edit.rooms.delete_room_hint') }
                onConfirm={ (e) => { e.stopPropagation(); this.handleDeleteRoom(record); } }
                onCancel={ (e) => { e.stopPropagation(); } }
                okText={ props.t('cms.properties.edit.btn.yes') }
                okType="danger"
                cancelText={ props.t('cms.properties.edit.btn.no') }
              >
                <Icon type="delete" className="icon icon-delete" onClick={ (e) => { e.stopPropagation(); } } />
              </Popconfirm>
            </If>
          </Row>
        ),
      },
    ];
  }

  getContainer = () => this.drawerContainer

  saveContainer = (container) => {
    this.drawerContainer = container;
  };

  sortData = (value) => {
    this.setState({
      tableData: [],
      defaultFilterValuer: value,
    });
    this.formatTableData(this.props.rooms);
    this.setState((state) => {
      const { tableData } = state;
      if (value !== 'all_categories') {
        const filteredTableData =
          tableData.filter(item => (item.category && item.category.toLowerCase() === value));
        return {
          tableData: filteredTableData,
        };
      }
      return {
        tableData,
      };
    });
  }

  formatTableData = (data) => {
    const { t } = this.props;
    const { showRoomsWithListings } = this.state;
    if (data.length) {
      this.setState({
        tableData: showRoomsWithListings ?
          data.filter((unit) => {
            const validListings = unit.node.listings.filter(listing => listing.action !== 'DELETE');
            return validListings.length;
          }).map(unit => ({
            parsedId: JSON.parse(atob(unit.node.id)).id,
            roomCategory: unit.node.category ? t(`cms.properties.edit.rooms.category.${unit.node.category.toLowerCase()}`) : '-',
            ...unit.node,
          }))
          :
          data.map(unit => ({
            parsedId: JSON.parse(atob(unit.node.id)).id,
            roomCategory: unit.node.category ? t(`cms.properties.edit.rooms.category.${unit.node.category.toLowerCase()}`) : '-',
            ...unit.node,
          })),
      });
    }
  }

  handleRoomEdit = (record) => {
    if (record.id !== (this.state.currentRoom && this.state.currentRoom.id)
      && this.state.drawerVisible) {
      this.handleDrawerClose();
      setTimeout(() => {
        this.setState(() => ({ currentRoom: record, drawerVisible: true }));
      }, 450);
    } else {
      this.setState(() => ({ currentRoom: record, drawerVisible: true }));
    }
  }

  handleAddNewRoom = () => {
    const idObj = {
      id: `fake-id-${moment().format('x')}`,
      type: 'UnitType',
    };
    const newRoom = {
      id: btoa(JSON.stringify(idObj)),
      name: 'Untitled Room',
      listings: [],
      links: [],
      action: updateMutation.NEW,
    };
    this.setState({
      currentRoom: newRoom,
      drawerVisible: true,
      defaultFilterValuer: 'all_categories',
      showRoomsWithListings: false,
    }, () => {
      this.props.updateRoom(newRoom.id, newRoom, updateMutation.NEW);
    });
  }

  handleCopyRoom = (record) => {
    if (this.state.drawerVisible) {
      this.setState({
        drawerVisible: false,
        showRoomsWithListings: false,
      });
      setTimeout(() => {
        this.copyRoom(record);
      }, 200);
    } else {
      this.setState({
        showRoomsWithListings: false,
      });
      this.copyRoom(record);
    }

    message.success(this.props.t('cms.rooms.toast.copy_success'));
  }

  copyRoom = (record) => {
    const copyRecord = JSON.parse(JSON.stringify(record));
    const idObj = {
      id: `fake-id-copied-${moment().format('x')}`,
      type: JSON.parse(atob(record.id)).type,
    };
    copyRecord.id = btoa(`${JSON.stringify(idObj)}`);
    copyRecord.name = `${this.props.t('cms.properties.edit.rooms.copy_of')} ${record.name}`;
    copyRecord.action = updateMutation.NEW;
    copyRecord.links = [];
    copyRecord.images = null;

    if (copyRecord.facilities) {
      copyRecord.facilities.map((facility, index) => {
        if (facility.checked) {
          copyRecord.facilities[index].action = 'INSERT';
        }
        return true;
      });
    }
    if (copyRecord.unitTypeBedSizes) {
      copyRecord.unitTypeBedSizes = copyRecord.unitTypeBedSizes.map(bedSize => ({
        ...bedSize,
        id: `fake-id-${Math.floor(Math.random() * 10000)}`,
        action: bedSize.action || 'INSERT',
      }));
    }

    this.setState({
      currentRoom: copyRecord,
      drawerVisible: true,
    }, () => {
      this.props.updateRoom(copyRecord.id, copyRecord, updateMutation.NEW);
      this.props.setRoomsDataChanged(true);
    });
  }

  handleConfirm = () => {
    this.setState({
      currentRoom: null,
      drawerVisible: false,
    });
    if (this.props.editedFields.roomsDataChanged) {
      this.props.setRoomsDataChanged(false);
    }
    message.success(this.props.t('cms.rooms.toast.update_success'));
  }

  handleDeleteRoom = (record) => {
    this.setState({
      currentRoom: record,
      drawerVisible: false,
    }, () => {
      if (this.props.editedFields.roomsDataChanged) {
        this.props.setRoomsDataChanged(false);
      }
      this.props.updateRoom(record.id, record, updateMutation.DELETE);
      if (this.state.currentRoom && this.state.currentRoom.action !== updateMutation.NEW) {
        message.success(this.props.t('cms.rooms.toast.delete_success'));
      }
    });
  }

  handleDrawerClose = () => {
    const { action } = this.state.currentRoom;
    if (action === updateMutation.NEW) {
      this.handleDeleteRoom(this.state.currentRoom);
    }
    if (this.props.editedFields.roomsDataChanged) {
      this.props.setRoomsDataChanged(false);
    }
    this.setState({
      drawerVisible: false,
    });
  }

  handleChooseNextRooom = () => {
    setTimeout(() => {
      this.setState(() => ({ currentRoom: this.state.nextRoom, drawerVisible: true }));
    }, 450);
  }

  componentWillMount() {
    this.formatTableData(this.props.rooms);
  }

  componentWillReceiveProps(nextProps) {
    this.formatTableData(nextProps.rooms);
  }

  render() {
    const { t, property } = this.props;
    return (
      <div className="rooms-tab" ref={ this.saveContainer }>
        <Choose>
          <When condition={ !this.props.rooms.length }>
            <NoRoomPage t={ t } handleAddRoomBtnClick={ this.handleAddNewRoom } />
          </When>
          <Otherwise>
            <div className="rooms-tab__list-wrapper">
              <div className="filter">
                <div>
                  <Dropdown
                    overlay={ () => (
                      <Menu
                        onClick={ (item) => {
                          this.sortData(item.key);
                          this.setState({ defaultFilterValuer: item.key });
                        } }
                        selectedKeys={ [this.state.defaultFilterValuer] }
                      >
                        <For of={ this.filter } each="filterItem">
                          <Menu.Item key={ filterItem }>
                            {t(`cms.properties.edit.rooms.filter.${filterItem}`)}
                          </Menu.Item>
                        </For>
                      </Menu>
                    ) }

                    trigger={ ['click'] }
                  >
                    <div>
                      <span className="filter__label">
                        {t(`cms.properties.edit.rooms.filter.${
                          this.state.defaultFilterValuer === 'all_categories' ? 'label' : this.state.defaultFilterValuer
                        }`)}
                      </span>
                      <Icon className="listings-tab__update-filter-icon" type="down" />
                    </div>
                  </Dropdown>
                </div>
                <div className="filter__show-rooms-with-listings">
                  <Checkbox
                    checked={ this.state.showRoomsWithListings }
                    onChange={ (e) => {
                      this.setState({ showRoomsWithListings: e.target.checked }, () => {
                        this.formatTableData(this.props.rooms);
                      });
                    } }
                  >
                    {t('cms.properties.edit.rooms.filter.show_rooms_with_listings')}
                  </Checkbox>
                </div>
                <If condition={ showElementByAuth(
                  platformEntity.PROPERTIES_UNIT_TYPES,
                  entityAction.CREATE,
                ) }
                >
                  <Button type="primary" onClick={ this.handleAddNewRoom }>
                    <Icon type="plus" className="icon-plus" />
                    {t('cms.properties.edit.rooms.button_add_room')}
                  </Button>
                </If>
              </div>
              <Table
                className="list"
                columns={ this.columns }
                pagination={ false }
                scroll={ { y: window.innerHeight - 285 } }
                dataSource={ this.state.tableData
                  .filter((item) => {
                    if (this.state.defaultFilterValuer === 'all_categories') {
                      return item.action !== updateMutation.DELETE;
                    }
                    return item.action !== updateMutation.DELETE
                      && item.category
                      && item.category.toLowerCase() === this.state.defaultFilterValuer;
                  }) }
                rowKey={ record => record.id }
                onRow={ record => ({
                  onClick: () => {
                    if (this.props.editedFields.roomsDataChanged
                      && record && this.state.currentRoom
                      && record.id !== this.state.currentRoom.id) {
                      this.setState({
                        closeModalPopupVisible: true,
                        nextRoom: record,
                      });
                      return;
                    }
                    this.setState({ nextRoom: null });
                    this.handleRoomEdit(record);
                  },
                }) }
                rowClassName={ record => classNames('rooms-tab__list-row', {
                  'rooms-tab__list-row--active': this.state.currentRoom && record.id === this.state.currentRoom.id,
                }) }
              />
            </div>
          </Otherwise>
        </Choose>
        <Drawer
          mask={ false }
          destroyOnClose
          placement="right"
          visible={ this.state.drawerVisible }
          className="rooms-tab__drawer"
          closable={ false }
          getContainer={ this.getContainer }
          width="40vw"
          style={ { position: 'absolute', zIndex: '10000' } }
        >
          <Modal
            property={ property }
            t={ t }
            roomData={ this.state.currentRoom }
            updateRoom={ this.props.updateRoom }
            onConfirm={ this.handleConfirm }
            onCopy={ this.handleCopyRoom }
            onDelete={ this.handleDeleteRoom }
            onClose={ this.handleDrawerClose }
            setRoomsDataChanged={ this.props.setRoomsDataChanged }
            editedFields={ this.props.editedFields }
            closeModalPopupVisible={ this.state.closeModalPopupVisible }
            onControlPopup={ (val) => { this.setState({ closeModalPopupVisible: val }); } }
            nextRoom={ this.state.nextRoom }
            onChooseNextRoom={ this.handleChooseNextRooom }
          />
        </Drawer>
      </div>
    );
  }
}

RoomsTab.propTypes = {
  t: PropTypes.func.isRequired,
  updateRoom: PropTypes.func.isRequired,
  setRoomsDataChanged: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  editedFields: PropTypes.object.isRequired,
  rooms: PropTypes.array.isRequired,
};

RoomsTab.defaultProps = {
  t: () => {},
  updateRoom: () => {},
  setRoomsDataChanged: () => {},
  editedFields: {},
  property: {
    unitTypes: {
      edges: [],
    },
    rooms: [],
    city: {
      country: {
        slut: '',
      },
    },
  },
};

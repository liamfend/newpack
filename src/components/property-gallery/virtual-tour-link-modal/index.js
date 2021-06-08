import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Modal, Button, Form, Icon } from 'antd';
import NoVirtualTourLink from '~components/property-gallery/virtual-tour-link-modal/no-link';
import VirtualTourLinkContent from '~components/property-gallery/virtual-tour-link-modal/link-content';
import { setEditedFields } from '~helpers/property-edit';
import * as actions from '~actions/properties/property-edit';
import { vrUrlPrefix } from '~constants/gallery';
import { isLandlordRole } from '~helpers/auth';

const mapStateToProps = state =>
  ({ editedFields: state.dashboard.propertyEdit.toJS().editedFields });

const mapDispatchToProps = dispatch => ({
  updatePropertyPayload: (links) => {
    dispatch(actions.updatePropertyPayload(links));
  },
  updateRoom: (roomId, record, action) => {
    dispatch(actions.updateRoom(roomId, record, action));
  },
});
@connect(mapStateToProps, mapDispatchToProps)
class VirtualTourLinkModal extends React.Component {
  constructor(props) {
    super(props);
    this.newUnitTypeIdToLinkId = null;
    this.scrollContainer = null;
    this.roomSection = null;
    this.state = {
      overallLinks: this.formatVirtualLinks('Overall'),
      propertyLinks: this.formatVirtualLinks('Property'),
      roomLinks: this.formatVirtualLinks('Room', props.rooms.map(room => room.node)),
    };
    this.sections = ['Overall', 'Property', 'Room'];
  }

  formatVirtualLinks = (section, rooms) => {
    const { property } = this.props;
    switch (section) {
      case 'Overall': {
        return property.links && property.links.filter(link => link.label === 'OVERALL').map((link) => {
          const newLink = { ...link };
          const action = '_action';
          newLink.action = 'UPDATE';
          if (link[action]) {
            newLink.action = link[action];
            delete newLink[action];
          }
          return newLink;
        });
      }
      case 'Property': {
        return property.links && property.links.filter(link => link.label === 'PROPERTY').map((link) => {
          const newLink = { ...link };
          const action = '_action';
          newLink.action = 'UPDATE';
          if (link[action]) {
            newLink.action = link[action];
            delete newLink[action];
          }
          return newLink;
        });
      }
      case 'Room': {
        const roomLinks = [];
        rooms.map((room) => {
          room.links.map((roomLink) => {
            roomLinks.push(roomLink);
            return true;
          });
          return true;
        });
        const resultRoomLinks = Array.from(
          roomLinks.reduce((dict, item) => {
            const key = `displayRegion=${item.displayRegion}&link=${item.link}&enabled=${item.enabled}`;
            if (dict.has(key)) {
              dict.get(key).unitTypeIdToLinkId.push({ ...item });
            } else {
              dict.set(key, {
                displayRegion: item.displayRegion,
                link: item.link,
                enabled: item.enabled,
                unitTypeIdToLinkId: [{ ...item }],
                id: `fake_id_${Math.random().toString().substring(2)}`,
                type: 'vr',
              });
            }
            return dict;
          }, new Map())).map(arrItem => arrItem[1]);
        return resultRoomLinks;
      }
      default: return false;
    }
  }

  getDifferentSectionLinks = (section) => {
    const formValueObj = this.props.form.getFieldsValue();
    switch (section) {
      case 'Overall': {
        return this.convertData(this.state.overallLinks, formValueObj);
      }
      case 'Property': {
        return this.convertData(this.state.propertyLinks, formValueObj);
      }
      case 'Room': {
        const roomLinks = this.convertData(this.state.roomLinks, formValueObj);

        const newRoomLinks = [];
        roomLinks.map((roomLink) => {
          const room = { ...roomLink };
          if (
            roomLink.unitTypeIdToLinkId
            && roomLink.unitTypeIdToLinkId.length
          ) {
            room.unitTypeIdToLinkId =
            roomLink.unitTypeIdToLinkId.filter(link => link.action !== 'DELETE');

            if (room.unitTypeIdToLinkId.length === 0) {
              room.action = 'DELETE';
            }
          }

          newRoomLinks.push(room);


          return true;
        });

        return newRoomLinks;
      }
      default: return this.convertData(this.state.overallLinks, formValueObj);
    }
  }

  handleAddAnotherLink = (section) => {
    const newLink = {
      id: `fake_id_added_${moment().format('x')}`,
      action: 'INSERT',
      enabled: false,
      displayRegion: isLandlordRole() ? 'ALL' : undefined,
      link: undefined,
      type: 'vr',
      label: section.toUpperCase(),
      propertyId: JSON.parse(atob(this.props.property.id)).id,
    };
    const { overallLinks, propertyLinks, roomLinks } = this.state;
    switch (section) {
      case 'Overall': {
        this.setState({
          overallLinks: overallLinks.concat(newLink),
        });
        break;
      }
      case 'Property': {
        newLink.area = 'GENERAL';
        this.setState({
          propertyLinks: propertyLinks.concat(newLink),
        });
        break;
      }
      case 'Room': {
        delete newLink.propertyId;
        newLink.unitTypeIdToLinkId = [];
        this.setState({
          roomLinks: roomLinks.concat(newLink),
        });
        break;
      }
      default: break;
    }
  }

  handleDeleteLink = (section, id) => {
    const { overallLinks, propertyLinks, roomLinks } = this.state;
    switch (section) {
      case 'Overall': {
        this.setState({
          overallLinks: /fake_id/g.test(id) ?
            overallLinks.filter(item => item.id !== id) :
            overallLinks.map((item) => {
              const newItem = { ...item };
              if (item.id === id) {
                newItem.action = 'DELETE';
              }
              return newItem;
            }),
        });
        break;
      }
      case 'Property': {
        this.setState({
          propertyLinks: /fake_id/g.test(id) ?
            propertyLinks.filter(item => item.id !== id) :
            propertyLinks.map((item) => {
              const newItem = { ...item };
              if (item.id === id) {
                newItem.action = 'DELETE';
              }
              return newItem;
            }),
        });
        break;
      }
      case 'Room': {
        if (id.includes('fake_id_added')) {
          this.setState({
            roomLinks: roomLinks.filter(item => item.id !== id),
          });
        } else {
          this.setState({
            roomLinks: roomLinks.map((roomLink) => {
              const newRoomLink = { ...roomLink };
              if (newRoomLink.id === id) {
                newRoomLink.action = 'DELETE';
                newRoomLink.unitTypeIdToLinkId = roomLink.unitTypeIdToLinkId.map((item) => {
                  const newItem = { ...item };
                  newItem.action = 'DELETE';
                  return newItem;
                });
              }
              return newRoomLink;
            }),
          });
        }
        break;
      }
      default: break;
    }
  }

  convertData = (apiLinks, formValuesObj) => {
    let newLinks = apiLinks.map((link) => {
      const newLink = { ...link };
      Object.keys(link).map((keyItem) => {
        if (formValuesObj[`${keyItem}-${link.id}`] !== undefined) {
          newLink[keyItem] = formValuesObj[`${keyItem}-${link.id}`];
        } else {
          newLink[keyItem] = link[keyItem];
        }
        return true;
      });

      if (newLink.link && !newLink.link.startsWith(vrUrlPrefix)) {
        newLink.link = `${vrUrlPrefix}${newLink.link}`;
      }

      if (
        newLink.unitTypeIdToLinkId && newLink.unitTypeIdToLinkId.length
      ) {
        newLink.unitTypeIdToLinkId = newLink.unitTypeIdToLinkId.map((item) => {
          const newItem = { ...item };
          newItem.displayRegion = newLink.displayRegion;
          newItem.enabled = newLink.enabled;
          newItem.link = newLink.link;
          newItem.type = newLink.type;
          return newItem;
        });
      }

      return newLink;
    });
    newLinks = newLinks.filter(link => link !== null);

    return newLinks;
  }

  // [{id: 2, link: 'xx'}, {id: 3, link: 'xx'}]
  // {2: {id: 2, link: 'xx'}, 3: {id: 2, link: 'xx'}}
  extractKeyOfArray = (array, key = 'id') => {
    const obj = {};
    array.map((x) => {
      obj[x[key] || Math.random().toString(36).substring(2)] = x;
      return true;
    });
    return obj;
  };

  handleConfirm = () => {
    const { form, rooms } = this.props;
    const { overallLinks, propertyLinks, roomLinks } = this.state;
    const formValueObj = form.getFieldsValue();
    const apiData = this.convertData(overallLinks.concat(propertyLinks), formValueObj);

    const formatedCurrentRoomsLinks = {};
    this.convertData(roomLinks, formValueObj).map((x) => {
      x.unitTypeIdToLinkId.map((y) => {
        if (formatedCurrentRoomsLinks[y.unitTypeId]) {
          formatedCurrentRoomsLinks[y.unitTypeId].push(y);
        } else {
          formatedCurrentRoomsLinks[y.unitTypeId] = [y];
        }
        return true;
      });
      return true;
    });

    Object.keys(formatedCurrentRoomsLinks).map((x) => {
      formatedCurrentRoomsLinks[x] = this.extractKeyOfArray(formatedCurrentRoomsLinks[x]);
      return true;
    });

    form.validateFieldsAndScroll({ scroll: { offsetTop: 76, offsetBottom: 76 } },
      (err) => {
        if (!err) {
          this.props.onCancel();
          setEditedFields('virtualLinks', {
            overallLinks: {
              value: this.convertData(overallLinks, formValueObj),
              touched: true,
            },
            propertyLinks: {
              value: this.convertData(propertyLinks, formValueObj),
              touched: true,
            },
            roomLinks: {
              value: this.convertData(roomLinks, formValueObj),
              touched: true,
            },
          });
          this.props.updatePropertyPayload(apiData);
          // update room links
          rooms.map((room => room.node)).map((room) => {
            const newRoomLinks = [];
            const currentRoomLinks = formatedCurrentRoomsLinks[JSON.parse(atob(room.id)).id];
            const objOriginRoomLinks = this.extractKeyOfArray(room.links);
            if (currentRoomLinks) {
              Object.keys(currentRoomLinks).map((key) => {
                if (objOriginRoomLinks[key]) {
                  // Exist link
                  const action = currentRoomLinks[key].action || 'UPDATE';
                  newRoomLinks.push({ ...currentRoomLinks[key], action });
                } else {
                  // Fake link
                  newRoomLinks.push(currentRoomLinks[key]);
                }
                return true;
              });
              this.props.updateRoom(
                room.id,
                room.action ? {
                  ...room,
                  links: newRoomLinks,
                } : {
                  ...room,
                  links: newRoomLinks,
                  isChangedByLink: true,
                },
                'UPDATE',
              );
            }

            return true;
          });
        }
      },
    );
  }

  handleSetSelectedRooms = (currentLink, selectedRooms) => {
    const roomIds = selectedRooms.map((room) => {
      const roomId = JSON.parse(atob(room.id)).id;
      currentLink.unitTypeIdToLinkId.find(item => item.unitTypeId === roomId);
      if (!currentLink.unitTypeIdToLinkId.find(item => item.unitTypeId === roomId)) {
        currentLink.unitTypeIdToLinkId.push({
          action: 'INSERT',
          displayRegion: currentLink.displayRegion,
          enabled: currentLink.enabled,
          link: currentLink.link,
          type: currentLink.type,
          unitTypeId: roomId,
        });
      }
      return JSON.parse(atob(room.id)).id;
    });
    if (currentLink.id.includes('fake_id_added')) {
      // eslint-disable-next-line no-param-reassign
      currentLink.unitTypeIdToLinkId = roomIds.map(x => ({ unitTypeId: x }));
    }

    const newUnitTypeIdToLinkId =
      currentLink.unitTypeIdToLinkId.map((unitTypeIdToLinkIdItem, index) => {
        if (unitTypeIdToLinkIdItem.id) {
          if (roomIds.includes(unitTypeIdToLinkIdItem.unitTypeId)) {
            return Object.assign(unitTypeIdToLinkIdItem, { action: null });
          }
          return Object.assign(unitTypeIdToLinkIdItem, { action: 'DELETE' });
        } else if (!unitTypeIdToLinkIdItem.id) {
          if (roomIds.includes(unitTypeIdToLinkIdItem.unitTypeId)) {
            return Object.assign(unitTypeIdToLinkIdItem, { action: 'INSERT' });
          }
          currentLink.unitTypeIdToLinkId.splice(index, 0);
        }
        return false;
      });

    this.setState({
      roomLinks: this.state.roomLinks.map((roomLink) => {
        const newRoomLink = { ...roomLink };
        if (roomLink.id === currentLink.id) {
          newRoomLink.unitTypeIdToLinkId = newUnitTypeIdToLinkId;
        }
        return newRoomLink;
      }),
    });
  }

  componentWillReceiveProps() {
    if (this.props.scrollTo === 'ROOM') {
      this.scrollContainer.scrollTo(0, this.roomSection.offsetTop);
    }
    return false;
  }

  render() {
    const { t, form, rooms } = this.props;
    return (
      <Modal
        className="virtual-tour-link-modal"
        width={ 880 }
        centered
        maskClosable={ false }
        visible={ this.props.visible }
        onCancel={ this.props.onCancel }
        footer={ <Button onClick={ this.handleConfirm } className="btn-confirm" type="primary">{t('cms.listing.modal.confirm.btn')}</Button> }
      >
        <div className="scroll-container" ref={ (node) => { this.scrollContainer = node; } }>
          <div className="content-wrapper">
            <div className="content-wrapper__title">{t('cms.properties.edit.gallery.add_virtual_tour_link')}</div>
            <Form layout="vertical">
              <For of={ this.sections } each="section">
                <div
                  className="overall-virtual-tour-link"
                  key={ section }
                  ref={ (node) => {
                    if (section === 'Room') {
                      this.roomSection = node;
                    }
                  } }
                >
                  <div className="section-title">{t('cms.properties.edit.gallery.section_virtual_tour_link', { section })}</div>
                  <If condition={ section === 'Overall' }>
                    <div className="overall-virtual-tour-link__reminder">
                      <Icon theme="filled" type="exclamation-circle" className="overall-virtual-tour-link__reminder__icon" />
                      {t('cms.properties.edit.gallery.overall_virtual_tour_link_reminder')}
                    </div>
                  </If>
                  <Choose>
                    <When
                      condition={
                        this.getDifferentSectionLinks(section) &&
                        this.getDifferentSectionLinks(section).filter(link => link.action !== 'DELETE').length
                      }
                    >
                      <VirtualTourLinkContent
                        links={
                          this.getDifferentSectionLinks(section).filter(link =>
                            link.action !== 'DELETE',
                          )
                        }
                        form={ form }
                        t={ t }
                        section={ section }
                        rooms={ rooms.filter(room => room.node.action !== 'DELETE') }
                        onAddAnOtherLink={ (section) => { this.handleAddAnotherLink(section); } }
                        onDeleteLink={ (section, id) => { this.handleDeleteLink(section, id); } }
                        onSetSelectedRooms={ (currentLink, selectedRooms) => {
                          this.handleSetSelectedRooms(currentLink, selectedRooms);
                        } }
                      />
                    </When>
                    <Otherwise>
                      <NoVirtualTourLink
                        t={ t }
                        section={ section }
                        onAddAnOtherLink={ (section) => { this.handleAddAnotherLink(section); } }
                      />
                    </Otherwise>
                  </Choose>
                </div>
              </For>
            </Form>
          </div>
        </div>
      </Modal>
    );
  }
}

VirtualTourLinkModal.propTypes = {
  visible: PropTypes.bool,
  t: PropTypes.func,
  onCancel: PropTypes.func,
  updatePropertyPayload: PropTypes.func,
  updateRoom: PropTypes.func,
  form: PropTypes.object,
  property: PropTypes.object,
  rooms: PropTypes.array,
  scrollTo: PropTypes.string,
};

VirtualTourLinkModal.defaultProps = {
  visible: false,
  t: () => { },
  onCancel: () => { },
  updatePropertyPayload: () => { },
  updateRoom: () => { },
  form: {},
  property: {},
  rooms: [],
  scrollTo: 'OVERALL',
};

export default Form.create({
  name: 'virtualTourLinkModal',
})(VirtualTourLinkModal);

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import enhanceForm from '~hocs/enhance-form';
import { Collapse } from 'antd';
import VirtualTourLink from '~pages/dashboard/properties/listing-management/gallery-management/virtual-tour-links/virtual-tour-link';
import NoVirtualTourLink from '~pages/dashboard/properties/listing-management/gallery-management/virtual-tour-links/virtual-tour-link/no-link';
import NoRoomPage from '~components/no-room-page';
import { vrUrlPrefix, vrLinkLabel } from '~constants/gallery';

const { Panel } = Collapse;

@enhanceForm()
export default class VirtualTourLinks extends React.Component {
  constructor(props) {
    super(props);
    this.newUnitTypeIdToLinkId = null;
    this.scrollContainer = null;
    this.roomSection = null;
    this.state = {
      propertyLinks: this.formatVirtualLinks(vrLinkLabel.PROPERTY),
      roomLinks: this.formatVirtualLinks(vrLinkLabel.ROOM,
        props.property.unitTypes.edges.map(room => room.node)),
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  formatVirtualLinks = (section, rooms) => {
    const { property } = this.props;
    switch (section) {
      case vrLinkLabel.PROPERTY: {
        return property.allLinks;
      }
      case vrLinkLabel.ROOM: {
        const roomLinks = [];
        const resultRoomLinks = [];
        const uniqueLinks = [];

        rooms.map((room) => {
          room.allLinks.map((roomLink) => {
            if (!uniqueLinks.includes(roomLink.link)) {
              uniqueLinks.push(roomLink.link);
            }
            roomLinks.push(roomLink);

            return true;
          });
          return true;
        });

        uniqueLinks.map((uniqueLink) => {
          const unitTypeIdToLinkId =
            roomLinks.filter(item => item.link === uniqueLink).map(item => (
              btoa(JSON.stringify({
                type: 'UnitType',
                id: item.unitTypeId,
              }))
            ));
          const { displayRegion, status, type } = roomLinks.find(item => item.link === uniqueLink);

          resultRoomLinks.push({
            displayRegion,
            link: uniqueLink,
            type,
            status,
            id: `fake_id_${Math.random().toString().substring(2)}`,
            unitTypeIdToLinkId,
          });

          return true;
        });

        return resultRoomLinks;
      }
      default: return [];
    }
  }

  handleAddAnotherLink = (section) => {
    const newLink = {
      id: `fake_id_added_${moment().format('x')}`,
      displayRegion: undefined,
      link: undefined,
      type: 'vr',
      propertyId: JSON.parse(atob(this.props.property.id)).id,
    };
    const { propertyLinks, roomLinks } = this.state;
    switch (section) {
      case vrLinkLabel.PROPERTY: {
        newLink.area = 'GENERAL';
        this.setState({
          propertyLinks: propertyLinks.concat(newLink),
        });
        break;
      }
      case vrLinkLabel.ROOM: {
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
    const { propertyLinks, roomLinks } = this.state;
    switch (section) {
      case vrLinkLabel.PROPERTY: {
        this.setState({
          propertyLinks: propertyLinks.filter(item => item.id !== id),
        }, () => {
          this.props.form.resetFields();
          this.props.form.validateFields();
        });
        break;
      }
      case vrLinkLabel.ROOM: {
        this.setState({
          roomLinks: roomLinks.filter(item => item.id !== id),
        }, () => {
          this.props.form.resetFields();
          this.props.form.validateFields();
        });
        break;
      }
      default: break;
    }
    this.props.onSetUpdateGallery();
  }

  getDifferentSectionLinks = (section) => {
    const formValueObj = this.props.form.getFieldsValue();
    switch (section) {
      case vrLinkLabel.PROPERTY: {
        return this.convertData(this.state.propertyLinks, formValueObj);
      }
      case vrLinkLabel.ROOM: {
        return this.convertData(this.state.roomLinks, formValueObj);
      }
      default:
        return [];
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

      return newLink;
    });
    newLinks = newLinks.filter(link => link !== null);

    return newLinks;
  }

  handleSetSelectedRooms = (currentLink, selectedRooms) => {
    this.setState({
      roomLinks: this.state.roomLinks.map((roomLink) => {
        const newRoomLink = { ...roomLink };
        if (roomLink.id === currentLink.id) {
          newRoomLink.unitTypeIdToLinkId = selectedRooms.map(room => room.id);
        }
        return newRoomLink;
      }),
    });
  }

  getUpdateData = () => ({
    propertyLinks: this.getDifferentSectionLinks(vrLinkLabel.PROPERTY).map((link) => {
      const propertyLink = {
        area: link.area,
        displayRegion: link.displayRegion,
        link: link.link,
      };
      if (link.id && !link.id.includes('fake_id')) {
        propertyLink.id = link.id;
      }
      return propertyLink;
    }),
    unitLinks: this.getDifferentSectionLinks(vrLinkLabel.ROOM).map((link) => {
      const unitLink = {
        displayRegion: link.displayRegion,
        link: link.link,
        unitTypeIdToLinkId: link.unitTypeIdToLinkId,
      };
      if (link.id && !link.id.includes('fake_id')) {
        unitLink.id = link.id;
      }

      return unitLink;
    }),
  })

  isLinksError = () => {
    this.props.form.validateFieldsAndScroll({ scroll: { offsetTop: 76 } });
    const errors = this.props.form.getFieldsError();

    return Object.values(errors).some(error => error);
  };

  render() {
    const { t, form, property } = this.props;
    return (
      <div className="virtual-tour-links">
        <ul className="virtual-tour-links__description">
          <li>
            <span className="virtual-tour-links__label">
              { t('cms.property.listing_management.virtual_tour_link.label') }
            </span>
            { t('cms.property.listing_management.virtual_tour_link.description') }
          </li>
        </ul>
        <Collapse
          onChange={ this.onChangeCollapse }
          expandIconPosition="right"
          className="virtual-tour-links__collapse"
          defaultActiveKey={ ['property', 'rooms'] }
        >
          <Panel
            header={ t('cms.property.listing_management.property.panel') }
            key="property"
          >
            <Choose>
              <When condition={ this.getDifferentSectionLinks(vrLinkLabel.PROPERTY).length } >
                <VirtualTourLink
                  links={ this.getDifferentSectionLinks(vrLinkLabel.PROPERTY) }
                  form={ form }
                  t={ t }
                  section={ vrLinkLabel.PROPERTY }
                  rooms={ property.unitTypes.edges }
                  onAddAnOtherLink={ (section) => { this.handleAddAnotherLink(section); } }
                  onDeleteLink={ (section, id) => { this.handleDeleteLink(section, id); } }
                />
              </When>
              <Otherwise>
                <NoVirtualTourLink
                  t={ t }
                  section={ vrLinkLabel.PROPERTY }
                  onAddAnOtherLink={ (section) => { this.handleAddAnotherLink(section); } }
                />
              </Otherwise>
            </Choose>
          </Panel>
          <Panel
            header={ t('cms.property.listing_management.rooms.panel') }
            key="rooms"
          >
            <Choose>
              <When condition={ this.getDifferentSectionLinks(vrLinkLabel.ROOM).length } >
                <VirtualTourLink
                  links={ this.getDifferentSectionLinks(vrLinkLabel.ROOM) }
                  form={ form }
                  t={ t }
                  section={ vrLinkLabel.ROOM }
                  rooms={ property.unitTypes.edges }
                  onAddAnOtherLink={ (section) => { this.handleAddAnotherLink(section); } }
                  onDeleteLink={ (section, id) => { this.handleDeleteLink(section, id); } }
                  onSetSelectedRooms={ (currentLink, selectedRooms) => {
                    this.handleSetSelectedRooms(currentLink, selectedRooms);
                  } }
                />
              </When>
              <When condition={ property.unitTypes.edges.length === 0 }>
                <NoRoomPage
                  t={ t }
                  handleAddRoomBtnClick={ this.props.handleGotoRoomConfig }
                />
              </When>
              <Otherwise>
                <NoVirtualTourLink
                  t={ t }
                  section={ vrLinkLabel.ROOM }
                  onAddAnOtherLink={ (section) => { this.handleAddAnotherLink(section); } }
                />
              </Otherwise>
            </Choose>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

VirtualTourLinks.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object,
  form: PropTypes.object, // eslint-disable-line react/require-default-props
  onRef: PropTypes.func,
  onSetUpdateGallery: PropTypes.func,
  handleGotoRoomConfig: PropTypes.func,
};

VirtualTourLinks.defaultProps = {
  t: () => {},
  property: {},
  onRef: () => {},
  onSetUpdateGallery: () => {},
  handleGotoRoomConfig: () => {},
};

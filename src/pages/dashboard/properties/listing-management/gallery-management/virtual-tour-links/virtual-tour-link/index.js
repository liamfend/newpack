import React from 'react';
import PropTypes from 'prop-types';
import { vrLinkLabel } from '~constants/gallery';
import SingleLink from '~pages/dashboard/properties/listing-management/gallery-management/virtual-tour-links/virtual-tour-link/single-link';

export default class VirtualTourLink extends React.PureComponent {
  render() {
    const { t, links, form, section, rooms } = this.props;

    return (
      <div className="virtual-tour-link">
        <div className="virtual-tour-link-header">
          <div className="virtual-tour-link-header__column" />
          <div className="virtual-tour-link-header__column">
            <span className="virtual-tour-link-title">
              {t('cms.properties.edit.gallery.virtual_tour.link_address')}
            </span>
          </div>
          <div className="virtual-tour-link-header__column">
            <span className="virtual-tour-link-title">
              {t('cms.properties.edit.gallery.virtual_tour.locale')}
            </span>
          </div>
          <If condition={ section === vrLinkLabel.PROPERTY }>
            <div className="virtual-tour-link-header__column">
              <span className="virtual-tour-link-title">
                {t('cms.properties.edit.gallery.virtual_tour.area_of_property')}
              </span>
            </div>
          </If>
          <If condition={ section === vrLinkLabel.ROOM }>
            <div className="virtual-tour-link-header__column">
              <span className="virtual-tour-link-title">
                {t('cms.properties.edit.gallery.virtual_tour.room')}
              </span>
            </div>
          </If>
          <div className="virtual-tour-link-header__column" />
        </div>
        <div>
          <For of={ links } each="virtualTourLinkItem">
            <SingleLink
              key={ virtualTourLinkItem.id }
              t={ t }
              virtualTourLinkItem={ virtualTourLinkItem }
              onDeleteLink={ this.props.onDeleteLink }
              section={ section }
              rooms={ rooms }
              form={ form }
              links={ links }
              onSetSelectedRooms={ this.props.onSetSelectedRooms }
            />
          </For>
        </div>
        <div
          className="btn__add-another-link"
          onClick={ () => { this.props.onAddAnOtherLink(section); } }
          role="presentation"
        >
          {t('cms.properties.edit.address.add_another_link')}
        </div>
      </div>
    );
  }
}

VirtualTourLink.propTypes = {
  t: PropTypes.func,
  onAddAnOtherLink: PropTypes.func,
  onDeleteLink: PropTypes.func,
  onSetSelectedRooms: PropTypes.func,
  links: PropTypes.array,
  rooms: PropTypes.array,
  form: PropTypes.object,
  section: PropTypes.string,
};

VirtualTourLink.defaultProps = {
  t: () => { },
  onAddAnOtherLink: () => { },
  onDeleteLink: () => { },
  onSetSelectedRooms: () => { },
  links: [],
  rooms: [],
  form: {},
  section: vrLinkLabel.PROPERTY,
};

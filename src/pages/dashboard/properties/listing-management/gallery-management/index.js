import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, message } from 'antd';
import PropertyDetailWrapper from '~components/property-detail-wrapper';
import enhanceForm from '~hocs/enhance-form';
import { propertyStatus } from '~constants/listing-management';
import PhotosAndVideos from '~pages/dashboard/properties/listing-management/gallery-management/photos-and-videos';
import VirtualTourLinks from '~pages/dashboard/properties/listing-management/gallery-management/virtual-tour-links';
import { cloneObject } from '~helpers';
import * as queries from '~settings/queries';
import { galleryCategories } from '~constants/gallery';
import { fetch } from '~helpers/graphql';
import { fireCustomEvent } from '~helpers/custom-events';

const { TabPane } = Tabs;

@enhanceForm()
export default class GalleryManagement extends React.Component {
  constructor() {
    super();
    this.state = {
      activeKey: 'photosAndVideos',
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  validateGotoTab = () => {
    const { activeKey } = this.state;
    const linksError = this.virtualTourLinks.isLinksError();
    const librariesError = this.photosAndVideos.isLibrariesError();

    if (linksError && !librariesError && activeKey === 'photosAndVideos') {
      this.setState({
        activeKey: 'virtualTourLinks',
      });
    }
    if (!linksError && librariesError && activeKey === 'virtualTourLinks') {
      this.setState({
        activeKey: 'photosAndVideos',
      });
    }
  }

  beforeSave = (callback) => {
    this.props.checkDraftReviewmodal(() => this.handleSubmit(callback));
  };

  handleSubmit = (callback) => {
    const { property } = this.props;
    const {
      propertyId,
      propertyImages,
      propertyVideos,
      unitTypes,
    } = this.photosAndVideos.getUpdateData();
    const { propertyLinks, unitLinks } = this.virtualTourLinks.getUpdateData();
    const updateGalleryInput = {
      propertyId,
      propertyImages,
      propertyVideos,
      propertyLinks,
      unitTypes,
    };

    if (this.virtualTourLinks.isLinksError() || this.photosAndVideos.isLibrariesError()) {
      this.validateGotoTab();
      callback({ status: 'err', e: { message: 'Cover photo is required' } });
      return;
    }

    unitLinks.map((unitLink) => {
      updateGalleryInput.unitTypes.map((unit) => {
        if (unitLink.unitTypeIdToLinkId.includes(unit.unitTypeId)) {
          const updateUnit = property.unitTypes.edges
            .find(propertyUnit => propertyUnit.node.id === unit.unitTypeId);
          if (updateUnit && updateUnit.node) {
            const updateLink = updateUnit.node.allLinks
              .find(propertyLink => propertyLink.link === unitLink.link);
            const { displayRegion, link } = unitLink;

            if (updateLink) {
              unit.unitTypeLinks.push({
                displayRegion,
                id: updateLink.id,
                link,
              });
            } else {
              unit.unitTypeLinks.push({
                displayRegion,
                link,
              });
            }
          }

          return unit;
        }
        return true;
      });

      return true;
    });

    fetch(queries.updateGallery(updateGalleryInput)).then((res) => {
      message.success(this.props.t(`cms.property.listing_management.update_gallery${
        this.props.property.status === propertyStatus.PUBLISHED ? '.published' : ''
      }.toast`));

      const updateGallery = res && res.updateGallery && res.updateGallery.gallery;

      fireCustomEvent('updateGallerySuccess');
      this.refreshGallery(updateGallery);
      // reset changed status
      this.props.onSetUpdateGallery(false);

      callback({ status: 'success', isUpdated: true });
    });
  };

  refreshGallery = (updateGallery) => {
    const { property } = this.props;
    const updatedProperty = cloneObject(property);

    if (updateGallery) {
      const { allLinks, allImages, allVideos, unitTypeGallerys } = updateGallery;
      updatedProperty.allLinks = allLinks;
      updatedProperty.allImages = allImages;
      updatedProperty.allVideos = allVideos;

      updatedProperty.unitTypes.edges.map((unit) => {
        const unitTypeGallery = unitTypeGallerys
          .find(updateUnit => updateUnit.unitTypeId === unit.node.id);
        Object.assign(unit.node, {
          allImages: unitTypeGallery.allImages,
          allVideos: unitTypeGallery.allVideos,
          allLinks: unitTypeGallery.allLinks.map(link => ({
            ...link,
            unitTypeId: JSON.parse(atob(unit.node.id)).id,
          })),
        });
        return unit;
      });
    }

    this.props.setProperty({ property: updatedProperty });
  };

  refreshAllImages = (newImage) => {
    const { property } = this.props;
    const updatedProperty = cloneObject(property);

    if (newImage) {
      const { category } = newImage;
      if (category === 'room') {
        const waitAddImageUnit = updatedProperty.unitTypes.edges
          .find(unit => unit.node.id === btoa(JSON.stringify({ type: 'UnitType', id: newImage.unit_type_id })));
        if (waitAddImageUnit) {
          waitAddImageUnit.node.allImages.edges.push({
            node: Object.assign(newImage, {
              category: galleryCategories[newImage.category],
              contentType: newImage.content_type,
            }),
          });
        }
      } else {
        updatedProperty.allImages.edges.push({
          node: Object.assign(newImage, {
            category: galleryCategories[newImage.category],
            contentType: newImage.content_type,
          }),
        });
      }
    }

    this.props.setProperty({ property: updatedProperty });
  };

  handleChangeActiveTab = (activeKey) => {
    this.setState({
      activeKey,
    });
  }

  render() {
    const { t, property, isHidden } = this.props;
    return (
      <PropertyDetailWrapper
        t={ t }
        isPublished={ property.status === propertyStatus.PUBLISHED }
        onClickSave={ this.beforeSave }
        isHidden={ isHidden }
      >
        <div className="gallery-management">
          <Tabs
            activeKey={ this.state.activeKey }
            onChange={ this.handleChangeActiveTab }
          >
            <TabPane
              key="photosAndVideos"
              tab={ t('cms.property.listing_management.photos_and_videos.tab') }
            >
              <PhotosAndVideos
                t={ t }
                property={ property }
                handleGotoRoomConfig={ this.props.handleGotoRoomConfig }
                onRef={ (node) => { this.photosAndVideos = node; } }
                onSetUpdateGallery={ this.props.onSetUpdateGallery }
                setProperty={ this.props.setProperty }
              />
            </TabPane>
            <TabPane
              key="virtualTourLinks"
              tab={ t('cms.property.listing_management.virtual_tour_links.tab') }
              forceRender
            >
              <VirtualTourLinks
                t={ t }
                property={ property }
                onSetUpdateGallery={ this.props.onSetUpdateGallery }
                onRef={ (node) => { this.virtualTourLinks = node; } }
                handleGotoRoomConfig={ this.props.handleGotoRoomConfig }
              />
            </TabPane>
          </Tabs>
        </div>
      </PropertyDetailWrapper>
    );
  }
}

GalleryManagement.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object,
  onRef: PropTypes.func.isRequired,
  handleGotoRoomConfig: PropTypes.func,
  setProperty: PropTypes.func,
  onSetUpdateGallery: PropTypes.func,
  isHidden: PropTypes.bool,
  checkDraftReviewmodal: PropTypes.func,
};

GalleryManagement.defaultProps = {
  t: () => {},
  property: {},
  onRef: () => {},
  handleGotoRoomConfig: () => {},
  setProperty: () => {},
  onSetUpdateGallery: () => {},
  isHidden: false,
  checkDraftReviewmodal: () => {},
};

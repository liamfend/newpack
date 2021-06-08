import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Popconfirm } from 'antd';
import NavigationOption from '~pages/dashboard/properties/listing-management/navigation-bar/option';
import UploadProgress from '~pages/dashboard/properties/listing-management/upload-progress';
import { propertySections, sectionPropertyState, propertyStatus } from '~constants/listing-management';
import { communicationStatus } from '~client/constants';
import Svg from '~components/svg';
import { authUrl } from '~settings/endpoints';

export default class NavigationBar extends React.Component {
  constructor() {
    super();
    this.state = {
      isShowUnpublishModal: false,
    };
  }

  calSectionState = (section) => {
    const {
      name,
      slug,
      headline,
      headlineCn,
      unitTypes,
      allImages,
      facilities,
      shippingCity,
      country,
      address,
    } = this.props.property;
    let sectionState = '';

    switch (section) {
      case propertySections.PROPERTY_DETAILS:
        if (name && slug && (headline || headlineCn)) {
          sectionState = sectionPropertyState.FILLED;
        } else {
          sectionState = sectionPropertyState.NOT_FILLED;
        }
        break;
      case propertySections.PROPERTY_ADDRESS:
        if (shippingCity && country && address) {
          sectionState = sectionPropertyState.FILLED;
        } else {
          sectionState = sectionPropertyState.NOT_FILLED;
        }
        break;
      case propertySections.PROPERTY_FACILITY:
        if (facilities.some(facility => facility.group !== 'others' && facility.checked)) {
          sectionState = sectionPropertyState.FILLED;
        } else {
          sectionState = sectionPropertyState.NOT_SUFFICIENT;
        }

        break;
      case propertySections.ROOM_CONFIG:
        if (unitTypes && unitTypes.edges.length > 0) {
          sectionState = sectionPropertyState.FILLED;
        } else {
          sectionState = sectionPropertyState.NOT_SUFFICIENT;
        }

        break;
      case propertySections.PRICE_AND_AVAILABILITY:
        if (
          unitTypes &&
          unitTypes.edges &&
          unitTypes.edges.some(unit => unit.node && unit.node.listings.length > 0) &&
          !this.props.isHaveUnconfirmedListing
        ) {
          sectionState = sectionPropertyState.FILLED;
        } else {
          sectionState = sectionPropertyState.NOT_SUFFICIENT;
        }

        break;
      case propertySections.GALLERY_MANAGEMENT:
        if (
          allImages.edges &&
          allImages.edges.some(image => image.node && image.node.hero &&
              image.node.status !== 'REJECTED' && !image.node.deleted)
        ) {
          sectionState = sectionPropertyState.FILLED;
        } else {
          sectionState = sectionPropertyState.NOT_FILLED;
        }
        break;
      default:
        sectionState = '';
    }

    return sectionState;
  }

  showUnpublishModal = () => {
    this.setState({
      isShowUnpublishModal: true,
    });
  }

  handleCancel = () => {
    this.setState({
      isShowUnpublishModal: false,
    });
  }

  getCityCountry = () => {
    const { property } = this.props;
    const cityArr = [];
    if (property.city) {
      cityArr.push(property.city.name);

      if (property.city.country) {
        cityArr.push(property.city.country.name);
      }
    }

    return cityArr.join();
  };

  handleClickPreivew = () => {
    this.props.handlePreview((res) => {
      if (res && res.slug && res.city.slug && res.city.country && res.city.country.slug) {
        this.previewForm.action = authUrl(`/${res.city.country.slug}/${res.city.slug}/p/${res.slug}?preview=yes&update_cache=yes`);
        document.getElementById('preview_input').value = JSON.stringify({
          property: res,
        });
        this.previewForm.submit();
      }
      return false;
    });
  };

  handleClickUnpublish = () => {
    this.props.handlePublish(false, () => {
      this.setState({
        isShowUnpublishModal: false,
      });
    });
  }

  calIsDisabled = () => {
    const {
      name,
      slug,
      headline,
      headlineCn,
      allImages,
      shippingCity,
      country,
      status,
    } = this.props.property;

    if (name && slug && (headline || headlineCn) && shippingCity &&
    country && status !== propertyStatus.NEW &&
      (allImages.edges &&
        allImages.edges.some(image => image.node && image.node.hero &&
        image.node.status !== 'REJECTED' && !image.node.deleted))
    ) {
      return false;
    }

    return true;
  };

  handleConfirmPublish = () => {
    this.props.onClearUnconfirmedListings();
    this.props.handlePublish(true);
  }

  render() {
    const { t, currentSection, property, publishStatus, isHaveUnconfirmedListing } = this.props;
    return (
      <div className="navigation-bar">
        <div className="navigation-bar__selection-wrap">
          <ul className="navigation-bar__selection">
            <For each="section" of={ Object.keys(propertySections) } index="index">
              <NavigationOption
                key={ index }
                sectionState={ this.calSectionState(section) }
                text={ t(`cms.property.listing_management.${section.toLowerCase()}.navigation`) }
                isSelected={ currentSection === section }
                handleSelectOption={ () => this.props.handleSetSection(section) }
              />
            </For>
          </ul>
        </div>
        <UploadProgress
          t={ t }
          history={ this.props.history }
        />
        <Choose>
          <When condition={ property.status === propertyStatus.PUBLISHED }>
            <div className="navigation-bar__unpublished-wrap">
              <span
                role="presentation"
                onClick={ this.showUnpublishModal }
              >
                { t('cms.property.listing_management.unpublish.button') }
              </span>
              <Modal
                visible={ this.state.isShowUnpublishModal }
                wrapClassName="navigation-bar__modal-wrap"
                onCancel={ this.handleCancel }
                onOk={ this.handleClickUnpublish }
                cancelText={ t('cms.property.listing_management.cancel.modal.button') }
                okText={ t('cms.property.listing_management.unpublish.modal.button') }
              >
                <div className="navigation-bar__modal-title">
                  { t('cms.property.listing_management.unpublish.modal.title') }
                </div>
                <div className="navigation-bar__modal-content">
                  <span>{ t('cms.properties.edit.detail.property_name') }</span>
                  { property.name }
                </div>
                <div className="navigation-bar__modal-content">
                  <span>{ t('cms.properties.edit.detail.landlord_name') }</span>
                  { property.landlord ? property.landlord.name : '' }
                </div>
                <div className="navigation-bar__modal-content">
                  <span>{ t('cms.properties.edit.detail.City') }</span>
                  { this.getCityCountry() }
                </div>
              </Modal>
            </div>
          </When>
          <Otherwise>
            <Choose>
              <When condition={ isHaveUnconfirmedListing }>
                <Popconfirm
                  placement="top"
                  overlayStyle={ { maxWidth: 350 } }
                  title={ t('cms.property.listing_management.unconfirmed_lisitings.publish.tips') }
                  onConfirm={ this.handleConfirmPublish }
                  okText={ t('cms.properties.edit.btn.yes') }
                  cancelText={ t('cms.properties.edit.btn.no') }
                >
                  <Button
                    block
                    type="primary"
                    size="large"
                    disabled={ this.calIsDisabled() }
                    loading={ publishStatus === communicationStatus.FETCHING }
                    className="navigation-bar__publish-btn"
                  >
                    { t('cms.property.listing_management.publish.button') }
                  </Button>
                </Popconfirm>
              </When>
              <Otherwise>
                <Button
                  block
                  type="primary"
                  size="large"
                  disabled={ this.calIsDisabled() }
                  loading={ publishStatus === communicationStatus.FETCHING }
                  className="navigation-bar__publish-btn"
                  onClick={ () => this.props.handlePublish(true) }
                >
                  { t('cms.property.listing_management.publish.button') }
                </Button>
              </Otherwise>
            </Choose>
            <form
              method="post"
              target="_blank"
              encType="application/json"
              ref={ (node) => { this.previewForm = node; } }
            >
              <input type="hidden" id="preview_input" name="data" value="" />
              <Button
                block
                ghost
                type="primary"
                size="large"
                onClick={ this.handleClickPreivew }
              >
                <Svg className="navigation-bar__preview-icon" hash="preview" />
                { t('cms.property.listing_management.preview.button') }
              </Button>
            </form>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

NavigationBar.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object,
  currentSection: PropTypes.string,
  handleSetSection: PropTypes.func,
  publishStatus: PropTypes.string,
  handlePreview: PropTypes.func.isRequired,
  handlePublish: PropTypes.func.isRequired,
  isHaveUnconfirmedListing: PropTypes.bool,
  history: PropTypes.object,
  onClearUnconfirmedListings: PropTypes.func,
};

NavigationBar.defaultProps = {
  t: () => {},
  property: {},
  currentSection: '',
  handleSetSection: () => {},
  publishStatus: '',
  handlePreview: () => {},
  handlePublish: () => {},
  isHaveUnconfirmedListing: false,
  history: {},
  onClearUnconfirmedListings: () => {},
};

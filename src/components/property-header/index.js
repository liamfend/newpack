import React from 'react';
import PropTypes from 'prop-types';
import document from 'global/document';
import classNames from 'classnames';
import generatePath from '~settings/routing';
import { Tooltip, Popover, Button } from 'antd';
import { Link } from 'react-router-dom';
import { getItem } from '~base/global/helpers/storage';
import getEnvironment, { environments } from '~base/global/helpers/environment';
import BreadCrumbs from '~components/bread-crumbs';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';
import { authUrl } from '~settings/endpoints';

export default class PropertyHeader extends React.Component {
  generatePropertyUrl = (property) => {
    const path = `${property.city && property.city.country && property.city.country.slug ?
      property.city.country.slug : ''}/${property.city && property.city.slug ?
      property.city.slug : ''}/p/${property.slug}`;

    if (getEnvironment() === environments.PROD) {
      return `//www.student.com/${path}`;
    }
    return `//hurricane-www.dandythrust.com/${path}`;
  };

  getFilters = () => {
    const filters = getItem('cms_properties_list_filters');
    const result = {};
    if (filters) {
      Object.keys(filters).map((key) => {
        if (filters[key]) {
          result[key] = filters[key];
        }
        return true;
      });
    }
    if (filters && filters.pageNumber && filters.pageNumber === 1) {
      delete result.pageNumber;
    }
    if (filters && filters.pageSize && filters.pageSize === 10) {
      delete result.pageSize;
    }

    return result;
  }

  redirectToEditPage = () => {
    let path = '';
    if (this.props.type === 'homepage') {
      path = generatePath('properties', {}, this.getFilters());
    }

    if (['edit', 'commission', 'record', 'deposit-and-fees', 'reference-and-contact', 'terms'].indexOf(this.props.type) !== -1) {
      path = generatePath('property.homepage', { propertySlug: this.props.property.slug });
    }

    return path;
  }

  handlePreview = () => {
    this.props.handlePreview((res) => {
      if (res && res.slug && res.city.slug && res.city.country && res.city.country.slug) {
        this.previewForm.action = authUrl(`/${res.city.country.slug}/${res.city.slug}/p/${res.slug}?preview=yes&update_cache=yes`);
        document.getElementById('item__data').value = JSON.stringify({
          property: res,
        });
        this.previewForm.submit();
      }

      return false;
    });
  };

  render() {
    const {
      t, property, showedWarningType,
      showWarning, renderWarning, type, warningType,
      isShowSaveButton,
    } = this.props;
    return (
      <div className="property-header">
        <If condition={ property }>
          <BreadCrumbs
            t={ t }
            type={ type }
            propertySlug={ property.slug }
            getFilters={ this.getFilters }
          />
          <div className="property-header__header-info">
            <h2 className="property-header__property-name">
              <Tooltip
                title={
                  this.props.property.status === 'PUBLISHED' ?
                    t('cms.edit.header.label.view_on_student')
                    : t('cms.header.property_name.unpublished.tips')
                }
              >
                <Choose>
                  <When condition={ property.status === 'PUBLISHED' }>
                    <a
                      className="property-header__text"
                      target="_blank"
                      href={ this.generatePropertyUrl(property) }
                      rel="noopener noreferrer"
                    >
                      { property.name }
                      <span className="property-header__underline" />
                    </a>
                  </When>
                  <Otherwise>
                    <span className="property-header__text">
                      { property.name }
                    </span>
                  </Otherwise>
                </Choose>
              </Tooltip>
              <If condition={ property.id }>
                <span className="property-header__property-id">
                  { t('cms.header.property_id.text') }{ JSON.parse(window.atob(property.id)).id }
                </span>
              </If>
              <div className={ classNames('property-header__property-status', {
                'property-header__property-status--gray': property.status === 'UNPUBLISHED',
                'property-header__property-status--green': property.status !== 'UNPUBLISHED',
              }) }
              >
                { t(`cms.property_card.status.tag.${property.status ? property.status.toLowerCase() : ''}`) }
              </div>
            </h2>
          </div>
          <div className="property-edit__btns">
            <If condition={ !type.includes('change-log') }>
              <Link to={ this.redirectToEditPage() }>
                <Button className="property-edit__btns__close" type="link" ghost>
                  { t('cms.properties.edit.btn.close') }
                </Button>
              </Link>
            </If>
            <If condition={ type === 'change-log-listing-management' }>
              <Button
                size="large"
                type="primary"
                onClick={ this.props.handleOpenFilterModal }
                className="property-edit__btns__prim property-header__btn"
              >
                { t('cms.properties.edit.btn.filter') }
              </Button>
            </If>
            <If condition={ type === 'reference-and-contact' && showElementByAuth(platformEntity.PROPERTIES_PROPERTIES, entityAction.UPDATE) }>
              <Button
                size="large"
                type="primary"
                onClick={ this.props.handleSave }
                className="property-edit__btns__prim property-header__btn"
                loading={ this.props.isFetchingSave }
              >
                { t('cms.properties.edit.btn.save') }
              </Button>
            </If>
            <If condition={ type === 'edit' && showElementByAuth(platformEntity.PROPERTIES_PROPERTIES, entityAction.UPDATE) }>
              <If condition={ property.status !== 'PUBLISHED' && isShowSaveButton }>
                <Popover
                  content={ renderWarning(showedWarningType) }
                  placement="topRight"
                  trigger="click"
                  visible={
                    showWarning
                      && (showedWarningType === warningType.CLOSE_POPUP_SAVE)
                  }
                >
                  <Button
                    ghost
                    size="large"
                    type="primary"
                    onClick={ this.props.handleSave }
                    className="property-edit__btns__prim property-header__btn"
                    loading={ this.props.isFetchingSave }
                  >
                    { t('cms.properties.edit.btn.save') }
                  </Button>
                </Popover>
              </If>
              <If condition={ type === 'edit' }>
                <form
                  style={ { display: 'inline-block' } }
                  method="post"
                  target="_blank"
                  encType="application/json"
                  ref={ (node) => { this.previewForm = node; } }
                >
                  <input type="hidden" id="item__data" name="data" value="" />
                  <Button
                    ghost
                    size="large"
                    type="primary"
                    onClick={ this.handlePreview }
                    className="property-edit__btns__prim property-header__btn"
                  >
                    { t('cms.properties.edit.btn.preview') }
                  </Button>
                </form>

              </If>

              <Button
                size="large"
                type="primary"
                onClick={ this.props.handleReview }
                className="property-edit__btns__prim property-header__btn"
              >
                { t('cms.properties.edit.btn.publish') }
              </Button>
              <Popover
                content={ renderWarning(showedWarningType) }
                placement="topRight"
                trigger="click"
                visible={
                  showWarning
                    && (showedWarningType === warningType.FIELD_REQUIRED
                      || showedWarningType === warningType.CLOSE_POPUP_REVIEW)
                }
              >
                <div className="property-edit__btns__popover" />
              </Popover>
            </If>
          </div>
        </If>
      </div>
    );
  }
}

PropertyHeader.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object,
  showedWarningType: PropTypes.string,
  type: PropTypes.string,
  warningType: PropTypes.object,
  renderWarning: PropTypes.func,
  showWarning: PropTypes.bool,
  isFetchingSave: PropTypes.bool,
  handleSave: PropTypes.func,
  handleReview: PropTypes.func,
  handlePreview: PropTypes.func,
  isShowSaveButton: PropTypes.bool,
  handleOpenFilterModal: PropTypes.func,
};

PropertyHeader.defaultProps = {
  t: () => {},
  property: {},
  showedWarningType: '',
  type: '',
  warningType: {},
  renderWarning: () => {},
  showWarning: false,
  isFetchingSave: false,
  handleSave: () => {},
  handleReview: () => {},
  handlePreview: () => {},
  isShowSaveButton: false,
  handleOpenFilterModal: () => {},
};

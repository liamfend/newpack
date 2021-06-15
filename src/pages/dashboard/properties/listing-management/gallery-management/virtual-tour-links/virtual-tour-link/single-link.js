import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Input,
  Select,
  Icon,
  Form,
  Tooltip,
  Popconfirm,
} from 'antd';
import CombinedSearchComponent from '~components/combined-search-component';
import { isLandlordRole } from '~helpers/auth';
import { vrUrlPrefix, vrLinkLabel } from '~constants/gallery';
import { RejectedNoShadow as RejectedNoShadowIcon } from "~components/svgs";

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;

export default class SingleLink extends React.PureComponent {
  handleCheckButtonClick = (value) => {
    window.open(`${vrUrlPrefix}${value}`);
  };

  validatUrl = (url) => {
    if (urlRegex.test(`${vrUrlPrefix}${url}`)) {
      return true;
    }
    return false;
  };

  urlValidator = (rule, value, callback) => {
    if (value && !urlRegex.test(`${vrUrlPrefix}${value}`)) {
      callback('error');
    } else {
      callback();
    }
  };

  checkSwitchEnabled = (section, id, links) => {
    const { getFieldValue } = this.props.form;
    const linkAddressValid = this.validatUrl(getFieldValue(`link-${id}`));
    const localeValid = !!getFieldValue(`displayRegion-${id}`);
    const areaValid = !!getFieldValue(`area-${id}`);
    let combinedSearchComponentValid = true;
    if (getFieldValue(`combinedSearchComponent-${id}`) === '') {
      combinedSearchComponentValid = false;
    }
    const selfLink = links.find(linkItem => linkItem.id === id);
    const otherLinks = links.filter(linkItem => linkItem.id !== id);

    switch (section) {
      case vrLinkLabel.PROPERTY: {
        for (let i = 0; i < otherLinks.length; i++) {
          if (otherLinks[i].link === selfLink.link) {
            return false;
          }
        }
        return linkAddressValid && localeValid && areaValid;
      }
      case vrLinkLabel.ROOM: {
        for (let i = 0; i < otherLinks.length; i++) {
          if (otherLinks[i].link === selfLink.link) {
            return false;
          }
        }
        return linkAddressValid && localeValid && combinedSearchComponentValid;
      }
      default:
        return false;
    }
  };

  render() {
    const { t, virtualTourLinkItem, section, rooms, form, links } = this.props;
    const { getFieldValue, getFieldDecorator } = form;

    return (
      <div
        className="virtual-tour-link-item"
        ref={ (node) => {
          this.selectContainer = node;
        } }
      >
        <div className="virtual-tour-link-item__column">
          <Popconfirm
            arrowPointAtCenter
            title={ t(
              'cms.properties.edit.gallery.delete_virtual_tour_link_reminder',
            ) }
            placement="topLeft"
            onConfirm={ () => {
              this.props.onDeleteLink(section, virtualTourLinkItem.id);
            } }
            okText={ t('cms.properties.edit.btn.yes') }
            cancelText={ t('cms.properties.edit.btn.no') }
          >
            <div className="virtual-tour-link-item__middle">
              <Icon className="icon-delete" type="minus-circle" />
            </div>
          </Popconfirm>
        </div>
        <div className="virtual-tour-link-item__column">
          <Form.Item style={ { width: '100%' } }>
            <Tooltip
              arrowPointAtCenter
              getPopupContainer={ () => this.selectContainer }
              overlayClassName={ classNames('vr-tooltip', {
                'vr-tooltip--show': false,
              }) }
              placement="top"
              title={ t(
                'cms.properties.edit.gallery.virtual_tour.disable_modify_hint',
              ) }
            >
              {getFieldDecorator(`link-${virtualTourLinkItem.id}`, {
                validateTrigger: ['onBlur'],
                rules: [
                  {
                    validator: this.urlValidator,
                    message: this.props.t(
                      'cms.properties.edit.others.invalid_hint',
                    ),
                  },
                  {
                    required: true,
                    message: this.props.t(
                      'cms.listing.modal.error_message.can_not_empty',
                    ),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (
                        links.some(link =>
                          link.id !== virtualTourLinkItem.id &&
                          link.link === `${vrUrlPrefix}${value}`,
                        )
                      ) {
                        callback('error');
                      }
                      callback();
                    },
                    message: this.props.t(
                      'cms.properties.edit.gallery.duplicated_virtual_tour_link_error',
                    ),
                  },
                ],
                initialValue: virtualTourLinkItem.link
                  ? virtualTourLinkItem.link.replace(vrUrlPrefix, '')
                  : virtualTourLinkItem.link,
              })(
                <Input
                  disabled={ !!virtualTourLinkItem.status }
                  className={ classNames('virtual-tour-link-item__middle url', {
                    'url--valid': this.validatUrl(
                      getFieldValue(`link-${virtualTourLinkItem.id}`),
                    ),
                  }) }
                  autoComplete="off"
                  placeholder={ t(
                    'cms.properties.edit.gallery.virtual_tour.link_address_hint',
                  ) }
                  addonBefore={
                    <span className="virtual-tour-link-item__url-prefix">
                      {vrUrlPrefix}
                    </span>
                  }
                  addonAfter={
                    <Icon
                      type="arrow-right"
                      onClick={ () => {
                        this.handleCheckButtonClick(
                          getFieldValue(`link-${virtualTourLinkItem.id}`),
                        );
                      } }
                    />
                  }
                />,
              )}
            </Tooltip>
          </Form.Item>
        </div>
        <div className="virtual-tour-link-item__column">
          <Form.Item style={ { width: '100%' } }>
            <Tooltip
              arrowPointAtCenter
              getPopupContainer={ () => this.selectContainer }
              overlayClassName={ classNames('vr-tooltip', {
                'vr-tooltip--show': false,
              }) }
              placement="top"
              title={ t(
                isLandlordRole()
                  ? 'cms.properties.edit.gallery.virtual_tour.landlord_disable_modify_hint'
                  : 'cms.properties.edit.gallery.virtual_tour.disable_modify_hint',
              ) }
            >
              <div>
                {getFieldDecorator(`displayRegion-${virtualTourLinkItem.id}`, {
                  initialValue: virtualTourLinkItem.displayRegion,
                  rules: [
                    {
                      required: true,
                      message: this.props.t(
                        'cms.listing.modal.error_message.can_not_empty',
                      ),
                    },
                  ],
                })(
                  <Select
                    style={ { width: '100%' } }
                    placeholder={ t(
                      'cms.properties.edit.gallery.virtual_tour.select_locale',
                    ) }
                    getPopupContainer={ () => this.selectContainer }
                    disabled={ !!virtualTourLinkItem.status }
                  >
                    <Select.Option value="ALL">
                      {t('cms.properties.edit.address.display_permission_ALL')}
                    </Select.Option>
                    <Select.Option value="ROW">
                      {t('cms.properties.edit.address.display_permission_ROW')}
                    </Select.Option>
                    <Select.Option value="CN">
                      {t('cms.properties.edit.address.display_permission_CN')}
                    </Select.Option>
                  </Select>,
                )}
              </div>
            </Tooltip>
          </Form.Item>
        </div>
        <If condition={ section === vrLinkLabel.PROPERTY }>
          <div className="virtual-tour-link-item__column">
            <Form.Item style={ { width: '100%' } }>
              <Tooltip
                arrowPointAtCenter
                getPopupContainer={ () => this.selectContainer }
                overlayClassName={ classNames('vr-tooltip', {
                  'vr-tooltip--show': false,
                }) }
                placement="top"
                title={ t(
                  'cms.properties.edit.gallery.virtual_tour.disable_modify_hint',
                ) }
              >
                <div>
                  {getFieldDecorator(`area-${virtualTourLinkItem.id}`, {
                    initialValue: virtualTourLinkItem.area,
                    rules: [
                      {
                        required: true,
                        message: this.props.t(
                          'cms.listing.modal.error_message.can_not_empty',
                        ),
                      },
                    ],
                  })(
                    <Select
                      style={ { width: '100%' } }
                      getPopupContainer={ () => this.selectContainer }
                      disabled={ !!virtualTourLinkItem.status }
                    >
                      <Select.Option value="GENERAL">
                        {t('cms.properties.edit.gallery.library.title.general')}
                      </Select.Option>
                      <Select.Option value="BUILDING_EXTERIOR">
                        {t(
                          'cms.properties.edit.gallery.library.title.building_exterior',
                        )}
                      </Select.Option>
                      <Select.Option value="COMMON_INDOOR_SPACES">
                        {t(
                          'cms.properties.edit.gallery.library.title.common_indoor_spaces',
                        )}
                      </Select.Option>
                      <Select.Option value="COMMON_OUTDOOR_SPACES">
                        {t(
                          'cms.properties.edit.gallery.library.title.common_outdoor_spaces',
                        )}
                      </Select.Option>
                    </Select>,
                  )}
                </div>
              </Tooltip>
            </Form.Item>
          </div>
        </If>
        <If condition={ section === vrLinkLabel.ROOM }>
          <div className="virtual-tour-link-item__column">
            <div>
              <CombinedSearchComponent
                disabled={ !!virtualTourLinkItem.status }
                rooms={ rooms }
                form={ form }
                virtualTourLink={ virtualTourLinkItem }
                t={ t }
                onChange={ (currentLink, selectedRooms) => {
                  this.props.onSetSelectedRooms(currentLink, selectedRooms);
                } }
              />
            </div>
          </div>
        </If>
        <div className="virtual-tour-link-item__column">
          <Form.Item style={ { width: '100%' } }>
            <span className={ classNames('virtual-tour-link-item__reject-vr', {
              'virtual-tour-link-item__reject-vr--red': virtualTourLinkItem.status === 'REJECTED',
            }) }
            >
              <If condition={ virtualTourLinkItem.status === 'REJECTED' }>
                <RejectedNoShadowIcon className="virtual-tour-link-item__reject-vr__icon" />
              </If>
            </span>
          </Form.Item>
        </div>
      </div>
    );
  }
}

SingleLink.propTypes = {
  t: PropTypes.func,
  virtualTourLinkItem: PropTypes.object,
  links: PropTypes.array,
  form: PropTypes.object,
  section: PropTypes.string,
  rooms: PropTypes.array,
  onDeleteLink: PropTypes.func,
  onSetSelectedRooms: PropTypes.func,
};

SingleLink.defaultProps = {
  t: () => {},
  virtualTourLinkItem: {},
  links: [],
  form: {},
  section: vrLinkLabel.PROPERTY,
  rooms: [],
  onDeleteLink: () => {},
  onSetSelectedRooms: () => {},
};

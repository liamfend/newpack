import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Row, Col, Input, Select, Icon, Switch, Form, Tooltip, Popconfirm } from 'antd'
import CombinedSearchComponent from '~components/combined-search-component'
import { vrUrlPrefix } from '~constants/gallery'
import { isLandlordRole } from '~helpers/auth'

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/

export default class VirtualTourLinkContent extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      isSameLocale: false,
    }
  }
  componentDidMount() {
    // init form value
    const { links, form, section, rooms } = this.props
    links.map(link => {
      const field = {}
      field[`link-${link.id}`] = link.link ? link.link.replace(vrUrlPrefix, '') : link.link
      field[`displayRegion-${link.id}`] = link.displayRegion
      field[`enabled-${link.id}`] = link.enabled
      if (section === 'Property') {
        field[`area-${link.id}`] = link.area
      } else if (section === 'Room') {
        field[`combinedSearchComponent-${link.id}`] = rooms
          .map(item => item.node)
          .filter(item => {
            const unitTypeIds = link.unitTypeIdToLinkId.map(
              unitTypeIdToLinkIdItem => unitTypeIdToLinkIdItem.unitTypeId,
            )
            return unitTypeIds.includes(JSON.parse(atob(item.id)).id)
          })
          .map(item => item.name)
          .join('; ')
      }
      form.setFieldsValue(field)
      return true
    })
  }

  urlValidator = (rule, value, callback) => {
    if (value && !urlRegex.test(`${vrUrlPrefix}${value}`)) {
      callback('error')
    } else {
      callback()
    }
  }

  validatUrl = url => {
    if (urlRegex.test(`${vrUrlPrefix}${url}`)) {
      return true
    }
    return false
  }

  handleCheckButtonClick = value => {
    window.open(`${vrUrlPrefix}${value}`)
  }

  checkSwitchEnabled = (section, id, links) => {
    const { getFieldValue } = this.props.form
    const linkAddressValid = this.validatUrl(getFieldValue(`link-${id}`))
    const localeValid = !!getFieldValue(`displayRegion-${id}`)
    const areaValid = !!getFieldValue(`area-${id}`)
    const combinedSearchComponentValid = !!getFieldValue(`combinedSearchComponent-${id}`)
    const selfLink = links.find(linkItem => linkItem.id === id)
    const otherLinks = links.filter(linkItem => linkItem.id !== id)

    switch (section) {
      case 'Overall': {
        const overallOtherLink = links.find(overallLink => overallLink.id !== id)

        if (overallOtherLink) {
          if (overallOtherLink.enabled) {
            if (selfLink.link === overallOtherLink.link) {
              this.setState({ isSameLocale: false })
              return false
            }
            if (overallOtherLink.displayRegion === 'ALL') {
              this.setState({ isSameLocale: true })
              return false
            } else if (overallOtherLink.displayRegion === 'ROW') {
              if (selfLink.displayRegion === 'CN') {
                this.setState({ isSameLocale: false })
                return true
              }
              this.setState({ isSameLocale: true })
              return false
            } else if (overallOtherLink.displayRegion === 'CN') {
              if (selfLink.displayRegion === 'ROW') {
                this.setState({ isSameLocale: false })
                return true
              }
              this.setState({ isSameLocale: true })
              return false
            }
          }
        }
        if (!linkAddressValid) {
          this.setState({ isSameLocale: false })
        }
        return linkAddressValid && localeValid
      }
      case 'Property': {
        for (let i = 0; i < otherLinks.length; i++) {
          if (otherLinks[i].enabled) {
            if (otherLinks[i].link === selfLink.link) {
              return false
            }
          }
        }
        return linkAddressValid && localeValid && areaValid
      }
      case 'Room': {
        for (let i = 0; i < otherLinks.length; i++) {
          if (otherLinks[i].enabled) {
            if (otherLinks[i].link === selfLink.link) {
              return false
            }
          }
        }
        return linkAddressValid && localeValid && combinedSearchComponentValid
      }
      default:
        return false
    }
  }

  render() {
    const { t, links, form, section, rooms } = this.props
    const { getFieldValue, getFieldDecorator } = form

    return (
      <div className="virtual-tour-link-content">
        <Row gutter={20} type="flex" align="middle" justify="space-between">
          <Col span={1} />
          <Col span={section === 'Overall' ? 17 : 9}>
            <span className="virtual-tour-link-title">
              {t('cms.properties.edit.gallery.virtual_tour.link_address')}
            </span>
          </Col>
          <Col span={4}>
            <span className="virtual-tour-link-title">
              {t('cms.properties.edit.gallery.virtual_tour.locale')}
            </span>
          </Col>
          <If condition={section === 'Property'}>
            <Col span={8}>
              <span className="virtual-tour-link-title">
                {t('cms.properties.edit.gallery.virtual_tour.area_of_property')}
              </span>
            </Col>
          </If>
          <If condition={section === 'Room'}>
            <Col span={8}>
              <span className="virtual-tour-link-title">
                {t('cms.properties.edit.gallery.virtual_tour.room')}
              </span>
            </Col>
          </If>
          <Col span={2} style={{ textAlign: 'right' }}>
            <span className="virtual-tour-link-title">
              {t('cms.properties.edit.gallery.virtual_tour.display')}
            </span>
          </Col>
        </Row>
        <div>
          <For of={links.filter(link => link.action !== 'DELETE')} each="virtualTourLinkItem">
            <div
              className="virtual-tour-link-item"
              ref={node => {
                this.selectContainer = node
              }}
              key={virtualTourLinkItem.id}
            >
              <Row gutter={20}>
                <Col span={1} className="virtual-tour-link-item__middle">
                  <Popconfirm
                    arrowPointAtCenter
                    title={t('cms.properties.edit.gallery.delete_virtual_tour_link_reminder')}
                    placement="topLeft"
                    onConfirm={() => {
                      this.props.onDeleteLink(section, virtualTourLinkItem.id)
                    }}
                    okText={t('cms.properties.edit.btn.yes')}
                    cancelText={t('cms.properties.edit.btn.no')}
                  >
                    <Icon className="icon-delete" type="minus-circle" />
                  </Popconfirm>
                </Col>
                <Col span={section === 'Overall' ? 17 : 9}>
                  <Form.Item>
                    <Tooltip
                      arrowPointAtCenter
                      getPopupContainer={() => this.selectContainer}
                      overlayClassName={classNames('vr-tooltip', {
                        'vr-tooltip--show': getFieldValue(`enabled-${virtualTourLinkItem.id}`),
                      })}
                      placement="top"
                      title={t('cms.properties.edit.gallery.virtual_tour.disable_modify_hint')}
                    >
                      {getFieldDecorator(`link-${virtualTourLinkItem.id}`, {
                        validateTrigger: ['onBlur'],
                        rules: [
                          {
                            validator: this.urlValidator,
                            message: this.props.t('cms.properties.edit.others.invalid_hint'),
                          },
                          {
                            required: true,
                            message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                          },
                          {
                            validator: (rule, value, callback) => {
                              links
                                .filter(link => link.id !== virtualTourLinkItem.id)
                                .map(link => {
                                  if (link.enabled && link.link === value) {
                                    callback('error')
                                  }
                                  return link
                                })
                              callback()
                            },
                            message: this.props.t(
                              'cms.properties.edit.gallery.duplicated_virtual_tour_link_error',
                            ),
                          },
                        ],
                        initialValue: virtualTourLinkItem.link,
                      })(
                        <Input
                          disabled={getFieldValue(`enabled-${virtualTourLinkItem.id}`)}
                          className={classNames('virtual-tour-link-item__middle url', {
                            'url--valid': this.validatUrl(
                              getFieldValue(`link-${virtualTourLinkItem.id}`),
                            ),
                          })}
                          autoComplete="off"
                          placeholder={t(
                            'cms.properties.edit.gallery.virtual_tour.link_address_hint',
                          )}
                          addonBefore={
                            <span className="virtual-tour-link-item__url-prefix">
                              {vrUrlPrefix}
                            </span>
                          }
                          addonAfter={
                            <Icon
                              type="arrow-right"
                              onClick={() => {
                                this.handleCheckButtonClick(
                                  getFieldValue(`link-${virtualTourLinkItem.id}`),
                                )
                              }}
                            />
                          }
                        />,
                      )}
                    </Tooltip>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item style={{ width: '100%' }}>
                    <Tooltip
                      arrowPointAtCenter
                      getPopupContainer={() => this.selectContainer}
                      overlayClassName={classNames('vr-tooltip', {
                        'vr-tooltip--show':
                          getFieldValue(`enabled-${virtualTourLinkItem.id}`) || isLandlordRole(),
                      })}
                      placement="top"
                      title={t(
                        isLandlordRole()
                          ? 'cms.properties.edit.gallery.virtual_tour.landlord_disable_modify_hint'
                          : 'cms.properties.edit.gallery.virtual_tour.disable_modify_hint',
                      )}
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
                            style={{ width: '100%' }}
                            placeholder={t(
                              'cms.properties.edit.gallery.virtual_tour.select_locale',
                            )}
                            getPopupContainer={() => this.selectContainer}
                            disabled={
                              getFieldValue(`enabled-${virtualTourLinkItem.id}`) || isLandlordRole()
                            }
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
                </Col>
                <If condition={section === 'Property'}>
                  <Col span={8}>
                    <Form.Item style={{ width: '100%' }}>
                      <Tooltip
                        arrowPointAtCenter
                        getPopupContainer={() => this.selectContainer}
                        overlayClassName={classNames('vr-tooltip', {
                          'vr-tooltip--show': getFieldValue(`enabled-${virtualTourLinkItem.id}`),
                        })}
                        placement="top"
                        title={t('cms.properties.edit.gallery.virtual_tour.disable_modify_hint')}
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
                              style={{ width: '100%' }}
                              getPopupContainer={() => this.selectContainer}
                              disabled={getFieldValue(`enabled-${virtualTourLinkItem.id}`)}
                            >
                              <Select.Option value="GENERAL">
                                {t('cms.properties.edit.gallery.library.title.general')}
                              </Select.Option>
                              <Select.Option value="BUILDING_EXTERIOR">
                                {t('cms.properties.edit.gallery.library.title.building_exterior')}
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
                  </Col>
                </If>
                <If condition={section === 'Room'}>
                  <Col span={8}>
                    <div>
                      <CombinedSearchComponent
                        disabled={getFieldValue(`enabled-${virtualTourLinkItem.id}`)}
                        rooms={rooms}
                        form={form}
                        virtualTourLink={virtualTourLinkItem}
                        t={t}
                        onChange={(currentLink, selectedRooms) => {
                          this.props.onSetSelectedRooms(currentLink, selectedRooms)
                        }}
                      />
                    </div>
                  </Col>
                </If>
                <Col className="virtual-tour-link-item__middle" span={2}>
                  {/*  Tooltip 直接套 Switch 会出现Tooltip不消失的问题 */}
                  <Tooltip
                    arrowPointAtCenter
                    getPopupContainer={() => this.selectContainer}
                    overlayClassName={classNames('vr-tooltip', {
                      'vr-tooltip--show': !this.checkSwitchEnabled(
                        section,
                        virtualTourLinkItem.id,
                        links,
                      ),
                    })}
                    placement="topRight"
                    title={
                      this.state.isSameLocale
                        ? t('cms.properties.edit.gallery.same_overall_virtual_tour_link')
                        : t('cms.properties.edit.gallery.virtual_tour.disable_switch_hint')
                    }
                  >
                    <Col
                      span={24}
                      className="virtual-tour-link-item__middle"
                      style={{ padding: 0, justifyContent: 'flex-end' }}
                    >
                      {getFieldDecorator(`enabled-${virtualTourLinkItem.id}`)(
                        <Switch
                          defaultChecked={virtualTourLinkItem.enabled}
                          disabled={
                            !this.checkSwitchEnabled(section, virtualTourLinkItem.id, links)
                          }
                          checkedChildren={<Icon type="check" style={{ pointerEvents: 'none' }} />}
                          unCheckedChildren={
                            <Icon type="close" style={{ pointerEvents: 'none' }} />
                          }
                        />,
                      )}
                    </Col>
                  </Tooltip>
                </Col>
              </Row>
            </div>
          </For>
        </div>
        <If condition={section !== 'Overall' || (section === 'Overall' && links.length < 2)}>
          <div
            className="btn__add-another-link"
            onClick={() => {
              this.props.onAddAnOtherLink(section)
            }}
            role="presentation"
          >
            {t('cms.properties.edit.address.add_another_link')}
          </div>
        </If>
      </div>
    )
  }
}

VirtualTourLinkContent.propTypes = {
  t: PropTypes.func,
  onAddAnOtherLink: PropTypes.func,
  onDeleteLink: PropTypes.func,
  onSetSelectedRooms: PropTypes.func,
  links: PropTypes.array,
  rooms: PropTypes.array,
  form: PropTypes.object,
  section: PropTypes.string,
}

VirtualTourLinkContent.defaultProps = {
  t: () => {},
  onAddAnOtherLink: () => {},
  onDeleteLink: () => {},
  onSetSelectedRooms: () => {},
  links: [],
  rooms: [],
  form: {},
  section: 'Overall',
}

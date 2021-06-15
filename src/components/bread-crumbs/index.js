import React from 'react'
import PropTypes from 'prop-types'
import generatePath from '~settings/routing'
import { Breadcrumb } from 'antd'

const thirdBreadCrumbsArr = [
  'commission',
  'edit',
  'deposit-and-fees',
  'record',
  'change-log',
  'change-log-listing-management',
  'change-log-commission-management',
  'change-log-contract-record',
  'change-log-policy-setting',
  'change-log-deposit-and-fees',
  'reference-and-contact',
  'listing-management',
  'terms',
]

const forthBreadCrumbsArr = [
  'change-log-listing-management',
  'change-log-commission-management',
  'change-log-contract-record',
  'change-log-policy-setting',
  'change-log-deposit-and-fees',
]

export default class BreadCrumbs extends React.Component {
  render() {
    const { t, propertySlug, getFilters, type } = this.props
    return (
      <div className="bread-crumbs">
        <Breadcrumb>
          <Breadcrumb.Item>
            <a className="bread-crumbs__text" href={generatePath('properties', {}, getFilters())}>
              {t('cms.header.menu_link.list')}
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Choose>
              <When condition={type === 'homepage'}>
                <span className="bread-crumbs__text">{t('cms.header.menu_link.homepage')}</span>
              </When>
              <Otherwise>
                <a
                  className="bread-crumbs__text"
                  href={generatePath('property.homepage', { propertySlug })}
                >
                  {this.props.t('cms.header.menu_link.homepage')}
                </a>
              </Otherwise>
            </Choose>
          </Breadcrumb.Item>
          <If condition={thirdBreadCrumbsArr.indexOf(type) !== -1}>
            <Breadcrumb.Item>
              <Choose>
                <When condition={forthBreadCrumbsArr.indexOf(type) !== -1}>
                  <a
                    className="bread-crumbs__text"
                    href={generatePath('property.changeLog', { propertySlug })}
                  >
                    {this.props.t('cms.header.menu_link.change_log')}
                  </a>
                </When>
                <Otherwise>
                  <span className="bread-crumbs__text">
                    <Choose>
                      <When condition={type.includes('change-log')}>
                        {t('cms.header.menu_link.change_log')}
                      </When>
                      <Otherwise>{t(`cms.header.menu_link.${type.replace(/-/g, '_')}`)}</Otherwise>
                    </Choose>
                  </span>
                </Otherwise>
              </Choose>
            </Breadcrumb.Item>
          </If>
          <If condition={forthBreadCrumbsArr.indexOf(type) !== -1}>
            <Breadcrumb.Item>
              <span className="bread-crumbs__text">
                {t(`cms.header.menu_link.${type.replace(/-/g, '_')}`)}
              </span>
            </Breadcrumb.Item>
          </If>
        </Breadcrumb>
      </div>
    )
  }
}

BreadCrumbs.propTypes = {
  t: PropTypes.func.isRequired,
  propertySlug: PropTypes.string,
  getFilters: PropTypes.func,
  type: PropTypes.string,
}

BreadCrumbs.defaultProps = {
  t: () => {},
  propertySlug: '',
  getFilters: () => {},
  type: '',
}

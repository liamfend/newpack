import React from 'react'
import PropTypes from 'prop-types'
import { Radio, Menu, Dropdown, Icon, Button } from 'antd'
import { propertyListingForm, platformEntity, entityAction } from '~constants'
import { extractSearchParams } from '~helpers/history'
import showElementByAuth, { isLandlordRole, isContentSpecialistRole } from '~helpers/auth'

const RadioButton = Radio.Button
const RadioGroup = Radio.Group

export default class PropertyStatusFilter extends React.Component {
  constructor() {
    super()
    this.statusList = ['all', 'new', 'editing', 'published', 'unpublished']
    this.statusListWithOutNew = ['all', 'editing', 'published', 'unpublished']
    this.tagList = ['all', 'sold_out', 'rejected', 'poor_details']
    this.popularCountriesList = ['all', 'uk', 'au', 'us']
    this.sortList = ['updated_at', 'name']
  }

  getCountryMenu = () => (
    // TODO: wait platform ready
    <Menu onClick={() => {}}>
      <For each="country" of={this.popularCountriesList}>
        <Menu.Item key={country} onClick={this.handleSelectCountryFilter}>
          {this.props.t(`cms.property_status_filter.countries_filter.label.${country}`)}
        </Menu.Item>
      </For>
    </Menu>
  )

  getSortMenu = () => (
    <Menu onClick={() => {}}>
      <For each="sort" of={this.sortList}>
        <Menu.Item key={sort} onClick={this.handleSelectSortFilter}>
          {this.props.t(`cms.property_status_filter.sort_filter.label.${sort}`)}
        </Menu.Item>
      </For>
    </Menu>
  )

  getTagMenu = () => (
    <Menu onClick={() => {}}>
      <For each="tag" of={this.tagList}>
        <Menu.Item key={tag} onClick={this.handleSelectTagFilter}>
          {this.props.t(`cms.property_status_filter.tag_filter.label.${tag}`)}
        </Menu.Item>
      </For>
    </Menu>
  )

  handleChangeStatus = e => {
    let value = e.target.value.toUpperCase().replace('-', '_')
    if (Object.values(propertyListingForm.statuses).indexOf(value) === -1) {
      value = null
    }

    this.props.onChange({ statuses: value })
  }

  handleSelectTagFilter = ({ key }) => {
    let value = key
    if (Object.values(['sold_out', 'rejected', 'poor_details']).indexOf(key) === -1) {
      value = null
    }

    this.props.onChange({ tag: value })
  }

  handleSelectCountryFilter = ({ key }) => {
    let value = key
    if (Object.values(['uk', 'au', 'us']).indexOf(key) === -1) {
      value = null
    }

    this.props.onChange({ countrySlug: value })
  }

  handleSelectSortFilter = ({ key }) => this.props.onChange({ sort: key })

  getStatusFilterList = () =>
    isLandlordRole() || isContentSpecialistRole() ? this.statusListWithOutNew : this.statusList

  render() {
    const { filters } = this.props
    const { type } = extractSearchParams(filters.search)
    return (
      <div className="property-status-filter">
        <RadioGroup defaultValue="all" onChange={this.handleChangeStatus}>
          <For each="status" of={this.getStatusFilterList()}>
            <RadioButton
              value={status}
              key={status}
              checked={
                filters.statuses === status.toUpperCase().replace('-', '_') ||
                (status === 'all' && !filters.statuses)
              }
            >
              {this.props.t(`cms.property_status_filter.tab.label.${status.replace('-', '_')}`)}
            </RadioButton>
          </For>
        </RadioGroup>

        <div className="property-status-filter__filter-container">
          <h1 className="table-header__heading">
            {this.props.t('cms.table.header.text.num_properties', { num: this.props.total })}
          </h1>

          {/* <div className="property-status-filter__tag-filter">
            <Dropdown overlay={ this.getTagMenu() }>
              <a className="ant-dropdown-link" >
                <Choose>
                  <When condition={ filters.tag }>
                    <span >{
                      this.props.t(`cms.property_status_filter.tag_filter.label.${filters.tag}`)
                    }</span>
                  </When>
                  <Otherwise>
                    { this.props.t('cms.property_status_filter.tag_filter.title.filter_your_tag') }
                  </Otherwise>
                </Choose>
                <Icon type="down" />
              </a>
            </Dropdown>
          </div> */}

          <If
            condition={
              (!type || ['citySlug', 'countrySlug'].indexOf(type) === -1) && !isLandlordRole()
            }
          >
            <div className="property-status-filter__country-filter">
              <Dropdown overlay={this.getCountryMenu()}>
                <a className="ant-dropdown-link">
                  <Choose>
                    <When
                      condition={this.popularCountriesList.find(
                        item => item === filters.countrySlug,
                      )}
                    >
                      <span>
                        {this.props.t(
                          `cms.property_status_filter.countries_filter.label.${filters.countrySlug}`,
                        )}
                      </span>
                    </When>
                    <Otherwise>
                      {this.props.t(
                        'cms.property_status_filter.countries_filter.title.filter_your_country',
                      )}
                    </Otherwise>
                  </Choose>
                  <Icon type="down" />
                </a>
              </Dropdown>
            </div>
          </If>
          <div className="property-status-filter__sort-filter">
            <Dropdown overlay={this.getSortMenu()}>
              <a className="ant-dropdown-link">
                <Choose>
                  <When condition={this.sortList.find(item => item === filters.sort)}>
                    <span>
                      {this.props.t(`cms.property_status_filter.sort_filter.label.${filters.sort}`)}
                    </span>
                  </When>
                  <Otherwise>
                    {this.props.t('cms.property_status_filter.sort_filter.title.updated_at')}
                  </Otherwise>
                </Choose>
                <Icon type="down" />
              </a>
            </Dropdown>
          </div>
          <If
            condition={showElementByAuth(platformEntity.PROPERTIES_PROPERTIES, entityAction.CREATE)}
          >
            <div className="table-header__button-container">
              <Button onClick={this.props.addBtn}>
                <Icon type="plus" className="table-list__icon-plus" />
                {this.props.t('cms.properties.create.name')}
              </Button>
            </div>
          </If>
        </div>
      </div>
    )
  }
}

PropertyStatusFilter.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  filters: PropTypes.shape({
    statuses: PropTypes.string,
  }),
  addBtn: PropTypes.func.isRequired,
}

PropertyStatusFilter.defaultProps = {
  t: () => {},
  onChange: () => {},
  total: 0,
  filters: {
    statuses: null,
  },
  addBtn: () => {},
}

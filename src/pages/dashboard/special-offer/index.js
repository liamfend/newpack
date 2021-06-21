import { Table, Icon, Divider, Tooltip, Button, Popconfirm, message } from 'antd'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import queryString from 'query-string'
import PropTypes from 'prop-types'
import {
  sortDirectionMapping,
  communicationStatus,
  sortByMapping,
  offerTypes,
  locales,
  platformEntity,
  entityAction,
} from '~constants'
import { mergeSearchParams } from '~helpers/history'
import moment from 'moment'
import TableColumnSearch from '~components/table-column-search'
import update from 'immutability-helper'
import * as actions from '~actions/special-offer/offer-list'
import React from 'react'
import { connect } from 'react-redux'
import generatePath from '~settings/routing'
import showElementByAuth from '~helpers/auth'
import authControl from '~components/auth-control'

const mapStateToProps = state => ({
  list: state.dashboard.specialOfferList.get('list')?.toJS(),
  communication: state.dashboard.specialOfferList.get('communication')?.toJS(),
})

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize())
  },
  getOfferList: filters => {
    dispatch(actions.getOfferList(filters))
  },
  deleteOffer: (deleteId, params) => {
    dispatch(actions.deleteOffer(deleteId, params))
  },
  setOperatingOffer: offer => {
    dispatch(actions.operatingOffer(offer))
  },
})

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
@withTranslation()
@authControl(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.READ)
export default class SpecialOffer extends React.Component {
  constructor(props) {
    super(props)
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    }
    this.state = {
      filters: this.formatFilters(queryString.parse(props.location.search)),
      visibility: {
        propertyFilter: false,
        internalTitleFilter: false,
        cityFilter: false,
        titleFilter: false,
        landlordFilter: false,
        universityFilter: false,
      },
    }
    this.columnInputs = {
      cityFilter: null,
      propertyFilter: null,
      landlordFilter: null,
    }
  }

  componentDidMount() {
    this.props.initialize()
    this.props.getOfferList(this.state.filters || {})
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.location.search) !== JSON.stringify(this.props.location.search)) {
      const filters = this.formatFilters(queryString.parse(nextProps.location.search))
      this.closeDropDownVisible()
      this.props.getOfferList(filters || {})
      this.setState({
        filters: update(this.state.filters, { $set: filters }),
      })
    }
    this.operationChecker(nextProps, 'list', this.props.t('cms.message.error'))
    this.operationChecker(nextProps, 'create', this.props.t('cms.message.offers.created_success'))
    this.operationChecker(nextProps, 'update', this.props.t('cms.message.offers.updated_success'))
    this.operationChecker(nextProps, 'delete', this.props.t('cms.message.offers.deleted_success'))
  }

  opreatOffer = (type, record) => {
    let url = ''
    if (type === 'edit') {
      url = generatePath('specialOffer.edit', { id: record.id })
    } else {
      url = generatePath('specialOffer.create')
    }
    this.props.history.push(url)
    this.props.setOperatingOffer(record)
  }

  operationChecker = (nextProps, type, messages, processStep = true) => {
    if (type === 'list') {
      if (
        nextProps.communication.list.status !== communicationStatus.IDLE &&
        nextProps.communication.list.status !== communicationStatus.FETCHING &&
        nextProps.communication.list.status !== this.props.communication.list.status
      ) {
        message.error(messages)
      }
      return
    }

    if (this.props.communication[type].status === communicationStatus.FETCHING) {
      if (nextProps.communication[type].status === communicationStatus.IDLE) {
        message.success(messages, 3)
        if (processStep) {
          this.props.getOfferList(this.state.filters)
        }
      } else if (nextProps.communication[type].status !== communicationStatus.FETCHING) {
        if (
          nextProps.communication[type].errorInfo.errorDescription &&
          nextProps.communication[type].errorInfo.errorDescription.indexOf('already has') !== -1
        ) {
          message.error(nextProps.communication[type].errorInfo.errorDescription)
        } else {
          message.error(this.props.t('cms.message.error'))
        }
      }
    }
  }

  handleColumnFilter = (type, value) => {
    this.pushState({
      [type]: value,
      pageNumber: 1,
    })
  }

  closeDropDownVisible = () => {
    this.setState({
      visibility: {
        propertyFilter: false,
        internalTitleFilter: false,
        cityFilter: false,
        titleFilter: false,
        universityFilter: false,
      },
    })
  }

  handleFilterDropDownVisibleChange = (name, filterItem) => {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (
      this.state.visibility[name] &&
      this.columnInputs[name] &&
      this.columnInputs[name].getValue().length === 0
    ) {
      this.timeout = setTimeout(() => {
        if (this.columnInputs[name] && this.columnInputs[name].getValue().length === 0) {
          this.handleColumnFilter(filterItem, null)
        }
      }, 100)
    }
    this.setState({
      visibility: update(this.state.visibility, { [name]: { $set: !this.state.visibility[name] } }),
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    const params = {
      pageNumber: pagination.current,
      sortBy: sortByMapping[sorter.columnKey] || null,
      sortDirection: sortDirectionMapping[sorter.order] || null,
      offerType: filters.offerType[0],
      ownerType: filters.ownerType[0],
    }

    if (pagination.pageSize !== this.state.filters.pageSize) {
      params.pageSize = pagination.pageSize
      params.pageNumber = 1
    }

    this.pushState(params)
  }

  pushState = data => {
    this.props.history.push(mergeSearchParams(data, this.defaultSearchParams))
  }

  formatData = () => {
    let data = this.props.list.payload
    if (data.length === 0) {
      return data
    }
    this.props.list.payload.forEach((listItem, index) => {
      let allProperties = update([], { $set: listItem.properties })
      listItem.listings.forEach(listing => {
        const isHaveProperty = allProperties.find(
          property => listing.unitType.property.id === property.id,
        )
        if (!isHaveProperty) {
          allProperties = update(allProperties, { $push: [listing.unitType.property] })
        }
      })
      listItem.unitTypes.forEach(unitType => {
        const isHaveProperty = allProperties.find(property => unitType.property.id === property.id)
        if (!isHaveProperty) {
          allProperties = update(allProperties, { $push: [unitType.property] })
        }
      })
      allProperties.forEach((property, propertyIndex) => {
        listItem.unitTypes.forEach(unitType => {
          if (unitType.property.id === property.id) {
            if (allProperties[propertyIndex].unitType) {
              allProperties = update(allProperties, {
                [propertyIndex]: { unitType: { $push: [unitType] } },
              })
              allProperties = update(allProperties, {
                [propertyIndex]: { unitType: { listings: { $set: [] } } },
              })
            } else {
              allProperties = update(allProperties, {
                [propertyIndex]: { unitType: { $set: [unitType] } },
              })
              allProperties = update(allProperties, {
                [propertyIndex]: { unitType: { listings: { $set: [] } } },
              })
            }
          }
        })
      })
      allProperties.forEach((property, propertyIndex) => {
        if (property.unitType) {
          property.unitType.forEach(unitType => {
            listItem.listings.forEach(listing => {
              if (listing.unitType.id === unitType.id) {
                allProperties = update(allProperties, {
                  [propertyIndex]: { unitType: { listings: { $push: [listing] } } },
                })
              }
            })
          })
        }
      })
      data = update(data, { [index]: { properties: { $set: allProperties } } })
    })
    return data
  }

  formatFilters = filters => ({
    pageNumber: Number(filters.pageNumber) || this.defaultSearchParams.pageNumber,
    pageSize: Number(filters.pageSize) || this.defaultSearchParams.pageSize,
    sortBy: filters.sortBy || null,
    sortDirection: filters.sortDirection || null,
    internalTitle: filters.internalTitle || null,
    propertyId: Number(filters.propertyId) || null,
    cityId: Number(filters.cityId) || null,
    landlordId: Number(filters.landlordId) || null,
    universityId: Number(filters.universityId) || null,
    title: filters.title || null,
    offerType: filters.offerType || null,
    ownerType: filters.ownerType || null,
  })

  showTableColumns = () => {
    const columns = this.tableColumns()
    return columns.filter(item => item.key !== 'title' && item.key !== 'description')
  }

  tableColumns = () => [
    {
      title: this.props.t('cms.special_offer.column.offer_Internal_title'),
      dataIndex: 'internalTitle',
      key: 'internalTitle',
      fixed: 'left',
      className: 'special-offer__table-text',
      width: 220,
      filterDropdown: (
        <TableColumnSearch
          valueData={this.state.filters.internalTitle || ''}
          placeholder={this.props.t('cms.table.column.search.internal_name')}
          onSearch={value => {
            this.setState(
              {
                visibility: update(this.state.visibility, { internalTitleFilter: { $set: false } }),
              },
              () => {
                this.handleColumnFilter('internalTitle', value)
              },
            )
          }}
          t={this.props.t}
        />
      ),
      filterIcon: (
        <Icon
          type="filter"
          style={{ color: this.state.filters.internalTitle ? '#38b2a6' : '#c8c9cb' }}
        />
      ),
      filterDropdownVisible: this.state.visibility.internalTitleFilter,
      onFilterDropdownVisibleChange: view => {
        this.setState({
          visibility: update(this.state.visibility, { internalTitleFilter: { $set: view } }),
        })
      },
      render: text => (
        <Tooltip placement="bottomLeft" title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: this.props.t('cms.special_offer.column.offer_title'),
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      className: 'special-offer__table-text',
      filterDropdown: (
        <TableColumnSearch
          valueData={this.state.filters.title || ''}
          placeholder={this.props.t('cms.table.column.search.offer_title')}
          onSearch={value => {
            this.setState(
              {
                visibility: update(this.state.visibility, { titleFilter: { $set: false } }),
              },
              () => {
                this.handleColumnFilter('title', value)
              },
            )
          }}
          t={this.props.t}
        />
      ),
      filterIcon: (
        <Icon type="filter" style={{ color: this.state.filters.title ? '#38b2a6' : '#c8c9cb' }} />
      ),
      filterDropdownVisible: this.state.visibility.titleFilter,
      onFilterDropdownVisibleChange: view => {
        this.setState({
          visibility: update(this.state.visibility, { titleFilter: { $set: view } }),
        })
      },
      render: text => (
        <Tooltip placement="bottomLeft" title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: this.props.t('cms.special_offer.column.description'),
      dataIndex: 'description',
      key: 'description',
      className: 'special-offer__table-text',
      render: text => (
        <Tooltip placement="bottomLeft" title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: this.props.t('cms.special_offer.column.property'),
      dataIndex: 'properties',
      key: 'properties',
      filterDropdown: (
        <TableColumnSearch
          searchType="property"
          ref={component => {
            this.columnInputs.propertyFilter = component
          }}
          valueData={this.state.filters.propertyId || ''}
          placeholder={this.props.t('cms.table.column.search.property_name')}
          onSearch={id => {
            this.handleColumnFilter('propertyId', id)
          }}
          t={this.props.t}
        />
      ),
      filterIcon: (
        <Icon
          type="filter"
          style={{ color: this.state.filters.propertyId ? '#38b2a6' : '#c8c9cb' }}
        />
      ),
      filterDropdownVisible: this.state.visibility.propertyFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('propertyFilter', 'propertyId')
      },
      render: text => {
        if (text.length < 1) {
          return <span>-</span>
        }
        const unitTypes = types =>
          types.map(type => (
            <div className="special-offer__property-item" key={type.name}>
              {type.name}
              {type.listings.length > 0 &&
                ` (${type.listings.length} ${this.props.t('cms.special_offer.form.listings')})`}
            </div>
          ))
        const properties = text.map(property => (
          <div key={property.slug} className="special-offer__property-box">
            <div className="special-offer__property">{property.name}</div>
            {property.unitType && unitTypes(property.unitType)}
          </div>
        ))
        return (
          <Tooltip
            placement="bottom"
            title={properties}
            overlayClassName="special-offer__property-container"
          >
            <If condition={text.length === 1}>
              <span>{text[0].name}</span>
            </If>
            <If condition={text.length > 1}>
              <span className="special-offer__right-text">{`${text.length} ${this.props.t(
                'cms.table.column.offer.properties',
              )}`}</span>
            </If>
          </Tooltip>
        )
      },
    },
    {
      title: this.props.t('cms.special_offer.column.landlord'),
      dataIndex: 'landlord',
      key: 'landlord',
      // not needed for now ！！
      // filterDropdown: (
      //   <TableColumnSearch
      //     ref={ (component) => { this.columnInputs.landlordFilter = component; } }
      //     searchType="landlord"
      //     valueData={ this.state.filters.landlordId || '' }
      //     placeholder={ this.props.t('cms.table.column.search.landlord_name') }
      //     onSearch={ (id) => { this.handleColumnFilter('landlordId', id); } }
      //     t={ this.props.t }
      //   />
      // ),
      // filterIcon: (
      //   <Icon
      //     type="filter"
      //     style={ { color: this.state.filters.landlordId ?
      //      colors['color-keppel'] : colors['color-silver-sand'] } }
      //   />
      // ),
      // filterDropdownVisible: this.state.visibility.landlordFilter,
      // onFilterDropdownVisibleChange: () => {
      //   this.handleFilterDropDownVisibleChange('landlordFilter', 'landlordId');
      // },
      render: (text, record) => {
        if (record.properties) {
          let landlord = record.properties.map(
            property => property.landlord && property.landlord.name,
          )
          landlord = landlord.filter((item, index, array) => array.indexOf(item) === index)
          if (record.properties.length > 0) {
            const landlords = record.properties.map(item => (
              <div key={item.id}>
                <span className="special-offer__table-landlord">{item.landlord.name}</span>
                <span className="special-offer__table-landlord-property">{item.name}</span>
              </div>
            ))
            return (
              <Tooltip placement="bottom" title={landlords}>
                <If condition={landlord.length === 1}>
                  <span>{landlord[0]}</span>
                </If>
                <If condition={landlord.length > 1}>
                  <span className="special-offer__right-text">
                    {`${landlord.length} ${this.props.t('cms.table.column.offer.landlords')}`}
                  </span>
                </If>
              </Tooltip>
            )
          }
          return <span>-</span>
        }
        return <span>-</span>
      },
    },
    {
      title: this.props.t('cms.special_offer.column.city'),
      dataIndex: 'cities',
      key: 'cities',
      filterDropdown: (
        <TableColumnSearch
          searchType="city"
          ref={component => {
            this.columnInputs.cityFilter = component
          }}
          valueData={this.state.filters.cityId || ''}
          placeholder={this.props.t('cms.table.column.search.city_name')}
          onSearch={id => {
            this.handleColumnFilter('cityId', id)
          }}
          t={this.props.t}
          visibility={this.state.visibility.cityFilter}
        />
      ),
      filterIcon: (
        <Icon type="filter" style={{ color: this.state.filters.cityId ? '#38b2a6' : '#c8c9cb' }} />
      ),
      filterDropdownVisible: this.state.visibility.cityFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('cityFilter', 'cityId')
      },
      render: text => {
        if (text.length < 1) {
          return <span>-</span>
        }
        const citys = text.map(item => <div key={item.slug}>{item.name}</div>)
        return (
          <Tooltip placement="bottom" title={citys}>
            <If condition={text.length === 1}>
              <span>{text[0].name}</span>
            </If>
            <If condition={text.length > 1}>
              <span className="special-offer__right-text">
                {`${text.length} ${this.props.t('cms.table.column.offer.cities')}`}
              </span>
            </If>
          </Tooltip>
        )
      },
    },
    {
      title: this.props.t('cms.special_offer.column.start_time'),
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: true,
      sortOrder:
        (this.state.filters.sortBy === sortByMapping.startDate &&
          sortDirectionMapping[this.state.filters.sortDirection]) ||
        false,
      render: text => <span>{text ? moment(text).format('DD/MM/YYYY') : '-'}</span>,
    },
    {
      title: this.props.t('cms.special_offer.column.end_time'),
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: true,
      sortOrder:
        (this.state.filters.sortBy === sortByMapping.endDate &&
          sortDirectionMapping[this.state.filters.sortDirection]) ||
        false,
      render: text => <span>{text ? moment(text).format('DD/MM/YYYY') : '-'}</span>,
    },
    {
      title: this.props.t('cms.special_offer.column.create_time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      sortOrder:
        (this.state.filters.sortBy === sortByMapping.createdAt &&
          sortDirectionMapping[this.state.filters.sortDirection]) ||
        false,
      render: text => <span>{text ? moment(text).format('DD/MM/YYYY') : '-'}</span>,
    },
    {
      title: this.props.t('cms.special_offer.column.limit'),
      dataIndex: 'maxBookings',
      key: 'maxBookings',
      sorter: true,
      sortOrder:
        (this.state.filters.sortBy === sortByMapping.maxBookings &&
          sortDirectionMapping[this.state.filters.sortDirection]) ||
        false,
      render: text => <span>{text || '-'}</span>,
    },
    {
      title: this.props.t('cms.special_offer.column.owner_type'),
      dataIndex: 'ownerType',
      key: 'ownerType',
      filterMultiple: false,
      filters: [
        {
          text: this.props.t('cms.special_offer.column.owner_type.filter.internal'),
          value: 'INTERNAL',
        },
        {
          text: this.props.t('cms.special_offer.column.owner_type.filter.landlord'),
          value: 'LANDLORD',
        },
      ],
      filteredValue: [this.state.filters.ownerType ? this.state.filters.ownerType : ''],
      filterIcon: (
        <Icon
          type="filter"
          style={{ color: this.state.filters.ownerType ? '#38b2a6' : '#c8c9cb' }}
        />
      ),
      render: text => {
        if (text) {
          if (text === 'INTERNAL') {
            return (
              <span>{this.props.t('cms.special_offer.column.owner_type.filter.internal')}</span>
            )
          }
          return <span>{this.props.t('cms.special_offer.column.owner_type.filter.landlord')}</span>
        }
        return <span>-</span>
      },
    },
    {
      title: this.props.t('cms.special_offer.column.type'),
      dataIndex: 'offerType',
      key: 'offerType',
      filterMultiple: false,
      filteredValue: [this.state.filters.offerType ? this.state.filters.offerType : ''],
      filters: offerTypes.map(item => ({
        text: item,
        value: item,
      })),
      filterIcon: (
        <Icon
          type="filter"
          style={{ color: this.state.filters.offerType ? '#38b2a6' : '#c8c9cb' }}
        />
      ),
      render: text => <span>{text || '-'}</span>,
    },
    {
      title: this.props.t('cms.special_offer.column.amount'),
      dataIndex: 'amount',
      key: 'amount',
      // not needed for now ！！
      // sorter: this.state.filters.offerType ? true : null,
      // sortOrder:
      //   (this.state.filters.sortBy === sortByMapping.amount &&
      //     sortDirectionMapping[this.state.filters.sortDirection]) ||
      //   false,
      render: text => <span>{text || '-'}</span>,
    },
    {
      title: this.props.t('cms.special_offer.column.locales'),
      dataIndex: 'locales',
      key: 'locales',
      render: text => {
        if (text.length < 1) {
          return <span>-</span>
        }
        const localesComponent = text.map(item => <div key={item}>{item}</div>)
        return (
          <Tooltip placement="bottom" title={localesComponent}>
            <If condition={text.length === 1}>
              <span>{text[0]}</span>
            </If>
            <If condition={text.length === locales.length}>
              <span className="special-offer__right-text">
                {this.props.t('cms.table.column.offer.all_locales')}
              </span>
            </If>
            <If condition={text.length > 1 && text.length < locales.length}>
              <span className="special-offer__right-text">
                {`${text.length} ${this.props.t('cms.table.column.offer.locales')}`}
              </span>
            </If>
          </Tooltip>
        )
      },
    },
    {
      title: this.props.t('cms.special_offer.column.actions'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 118,
      render: (text, record, index) => (
        <div>
          <If
            condition={showElementByAuth(
              platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS,
              entityAction.READ,
            )}
          >
            <a
              role="button"
              tabIndex="0"
              onClick={() => this.opreatOffer('edit', this.props.list.payload[index])}
            >
              <Icon type="edit" />
            </a>
          </If>
          <If
            condition={showElementByAuth(
              platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS,
              entityAction.CREATE,
            )}
          >
            <Divider type="vertical" />
            <a
              role="button"
              tabIndex="0"
              onClick={() => this.opreatOffer('copy', this.props.list.payload[index])}
            >
              <Icon type="copy" />
            </a>
          </If>
          <If
            condition={showElementByAuth(
              platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS,
              entityAction.DELETE,
            )}
          >
            <Divider type="vertical" />
            <Popconfirm
              overlayClassName="special-offer__delete-btn"
              title={this.props.t('cms.special_offer.column.delete_remind')}
              onConfirm={() => {
                this.props.deleteOffer({ id: record.key })
              }}
              placement="topRight"
              okText="Yes,delete"
              cancelText="Cancel"
              arrowPointAtCenter
            >
              <a href="javascirpt:;">
                <Icon type="delete" />
              </a>
            </Popconfirm>
          </If>
        </div>
      ),
    },
  ]

  render() {
    return (
      <div>
        <div className="table-header">
          <div className="table-header__container">
            <h1 className="table-header__heading">
              {this.props.t('cms.table.header.text.num_special_offers', {
                num: this.props.list.total,
              })}
            </h1>
            <If
              condition={showElementByAuth(
                platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS,
                entityAction.CREATE,
              )}
            >
              <div className="table-header__button-container">
                <Button onClick={() => this.opreatOffer('add', {})}>
                  <Icon type="plus" />
                  {this.props.t('cms.table.header.button.add_new_special_offer')}
                </Button>
              </div>
            </If>
          </div>
        </div>
        <div className="table-list__wrapper">
          <Table
            columns={this.showTableColumns()}
            className="table-list"
            dataSource={this.formatData()}
            scroll={{ x: '130%' }}
            pagination={{
              current: this.state.filters.pageNumber,
              pageSize: this.state.filters.pageSize,
              showSizeChanger: true,
              hideOnSinglePage: false,
              total: this.props.list.total,
            }}
            loading={this.props.communication.list.status === communicationStatus.FETCHING}
            onChange={this.handleTableChange}
          />
        </div>
      </div>
    )
  }
}

SpecialOffer.propTypes = {
  t: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  communication: PropTypes.shape({
    create: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
    update: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
    delete: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
    list: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  list: PropTypes.shape({
    payload: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
  }),
  getOfferList: PropTypes.func.isRequired,
  deleteOffer: PropTypes.func.isRequired,
  setOperatingOffer: PropTypes.func.isRequired,
}

SpecialOffer.defaultProps = {
  t: () => {},
  initialize: () => {},
  setOperatingOffer: () => {},
  communication: {
    create: {
      status: '',
    },
    update: {
      status: '',
    },
    delete: {
      status: '',
    },
    list: {
      status: '',
    },
  },
  location: {
    search: '',
  },
  history: {
    push: () => {},
  },
  list: {
    payload: [],
    total: 0,
  },
  deleteOffer: () => {},
  getOfferList: () => {},
}

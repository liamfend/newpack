import { Table, Icon, Divider, Button, Popconfirm } from 'antd'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import {
  communicationStatus,
  displayForm,
  operateType,
  platformEntity,
  entityAction,
} from '~constants'
import * as actions from '~actions/special-offer/offer-map'
import React from 'react'
import update from 'immutability-helper'
import { connect } from 'react-redux'
import formatListingShow from '~helpers/formatListing'
import showElementByAuth from '~helpers/auth'

const mapStateToProps = state => ({
  propertyList: state.dashboard.specialOfferMap.get('propertyList').toJS(),
  communication: state.dashboard.specialOfferMap.get('communication').toJS(),
})

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize())
  },
})

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
@withTranslation()
export default class PropertyList extends React.Component {
  opreatProperty = record => {
    let params = {
      search: record.property.name,
      selectProperty: record.property.id,
      unitType: record.property.unitTypes.edges
        ? this.formatUnitTypes(record.property.unitTypes)
        : record.property.unitTypes,
      listingIds: [],
      unitTypeIds: [],
    }

    params.unitType.forEach(unitTypeItem => {
      const listings = record.listing.filter(listItem => listItem.unitType.id === unitTypeItem.id)
      const listingIds = listings.map(item => item.id)
      if (listingIds.length > 0) {
        params = update(params, { listingIds: { $push: [listingIds] } })
        params = update(params, { unitTypeIds: { $push: [unitTypeItem.id] } })
      }
    })

    let unitTypes = record.unitType
    params.unitTypeIds.forEach(linkId => {
      unitTypes = record.unitType.filter(linkUnitTypeItem => linkUnitTypeItem.id !== linkId)
    })
    const unitTypeIds = unitTypes.map(item => item.id)
    params = update(params, { unitTypeIds: { $push: unitTypeIds } })
    this.props.changeAddPropertyShow(displayForm.modal, params)
  }

  onSubmit = () => {
    this.props.redirectToList()
  }

  addProperty = () => {
    const initialParams = {
      search: '',
      selectProperty: '',
      unitType: [],
      listingIds: [],
      unitTypeIds: [],
    }
    this.props.changeAddPropertyShow(displayForm.modal, initialParams)
  }

  formatUnitTypes = types =>
    types.edges.map(type => ({
      id: type.node.id,
      name: type.node.name,
      listings: type.node.listings,
      property: type.node.property,
    }))

  unlinkOffer = record => {
    let formedParams = {
      id: this.props.offerInfo.id,
      listingIds: [],
      unitTypeIds: [],
      propertyIds: [],
    }
    if (Object.prototype.toString.call(record.listing) === '[object String]') {
      if (record.listing) {
        formedParams = update(formedParams, { listingIds: { $set: [record.key] } })
      } else {
        formedParams = update(formedParams, { unitTypeIds: { $set: [record.key] } })
      }
    } else {
      const listingIds = record.listing.map(item => item.id) || []
      const unitTypeIds = []
      this.props.offerInfo.unitTypes.forEach(unitTypeItem => {
        record.unitType.forEach(item => {
          if (item.id === unitTypeItem.id) {
            unitTypeIds.push(item.id)
          }
        })
      })
      if (unitTypeIds.length > 0 || listingIds.length > 0) {
        formedParams = update(formedParams, { listingIds: { $set: listingIds } })
        formedParams = update(formedParams, { unitTypeIds: { $set: unitTypeIds } })
      } else {
        formedParams = update(formedParams, { propertyIds: { $set: record.key } })
      }
    }
    this.props.unLinkSpecialOffer(formedParams)
  }

  tableColumns = () => [
    {
      title: this.props.t('cms.special_offer.column.property'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: this.props.t('cms.special_offer.form.unit_type'),
      dataIndex: 'unitType',
      key: 'unitType',
      render: (text, record) => {
        if (Object.prototype.toString.call(text) === '[object String]') {
          return text
        }
        if (!text[0] && record.children.length !== 1) {
          return <span>-</span>
        }
        return (
          <div>
            <If condition={record.children.length === 1 && record.children[0].unitType}>
              <span>{record.children[0].unitType}</span>
            </If>
            <If condition={record.children.length > 1}>
              <span>{`${text.length} ${this.props.t('cms.special_offer.form.unit_types')}`}</span>
            </If>
          </div>
        )
      },
    },
    {
      title: this.props.t('cms.special_offer.form.listing'),
      dataIndex: 'listing',
      key: 'listing',
      render: (text, record) => {
        if (Object.prototype.toString.call(text) === '[object String]') {
          return text
        }
        if (text.length > 0) {
          return (
            <div>
              <If condition={record.children.length === 1 && text[0]}>
                <span>{formatListingShow(text[0])}</span>
              </If>
              <If condition={record.children.length !== 1}>
                <span>{`${text.length} ${this.props.t('cms.special_offer.form.listings')}`}</span>
              </If>
            </div>
          )
        }
        return <span>-</span>
      },
    },
    {
      title: this.props.t('cms.special_offer.column.actions'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 118,
      render: (text, record) => (
        <div>
          <If condition={Object.prototype.toString.call(record.listing) !== '[object String]'}>
            <a role="button" tabIndex="0" onClick={() => this.opreatProperty(record)}>
              <Icon type="edit" />
            </a>
            <Divider type="vertical" />
          </If>
          <Popconfirm
            overlayClassName="special-offer__delete-btn"
            title={this.props.t('cms.special_offer.map.property.delete_remind')}
            onConfirm={() => {
              this.unlinkOffer(record)
            }}
            placement="topRight"
            okText={this.props.t('cms.special_offer.map.property.delete_confirm')}
            cancelText={this.props.t('cms.special_offer.map.property.delete_cancel')}
            arrowPointAtCenter
          >
            <a href="javascirpt:;" className="special-offer__children-delete-btn">
              <Icon type="delete" />
            </a>
          </Popconfirm>
        </div>
      ),
    },
  ]

  formatRowData = () => {
    let data = []
    let allProperties = update([], { $set: this.props.offerInfo.properties })
    this.props.offerInfo.listings.forEach(listing => {
      const isHaveProperty = allProperties.find(
        property => listing.unitType.property.id === property.id,
      )
      if (!isHaveProperty) {
        allProperties = update(allProperties, { $push: [listing.unitType.property] })
      }
    })

    this.props.offerInfo.unitTypes.forEach(unitType => {
      const isHaveProperty = allProperties.find(property => unitType.property.id === property.id)
      if (!isHaveProperty) {
        allProperties = update(allProperties, { $push: [unitType.property] })
      }
    })
    allProperties.forEach((property, index) => {
      const linkUnitTypes = []
      const linkListings = []
      data = update(data, {
        [index]: {
          $set: {
            name: property.name,
            key: property.id,
            unitType: linkUnitTypes,
            listing: linkListings,
            property,
            children: [],
          },
        },
      })
      this.props.offerInfo.unitTypes.forEach(unitType => {
        if (unitType.property.id === property.id) {
          linkUnitTypes.push(unitType)
          data = update(data, {
            [index]: {
              children: {
                $push: [
                  {
                    key: unitType.id,
                    listing: '',
                    unitType: unitType.name,
                    name: property.name,
                  },
                ],
              },
            },
          })
        }
      })
      this.props.offerInfo.listings.forEach(listing => {
        if (listing.unitType.property.id === property.id) {
          linkListings.push(listing)
          data = update(data, {
            [index]: {
              children: {
                $push: [
                  {
                    key: listing.id,
                    listing: formatListingShow(listing),
                    unitType: listing.unitType.name,
                    name: property.name,
                  },
                ],
              },
            },
          })
        }
      })
      data = update(data, {
        [index]: {
          $merge: {
            unitType: linkUnitTypes,
            listing: linkListings,
          },
        },
      })
    })
    return data
  }

  render() {
    return (
      <div>
        <div className="special-offer__map-property-header">
          <Button onClick={this.addProperty}>
            <Icon type="plus" />
            {this.props.t('cms.table.header.button.add_new_property')}
          </Button>
        </div>
        <div className="table-list__wrapper">
          <Table
            columns={this.tableColumns()}
            className="table-list"
            dataSource={this.formatRowData()}
            pagination={false}
            indentSize={0}
            loading={this.props.communication.link.status === communicationStatus.FETCHING}
            onChange={this.handleTableChange}
          />
        </div>
        <If
          condition={
            this.props.operateType === operateType.edit &&
            showElementByAuth(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.UPDATE)
          }
        >
          <Button
            type="primary"
            className="create-offer-content__continue-btn"
            onClick={this.onSubmit}
          >
            {this.props.t('cms.sepcial_offer.submit.btn')}
          </Button>
        </If>
        <If
          condition={
            this.props.operateType === operateType.add &&
            showElementByAuth(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.CREATE)
          }
        >
          <Button
            type="primary"
            className="create-offer-content__continue-save-btn"
            onClick={this.props.goToNextStep}
          >
            {this.props.t('cms.sepcial_offer.save_continue.btn')}
          </Button>
        </If>
      </div>
    )
  }
}

PropertyList.propTypes = {
  t: PropTypes.func.isRequired,
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
    link: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
    unLink: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
  }),
  redirectToList: PropTypes.func.isRequired,
  operateType: PropTypes.string.isRequired,
  offerInfo: PropTypes.object.isRequired,
  changeAddPropertyShow: PropTypes.func.isRequired,
  unLinkSpecialOffer: PropTypes.func.isRequired,
  goToNextStep: PropTypes.func.isRequired,
}

PropertyList.defaultProps = {
  t: () => {},
  initialize: () => {},
  offerInfo: {},
  redirectToList: () => {},
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
    link: {
      status: '',
    },
    unLink: {
      status: '',
    },
  },
  history: {
    push: () => {},
  },
  operateType: '',
  deleteOffer: () => {},
  getOfferList: () => {},
  unLinkSpecialOffer: () => {},
  changeAddPropertyShow: () => {},
  goToNextStep: () => {},
}

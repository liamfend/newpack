import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import * as actions from '~actions/special-offer/offer-map'
import { withRouter } from 'react-router-dom'
import update from 'immutability-helper'
import { connect } from 'react-redux'
import { displayForm } from '~constants'
import { Card, Row, Col, Icon, Select, Button, Modal, Tooltip } from 'antd'
import formatListingShow from '~helpers/formatListing'
import LinkSelects from './link-selects'

const Option = Select.Option

const mapStateToProps = state => ({
  list: state.dashboard.specialOfferMap.get('list').toJS(),
  communication: state.dashboard.specialOfferMap.get('communication').toJS(),
})

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize())
  },
  searchResults: params => {
    dispatch(actions.searchProperties(params))
  },
  addProperty: params => {
    dispatch(actions.linkSpecialOffer(params))
  },
})

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
@withTranslation()
class AddProperty extends React.Component {
  constructor(props) {
    super(props)
    this.initialState = {
      search: '',
      selectProperty: '',
      unitType: [],
      listingIds: [],
      unitTypeIds: [],
    }
    this.state = props.initialParams ? props.initialParams : this.initialState
  }

  componentWillReceiveProps(newProps) {
    if (newProps.initialParams.selectProperty !== this.props.initialParams.selectProperty) {
      this.setState(update(this.state, { $merge: newProps.initialParams }))
    }
  }

  fetchProperty = value => {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(() => {
      this.props.searchResults(value)
    }, 300)
    this.setState({
      search: value,
    })
  }

  handleChange = value => {
    this.setState({
      search: value,
    })
  }

  handlePropertySelect = value => {
    const selectItem = this.props.list.payload.filter(item => {
      if (item.slug === value) {
        return item
      }
      return false
    })

    this.setState({
      selectProperty: selectItem[0].id,
      unitType: selectItem[0].unitTypes,
      unitTypeIds: [],
    })
  }

  handleListingSelect = (value, index) => {
    this.setState({
      listingIds: update(this.state.listingIds, { [index]: { $set: value } }),
    })
  }

  handleUnitTypeSelect = (value, index) => {
    this.setState({
      unitTypeIds: update(this.state.unitTypeIds, { [index]: { $set: value } }),
      listingIds: update(this.state.listingIds, { $splice: [[index, 1]] }),
    })
  }

  removeUnitType = index => {
    this.setState({
      unitTypeIds: update(this.state.unitTypeIds, { $splice: [[index, 1]] }),
      listingIds: update(this.state.listingIds, { $splice: [[index, 1]] }),
    })
  }

  onAddProperty = () => {
    if (this.isEdited()) {
      this.onEditProperty()
      return
    }
    const listingIds = this.state.listingIds.filter(d => d)
    const unitTypeIds = this.state.unitTypeIds.filter(
      (item, index) => !this.state.listingIds[index],
    )
    const params = {
      id: this.props.offerInfo.id,
      propertyIds: this.state.unitTypeIds.length === 0 ? [this.state.selectProperty] : null,
      unitTypeIds,
      listingIds:
        this.state.listingIds.length > 0 ? Array.prototype.concat.apply([], listingIds) : null,
    }
    this.props.addProperty(params)
    this.props.changeAddPropertyShow(displayForm.modal)
  }

  onEditProperty = () => {
    let newListingIds = this.state.listingIds.filter(d => d)
    newListingIds = Array.prototype.concat.apply([], newListingIds)
    const newUnitTypeIds = this.state.unitTypeIds.filter(
      (item, index) => !this.state.listingIds[index] || this.state.listingIds[index].length === 0,
    )
    let oldListingIds = this.props.initialParams.listingIds.filter(d => d)
    oldListingIds = Array.prototype.concat.apply([], oldListingIds)
    const oldUnitTypeIds = this.props.initialParams.unitTypeIds.filter(
      (item, index) =>
        !this.props.initialParams.listingIds[index] ||
        this.props.initialParams.listingIds[index].length === 0,
    )

    const linkListingIds = []
    const unLinkListingIds = []
    const linkUnitTypeIds = []
    const unLinkUnitTypeIds = []
    oldListingIds.forEach(o => {
      const equalCount = newListingIds.filter(n => n === o).length
      if (equalCount === 0) {
        unLinkListingIds.push(o)
      }
    })
    newListingIds.forEach(n => {
      const equalCount = oldListingIds.filter(o => n === o).length
      if (equalCount === 0) {
        linkListingIds.push(n)
      }
    })
    oldUnitTypeIds.forEach(o => {
      const equalCount = newUnitTypeIds.filter(n => n === o).length
      const isLinkedUnitType = this.props.offerInfo.unitTypes.find(n => n.id === o)
      if (equalCount === 0 && isLinkedUnitType) {
        unLinkUnitTypeIds.push(o)
      }
    })
    newUnitTypeIds.forEach(n => {
      const equalCount = oldUnitTypeIds.filter(o => n === o).length
      if (equalCount === 0) {
        linkUnitTypeIds.push(n)
      }
    })

    const linkParams = {
      id: this.props.offerInfo.id,
      propertyIds: this.state.unitTypeIds.length === 0 ? [this.state.selectProperty] : [],
      unitTypeIds: linkUnitTypeIds,
      listingIds: linkListingIds,
    }
    let unLinkPropertyIds = []
    if (linkUnitTypeIds.length > 0 || linkListingIds.length > 0) {
      const unLinkProperty = this.props.offerInfo.properties.find(
        o => o.id === this.state.selectProperty,
      )
      if (unLinkProperty) {
        unLinkPropertyIds = [unLinkProperty.id]
      }
    }
    const unLinkParams = {
      id: this.props.offerInfo.id,
      propertyIds: unLinkPropertyIds,
      unitTypeIds: unLinkUnitTypeIds,
      listingIds: unLinkListingIds,
    }

    if (
      linkUnitTypeIds.length > 0 ||
      linkListingIds.length > 0 ||
      this.state.unitTypeIds.length === 0
    ) {
      this.props.addProperty(linkParams)
    }

    if (
      unLinkUnitTypeIds.length > 0 ||
      unLinkListingIds.length > 0 ||
      unLinkPropertyIds.length > 0
    ) {
      this.props.unLinkSpecialOffer(unLinkParams)
    }

    this.props.changeAddPropertyShow(displayForm.modal)
  }

  isEdited = () => !!this.props.initialParams.selectProperty

  addUnitType = () => {
    const index = this.state.unitTypeIds.length
    const remainder = []
    this.state.unitType.forEach(item => {
      const count = this.state.unitTypeIds.filter(id => item.id !== id).length
      if (count === this.state.unitTypeIds.length) {
        remainder.push(item)
      }
    })
    if (remainder.length > 0) {
      this.handleUnitTypeSelect(remainder[0].id, index)
    }
  }

  renderUnitType = () => {
    const isDisabled = d => {
      const count = this.state.unitTypeIds.filter(id => d.id === id).length
      if (count !== 0) {
        return true
      }
      return false
    }

    const unitTypeComponents = this.state.unitTypeIds.map((item, index) => {
      const selectUnitItem = this.state.unitType.filter(unitItem => {
        if (unitItem.id === item) {
          return unitItem
        }
        return false
      })
      const listings = (selectUnitItem[0] && selectUnitItem[0].listings) || []
      const noListings = id => {
        const unitType = this.state.unitType.find(u => u.id === id)
        return unitType.listings.length === 0
      }
      return (
        <Row key={item} className="add-property__unit-type">
          <Col span={12}>
            <div
              className="add-property__unit-type-container"
              ref={node => {
                if (node) {
                  this.unitTypeSelector = node
                }
              }}
            >
              <Select
                showSearch
                className="add-property__select"
                defaultActiveFirstOption
                optionFilterProp="children"
                value={item}
                onSelect={value => {
                  this.handleUnitTypeSelect(value, index)
                }}
                getPopupContainer={() => this.unitTypeSelector || document.body}
              >
                <For each="d" of={this.state.unitType}>
                  <Option key={d.id} value={d.id} disabled={isDisabled(d)}>
                    {d.name}
                  </Option>
                </For>
              </Select>
            </div>
            <Icon
              type="minus-circle"
              className="add-property__icon"
              onClick={() => {
                this.removeUnitType(index)
              }}
            />
            <If condition={noListings(item)}>
              <Tooltip
                placement="rightTop"
                title={this.props.t('cms.special_offer.map.no_listing')}
              >
                <Icon className="add-property__icon-red" type="warning" />
              </Tooltip>
            </If>
          </Col>
          <If
            condition={
              (listings.length === 1 && listings[0].type !== 'PLACEHOLDER') || listings.length > 1
            }
          >
            <Col span={12}>
              <div
                className="add-property__listing-container"
                ref={node => {
                  if (node) {
                    this.listingSelector = node
                  }
                }}
              >
                <Select
                  showSearch
                  className="add-property__select-large"
                  mode="multiple"
                  dropdownClassName="add-property__drop-down"
                  value={this.state.listingIds[index]}
                  optionFilterProp="children"
                  onChange={value => {
                    this.handleListingSelect(value, index)
                  }}
                  getPopupContainer={() => this.listingSelector || document.body}
                >
                  {listings.map(d => {
                    if (d.type === 'PLACEHOLDER') {
                      return false
                    }

                    return (
                      <Option key={d.id} className="add-property__option">
                        {formatListingShow(d)}
                      </Option>
                    )
                  })}
                </Select>
              </div>
            </Col>
          </If>
        </Row>
      )
    })
    return unitTypeComponents
  }

  formRender = children => {
    if (this.props.displayForm === displayForm.modal) {
      return (
        <Modal
          okText={
            this.isEdited()
              ? this.props.t('cms.sepcial_offer.edit.btn')
              : this.props.t('cms.sepcial_offer.add.btn')
          }
          title={
            this.isEdited()
              ? this.props.t('cms.table.header.button.edit_property')
              : this.props.t('cms.table.header.button.add_new_property')
          }
          visible={this.props.addPropertyShow}
          onOk={this.onAddProperty}
          onCancel={() => this.props.changeAddPropertyShow(displayForm.modal)}
          className="add-property__modal"
        >
          {children}
        </Modal>
      )
    }
    return (
      <div>
        <Card className="create-offer__card">{children}</Card>
        <Button
          disabled={!this.state.selectProperty}
          type="primary"
          className="create-offer-content__continue-btn"
          onClick={this.onAddProperty}
        >
          {this.props.t('cms.sepcial_offer.add.btn')}
        </Button>
      </div>
    )
  }

  render() {
    return this.formRender(
      <div>
        <LinkSelects
          isEdited={this.isEdited()}
          t={this.props.t}
          search={this.state.search}
          status={this.props.communication.list.status}
          fetchProperty={this.fetchProperty}
          handleChange={this.handleChange}
          handlePropertySelect={this.handlePropertySelect}
          options={this.props.list.payload}
          addUnitType={this.addUnitType}
          renderUnitType={this.renderUnitType}
          unitTypes={this.state.unitType}
        />
      </div>,
    )
  }
}

export default AddProperty
AddProperty.propTypes = {
  t: PropTypes.func.isRequired,
  searchResults: PropTypes.func.isRequired,
  list: PropTypes.array.isRequired,
  offerInfo: PropTypes.object.isRequired,
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
    propertyList: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
  }),
  addProperty: PropTypes.func.isRequired,
  changeAddPropertyShow: PropTypes.func.isRequired,
  displayForm: PropTypes.string.isRequired,
  addPropertyShow: PropTypes.bool.isRequired,
  unLinkSpecialOffer: PropTypes.func.isRequired,
  initialParams: PropTypes.shape({
    search: PropTypes.string,
    selectProperty: PropTypes.string,
    unitType: PropTypes.array,
    listingIds: PropTypes.array,
    unitTypeIds: PropTypes.array,
  }),
}

AddProperty.defaultProps = {
  t: () => {},
  offerInfo: {},
  searchResults: () => {},
  list: [],
  addProperty: () => {},
  unLinkSpecialOffer: () => {},
  communication: {},
  initialParams: {
    search: '',
    searchProperty: '',
    unitType: [],
    listingIds: [],
    unitTypeIds: [],
  },
  changeAddPropertyShow: () => {},
  displayForm: '',
}

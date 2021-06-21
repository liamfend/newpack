import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { message, Radio, Tooltip } from 'antd'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { mapType, operateType, displayForm, communicationStatus } from '~constants'
import * as actions from '~actions/special-offer/offer-map'
import AddProperty from './add-property'
import PropertyList from './property-list'
import AddCity from './add-city'

const mapStateToProps = state => ({
  communication: state.dashboard.specialOfferMap.get('communication').toJS(),
})
const mapDispatchToProps = dispatch => ({
  unLinkSpecialOffer: params => {
    dispatch(actions.unLinkSpecialOffer(params))
  },
  linkSpecialOffer: params => {
    dispatch(actions.linkSpecialOffer(params))
  },
})

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
@withTranslation()
export default class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addPropertyShow: false,
      displayForm: displayForm.modal,
      offerMapType:
        this.props.offerInfo.cities && this.props.offerInfo.cities.length > 0
          ? mapType.city
          : mapType.property,
      initialParams: {
        search: '',
        selectProperty: '',
        unitType: [],
        listingIds: [],
        unitTypeIds: [],
      },
    }
  }

  componentWillMount() {
    if (this.props.operateType === operateType.add) {
      this.setState({
        displayForm: displayForm.page,
        addPropertyShow: true,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.operationChecker(nextProps, 'link', this.props.t('cms.message.offers.linked_success'))
    this.operationChecker(nextProps, 'unlink', this.props.t('cms.message.offers.unlinked_success'))
  }

  handleTypeChange = e => {
    this.setState({
      offerMapType: e.target.value,
    })
  }

  operationChecker = (nextProps, type, messages) => {
    if (this.props.communication[type].status === communicationStatus.FETCHING) {
      if (nextProps.communication[type].status === communicationStatus.IDLE) {
        message.success(messages, 3)
      } else if (nextProps.communication[type].status !== communicationStatus.FETCHING) {
        message.error(this.props.t('cms.message.error'), 3)
      }
    }
  }

  changeAddPropertyShow = (displayFormValue, initialParams) => {
    this.setState({
      addPropertyShow: !this.state.addPropertyShow,
      displayForm: displayFormValue,
      initialParams,
    })
  }

  render() {
    const { offerInfo } = this.props
    const cityDisable =
      (offerInfo.properties && offerInfo.properties.length > 0) ||
      (offerInfo.unitTypes && offerInfo.unitTypes.length > 0) ||
      (offerInfo.listings && offerInfo.listings.length > 0)
    const propertyDisable = offerInfo.cities && offerInfo.cities.length > 0
    return (
      <div className="special-offer__map">
        <Radio.Group
          onChange={this.handleTypeChange}
          value={this.state.offerMapType}
          className="special-offer__map-group"
        >
          <Tooltip
            placement="top"
            title={propertyDisable && this.props.t('cms.special_offer.map.property.tooltip')}
          >
            <Radio.Button disabled={propertyDisable} value={mapType.property}>
              {this.props.t('cms.special_offer.map.property.radio_btn')}
            </Radio.Button>
          </Tooltip>
          <Tooltip
            placement="right"
            title={cityDisable && this.props.t('cms.special_offer.map.property.tooltip')}
          >
            <Radio.Button disabled={cityDisable} value={mapType.city}>
              {this.props.t('cms.special_offer.map.city.radio_btn')}
            </Radio.Button>
          </Tooltip>
        </Radio.Group>
        <If condition={this.state.offerMapType === mapType.property}>
          <AddProperty
            offerInfo={offerInfo}
            addPropertyShow={this.state.addPropertyShow}
            changeAddPropertyShow={this.changeAddPropertyShow}
            initialParams={this.state.initialParams}
            unLinkSpecialOffer={this.props.unLinkSpecialOffer}
            displayForm={this.state.displayForm}
          />
        </If>
        <If
          condition={
            this.state.offerMapType === mapType.property &&
            this.state.displayForm !== displayForm.page
          }
        >
          <PropertyList
            offerInfo={offerInfo}
            unLinkSpecialOffer={this.props.unLinkSpecialOffer}
            goToNextStep={this.props.goToNextStep}
            operateType={this.props.operateType}
            redirectToList={this.props.redirectToList}
            changeAddPropertyShow={this.changeAddPropertyShow}
          />
        </If>
        <If condition={this.state.offerMapType === mapType.city}>
          <AddCity
            unLinkSpecialOffer={this.props.unLinkSpecialOffer}
            offerInfo={offerInfo}
            operateType={this.props.operateType}
            redirectToList={this.props.redirectToList}
            goToNextStep={this.props.goToNextStep}
            linkSpecialOffer={this.props.linkSpecialOffer}
          />
        </If>
      </div>
    )
  }
}

Map.propTypes = {
  offerInfo: PropTypes.object.isRequired,
  goToNextStep: PropTypes.func.isRequired,
  redirectToList: PropTypes.func,
  unLinkSpecialOffer: PropTypes.func.isRequired,
  linkSpecialOffer: PropTypes.func.isRequired,
  operateType: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  communication: PropTypes.shape({
    link: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
    unlink: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
  }),
}

Map.defaultProps = {
  offerInfo: {},
  operateType: '',
  t: () => {},
  redirectToList: () => {},
  unLinkSpecialOffer: () => {},
  linkSpecialOffer: () => {},
  goToNextStep: () => {},
  communication: {
    link: {
      status: '',
    },
    unlink: {
      status: '',
    },
  },
}

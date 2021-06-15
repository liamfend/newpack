import React from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { operateType } from '~constants'
import { Card, Icon, message, Tag, Tooltip, Button } from 'antd'
import SearchCity from './search'

@withRouter
@withTranslation()
export default class AddCity extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
      newCityIds: [],
      inputVisible: false,
    }
  }

  handleClose = (e, value) => {
    e.preventDefault()
    this.props.unLinkSpecialOffer({
      id: this.props.offerInfo.id,
      cityIds: [value],
    })
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => {
      if (this.inputRef && this.inputRef.rcSelect && this.inputRef.rcSelect.inputRef) {
        this.inputRef.rcSelect.focus()
        this.inputRef.rcSelect.inputRef.focus()
      }
    })
  }

  onSubmit = () => {
    this.props.redirectToList()
  }

  handleCitySelect = value => {
    if (!value) {
      setTimeout(
        this.setState({
          inputVisible: false,
        }),
        100,
      )
      return
    }
    const cities = this.props.offerInfo.cities
    const cityIds = cities.map(city => city.id)
    if (value && cityIds.indexOf(value) === -1) {
      this.setState({
        inputVisible: false,
      })
      this.props.linkSpecialOffer({
        id: this.props.offerInfo.id,
        cityIds: [value],
      })
    } else {
      message.error(this.props.t('cms.message.error'))
      // to do more error message...
    }
  }

  render() {
    return (
      <div>
        <Card
          className="special-offer__map-city"
          type="inner"
          title={this.props.t('cms.table.header.city_name')}
        >
          <div>
            {this.props.offerInfo.cities.map(city => {
              const tagElem = (
                <Tag
                  key={city.id}
                  closable
                  className="special-offer__map-tag"
                  onClose={e => {
                    this.handleClose(e, city.id)
                  }}
                >
                  {city.name}
                </Tag>
              )
              return <Tooltip key={city.id}>{tagElem}</Tooltip>
            })}
            <If condition={this.state.inputVisible}>
              <SearchCity
                saveRef={e => {
                  this.inputRef = e
                }}
                searchType="city"
                onSelect={this.handleCitySelect}
              />
            </If>
            <If condition={!this.state.inputVisible}>
              <Tag onClick={this.showInput} className="special-offer__map-add-btn">
                <Icon type="plus" />
                {this.props.t('cms.sepcial_offer.add_city.btn')}
              </Tag>
            </If>
          </div>
        </Card>
        <If condition={this.props.operateType === operateType.add}>
          <Button
            disabled={this.props.offerInfo.cities.length === 0}
            type="primary"
            className="create-offer-content__continue-save-btn"
            onClick={this.props.goToNextStep}
          >
            {this.props.t('cms.sepcial_offer.save_continue.btn')}
          </Button>
        </If>
        <If condition={this.props.operateType === operateType.edit}>
          <Button
            type="primary"
            className="create-offer-content__continue-btn"
            onClick={this.onSubmit}
          >
            {this.props.t('cms.sepcial_offer.submit.btn')}
          </Button>
        </If>
      </div>
    )
  }
}

AddCity.propTypes = {
  offerInfo: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  linkSpecialOffer: PropTypes.func.isRequired,
  unLinkSpecialOffer: PropTypes.func.isRequired,
  goToNextStep: PropTypes.func.isRequired,
  redirectToList: PropTypes.func,
  operateType: PropTypes.string.isRequired,
}

AddCity.defaultProps = {
  offerInfo: {},
  t: () => {},
  linkSpecialOffer: () => {},
  unLinkSpecialOffer: () => {},
  goToNextStep: () => {},
  redirectToList: () => {},
}

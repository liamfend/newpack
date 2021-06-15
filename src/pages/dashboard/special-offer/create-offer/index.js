import React from 'react'
import PropTypes from 'prop-types'
import { Steps, Icon, message } from 'antd'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  addStatus,
  operateType,
  communicationStatus,
  platformEntity,
  entityAction,
} from '~constants'
import Content from '~components/special-offer/content'
import Map from '~components/special-offer/map'
import Admin from '~components/special-offer/admin'
import * as actions from '~actions/special-offer/offer-list'
import generatePath from '~settings/routing'
import authControl from '~components/auth-control'

const Step = Steps.Step
const mapDispatchToProps = dispatch => ({
  getOfferList: filters => {
    dispatch(actions.getOfferList(filters))
  },
  createSpecialOffer: params => {
    dispatch(actions.createSpecialOffer(params))
  },
  updateSpecialOffer: params => {
    dispatch(actions.updateSpecialOffer(params))
  },
})

const mapStateToProps = state => ({
  operatingOffer: state.dashboard.specialOfferList.get('operatingOffer')?.toJS(),
  communication: state.dashboard.specialOfferList.get('communication')?.toJS(),
})

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
@withTranslation()
@authControl(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.CREATE)
export default class CreateOffer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      operateType: addStatus.content,
      isBack: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    this.operationChecker(
      nextProps,
      'update',
      this.props.t('cms.message.special_offer.created_success'),
    )
    this.operationChecker(nextProps, 'create')
  }

  operationChecker = (nextProps, type, messages) => {
    if (this.props.communication[type].status === communicationStatus.FETCHING) {
      if (nextProps.communication[type].status === communicationStatus.IDLE) {
        if (this.state.operateType === addStatus.content) {
          this.goToNextStep()
          return
        }
        if (type === 'update' && this.state.operateType === addStatus.admin) {
          message.success(messages, 3)
          this.redirectToList()
        }
      } else if (nextProps.communication[type].status !== communicationStatus.FETCHING) {
        message.error(this.props.t('cms.message.error'), 3)
      }
    }
  }

  redirectToList = () => {
    const url = generatePath('specialOffer')
    this.props.history.push(url)
  }

  goToPreviousStep = () => {
    if (this.state.operateType !== addStatus.map) {
      this.setState({
        operateType: addStatus.map,
        isBack: addStatus.admin,
      })
    } else {
      this.setState({
        operateType: addStatus.content,
      })
    }
  }

  goToNextStep = () => {
    if (this.state.operateType !== addStatus.map) {
      this.setState({
        operateType: addStatus.map,
        isBack: '',
      })
    } else {
      this.setState({
        operateType: addStatus.admin,
        isBack: '',
      })
    }
  }

  render() {
    return (
      <div>
        <div className="create-offer__header">
          <If condition={this.state.operateType === addStatus.map}>
            <div
              role="button"
              tabIndex={0}
              onClick={this.goToPreviousStep}
              className="create-offer__back-btn"
            >
              <Icon type="left" />
              {this.props.t('cms.special_offer.create.back_to_content')}
            </div>
          </If>
          <If condition={this.state.operateType === addStatus.admin}>
            <div
              role="button"
              tabIndex={0}
              onClick={this.goToPreviousStep}
              className="create-offer__back-btn"
            >
              <Icon type="left" />
              {this.props.t('cms.special_offer.create.back_to_map')}
            </div>
          </If>
          <Steps className="create-offer__dot" current={this.state.operateType} progressDot>
            <Step title={this.props.t('cms.special_offer.create.state.content')} />
            <Step title={this.props.t('cms.special_offer.create.state.map')} />
            <Step title={this.props.t('cms.special_offer.create.state.admin')} />
          </Steps>
        </div>
        <If condition={this.state.operateType === addStatus.content}>
          <Content
            offerInfo={this.props.operatingOffer}
            createSpecialOffer={this.props.createSpecialOffer}
            operateType={operateType.add}
            isBack={this.state.isBack}
            updateSpecialOffer={this.props.updateSpecialOffer}
          />
        </If>
        <If condition={this.state.operateType === addStatus.map}>
          <Map
            offerInfo={this.props.operatingOffer}
            operateType={operateType.add}
            goToNextStep={this.goToNextStep}
          />
        </If>
        <If condition={this.state.operateType === addStatus.admin}>
          <Admin
            offerInfo={this.props.operatingOffer}
            operateType={operateType.add}
            updateSpecialOffer={this.props.updateSpecialOffer}
            isCreateOffer
          />
        </If>
      </div>
    )
  }
}

CreateOffer.propTypes = {
  t: PropTypes.func.isRequired,
  operatingOffer: PropTypes.func.isRequired,
  createSpecialOffer: PropTypes.func.isRequired,
  updateSpecialOffer: PropTypes.func.isRequired,
  communication: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
}

CreateOffer.defaultProps = {
  t: () => {},
  communication: {},
  history: {
    push: () => {},
  },
  operatingOffer: () => {},
  createSpecialOffer: () => {},
  updateSpecialOffer: () => {},
}

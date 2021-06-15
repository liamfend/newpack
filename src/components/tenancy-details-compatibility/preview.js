import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Tooltip } from 'antd'
import handleTenancy from '~helpers/tenancy-preview'
import { Arrow as ArrowIcon } from '~components/svgs'

export default class TenancyDetailsPreview extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      moveInDesc: null,
      moveOutDesc: null,
      tenancyDesc: null,
    }

    this.listingDateTypes = {
      EXACTLY_MATCH: 'EXACTLY_MATCH',
      AFTER: 'AFTER',
      BEFORE: 'BEFORE',
      ANYTIME: 'ANYTIME',
      // tenancy types
      EQUALS: 'EQUALS',
      NO_LESS_THAN: 'NO_LESS_THAN',
      NO_MORE_THAN: 'NO_MORE_THAN',
      NO_SPECIFIC: 'NO_SPECIFIC',
      BETWEEN: 'BETWEEN',
    }
  }

  componentDidMount() {
    this.isShowLogic()
  }

  componentWillReceiveProps() {
    this.isShowLogic()
  }

  isShowLogic = () => {
    this.setState(this.state, () => {
      const {
        moveIn,
        moveOut,
        moveInType,
        moveOutType,
        billingCycle,
        tenancyType,
        tenancyValueMin,
        tenancyValueMax,
      } = this.props
      const tenancy = handleTenancy(
        moveIn,
        moveOut,
        moveInType,
        moveOutType,
        billingCycle,
        tenancyType,
        tenancyValueMin,
        tenancyValueMax,
      )

      this.setState({
        moveInDesc: tenancy.moveIn,
        moveOutDesc: tenancy.moveOut,
        tenancyDesc: tenancy.stay,
      })
    })
  }

  render() {
    const { moveInDesc, moveOutDesc, tenancyDesc } = this.state
    return (
      <div className="tenancy-details-preview">
        <div className="tenancy-details-preview__view-on-student-com">
          <Tooltip
            title={() => (
              <div>
                <If condition={!this.props.showPlaceHolder}>
                  <If condition={!moveInDesc && !moveOutDesc && !tenancyDesc}>
                    <div className="listing-model__line">
                      {this.props.t('cms.listing.edit.tenancy_preview.tooltip_preview', {
                        moveInDate: '--',
                        moveOutDate: '--',
                      })}
                    </div>
                  </If>
                  <div className="listing-model">
                    <div className="listing-model__line">
                      <If condition={this.state.moveInDesc}>
                        <span className="listing-model__desc listing-model__move-in-desc">
                          {`${this.props.t('cms.listing.edit.tenancy_preview.move_in')} ${
                            this.state.moveInDesc
                          }`}
                        </span>
                      </If>
                      <If condition={this.state.moveInDesc && this.state.moveOutDesc}>
                        <ArrowIcon className="listing-model__desc listing-model__common" />
                      </If>
                      <If condition={this.state.moveOutDesc}>
                        <span className="listing-model__desc listing-model__move-out-desc">
                          {`${this.props.t('cms.listing.edit.tenancy_preview.move_out')} ${
                            this.state.moveOutDesc
                          }`}
                        </span>
                      </If>
                    </div>
                    <If condition={this.state.tenancyDesc}>
                      <span className="listing-model__desc listing-model__tenancy-desc">
                        {this.state.tenancyDesc}
                      </span>
                    </If>
                  </div>
                </If>
                <If condition={this.props.showPlaceHolder}>
                  <p className="tenancy-details-preview__preview-content">
                    {this.props.t('cms.listing.edit.tenancy_preview.tooltip_preview_place_holder')}
                  </p>
                </If>
              </div>
            )}
            getPopupContainer={() => this.previewTooltip}
            overlayClassName="tenancy-details-preview__tooltip"
          >
            <p
              className="tenancy-details-preview__view-on-student-com-content"
              ref={node => {
                this.previewTooltip = node
              }}
            >
              {this.props.t('cms.listing.edit.tenancy_preview.view_on_student_com')}
              <Icon
                type="eye"
                style={{
                  color: '#38b2a6',
                  paddingLeft: '2px',
                  height: '11px',
                }}
              />
            </p>
          </Tooltip>
        </div>

        <div className="tenancy-details-preview__container">
          <div className="tenancy-details-preview__desc tenancy-details-preview__move-in-desc">
            <p className="tenancy-details-preview__desc-label">
              {this.props.t('cms.listing.edit.tenancy_preview.move_in')}
            </p>
            <p className="tenancy-details-preview__desc-content tenancy-details-preview__desc-content--move-in">
              {this.state.moveInDesc || '--'}
            </p>
          </div>
          <div className="tenancy-details-preview__desc tenancy-details-preview__tenancy-desc">
            <p className="tenancy-details-preview__desc-label">
              {this.props.t('cms.listing.edit.tenancy_preview.stay')}
            </p>
            <p className="tenancy-details-preview__desc-content tenancy-details-preview__desc-content--tenancy">
              {this.state.tenancyDesc || '--'}
            </p>
          </div>
          <div className="tenancy-details-preview__desc tenancy-details-preview__move-out-desc">
            <p className="tenancy-details-preview__desc-label">
              {this.props.t('cms.listing.edit.tenancy_preview.move_out')}
            </p>
            <p className="tenancy-details-preview__desc-content tenancy-details-preview__desc-content--move-out">
              {this.state.moveOutDesc || '--'}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

TenancyDetailsPreview.propTypes = {
  t: PropTypes.func.isRequired,
  moveIn: PropTypes.any,
  moveOut: PropTypes.any,
  tenancyValueMin: PropTypes.number,
  tenancyValueMax: PropTypes.number,
  tenancyType: PropTypes.oneOf([
    'EQUALS',
    'NO_LESS_THAN',
    'NO_MORE_THAN',
    'BETWEEN',
    'NOT_SPECIFIC',
    '',
  ]),
  moveInType: PropTypes.oneOf(['EXACTLY_MATCH', 'AFTER', 'ANYTIME', '']),
  moveOutType: PropTypes.oneOf(['EXACTLY_MATCH', 'BEFORE', 'ANYTIME', '']),
  billingCycle: PropTypes.string,
  showPlaceHolder: PropTypes.bool,
}

TenancyDetailsPreview.defaultProps = {
  moveIn: null,
  moveOut: null,
  tenancyValueMin: 0,
  tenancyValueMax: 0,
  moveInType: '',
  moveOutType: '',
  tenancyType: '',
  showPlaceHolder: false,
  billingCycle: 'weeks',
}

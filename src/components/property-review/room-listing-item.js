import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import moment from 'moment'
import { Table, Icon, Popover } from 'antd'
import { updateMutation } from '~client/constants'
import handleTenancy from '~helpers/tenancy-preview'
import formatPrice from '~helpers/currency'
import Svg from '~components/svg'

export default class RoomListingReviewItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showListing: props.isChangedVersion,
      showDetail: false,
    }
    this.listColumns = [
      {
        title: props.t('cms.properties.edit.review_modal.room.tenancy'),
        key: 'tenancy',
        render: this.renderTenancy,
      },
      {
        title: `${props.t('cms.properties.edit.review_modal.room.stay')}`,
        key: 'stay',
        render: this.renderStay,
      },
      {
        title: `${props.t('cms.properties.edit.review_modal.room.price')}(${this.props.t(
          `cms.listing.billing_cycle.per_${
            props.property.billingCycle ? props.property.billingCycle.toLowerCase() : 'weekly'
          }`,
        )})`,
        key: 'price',
        render: this.renderPrice,
      },
      {
        title: props.t('cms.properties.edit.review_modal.room.availability'),
        key: 'availability',
        render: this.renderAvailability,
      },
      {
        title: '',
        key: 'other',
        className: 'room-review__listing__other-container',
        render: this.renderOther,
      },
    ]
  }

  renderTenancy = (text, record) => {
    const tenancy = handleTenancy(
      record.moveIn,
      record.moveOut,
      record.moveInType,
      record.moveOutType,
      this.props.property.billingCycle,
      null,
      null,
      null,
    )
    return (
      <div
        className={classNames('room-review__tenancy', {
          'room-review__deleted':
            this.props.isChangedVersion && record.action === updateMutation.DELETE,
        })}
      >
        <p className="room-review__tenancy--move-in">{`Move in: ${tenancy.moveIn || '--'}`}</p>
        <p className="room-review__tenancy--move-out">{`Move out: ${tenancy.moveOut || '--'}`}</p>

        <If condition={this.props.isChangedVersion && record.action === updateMutation.INSERT}>
          <span className="room-review__new-label">
            {this.props.t('cms.properties.edit.review_modal.new-label')}
          </span>
        </If>
      </div>
    )
  }

  renderStay = (text, record) => {
    let tenancyLengthValueMin
    let tenancyLengthValueMax
    if (record.tenancyLengthValue && isNaN(Number(record.tenancyLengthValue))) {
      const tenancyLengthList = record.tenancyLengthValue.split('-')
      let min
      let max
      if (Array.isArray(tenancyLengthList) && tenancyLengthList.length === 2) {
        ;[min, max] = tenancyLengthList
      } else {
        ;[min, max] = record.tenancyLengthValue.split('_')
      }
      ;[tenancyLengthValueMin, tenancyLengthValueMax] = [Number(min), Number(max)]
    } else if (record.tenancyLengthValue) {
      tenancyLengthValueMin = Number(record.tenancyLengthValue)
    }

    const tenancy = handleTenancy(
      record.moveIn,
      record.moveOut,
      record.moveInType,
      record.moveOutType,
      this.props.property.billingCycle,
      record.tenancyLengthType,
      tenancyLengthValueMin,
      tenancyLengthValueMax,
    )
    return <span className={classNames('room-review__listing__stay')}>{tenancy.stay || '--'}</span>
  }

  renderPrice = (text, record) => {
    let currentPrice = record.priceMin
    if (record.priceMin && record.discountValue && record.discountType === 'ABSOLUTE') {
      currentPrice = record.priceMin - record.discountValue
    } else if (record.priceMin && record.discountValue && record.discountType === 'PERCENTAGE') {
      // eslint-disable-next-line  no-mixed-operators
      currentPrice = (record.priceMin * (100 - record.discountValue)) / 100
    }
    return (
      <div className={classNames('room-review__listing__price')}>
        <span className="room-review__listing__price-min">
          {formatPrice(currentPrice, this.props.property.currency) || '--'}
        </span>
        <If condition={record.discountType !== 'NO_DISCOUNT'}>
          <span className="room-review__listing__price-max">
            {formatPrice(record.priceMin, this.props.property.currency)}
          </span>
        </If>
      </div>
    )
  }

  renderAvailability = (text, record) => (
    <div>
      <If condition={record.type !== 'PLACEHOLDER'}>
        <span
          className={classNames('room-review__listing__availability', {
            'room-review__listing__availability--good': record.availability === 'GOOD',
            'room-review__listing__availability--limited': record.availability === 'LIMITED',
          })}
        >
          {this.props.t(
            `cms.table.value.availability.${
              record.availability && record.availability.toLowerCase()
            }`,
          )}
        </span>
      </If>
      <If condition={record.type === 'PLACEHOLDER'}>
        <p className="room-review__listing__place-holder">
          {this.props.t('cms.listing.modal.place_holder.label')}
        </p>
      </If>
    </div>
  )

  renderOther = (text, record) => (
    <Popover content={this.renderListingDetail(record)}>
      <Icon type="more" rotate={90} className="room-review__listing__more" />
    </Popover>
  )

  renderListingDetail = listing => (
    <div className="room-review__listing-detail">
      <div className="room-review__listing-detail__name">
        {this.props.t('cms.properties.edit.review_modal.listing.label.live_time')}
      </div>
      <div className="room-review__listing-detail__content">
        {`${moment(listing.liveOn).format('ll')} - ${moment(listing.liveUntil).format('ll')}`}
      </div>
      <div className="room-review__listing-detail__name">
        {this.props.t('cms.form.label.auto_price')}
      </div>
      <div className="room-review__listing-detail__content">
        {listing.autoPriceAllowed ? 'Yes' : 'No'}
      </div>
      <div className="room-review__listing-detail__name">
        {this.props.t('cms.form.label.auto_availability')}
      </div>
      <div className="room-review__listing-detail__content">
        {listing.autoAvailAllowed ? 'Yes' : 'No'}
      </div>
    </div>
  )

  renderDetail = () => {
    const { t, room, isChangedVersion } = this.props
    return (
      <For index="topicIndex" each="topic" of={room.roomDetails}>
        <div className="room-review__detail__topic" key={topicIndex}>
          <div className="room-review__detail__topic-name">
            {t(`cms.properties.edit.rooms.${topic.name}`)}
          </div>
          <Choose>
            <When condition={isChangedVersion && (!topic.value || topic.value.length === 0)}>
              <div className="room-review__detail__no-change">
                {t('cms.properties.edit.review_modal.room.no_chenged')}
              </div>
            </When>
            <When condition={topic.name === 'facilities'}>
              <div className="room-review__detail__field-facility">
                {topic.value ? topic.value : '-'}
              </div>
            </When>
            <Otherwise>
              <For index="index" each="field" of={topic.value}>
                <div
                  className={classNames('room-review__detail__field', {
                    'room-review__detail__field--line': field.key === 'unitTypeBedSizes',
                  })}
                  key={index}
                >
                  <div className="room-review__detail__field-name">{field.fieldName}</div>
                  <div className="room-review__detail__field-text">
                    {field.text ? field.text : '-'}
                  </div>
                </div>
              </For>
            </Otherwise>
          </Choose>
        </div>
      </For>
    )
  }

  toogleListing = () => {
    this.setState({ showListing: !this.state.showListing })
  }

  toogleDetail = () => {
    this.state.showDetail = !this.state.showDetail
    this.setState(this.state)
    if (this.state.showDetail) {
      document.addEventListener('click', this.checkToHideDetail)
    } else {
      document.removeEventListener('click', this.checkToHideDetail)
    }
  }

  isDescendant = (parent, child) => {
    let node = child
    while (node != null) {
      if (node === parent) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  checkToHideDetail = e => {
    if (
      e &&
      e.target &&
      !this.isDescendant(this.roomRef, e.target) &&
      !this.isDescendant(this.detailRef, e.target)
    ) {
      this.toogleDetail()
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.checkToHideDetail)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isChangedVersion !== this.props.isChangedVersion) {
      this.setState({ showListing: nextProps.isChangedVersion })
    }
  }

  render() {
    const { showListing, showDetail } = this.state
    const { room, t, isChangedVersion } = this.props
    return (
      <div className="room-review__item">
        <div
          className="room-review__item__room"
          ref={roomItem => {
            this.roomRef = roomItem
          }}
        >
          <div className="room-review__item__icon-wrapper">
            <If condition={room.listings && room.listings.length > 0}>
              <Svg
                attributes={{ onClick: this.toogleListing }}
                className="room-review__item__icon"
                hash={showListing ? 'icon-minus' : 'icon-plus'}
              />
            </If>
          </div>
          <If condition={isChangedVersion && room.action === updateMutation.INSERT}>
            <span className="room-review__new-room-label">
              {t('cms.properties.edit.review_modal.new-label')}
            </span>
          </If>
          <div className="room-review__item__text">
            <span
              className={classNames('room-review__item__name', {
                'room-review__deleted':
                  this.props.isChangedVersion && room.action === updateMutation.DELETE,
              })}
            >
              {room.name}
            </span>
            <span className="room-review__item__category">
              {room.category ? t(`cms.table.value.category.${room.category.toLowerCase()}`) : ''}
            </span>
          </div>
          <If condition={!(isChangedVersion && room.action === updateMutation.DELETE)}>
            <span
              className="room-review__item__detail"
              onClick={this.toogleDetail}
              role="presentation"
            >
              {t(
                `cms.properties.edit.review_modal.room.${
                  showDetail ? 'hide_detail' : 'more_detail'
                }`,
              )}
            </span>
          </If>
        </div>
        <If condition={showListing && room.listings && room.listings.length > 0}>
          <div className="room-review__listing">
            <Table
              columns={this.listColumns}
              dataSource={
                isChangedVersion ? room.listings.filter(item => item.action) : room.listings
              }
              rowClassName={record =>
                isChangedVersion && record.action === updateMutation.DELETE
                  ? 'room-review__delete-row'
                  : ''
              }
              pagination={false}
              rowKey="id"
            />
          </div>
        </If>
        <If condition={showDetail}>
          <div
            className="room-review__detail"
            ref={roomDetail => {
              this.detailRef = roomDetail
            }}
          >
            {this.renderDetail()}
          </div>
        </If>
      </div>
    )
  }
}

RoomListingReviewItem.propTypes = {
  t: PropTypes.func.isRequired,
  isChangedVersion: PropTypes.bool,
  room: PropTypes.object,
  property: PropTypes.object.isRequired,
}

RoomListingReviewItem.defaultProps = {
  t: () => {},
  isChangedVersion: false,
  room: {},
}

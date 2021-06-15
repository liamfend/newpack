import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Select, DatePicker, InputNumber, Form, Row, Col } from 'antd'
import TenancyDetailsPreview from '~components/tenancy-details-compatibility/preview'

const Option = Select.Option

export default class TenancyDetailsCompatibility extends React.Component {
  constructor(props) {
    super(props)
    this.billingCycleRange = props.billingCycle === 'WEEKLY' ? 7 : 14
    this.state = {
      moveOutDateRange: {
        startValue: null,
        endValue: null,
      },
    }
  }

  handleMoveInSelectChange = value => {
    if (value === 'ANYTIME') {
      this.props.form.resetFields(['moveIn', 'moveOut', 'moveOutType'])
    }
    this.handleCalculateMoveOutDateRange('moveInType', value)
  }

  handleMoveInDatePicker = date => {
    this.handleCalculateMoveOutDateRange('moveIn', date)
  }

  handleTenancyLengthSelectChange = value => {
    if (value === 'NOT_SPECIFIC') {
      this.props.form.resetFields(['tenancyLengthValueMin', 'tenancyLengthValueMax'])
    }
    this.handleCalculateMoveOutDateRange('tenancyLengthType', value)
    this.setState(this.state)
  }

  handleTenancyLengthMinInputChange = value => {
    this.handleCalculateMoveOutDateRange('tenancyLengthValueMin', value)
  }

  handleTenancyLengthMaxInputChange = value => {
    this.handleCalculateMoveOutDateRange('tenancyLengthValueMax', value)
    this.props.form.validateFields(['tenancyLengthValueMin'])
  }

  handleCalculateMoveOutDateRange = (type, value) => {
    let moveInType = this.props.form.getFieldValue('moveInType')
    let moveIn = this.props.form.getFieldValue('moveIn')
    let tenancyLengthType = this.props.form.getFieldValue('tenancyLengthType')
    let tenancyLengthValueMin = this.props.form.getFieldValue('tenancyLengthValueMin')
    let tenancyLengthValueMax = this.props.form.getFieldValue('tenancyLengthValueMax')
    const resetFields = ['moveOut']

    switch (type) {
      case 'moveInType':
        moveInType = value
        resetFields.push('moveOutType', 'tenancyLengthType')
        break
      case 'moveIn':
        moveIn = value
        break
      case 'tenancyLengthType':
        tenancyLengthType = value
        resetFields.push('moveOutType')
        break
      case 'tenancyLengthValueMin':
        tenancyLengthValueMin = value
        break
      case 'tenancyLengthValueMax':
        tenancyLengthValueMax = value
        break
      default:
        break
    }

    if (moveInType === 'ANYTIME') {
      moveIn = moment()
    }

    if (
      !moveIn ||
      !tenancyLengthValueMin ||
      !moveInType ||
      !tenancyLengthType ||
      tenancyLengthValueMin === 0 ||
      (tenancyLengthType === 'BETWEEN' && !tenancyLengthValueMax)
    ) {
      this.props.form.resetFields(resetFields)
      return true
    }

    if (moveInType === 'ANYTIME') {
      resetFields.push('moveIn')
    }
    if (tenancyLengthType !== 'BETWEEN') {
      resetFields.push('tenancyLengthValueMax')
    }

    this.props.form.resetFields(resetFields)

    switch (moveInType) {
      case 'EXACTLY_MATCH':
        if (tenancyLengthType === 'EQUALS') {
          this.setMoveInExactlyMatchEqual(moveIn, tenancyLengthValueMin)
        }
        if (tenancyLengthType === 'NO_LESS_THAN') {
          this.setMoveInExactlyMatchBigger(moveIn, tenancyLengthValueMin)
        }
        if (tenancyLengthType === 'NO_MORE_THAN') {
          this.setMoveInExactlyMatchSmaller(moveIn, tenancyLengthValueMin)
        }
        if (tenancyLengthType === 'BETWEEN') {
          this.setMoveInExactlyMatchBetween(moveIn, tenancyLengthValueMax)
        }
        if (tenancyLengthType === 'NOT_SPECIFIC') {
          this.setMoveInAfterSmaller(moveIn)
        }
        break
      case 'AFTER':
        if (['NO_LESS_THAN', 'EQUALS'].indexOf(tenancyLengthType) !== -1) {
          this.setMoveInExactlyMatchBigger(moveIn, tenancyLengthValueMin)
        }
        if (tenancyLengthType === 'NOT_SPECIFIC') {
          this.setMoveInAfterSmaller(moveIn)
        }
        if (tenancyLengthType === 'NO_MORE_THAN') {
          this.setMoveInAfterNoMoreThen(moveIn, tenancyLengthValueMin)
        }
        if (tenancyLengthType === 'BETWEEN') {
          this.setMoveInAfterBetween(moveIn, tenancyLengthValueMax)
        }
        break
      case 'ANYTIME':
        if (['NO_LESS_THAN', 'EQUALS'].indexOf(tenancyLengthType) !== -1) {
          this.setMoveInExactlyMatchBigger(moment(), tenancyLengthValueMin)
        }
        if (tenancyLengthType === 'NOT_SPECIFIC') {
          this.setMoveInAfterSmaller(moment())
        }
        if (tenancyLengthType === 'NO_MORE_THAN') {
          this.setMoveInAnytimeNoMoreThen()
        }
        if (tenancyLengthType === 'BETWEEN') {
          this.setMoveInAnytimeBetween(tenancyLengthValueMax)
        }
        break
      default:
        break
    }

    return true
  }

  // if range start date before current, then set start date equals curent day
  setMoveOutDateRange(startValue, endValue) {
    this.state.moveOutDateRange.startValue = null
    this.state.moveOutDateRange.endValue = null

    if (startValue) {
      const currentDay = moment().add(1, 'days')
      this.state.moveOutDateRange.startValue = startValue
      if (currentDay.isAfter(this.state.moveOutDateRange.startValue)) {
        this.state.moveOutDateRange.startValue = currentDay
      }
    }
    if (endValue) {
      this.state.moveOutDateRange.endValue = endValue
    }
  }

  // this.state.moveOutDateRange = {
  //   startValue: 'a+b-7',
  //   endValue: 'a+b+7',
  // }
  setMoveInExactlyMatchEqual = (moveIn, tenancyLengthValue) => {
    const moveOut = moment(moveIn).add(this.getTenancyLengthToDays(tenancyLengthValue), 'days')
    this.props.form.setFieldsValue({
      moveOutType: 'EXACTLY_MATCH',
      moveOut,
    })

    this.props.form.validateFields(['moveOut'])

    this.setMoveOutDateRange(
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) - this.billingCycleRange,
        'days',
      ),
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) + this.billingCycleRange,
        'days',
      ),
    )
  }

  // this.state.moveOutDateRange = {
  //   startValue: 'a+b-7',
  //   endValue: 'null',
  // }
  setMoveInExactlyMatchBigger = (moveIn, tenancyLengthValue) => {
    this.setMoveOutDateRange(
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) - this.billingCycleRange,
        'days',
      ),
    )
  }

  // this.state.moveOutDateRange = {
  //   startValue: 'a+b-7',
  //   endValue: 'a+b+7',
  // }
  setMoveInExactlyMatchSmaller = (moveIn, tenancyLengthValue) => {
    this.setMoveOutDateRange(
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) - this.billingCycleRange,
        'days',
      ),
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) + this.billingCycleRange,
        'days',
      ),
    )
  }

  // this.state.moveOutDateRange = {
  //   startValue: 'a',
  //   endValue: 'null',
  // }
  setMoveInAfterSmaller = moveIn => {
    this.setMoveOutDateRange(moveIn)
  }

  // this.setMoveInAfterNoMoreThen = {
  //   startValue: 'a+b-7',
  //   endValue: 'null',
  // }
  setMoveInAfterNoMoreThen = (moveIn, tenancyLengthValue) => {
    this.setMoveOutDateRange(
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) - this.billingCycleRange,
        'days',
      ),
    )
  }

  // this.setMoveInAfterBetween = {
  //   startValue: 'a+b'-7',
  //   endValue: 'null',
  // }
  setMoveInAfterBetween = (moveIn, tenancyLengthValue) => {
    this.setMoveOutDateRange(
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValue) - this.billingCycleRange,
        'days',
      ),
    )
  }

  // this.setMoveInAnytimeNoMoreThen = {
  //   startValue: '-7',
  //   endValue: 'null',
  // }
  setMoveInAnytimeNoMoreThen = () => {
    this.setMoveOutDateRange(moment().add(-this.billingCycleRange, 'days'))
  }

  // this.setMoveInAnytimeBetween = {
  //   startValue: 'b'-7',
  //   endValue: 'null',
  // }
  setMoveInAnytimeBetween = tenancyLengthValue => {
    this.setMoveOutDateRange(
      moment().add(
        this.getTenancyLengthToDays(tenancyLengthValue) - this.billingCycleRange,
        'days',
      ),
    )
  }

  // this.state.moveOutDateRange = {
  //   startValue: 'a + b' - 7d',
  //   endValue: 'a + b' + 7d',
  // }
  setMoveInExactlyMatchBetween = (moveIn, tenancyLengthValueMax) => {
    this.setMoveOutDateRange(
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValueMax) - this.billingCycleRange,
        'days',
      ),
      moment(moveIn).add(
        this.getTenancyLengthToDays(tenancyLengthValueMax) + this.billingCycleRange,
        'days',
      ),
    )
  }

  // get move out disable date range
  getMoveOutRange = value => {
    if (!value) {
      return false
    }
    if (this.state.moveOutDateRange.startValue && this.state.moveOutDateRange.endValue) {
      return (
        this.state.moveOutDateRange.startValue.valueOf() > value.valueOf() ||
        this.state.moveOutDateRange.endValue.valueOf() < value.valueOf()
      )
    } else if (this.state.moveOutDateRange.startValue) {
      return this.state.moveOutDateRange.startValue.valueOf() > value.valueOf()
    } else if (this.state.moveOutDateRange.endValue) {
      return this.state.moveOutDateRange.endValue.valueOf() > value.valueOf()
    }

    return false
  }

  getTenancyLengthToDays = tenancyLengthValue => {
    let days = 0
    switch (this.props.billingCycle) {
      case 'MONTHLY':
        days = tenancyLengthValue * 28
        break
      default:
        days = tenancyLengthValue * 7
    }

    return days
  }

  getMoveInDateContainer = () => this.moveInDateContainer

  handleMoveOutSelectChange = value => {
    if (value === 'ANYTIME') {
      this.props.form.resetFields('moveOut')
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <div className="listing-modal__tenancy-details-container">
        <h4 className="listing-modal__title isting-modal__title--tenancy-details">
          {this.props.t('cms.listing.modal.tenancy_details.title')}
        </h4>
        <div className="listing-modal__tenancy-details-input-container">
          {/* Move in */}
          <div className="listing-modal__move-in-container">
            <label className="listing-modal__label listing-modal__label--move-in listing-modal__label--required">
              {this.props.t('cms.listing.modal.move_in.label')}
            </label>
            <div className="listing-modal__move-in-input-container">
              <Row gutter={9}>
                <Col span={8}>
                  <Form.Item className="listing-modal__type">
                    <div
                      className="listing-modal__move-in-type-container"
                      ref={node => {
                        this.moveInTypeContainer = node
                      }}
                    >
                      {getFieldDecorator('moveInType', {
                        rules: [
                          {
                            required: !this.props.showPlaceHolder,
                            message: this.props.t(
                              'cms.listing.modal.error_message.date_range_required',
                            ),
                          },
                        ],
                      })(
                        <Select
                          style={{ width: '100%', height: '32px', borderRadius: '2px' }}
                          onSelect={this.handleMoveInSelectChange}
                          getPopupContainer={() => this.moveInTypeContainer}
                          disabled={this.props.showPlaceHolder}
                          placeholder={this.props.t(
                            'cms.listing.modal.tenancy_details.place_holder',
                          )}
                        >
                          <Option key="EXACTLY_MATCH" value="EXACTLY_MATCH">
                            {this.props.t('cms.listing.modal.move_in.options.exactly_match')}
                          </Option>
                          <Option key="AFTER" value="AFTER">
                            {this.props.t('cms.listing.modal.move_in.options.after')}
                          </Option>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item className="listing-modal__date">
                    <div
                      className="listing-modal__move-in-date-container"
                      ref={node => {
                        this.moveInDateContainer = node
                      }}
                    >
                      {getFieldDecorator('moveIn', {
                        rules: [
                          {
                            required:
                              !this.props.showPlaceHolder &&
                              this.props.form.getFieldValue('moveInType') !== 'ANYTIME',
                            message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                          },
                        ],
                      })(
                        <DatePicker
                          style={{ width: '100%', height: '32px', borderRadius: '2px' }}
                          format="ll"
                          onChange={this.handleMoveInDatePicker}
                          getCalendarContainer={() => this.moveInDateContainer}
                          disabled={
                            this.props.form.getFieldValue('moveInType') === 'ANYTIME' ||
                            this.props.showPlaceHolder
                          }
                        />,
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Tenancy length */}
          <div className="listing-modal__tenancy-length-container">
            <label className="listing-modal__label listing-modal__label--tenancy-length listing-modal__label--required">
              {this.props.t('cms.listing.modal.tenancy_length.label')}
              <span className="listing-modal__label-billing-cycle">
                {' '}
                (
                {this.props.t(
                  `cms.listing.billing_cycle.per_${
                    this.props.billingCycle ? this.props.billingCycle.toLowerCase() : 'weekly'
                  }`,
                )}
                )
              </span>
            </label>
            <div className="listing-modal__tenancy-length-input-container">
              <Row gutter={9}>
                <Col span={8}>
                  <Form.Item className="listing-modal__type">
                    <div
                      className="listing-modal__tenancy-length-type-container"
                      ref={node => {
                        this.tenancyLengthTypeContainer = node
                      }}
                    >
                      {getFieldDecorator('tenancyLengthType', {
                        rules: [
                          {
                            required:
                              !this.props.showPlaceHolder &&
                              this.props.form.getFieldValue('moveInType'),
                            message: this.props.t(
                              'cms.listing.modal.error_message.date_range_required',
                            ),
                          },
                        ],
                      })(
                        <Select
                          style={{ height: '32px', borderRadius: '2px' }}
                          onSelect={this.handleTenancyLengthSelectChange}
                          placeholder={this.props.t(
                            'cms.listing.modal.tenancy_details.place_holder',
                          )}
                          getPopupContainer={() => this.tenancyLengthTypeContainer}
                          disabled={this.props.showPlaceHolder}
                        >
                          <Option
                            key="EQUALS"
                            value="EQUALS"
                            disabled={this.props.form.getFieldValue('moveInType') === 'AFTER'}
                          >
                            {this.props.t('cms.listing.modal.tenancy_length.options.equals')}
                          </Option>
                          <Option key="NO_LESS_THAN" value="NO_LESS_THAN">
                            {this.props.t('cms.listing.modal.tenancy_length.options.no_less_than')}
                          </Option>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Row gutter={1}>
                    <Col span={11}>
                      <Form.Item className="listing-modal__type listing-modal__type--tenancy-length-input">
                        {getFieldDecorator('tenancyLengthValueMin', {
                          rules: [
                            {
                              required:
                                !this.props.showPlaceHolder &&
                                this.props.form.getFieldValue('moveInType') &&
                                this.props.form.getFieldValue('tenancyLengthType') !==
                                  'NOT_SPECIFIC',
                              message: this.props.t(
                                'cms.listing.modal.error_message.valid_range_required',
                              ),
                            },
                          ],
                        })(
                          <InputNumber
                            min={1}
                            onChange={this.handleTenancyLengthMinInputChange}
                            precision={0}
                            disabled={
                              this.props.showPlaceHolder ||
                              this.props.form.getFieldValue('tenancyLengthType') === 'NOT_SPECIFIC'
                            }
                          />,
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <div className="listing-modal__type listing-modal__type--tilde">—</div>
                    </Col>
                    <Col span={11}>
                      <Form.Item className="listing-modal__type listing-modal__type--tenancy-length-input">
                        {getFieldDecorator('tenancyLengthValueMax', {
                          rules: [
                            {
                              required:
                                this.props.form.getFieldValue('tenancyLengthType') === 'BETWEEN' &&
                                !this.props.showPlaceHolder &&
                                this.props.form.getFieldValue('moveInType'),
                              message: this.props.t(
                                'cms.listing.modal.error_message.valid_range_required',
                              ),
                            },
                          ],
                        })(
                          <InputNumber
                            onChange={this.handleTenancyLengthMaxInputChange}
                            disabled={
                              this.props.form.getFieldValue('tenancyLengthType') !== 'BETWEEN' ||
                              this.props.showPlaceHolder ||
                              this.props.form.getFieldValue('tenancyLengthType') === 'NOT_SPECIFIC'
                            }
                            min={
                              this.props.form.getFieldValue('tenancyLengthValueMin')
                                ? this.props.form.getFieldValue('tenancyLengthValueMin') + 1
                                : 2
                            }
                            precision={0}
                          />,
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>

          {/* Move out */}
          <div className="listing-modal__move-out-container">
            <label className="listing-modal__label listing-modal__label--move-out listing-modal__label--required">
              {this.props.t('cms.listing.modal.move_out.label')}
            </label>
            <div className="listing-modal__move-out-input-container">
              <Row gutter={9}>
                <Col span={8}>
                  <Form.Item className="listing-modal__type">
                    <div
                      className="listing-modal__move-out-type-container"
                      ref={node => {
                        this.moveOutTypeContainer = node
                      }}
                    >
                      {getFieldDecorator('moveOutType', {
                        rules: [
                          {
                            required:
                              !this.props.showPlaceHolder &&
                              this.props.form.getFieldValue('moveInType'),
                            message: this.props.t(
                              'cms.listing.modal.error_message.date_range_required',
                            ),
                          },
                        ],
                      })(
                        <Select
                          style={{ height: '32px', borderRadius: '2px' }}
                          onSelect={this.handleMoveOutSelectChange}
                          getPopupContainer={() => this.moveOutTypeContainer}
                          placeholder={this.props.t(
                            'cms.listing.modal.tenancy_details.place_holder',
                          )}
                          disabled={
                            this.props.showPlaceHolder ||
                            !this.props.form.getFieldValue('moveInType') ||
                            !this.props.form.getFieldValue('tenancyLengthType')
                          }
                        >
                          <Option
                            key="EXACTLY_MATCH"
                            value="EXACTLY_MATCH"
                            disabled={
                              this.props.form.getFieldValue('moveInType') !== 'EXACTLY_MATCH' ||
                              this.props.form.getFieldValue('tenancyLengthType') !== 'EQUALS'
                            }
                          >
                            {this.props.t('cms.listing.modal.move_in.options.exactly_match')}
                          </Option>
                          <Option
                            key="BEFORE"
                            value="BEFORE"
                            disabled={
                              this.props.form.getFieldValue('moveInType') === 'EXACTLY_MATCH'
                            }
                          >
                            {this.props.t('cms.listing.modal.move_out.options.before')}
                          </Option>
                          <Option
                            key="ANYTIME"
                            value="ANYTIME"
                            disabled={
                              this.props.form.getFieldValue('moveInType') === 'EXACTLY_MATCH' &&
                              this.props.form.getFieldValue('tenancyLengthType') === 'EQUALS'
                            }
                          >
                            {this.props.t('cms.listing.modal.move_in.options.anytime')}
                          </Option>
                        </Select>,
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item className="listing-modal__date listing-modal__col-65">
                    <div
                      className="listing-modal__move-out-date-container"
                      ref={node => {
                        this.moveOutDateContainer = node
                      }}
                    >
                      {getFieldDecorator('moveOut', {
                        rules: [
                          {
                            required:
                              !this.props.showPlaceHolder &&
                              this.props.form.getFieldValue('moveOutType') !== 'ANYTIME' &&
                              this.props.form.getFieldValue('moveInType'),
                            message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                          },
                          {
                            message: this.props.t(
                              'cms.listing.modal.error_message.move_out_after_current_date',
                            ),
                            validator: (rule, value, callback) => {
                              if (
                                moment().isAfter(value) &&
                                !this.props.form.getFieldValue('placeHolder')
                              ) {
                                callback('error')
                              }
                              callback()
                            },
                          },
                        ],
                      })(
                        <DatePicker
                          style={{ width: '100%', height: '32px', borderRadius: '2px' }}
                          getCalendarContainer={() => this.moveOutDateContainer}
                          format="ll"
                          showToday={false}
                          defaultPickerValue={this.state.moveOutDateRange.startValue}
                          disabledDate={value => this.getMoveOutRange(value)}
                          disabled={
                            this.props.form.getFieldValue('moveOutType') === 'ANYTIME' ||
                            this.props.showPlaceHolder ||
                            !this.props.form.getFieldValue('moveInType') ||
                            !this.props.form.getFieldValue('tenancyLengthType')
                          }
                        />,
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          <TenancyDetailsPreview
            t={this.props.t}
            moveIn={this.props.form.getFieldValue('moveIn')}
            moveOut={this.props.form.getFieldValue('moveOut')}
            tenancyValueMin={this.props.form.getFieldValue('tenancyLengthValueMin')}
            tenancyValueMax={this.props.form.getFieldValue('tenancyLengthValueMax')}
            moveInType={this.props.form.getFieldValue('moveInType')}
            moveOutType={this.props.form.getFieldValue('moveOutType')}
            tenancyType={this.props.form.getFieldValue('tenancyLengthType')}
            billingCycle={this.props.billingCycle}
            showPlaceHolder={this.props.showPlaceHolder}
          />
        </div>
      </div>
    )
  }
}

TenancyDetailsCompatibility.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.shape({
    validateFields: PropTypes.func.isRequired,
    resetFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
  }).isRequired,
  billingCycle: PropTypes.string.isRequired,
  showPlaceHolder: PropTypes.bool,
}

TenancyDetailsCompatibility.defaultProps = {
  t: () => {},
  showPlaceHolder: false,
}

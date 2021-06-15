import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Tag } from 'antd'

export default class OthersFacilities extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      facilities: props.facilitiesList,
      value: '',
      errMessage: null,
    }
    this.tagLengthLimit = 40
  }

  handleClose = (e, facility) => {
    e.preventDefault()
    if (this.state.facilities.indexOf(facility) !== -1) {
      const newState = this.state.facilities.filter(tag => tag !== facility)
      this.setState({ facilities: newState }, () => {
        this.props.onChange(this.state.facilities)
      })
    }
  }

  getValue = () => this.state.facilities

  componentDidMount() {
    this.othersFacilitiesInput.addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        if (
          this.state.facilities.indexOf(this.state.value) === -1 &&
          this.othersFacilitiesInput.value.trim() !== '' &&
          !/[\u4e00-\u9fa5]+/.test(this.state.value) &&
          this.state.value.length <= this.tagLengthLimit
        ) {
          this.state.facilities.push(this.state.value)
          this.state.value = ''
          this.setState(this.state, () => {
            this.props.onChange(this.state.facilities)
          })
        } else if (
          this.state.value.trim() !== '' &&
          /[\u4e00-\u9fa5]+/.test(this.othersFacilitiesInput.value)
        ) {
          this.state.value = ''
          this.setState(this.state)
        }
      }
    })

    this.othersFacilitiesInput.addEventListener('keydown', e => {
      if (this.state.value === '' && e.keyCode === 8) {
        this.state.facilities.splice(-1, 1)
        this.setState(this.state, () => {
          this.props.onChange(this.state.facilities)
        })
      }
    })

    this.othersFacilitiesContainer.addEventListener('click', () => {
      this.othersFacilitiesInput.focus()
    })
  }

  showFacilityLabel = facility => {
    const label = this.props.findPropertyFacilityBySlug(facility, 'others')
      ? this.props.findPropertyFacilityBySlug(facility, 'others').label
      : facility

    return label.length > this.tagLengthLimit ? `${label.slice(0, this.tagLengthLimit)}...` : label
  }

  handleInputChange = e => {
    this.state.value = e.target.value
    this.setState(this.state)
  }

  render() {
    const { countLimit } = this.props
    const isInputError = this.state.value.length > this.tagLengthLimit
    return (
      <div>
        <div
          className={classNames('others-facilities', { 'bothers-facilities--error': isInputError })}
          ref={node => {
            this.othersFacilitiesContainer = node
          }}
        >
          <div className="others-facilities__container">
            <For each="facility" of={this.state.facilities}>
              <Tag key={facility} closable onClose={event => this.handleClose(event, facility)}>
                {this.showFacilityLabel(facility)}
              </Tag>
            </For>
            <input
              className="others-facilities__input"
              ref={node => {
                this.othersFacilitiesInput = node
              }}
              placeholder="Please input additional facilities here"
              value={this.state.value}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        <div>
          <span className="others-facilities__error-msg">
            {isInputError
              ? this.props.t('cms.properties.edit.facilities.other.length_limit_error')
              : ''}
          </span>
          <span
            className={classNames('others-facilities__counter', {
              'others-facilities__counter--red': this.state.facilities.length > countLimit,
            })}
          >
            {`${this.state.facilities.length}/${countLimit}`}
          </span>
        </div>
      </div>
    )
  }
}

OthersFacilities.propTypes = {
  facilitiesList: PropTypes.array.isRequired,
  findPropertyFacilityBySlug: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  t: PropTypes.func.isRequired,
  countLimit: PropTypes.number.isRequired,
}

OthersFacilities.defaultProps = {
  onChange: () => {},
}

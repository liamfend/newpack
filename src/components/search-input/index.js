import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon } from 'antd'
import AutocompleteInput from '~components/search-input/autocomplete-input'

export default class SearchInput extends React.Component {
  constructor() {
    super()
    this.state = {
      showAddressSearch: false,
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.bindSearchBlur)
  }

  componentWillMount() {
    document.removeEventListener('click', this.bindSearchBlur)
  }

  handleInputChange = value => {
    this.setState({
      inputValue: value,
    })
  }

  bindSearchBlur = e => {
    if (
      this.state.showAddressSearch &&
      this.searchContainer &&
      !this.searchContainer.contains(e.target) &&
      !this.state.inputValue
    ) {
      this.setState({ showAddressSearch: false })
    }
  }

  handleSearchExpand = () => {
    if (!this.state.showAddressSearch) {
      this.setState({ showAddressSearch: true })
    }
  }

  handleSelect = e => {
    this.props.onChange(e)
    this.setState({
      showAddressSearch: false,
    })
  }

  render() {
    const { t } = this.props
    return (
      <div
        className={classNames('search-input', {
          'search-input--expand': this.state.showAddressSearch,
        })}
        onClick={this.handleSearchExpand}
        role="presentation"
        ref={node => {
          this.searchContainer = node
        }}
      >
        <div
          className={classNames('search-input__icon-container', {
            'search-input__icon-container--expand': this.state.showAddressSearch,
          })}
        >
          <Icon
            type="search"
            className={classNames('search-input__icon', {
              'search-input__icon--expand': this.state.showAddressSearch,
            })}
            style={{ fontSize: '16px' }}
          />
          <AutocompleteInput
            onSelect={this.handleSelect}
            onChange={this.handleInputChange}
            t={t}
            type="address"
            inputProps={{
              placeholder: t('cms.properties.create.property_address.search_address'),
            }}
          />
        </div>
        <span className="search-input__icon-text">
          {t('cms.properties.create.property_address.search_address')}
        </span>
      </div>
    )
  }
}

SearchInput.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

SearchInput.defaultProps = {
  t: () => {},
  onChange: () => {},
}

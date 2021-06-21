import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import cookies from 'js-cookie'
import { AutoComplete, message, Button, Input, Icon } from 'antd'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'
import { cookieNames } from '~constants'
import { getItem } from '~base/global/helpers/storage'

export default class TableColumnSearch extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      results: [],
      value: props.valueData || '',
      searchShow: true,
    }

    this.timeout = null
  }

  componentDidMount() {
    if (this.props.valueData) {
      this.handleSearch(this.props.valueData)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.valueData !== this.props.valueData) {
      this.setState({ value: nextProps.valueData || '' })
    }
  }

  getValue = () => this.state.value || ''

  handleSelect = value => {
    if (this.props.isLocaitonCustom) {
      const search = this.state.results
        ? this.state.results.find(result => result.id === value)
        : {}
      this.props.onSearch(search.slug, search, this.props.searchType)
      if (this.props.showCountry) {
        this.setState(
          Object.assign({}, this.state, {
            value: search.slug ? `${search.name}, ${search.countryName}` : '',
          }),
        )
      } else {
        this.setState(
          Object.assign({}, this.state, {
            value: search.name ? search.name : '',
          }),
        )
      }
      if (this.props.basicType === 'basicCity') {
        this.props.changeCurrencyState(true, search)
      }
    } else {
      const decodedValue = window.atob(value)
      const valueId = JSON.parse(decodedValue).id
      this.props.onSearch(valueId, decodedValue)
      this.setState(
        Object.assign({}, this.state, {
          value,
        }),
      )
    }
  }

  handleInput = e => {
    this.setState(
      Object.assign({}, this.state, {
        value: e.target.value,
      }),
    )
  }

  handleSearch = value => {
    this.setState({ value })
    if (this.props.saveSearchValue) {
      this.props.saveSearchValue(value, this.props.searchType)
    }

    if (this.props.resetValue) {
      this.props.resetValue(this.props.searchType)
    }

    if (!value) {
      this.props.changeCurrencyState(false)
    }

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    if (!value) {
      this.setState(
        Object.assign({}, this.state, {
          value: '',
        }),
      )
      return
    }

    if (this.state.results && this.isIdOneOfSIds(value)) {
      return
    }

    this.timeout = setTimeout(() => {
      const authorization = `Bearer ${cookies.get(cookieNames.token)}`
      const headers = {
        Authorization: authorization,
        'Accept-Language': 'en-us',
      }

      const authPayload = getItem('PMS_CURRENT_USER_AUTH')
      if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
        headers['Current-Role'] = authPayload.payload.currentRoleSlug
      }
      axios({
        method: 'post',
        url: endpoints.search.url(this.props.searchType),
        data: queries.search(
          { query: value, publishedStatus: this.props.publishedStatus },
          this.props.searchType,
        ),
        headers,
      })
        .then(response => {
          if (!response.data.errors) {
            if (
              !response.data.data.search.edges.length &&
              response.data.data.search.edges.length === 0
            ) {
              this.setState(
                Object.assign({}, this.state, {
                  results: null,
                }),
              )
              return
            }

            if (this.props.searchType === 'landlord') {
              this.setState(
                Object.assign({}, this.state, {
                  results: response.data.data.search.edges.map(item => ({
                    slug: item.node.slug,
                    name: item.node.name,
                    id: item.node.id,
                    published: true,
                  })),
                }),
              )
            } else if (this.props.searchType === 'city') {
              this.setState(
                Object.assign({}, this.state, {
                  results: response.data.data.search.edges.map(item => ({
                    slug: item.node.slug,
                    name: item.node.name,
                    id: item.node.id,
                    countryName: item.node.country ? item.node.country.name : null,
                    published: item.node.published,
                    currency: item.node.country.currencyCode,
                    billingCycle: item.node.country.billingCycle,
                  })),
                }),
              )
            } else {
              this.setState(
                Object.assign({}, this.state, {
                  results: response.data.data.search.edges.map(item => ({
                    slug: item.node.slug,
                    name: item.node.name,
                    id: item.node.id,
                    countryName: item.node.country ? item.node.country.name : null,
                    published: item.node.published,
                  })),
                }),
              )
            }
          } else {
            message.error(this.props.t('cms.message.error'))
          }
        })
        .catch(() => {
          message.error(this.props.t('cms.message.error'))
        })
    }, 300)
  }

  isIdOneOfSIds = value => this.state.results.find(result => result.id === value)

  makeFilterDisapper = () => {
    this.setState({
      searchShow: false,
    })
  }

  render() {
    return (
      <div className="table-list__columns-dropdown">
        <If condition={this.props.searchType}>
          <AutoComplete
            disabled={this.props.disabled}
            value={this.state.value}
            allowClear={this.props.allowClear}
            autoFocus={!this.props.isLocaitonCustom}
            onChange={this.handleSearch}
            onSelect={this.handleSelect}
            defaultValue={this.props.valueData}
            placeholder={this.props.placeholder}
            optionLabelProp="option"
            suffix={<Icon type="search" />}
            getPopupContainer={this.props.parrentNode ? () => this.props.parrentNode : null}
          >
            <If condition={this.state.results === null}>
              <AutoComplete.Option key="noResult">
                <span className="autocomplete__primary-text">
                  {this.props.t('cms.message.auto_complete.no_result')}
                </span>
              </AutoComplete.Option>
            </If>
            <If condition={this.state.results}>
              <For each="item" of={this.state.results}>
                <AutoComplete.Option key={item.id} option={item.name}>
                  {item.name}
                  <If condition={this.props.showCountry && item.countryName}>
                    <span className="table-list__country-name">{item.countryName}</span>
                  </If>
                  <If condition={this.props.showCountry && !item.published}>
                    <span className="table-list__unpublished">
                      ({this.props.t('cms.location.review.btn.unpublish')})
                    </span>
                  </If>
                </AutoComplete.Option>
              </For>
            </If>
          </AutoComplete>
        </If>
        <If condition={!this.props.searchType}>
          <Input
            defaultValue={this.props.valueData}
            placeholder={this.props.placeholder}
            className="table-list__columns-dropdown--auto-complete"
            onChange={this.handleInput}
          />
          <Button
            onClick={() => {
              this.props.onSearch(this.state.value)
            }}
            type="primary"
            className="table-list__columns-dropdown--custom-search"
          >
            {this.props.t('cms.table.column.search.confirm')}
          </Button>
        </If>
      </div>
    )
  }
}

TableColumnSearch.propTypes = {
  placeholder: PropTypes.string,
  searchType: PropTypes.string,
  valueData: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSearch: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isLocaitonCustom: PropTypes.bool,
  showCountry: PropTypes.bool,
  basicType: PropTypes.string,
  changeCurrencyState: PropTypes.func.isRequired,
  resetValue: PropTypes.func,
  saveSearchValue: PropTypes.func,
  parrentNode: PropTypes.object,
  disabled: PropTypes.bool,
  allowClear: PropTypes.bool,
  publishedStatus: PropTypes.string,
}

TableColumnSearch.defaultProps = {
  placeholder: '',
  searchType: '',
  valueData: '',
  onSearch: () => {},
  t: () => {},
  isLocaitonCustom: false,
  showCountry: false,
  changeCurrencyState: () => {},
  basicType: '',
  resetValue: () => {},
  saveSearchValue: () => {},
  parrentNode: null,
  disabled: false,
  allowClear: true,
  publishedStatus: 'ALL',
}

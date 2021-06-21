import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon } from 'antd'
import Fuse from 'fuse.js'

/**
 *  Parameter:
 *    t: translation
 *    targetInput: bind target element
 *    container: position container
 *    options: [{
 *      name: 'xxx',
 *      {key}: 'xxx',
 *     }]
 *    type: 'input'|'dropdown'
 *    className: ''
 *    keyValue="slug"
 *    onChange: ({currentItem: {}, value: []}) => {
 *    }
 *    onBlur: value => {}
 */
export default class searchComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showSearchList: false,
      selectList: props.selectList || [],
      searchResults: JSON.parse(JSON.stringify(props.options)),
      currentItem: null,
      value: [],
    }

    this.fuseSearch = null
  }

  componentDidMount() {
    this.addInputEventListener()
    this.initContainer()
    if (this.props.options.length > 0) {
      this.initFuseSearch()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.targetInput && !prevProps.targetInput) {
      this.addInputEventListener()
    }

    if (this.props.container && !prevProps.container) {
      this.initContainer()
    }

    if (this.props.options && this.props.options !== prevProps.options) {
      this.setSearchResults(this.props.options)
      this.initFuseSearch()
    }

    if (JSON.stringify(this.props.selectList) !== JSON.stringify(prevProps.selectList)) {
      this.updateSelectList(this.props.selectList)
    }
  }

  updateSelectList = selectList => {
    this.setState({ selectList })
  }

  componentWillUnmount() {
    if (this.props.targetInput) {
      this.props.targetInput.removeEventListener('click', this.handleFocus)
    }

    document.removeEventListener('mousedown', this.handleOutsideClick)
  }

  setSearchResults = options => {
    this.setState({ searchResults: options })
  }

  addInputEventListener = () => {
    if (this.props.targetInput) {
      this.props.targetInput.readOnly = true
      this.props.targetInput.addEventListener('click', this.handleFocus)
    }

    document.addEventListener('mousedown', this.handleOutsideClick)
  }

  handleFocus = () => {
    if (![...this.props.targetInput.classList].includes('disabled')) {
      if (this.props.type === 'input') {
        this.setState({ showSearchList: true })
      } else {
        this.setState({ showSearchList: !this.state.showSearchList })
      }
    }
  }

  handleOutsideClick = e => {
    if (
      this.props.targetInput &&
      !this.props.targetInput.contains(e.target) &&
      this.searchComponent &&
      !this.searchComponent.contains(e.target) &&
      this.state.showSearchList
    ) {
      this.setState({ showSearchList: false })
      this.triggerBlur({ value: this.state.value })
    }
  }

  initContainer = () => {
    if (this.props.container && this.props.container.style) {
      this.props.container.style.position = 'relative'
    }
  }

  handleItemClick = item => {
    if (this.state.selectList && this.state.selectList.indexOf(item[this.props.keyValue]) !== -1) {
      this.state.selectList.splice(this.state.selectList.indexOf(item[this.props.keyValue]), 1)
    } else {
      this.state.selectList.push(item[this.props.keyValue])
    }

    const selectItems = this.props.options.filter(
      option => this.state.selectList.indexOf(option[this.props.keyValue]) !== -1,
    )

    this.triggerChange({
      currentItem: item,
      value: selectItems,
    })
    this.state.currentItem = item
    this.state.value = selectItems
    this.setState(this.state)
  }

  handleClear = () => {
    this.state.searchResults.map(item => {
      if (
        this.state.selectList &&
        this.state.selectList.indexOf(item[this.props.keyValue]) !== -1
      ) {
        this.state.selectList.splice(this.state.selectList.indexOf(item[this.props.keyValue]), 1)
      }
      return true
    })

    const selectItems = this.props.options.filter(
      option => this.state.selectList.indexOf(option[this.props.keyValue]) !== -1,
    )

    this.triggerChange({
      currentItem: null,
      value: selectItems,
    })
    this.state.currentItem = null
    this.state.value = selectItems
    this.setState(this.state)
  }

  handleSelectAll = () => {
    this.state.searchResults.map(option => {
      if (this.state.selectList.indexOf(option[this.props.keyValue]) === -1) {
        this.state.selectList.push(option[this.props.keyValue])
      }

      return true
    })

    const selectItems = this.props.options.filter(
      option => this.state.selectList.indexOf(option[this.props.keyValue]) !== -1,
    )

    this.triggerChange({
      currentItem: null,
      value: selectItems,
    })
    this.state.currentItem = null
    this.state.value = selectItems
    this.setState(this.state)
  }

  initFuseSearch = () => {
    this.fuseSearch = new Fuse(this.props.options, {
      keys: ['name'],
      threshold: 0.1,
    })
  }

  handleInputChange = e => {
    if (this.fuseSearch) {
      let result
      if (e.target.value && e.target.value !== '') {
        result = this.fuseSearch.search(e.target.value)
      } else {
        result = this.props.options
      }
      this.setSearchResults(result)
    }
  }

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props
    if (onChange) {
      onChange(Object.assign({}, changedValue))
    }
  }

  triggerBlur = changedValue => {
    // Should provide an event to pass value to Form.
    const { onBlur } = this.props
    if (onBlur) {
      onBlur(Object.assign({}, changedValue))
    }
  }

  handleClearSearchInput = () => {
    if (this.searchInput) {
      this.searchInput.value = ''
      this.setState({
        searchResults: this.props.options,
        value: [],
      })
    }
  }

  render() {
    if (!this.props.targetInput) {
      return null
    }

    return (
      <div
        className={classNames('search-component', this.props.className, {
          'search-component--active': this.state.showSearchList,
        })}
        ref={node => {
          this.searchComponent = node
        }}
      >
        <div className="search-component__input-container">
          <input
            className="search-component__input"
            placeholder={this.props.t(
              'cms.global.search_component.placeholder.please_input_search_content_here',
            )}
            onChange={this.handleInputChange}
            ref={node => {
              this.searchInput = node
            }}
          />
          <Icon type="search" className="search-component__search-icon" />
        </div>

        <Choose>
          <When condition={this.props.isFetching}>
            <div className="search-component__loading-wrap">
              <Icon type="loading" style={{ fontSize: '24px' }} />
              <span className="search-component__loading-text">
                {this.props.t('cms.global.search_component.loading')}
              </span>
            </div>
          </When>
          <Otherwise>
            <ul className="search-component__results-list">
              <For of={this.state.searchResults} each="option" index="index">
                <li
                  className="search-component__results-item"
                  key={index}
                  onClick={() => {
                    this.handleItemClick(option)
                  }}
                  role="presentation"
                >
                  {option.name}
                  <If condition={this.state.selectList.indexOf(option[this.props.keyValue]) !== -1}>
                    <Icon className="search-component__results-selected-icon" type="check" />
                  </If>
                </li>
              </For>
            </ul>

            <div className="search-component__operate-container">
              <button
                type="button"
                className="search-component__btn search-component__btn--clear"
                onClick={this.handleClear}
              >
                {this.props.t('cms.global.search_component.clear_selected')}
              </button>
              <If condition={this.props.showSelectAll}>
                <button
                  type="button"
                  className="search-component__btn search-component__btn--select-all"
                  onClick={this.handleSelectAll}
                >
                  {this.props.t('cms.global.search_component.select_all')}
                </button>
              </If>
            </div>
          </Otherwise>
        </Choose>
      </div>
    )
  }
}

searchComponent.propTypes = {
  t: PropTypes.func.isRequired,
  targetInput: PropTypes.object,
  container: PropTypes.object,
  options: PropTypes.array.isRequired,
  selectList: PropTypes.array,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  keyValue: PropTypes.string,
  showSelectAll: PropTypes.bool,
  isFetching: PropTypes.bool,
}

searchComponent.defaultProps = {
  t: () => {},
  targetInput: null,
  type: 'input',
  onChange: () => {},
  onBlur: () => {},
  container: null,
  className: '',
  keyValue: 'slug',
  selectList: [],
  showSelectAll: true,
  isFetching: false,
}

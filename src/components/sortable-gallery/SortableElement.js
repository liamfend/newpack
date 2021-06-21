import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { provideDisplayName, omit } from './utils'

export default function sortableElement(WrappedComponent) {
  return class extends Component {
    state = {
      selected: false,
    }
    static displayName = provideDisplayName('sortableElement', WrappedComponent)

    static propTypes = {
      collection: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      disabled: PropTypes.bool,
      item: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
      className: PropTypes.string,
      selectedClassName: PropTypes.string,
      onSelect: PropTypes.func,
    }

    static defaultProps = {
      collection: 0,
      disabled: false,
      item: '',
      className: '',
      selectedClassName: '',
      onSelect: () => {},
    }

    static contextTypes = {
      manager: PropTypes.object.isRequired,
    }

    componentDidMount() {
      this.setDraggable()
    }

    componentWillUnmount() {
      this.removeDraggable()
    }

    setDraggable = () => {
      if (!this.props.disabled) {
        this.context.manager.add(this)
      }
    }

    removeDraggable = () => {
      this.context.manager.remove(this)
    }

    setGhost = (hide = false) => {
      if (hide) {
        this.node.style.display = 'none'
      } else {
        this.node.style.visibility = 'hidden'
      }
    }

    removeGhost = () => {
      this.node.style.visibility = ''
    }

    onSelect = () => {
      if (!this.state.selected) {
        this.setState(
          {
            selected: true,
          },
          () => {
            this.context.manager.addSelected(this)
            const { onSelect, item } = this.props
            onSelect(item, true)
          },
        )
      }
    }

    removeSelect = () => {
      if (this.state.selected) {
        this.setState(
          {
            selected: false,
          },
          () => {
            this.context.manager.removeSelected(this)
            const { onSelect, item } = this.props
            onSelect(item, false)
          },
        )
      }
    }

    isSelected = () => this.state.selected

    triggerSelect = () => {
      if (this.state.selected) {
        this.removeSelect()
      } else {
        this.onSelect()
      }
    }

    getItem = () => this.props.item

    render() {
      const component = (
        <div
          role="button"
          tabIndex="0"
          ref={e => {
            // it's better to use e.firstElementChild :)
            // optimize it when have time
            this.node = e
          }}
          onClick={this.triggerSelect}
          style={{
            outline: 'none',
          }}
          className={this.props.className}
        >
          <WrappedComponent
            {...omit(this.props, 'collection', 'disabled', 'index')}
            className={this.state.selected ? this.props.selectedClassName : ''}
          />
        </div>
      )

      return component
    }
  }
}

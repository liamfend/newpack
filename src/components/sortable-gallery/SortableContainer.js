import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DragLayer from './DragLayer'
import Manager from './Manager'
import { closest, events, provideDisplayName, omit, vendorPrefix, getElementBPWidth } from './utils'

// Export Higher Order Sortable Container Component
export default function sortableContainer(WrappedComponent) {
  return class extends Component {
    static displayName = provideDisplayName('sortableList', WrappedComponent)

    static defaultProps = {
      axis: 'xy',
      transitionDuration: 300,
      distance: 0,
      useWindowAsScrollContainer: false,
      multiple: true,
      onSortEnd: () => {},
      contentWindow: typeof window !== 'undefined' ? window : null,
      shouldCancelStart(e) {
        // Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
        const disabledElements = ['input', 'textarea', 'select', 'option', 'button']

        if (disabledElements.indexOf(e.target.tagName.toLowerCase()) !== -1) {
          return true // Return true to cancel sorting
        }
        return false
      },
      getHelperDimensions: ({ node }) => ({
        width: node.offsetWidth,
        height: node.offsetHeight,
      }),
      createHelper: null,
      enabledClassName: '',
      disabledClassName: '',
      shouldClearSelected: () => true,
      canDrop: () => {},
    }

    static propTypes = {
      id: PropTypes.string.isRequired,
      axis: PropTypes.oneOf(['x', 'y', 'xy']),
      distance: PropTypes.number,
      transitionDuration: PropTypes.number,
      contentWindow: PropTypes.any,
      onSortEnd: PropTypes.func,
      shouldCancelStart: PropTypes.func,
      multiple: PropTypes.bool,
      useWindowAsScrollContainer: PropTypes.bool,
      items: PropTypes.array.isRequired,
      getHelperDimensions: PropTypes.func,
      dragLayer: PropTypes.instanceOf(DragLayer).isRequired,
      createHelper: PropTypes.func,
      enabledClassName: PropTypes.string,
      disabledClassName: PropTypes.string,
      shouldClearSelected: PropTypes.func,
      canDrop: PropTypes.func,
    }

    static childContextTypes = {
      manager: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props)
      this.manager = new Manager()
      this.createHelper = props.createHelper || null
      this.dragLayer = props.dragLayer
      this.dragData = null
      this.dragInitialEvent = null
      this.dragging = false
      this.lastClickedNode = null

      this.events = {
        start: this.handleStart,
        move: this.handleMove,
        end: this.handleEnd,
      }

      this.dragLayer.addRef(this)

      this.state = {
        items: props.multiple ? props.items : props.items.slice(0, 1),
      }
    }

    getChildContext() {
      return {
        manager: this.manager,
      }
    }

    componentDidMount() {
      const { contentWindow, axis, useWindowAsScrollContainer } = this.props
      this.document = this.container.ownerDocument || document
      this.contentWindow = typeof contentWindow === 'function' ? contentWindow() : contentWindow
      this.scrollContainer = useWindowAsScrollContainer ? this.document.body : this.container
      this.axis = {
        x: axis.indexOf('x') >= 0,
        y: axis.indexOf('y') >= 0,
      }

      Object.keys(this.events).forEach(key => {
        events[key].forEach(eventName =>
          this.container.parentNode.addEventListener(eventName, this.events[key], false),
        )
      })

      events.start.forEach(eventName => {
        this.document.addEventListener(eventName, this.handleClick)
      })
    }

    componentWillUnmount() {
      Object.keys(this.events).forEach(key => {
        events[key].forEach(eventName =>
          this.container.parentNode.removeEventListener(eventName, this.events[key]),
        )
      })
      events.start.forEach(eventName => {
        this.document.removeEventListener(eventName, this.handleClick)
      })
      this.dragLayer.removeRef(this)
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.items !== this.state.items) {
        this.clearActive()
        this.setItems(nextProps.items)
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (nextState.items !== this.state.items) {
        this.clearActive()
      }
      return true
    }

    setItems = (items, callback) => {
      this.setState(
        {
          items: this.props.multiple ? items : items.slice(0, 1),
        },
        callback,
      )
    }

    getID = () => this.props.id

    getSelectedIndexes = () => {
      const selected = this.manager.getSelected()
      return selected.map(element => this.manager.getIndex(element))
    }

    addSelectedIndexes = indexes => {
      const all = this.manager.getAll()
      indexes.forEach(index => {
        this.manager.addSelected(all[index])
      })
    }

    clearSelected = () => {
      this.manager.clearSelected()
    }

    triggerSelectAll = () => {
      const selected = this.manager.getSelected()
      if (selected.length > 0 && selected.length === this.manager.getAll().length) {
        this.manager.clearSelected()
      } else {
        this.manager.selectAll()
      }
    }

    handleClick = e => {
      const clearSelected = () => {
        const { shouldClearSelected } = this.props
        if (shouldClearSelected(e)) {
          this.manager.clearSelected()
        }
        this.lastClickedNode = null
      }
      const container = closest(e.target, el => el === this.container)
      if (!container) {
        clearSelected()
      }
    }

    handleShiftSelect = (e, node) => {
      if (this.lastClickedNode && e.shiftKey) {
        const lastSelectedIndex = this.manager.getIndexByNode(this.lastClickedNode)
        const currentIndex = this.manager.getIndexByNode(node)
        const elements = this.manager.getAll()
        if (elements[lastSelectedIndex].isSelected() && !elements[currentIndex].isSelected()) {
          let start
          let end
          if (lastSelectedIndex < currentIndex) {
            start = lastSelectedIndex
            end = currentIndex
          } else {
            start = currentIndex
            end = lastSelectedIndex
          }
          elements.forEach((el, index) => {
            if (start < index && index < end) {
              this.manager.addSelected(el)
            } else {
              this.manager.removeSelected(index)
            }
          })
          return
        }
      }
      this.lastClickedNode = node
    }

    canDrop = sourceContainer => {
      const selected = sourceContainer.manager.getSelected()
      if (this.props.canDrop && this.props.id === 'property:cover_photo') {
        return this.props.canDrop(selected)
      }

      return this.props.multiple || (selected.length === 1 && this.state.items.length === 0)
    }

    initDragData = () => {
      this.dragData = {
        coveringIndex: -1,
        actualList: [],
        virtualList: [],
        virtualInitialAxis: {},
      }

      const containerBoundingRect = this.container.getBoundingClientRect()
      this.dragData.virtualInitialAxis = {
        x: containerBoundingRect.x,
        y: containerBoundingRect.y,
      }

      const elements = this.manager.getAll()
      const selected = this.manager.getSelected()
      if (elements.length) {
        elements.forEach(element => {
          const rect = element.node.getBoundingClientRect()
          this.dragData.actualList.push({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          })
        })

        // create a virtual list to suppose where should the elements be.
        const { virtualList } = this.dragData
        const containerPadding = getElementBPWidth(this.container)
        const virtualLen = elements.length - selected.length
        let refererRect = this.dragData.actualList[0]
        // use '<=' to reserve a place in the end
        for (let i = 0; i <= virtualLen; i++) {
          const containerRightX =
            containerBoundingRect.x + containerBoundingRect.width - containerPadding.right
          // extend the scope to the end of line if it's the last one
          if (i === virtualLen) {
            refererRect.width = containerRightX - refererRect.x
          }
          virtualList.push(refererRect)

          // hard code for current drag element
          refererRect.width = 255
          // calculate the next one
          const breakLine = refererRect.x + refererRect.width * 2 > containerRightX
          if (breakLine) {
            const lastRect = virtualList[virtualList.length - 1]
            refererRect = {
              x: containerBoundingRect.x + containerPadding.left,
              y: lastRect.y + lastRect.height,
              width: lastRect.width,
              height: lastRect.height,
              breakLine: true,
            }
          } else {
            refererRect = {
              x: refererRect.x + refererRect.width,
              y: refererRect.y,
              width: refererRect.width,
              height: refererRect.height,
            }
          }
        }
      } else {
        const refererRect = {
          x: containerBoundingRect.x,
          y: containerBoundingRect.y,
          width: containerBoundingRect.width,
          height: containerBoundingRect.height,
        }
        this.dragData.actualList.push(refererRect)
        this.dragData.virtualList.push(refererRect)
      }
    }

    handleStart = e => {
      const { shouldCancelStart } = this.props

      const isAuxiliaryButtonPressed = e.button === 2
      if (isAuxiliaryButtonPressed || shouldCancelStart(e)) {
        return false
      }

      if (!this.dragging) {
        if (e.target.tagName.toLowerCase() === 'a') {
          e.preventDefault()
        }
        // Find the node of sortable element
        const node = closest(e.target, el => this.manager.getElementByNode(el))
        if (node) {
          this.dragInitialEvent = e
          this.handleShiftSelect(e, node)
        }
      }
      return false
    }

    handleMove = e => {
      if (this.dragInitialEvent) {
        const moveX = Math.abs(this.dragInitialEvent.clientX - e.clientX)
        const moveY = Math.abs(this.dragInitialEvent.clientY - e.clientY)
        const { distance } = this.props
        if ((distance < moveX || distance < moveY) && !this.dragging) {
          this.dragging = true

          // Find the node of sortable element
          const node = closest(this.dragInitialEvent.target, el =>
            this.manager.getElementByNode(el),
          )
          const index = this.manager.getIndexByNode(node)
          this.manager.setActive(index)
          this.dragLayer.startDrag(this.document.body, this, e)
          const { selected } = this.manager.getActive()
          selected.forEach(element => {
            element.setGhost()
          })
        }
      }
    }

    handleEnd = () => {
      this.dragging = false
      this.dragInitialEvent = null
    }

    handleSortMove = (e, sourceContainer) => {
      this.dragData.coveringIndex = this.checkCoveringIndex()
      this.setContainerStyle(sourceContainer)
      // animate nodes if needed
      this.animateNodes()
    }

    clearActive = () => {
      if (this.manager.getActive()) {
        const { selected } = this.manager.getActive()
        selected.forEach(element => {
          element.removeGhost()
        })
        this.manager.clearSelected()
        this.manager.clearActive()
      }
    }

    handleSortEnd = (e, sourceContainer) => {
      if (this.manager.getSelected()) {
        this.manager.getSelected().forEach(element => {
          element.removeGhost()
        })
      }
      if (this.dragData.coveringIndex !== -1 && this.canDrop(sourceContainer)) {
        const selectedCopied = sourceContainer.manager.getSelected().slice(0)
        // clear selected elements before remove ghosts
        sourceContainer.manager.clearSelected()
        const activeIndexes = selectedCopied.map(element => {
          element.removeGhost()
          return sourceContainer.manager.getIndex(element)
        })
        const movingIndexes = []
        activeIndexes.forEach(activeIndex => {
          movingIndexes.push(activeIndex)
        })

        sourceContainer.onSortEnd({
          from: sourceContainer.getID(),
          fromIndexes: movingIndexes.sort((a, b) => a - b),
          to: this.getID(),
          toIndex: this.dragData.coveringIndex,
        })
      }
      this.manager.clearActive()

      this.manager.getAll().forEach(element => {
        const { node } = element
        node.style[`${vendorPrefix}TransitionDuration`] = ''
        node.style[`${vendorPrefix}Transform`] = ''
      })

      this.resetContainerStyle()
      this.dragData = null

      this.handleEnd()
    }

    onSortEnd = newItems => {
      const { onSortEnd } = this.props
      if (onSortEnd) {
        onSortEnd(newItems)
      }
    }

    setContainerStyle(sourceContainer) {
      // set container class
      const movingCoordinate = this.dragLayer.getMovingCoordinate()
      const { x, y, width, height } = this.container.getBoundingClientRect()
      const hoveringContainer =
        x <= movingCoordinate.x &&
        movingCoordinate.x <= x + width &&
        y <= movingCoordinate.y &&
        movingCoordinate.y <= y + height

      const { enabledClassName, disabledClassName } = this.props
      if (hoveringContainer) {
        const canDrop = sourceContainer === this || this.canDrop(sourceContainer)
        if (enabledClassName && canDrop) {
          this.container.classList.add(enabledClassName)
        } else if (disabledClassName && !canDrop) {
          this.container.classList.add(disabledClassName)
        }
      } else {
        if (enabledClassName) {
          this.container.classList.remove(enabledClassName)
        }
        if (disabledClassName) {
          this.container.classList.remove(disabledClassName)
        }
      }

      // set container height
      const { coveringIndex, virtualList, virtualInitialAxis } = this.dragData
      if (this.state.items.length === 0 || !this.props.multiple) {
        return
      }
      if (virtualList.length) {
        const containerPadding = getElementBPWidth(this.container)
        const lastVirtualElement = virtualList[virtualList.length - 1]
        let virtualHeight = lastVirtualElement.height
        if (lastVirtualElement.breakLine) {
          virtualHeight = coveringIndex === -1 ? 0 : lastVirtualElement.height
        }
        const containerHeight =
          lastVirtualElement.y + virtualHeight - virtualInitialAxis.y + containerPadding.bottom
        const { transitionDuration } = this.props
        if (transitionDuration) {
          this.container.style[`${vendorPrefix}TransitionDuration`] = `${transitionDuration}ms`
        }
        this.container.style.height = `${containerHeight}px`
        this.container.style.overflow = 'hidden'
      }
    }

    resetContainerStyle() {
      this.container.style[`${vendorPrefix}TransitionDuration`] = ''
      this.container.style.height = ''
      this.container.style.overflow = ''

      const { enabledClassName, disabledClassName } = this.props
      if (enabledClassName) {
        this.container.classList.remove(enabledClassName)
      }
      if (disabledClassName) {
        this.container.classList.remove(disabledClassName)
      }
    }

    checkCoveringIndex = () => {
      let coveringIndex = -1
      const movingCoordinate = this.dragLayer.getMovingCoordinate()
      const { virtualList, virtualInitialAxis } = this.dragData
      const virtualAxis = this.container.getBoundingClientRect()
      const offsetAxis = {
        x: virtualAxis.x - virtualInitialAxis.x,
        y: virtualAxis.y - virtualInitialAxis.y,
      }
      virtualList.some((virtualElement, index) => {
        // it maybe a space between elements
        // let's count a edge to avoid the space
        const tolerateEdge = 5

        const elementXLeft = virtualElement.x + offsetAxis.x - tolerateEdge
        const elementXRight = virtualElement.x + offsetAxis.x + tolerateEdge + virtualElement.width
        const inWidth = elementXLeft < movingCoordinate.x && movingCoordinate.x < elementXRight

        const elementYTop = virtualElement.y + offsetAxis.y - tolerateEdge
        const elementYBottom =
          virtualElement.y + offsetAxis.y + tolerateEdge + virtualElement.height
        const inHeight = elementYTop < movingCoordinate.y && movingCoordinate.y < elementYBottom

        // is the dragged element covering any index?
        if (inWidth && inHeight) {
          coveringIndex = index
          return true
        }
        return false
      })
      return coveringIndex
    }

    animateNodes() {
      if (this.state.items.length === 0 || !this.props.multiple) {
        return
      }
      const selected = this.manager.getSelected()
      const activeIndexes = selected.map(v => this.manager.getIndex(v))
      const elements = this.manager.getAll()

      this.dragData.actualList.forEach((actualElement, index) => {
        if (activeIndexes.includes(index)) {
          return
        }
        // how many elements are being dragged on the left of current element
        let leftElementsMissing = 0
        activeIndexes.forEach(activeIndex => {
          if (activeIndex < index) {
            leftElementsMissing += 1
          }
        })

        let shouldPlaceIndex = index - leftElementsMissing
        if (this.dragData.coveringIndex !== -1 && this.dragData.coveringIndex <= shouldPlaceIndex) {
          shouldPlaceIndex += 1
        }

        const { transitionDuration } = this.props
        if (transitionDuration) {
          elements[index].node.style[
            `${vendorPrefix}TransitionDuration`
          ] = `${transitionDuration}ms`
        }
        const shouldPlaceElement = this.dragData.virtualList[shouldPlaceIndex]
        elements[index].node.style[`${vendorPrefix}Transform`] = `translate3d(${
          shouldPlaceElement.x - actualElement.x
        }px,${shouldPlaceElement.y - actualElement.y}px,0)`
      })
    }

    render() {
      const props = {
        ...omit(
          this.props,
          'contentWindow',
          'useWindowAsScrollContainer',
          'distance',
          'helperClass',
          'transitionDuration',
          'shouldCancelStart',
          'onSortEnd',
          'axis',
          'getHelperDimensions',
          'enabledClassName',
          'disabledClassName',
        ),
      }

      props.items = this.state.items

      return (
        <div
          style={{
            position: 'relative',
            userSelect: 'none',
          }}
          ref={e => {
            if (e) {
              this.container = e.firstElementChild
            }
          }}
        >
          <WrappedComponent {...props} />
        </div>
      )
    }
  }
}

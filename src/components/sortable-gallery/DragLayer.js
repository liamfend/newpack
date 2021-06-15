import { events, vendorPrefix, getOffset, getElementMargin, clamp } from './utils'

export default class DragLayer {
  helper = null
  parent = null
  lists = []
  scrollContainer = null
  scrollInterval = null
  scrollTop = null

  addRef(list) {
    this.lists.push(list)
  }

  removeRef(list) {
    const i = this.lists.indexOf(list)

    if (i !== -1) {
      this.lists.splice(i, 1)
    }
  }

  startDrag(parent, list, e) {
    this.scrollTop = this.scrollContainer.scrollTop
    this.parent = parent
    this.parent.style.userSelect = 'none'
    this.parent.style.webkitUserSelect = 'none'

    this.lists.forEach(container => {
      container.initDragData(list)
    })

    const offset = getOffset(e)
    const activeNode = list.manager.getActive()
    if (activeNode) {
      const { axis } = list.props
      const { index, element } = activeNode
      this.startItemID = index
      const margin = getElementMargin(element.node)
      const containerBoundingRect = list.container.getBoundingClientRect()

      this.marginOffset = {
        x: margin.left + margin.right,
        y: Math.max(margin.top, margin.bottom),
      }
      this.boundingClientRect = element.node.getBoundingClientRect()
      this.containerBoundingRect = containerBoundingRect
      this.currentList = list

      this.axis = {
        x: axis.indexOf('x') >= 0,
        y: axis.indexOf('y') >= 0,
      }
      this.initialOffset = offset
      this.distanceBetweenContainers = {
        x: 0,
        y: 0,
      }

      this.createHelper(list, e)
      this.listenerNode = list.contentWindow
      events.move.forEach(eventName =>
        this.listenerNode.addEventListener(eventName, this.handleSortMove, false),
      )
      events.end.forEach(eventName =>
        this.listenerNode.addEventListener(eventName, this.handleSortEnd, false),
      )

      return activeNode
    }

    return false
  }

  createHelper(list, e) {
    const { element, index, selected } = list.manager.getActive()
    const node = element.node
    let clonedNode
    let dimensions
    let margin
    if (list.createHelper) {
      const helperInfo = list.createHelper(element, index)
      clonedNode = helperInfo.node
      dimensions = helperInfo.dimensions
      margin = helperInfo.margin
    } else {
      clonedNode = node.cloneNode(true)
      margin = getElementMargin(node)
      dimensions = list.props.getHelperDimensions({
        index,
        node,
      })
    }

    this.width = dimensions.width
    this.height = dimensions.width

    this.helper = this.parent.appendChild(clonedNode)
    if (selected && selected.length > 1) {
      const tag = document.createElement('div')
      tag.style.position = 'absolute'
      tag.style.top = '0px'
      tag.style.right = '0px'
      tag.style.height = '16px'
      tag.style.minWidth = '16px'
      tag.style.lineHeight = '16px'
      tag.style.fontSize = '10px'
      tag.style.textAlign = 'center'
      tag.style.borderRadius = '50%'
      tag.style.background = '#f25202'
      tag.style.color = 'white'
      tag.style.boxShadow = '0 2px 8px 0 rgba(76, 76, 76, 0.16)'
      tag.innerText = selected.length
      if (selected.length >= 100) {
        tag.style.padding = '0 4px'
      }
      this.helper.appendChild(tag)
    }
    this.helper.style.position = 'fixed'

    let top = this.boundingClientRect.top + margin.top
    let left = this.boundingClientRect.left + margin.left
    if (
      e.clientY < top ||
      top + this.height < e.clientY ||
      e.clientX < left ||
      left + this.width < e.clientX
    ) {
      top = e.clientY - this.height / 2
      left = e.clientX - this.width / 2
    }
    this.helper.style.top = `${top - margin.top}px`
    this.helper.style.left = `${left - margin.left}px`
    this.helper.style.width = `${this.width}px`
    this.helper.style.height = `${this.height}px`
    this.helper.style.boxSizing = 'border-box'
    this.helper.style.pointerEvents = 'none'
    this.helper.style.overflow = 'hidden'
    this.helper.style.zIndex = 99999
    this.minTranslate = {}
    this.maxTranslate = {}
    if (this.axis.x) {
      this.minTranslate.x = -this.boundingClientRect.left - this.width / 2
      this.maxTranslate.x =
        list.contentWindow.innerWidth - this.boundingClientRect.left - this.width / 2
    }
    if (this.axis.y) {
      this.minTranslate.y = -this.boundingClientRect.top - this.height / 2
      this.maxTranslate.y =
        list.contentWindow.innerHeight - this.boundingClientRect.top - this.height / 2
    }
  }

  getMovingCoordinate = () => {
    if (this.helper) {
      const { x, y, width, height } = this.helper.getBoundingClientRect()
      return {
        x: x + width / 2,
        y: y + height / 2,
      }
    }
    return null
  }

  stopDrag() {
    this.handleSortEnd()
  }

  handleSortMove = e => {
    e.preventDefault()
    this.updatePosition(e)
    if (this.currentList) {
      this.lists.forEach(list => {
        list.handleSortMove(e, this.currentList)
      })
    }
    return false
  }

  handleSortEnd = e => {
    if (this.parent) {
      this.parent.style.userSelect = ''
      this.parent.style.webkitUserSelect = ''
    }
    if (this.listenerNode) {
      events.move.forEach(eventName =>
        this.listenerNode.removeEventListener(eventName, this.handleSortMove),
      )
      events.end.forEach(eventName =>
        this.listenerNode.removeEventListener(eventName, this.handleSortEnd),
      )
    }

    // Remove the helper from the DOM
    if (this.helper) {
      this.helper.parentNode.removeChild(this.helper)
      this.helper = null
    }
    clearInterval(this.scrollInterval)
    // you can't update list before all handleSortEnd events finished
    const fixedList = this.lists.slice(0)
    fixedList.forEach(list => {
      list.handleSortEnd(e, this.currentList)
    })
  }

  updatePosition(e) {
    const { lockAxis, lockToContainerEdges } = this.currentList.props
    const offset = getOffset(e)
    const translate = {
      x: offset.x - this.initialOffset.x,
      y: offset.y - this.initialOffset.y,
    }

    this.translate = translate
    this.delta = offset

    if (lockToContainerEdges) {
      const [minLockOffset, maxLockOffset] = this.currentList.getLockPixelOffsets()
      const minOffset = {
        x: this.width / 2 - minLockOffset.x,
        y: this.height / 2 - minLockOffset.y,
      }
      const maxOffset = {
        x: this.width / 2 - maxLockOffset.x,
        y: this.height / 2 - maxLockOffset.y,
      }

      translate.x = clamp(
        translate.x,
        this.minTranslate.x + minOffset.x,
        this.maxTranslate.x - maxOffset.x,
      )
      translate.y = clamp(
        translate.y,
        this.minTranslate.y + minOffset.y,
        this.maxTranslate.y - maxOffset.y,
      )
    }

    if (lockAxis === 'x') {
      translate.y = 0
    } else if (lockAxis === 'y') {
      translate.x = 0
    }

    this.helper.style[
      `${vendorPrefix}Transform`
    ] = `translate3d(${translate.x}px,${translate.y}px, 0)`

    // safari is having this feature
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (!isSafari) {
      // auto scroll when draping
      clearInterval(this.scrollInterval)
      const scrollRect = this.scrollContainer.getBoundingClientRect()
      if (scrollRect.x <= offset.x && offset.x <= scrollRect.x + scrollRect.width) {
        const topEnd = scrollRect.y + scrollRect.height * 0.2
        const bottomStart = scrollRect.y + scrollRect.height - scrollRect.height * 0.2
        if (offset.y <= topEnd || bottomStart <= offset.y) {
          const distance = offset.y <= topEnd ? -5 : 5
          this.scrollInterval = setInterval(() => {
            this.scrollContainer.scrollTo({
              top: (this.scrollTop += distance),
              left: 0,
            })
          }, 10)
        }
      }
    }
  }

  setScrollContainer(scrollContainer) {
    this.scrollContainer = scrollContainer
  }

  getScrollContainer() {
    return this.setScrollContainer
  }
}

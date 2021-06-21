export default class Manager {
  refs = []

  selected = []

  active = null

  add(element) {
    this.refs.push(element)
  }

  remove(element) {
    const index = this.getIndex(element)

    if (index !== -1) {
      this.refs.splice(index, 1)
      this.removeSelected(element)
    }
  }

  addSelected(element) {
    if (!this.selected.includes(element)) {
      this.selected.push(element)
      element.onSelect()
    }
  }

  selectAll() {
    this.refs.forEach(element => {
      this.addSelected(element)
    })
  }

  getSelected() {
    return this.selected
  }

  removeSelected(element) {
    const index = this.selected.indexOf(element)

    if (index !== -1) {
      this.selected.splice(index, 1)
      element.removeSelect()
    }
  }

  clearSelected() {
    if (this.selected.length) {
      this.selected.slice(0).forEach(element => {
        element.removeSelect()
      })
      this.selected = []
    }
  }

  setActive(index) {
    this.addSelected(this.refs[index])
    this.active = {
      index,
      element: this.refs[index],
      selected: this.selected,
    }
  }

  getActive() {
    return this.active
  }

  clearActive() {
    this.active = null
  }

  getIndex(element) {
    return this.refs.indexOf(element)
  }

  getElementByNode(node) {
    return this.refs.find(element => element.node === node)
  }

  getIndexByNode(node) {
    const result = this.refs.find(element => element.node === node)
    if (result) {
      return this.getIndex(result)
    }
    return -1
  }

  getAll() {
    return this.refs
  }
}

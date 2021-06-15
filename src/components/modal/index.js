/**
 * @file
 *
 * Defines the basic style of modal in this repo.
 */
import React from 'react'
import PropTypes from 'prop-types'

import window from 'global/window'
import classNames from 'classnames'

/**
 * Modal
 *
 * Example:
 * @modal({
 *   className: String, // the class name of component
 *   avoidSidebar: Bool, // If provide true, the modal's left will add the sidebar width
 * })
 * class YourComponent {}
 */
const modal =
  (options = {}, isSticky = false) =>
  Component =>
    class extends React.Component {
      static propTypes = {
        activeModal: PropTypes.bool,
        element: PropTypes.element,
      }

      static defaultProps = {
        activeModal: false,
        element: undefined,
      }

      constructor(props) {
        super(props)
        this.scrollTop = null
      }

      componentDidMount() {
        this.active()
      }

      componentWillUnmount() {
        this.inactive()
      }

      componentDidUpdate(prevProps) {
        if (this.props.activeModal && !prevProps.activeModal) {
          this.active()
        } else if (!this.props.activeModal && prevProps.activeModal) {
          this.inactive()
        }
      }

      setModalBodyScroll = () => {
        const stickyWrapper = this.modal
        if (stickyWrapper) {
          const headerDom = stickyWrapper.childNodes[0].childNodes[0]
          const bodyDom = stickyWrapper.childNodes[0].childNodes[1]
          const footerDom = stickyWrapper.childNodes[0].childNodes[2]
          const headerHeight = headerDom.clientHeight
          const footerHeight = footerDom.clientHeight
          const blankHeight = 80
          bodyDom.style.maxHeight = `calc(100vh - ${blankHeight}px - ${headerHeight}px - ${footerHeight}px)`
          bodyDom.style.minHeight = `calc(560px - ${headerHeight}px - ${footerHeight}px)`
          bodyDom.classList.add('body-dom-ovs')
        }
      }

      setModalOffset = () => {
        if (options.avoidSidebar) {
          const sideBarWidth = document.querySelector('.sidebar').offsetWidth
          this.modal.childNodes[0].style.marginLeft = `${sideBarWidth / 2}px`
        }
      }

      cancelModalBodyScroll = () => {
        const stickyWrapper = this.modal
        if (stickyWrapper) {
          const bodyDom = stickyWrapper.childNodes[0].childNodes[1]
          bodyDom.removeAttribute('style')
          bodyDom.classList.remove('body-dom-ovs')
        }
      }

      active = () => {
        if (this.props.element) {
          this.props.element.classList.add('body-ovh')
        } else {
          this.scrollTop = window.scrollTop || window.pageYOffset
          document.body.classList.add('body-ovh')
          if (isSticky) {
            this.setModalBodyScroll()
          }
          this.setModalOffset()
        }
      }

      inactive = () => {
        if (this.props.element) {
          this.props.element.classList.remove('body-ovh')
        } else {
          if (document.querySelectorAll('.modal').length === 1) {
            document.body.classList.remove('body-ovh')
            document.body.removeAttribute('style')
          }

          if (this.scrollTop) {
            window.scrollTo(0, this.scrollTop)
          }

          this.scrollTop = null
          if (isSticky) {
            this.cancelModalBodyScroll()
          }
        }
      }

      render() {
        return (
          <div
            ref={modalwraper => {
              this.modal = modalwraper
            }}
            className={classNames('modal', options.className, {
              'modal--active': this.props.activeModal,
            })}
          >
            <Component {...this.props} />
          </div>
        )
      }
    }

export default modal

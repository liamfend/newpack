/**
 * @file
 *
 * Defines the basic page auth contorl in this repo.
 */
import React from 'react'
import { Redirect } from 'react-router-dom'
import { isHaveAuth } from '~helpers/auth'
import generatePath from '~settings/routing'

/**
 * authControl
 *
 * Example:
 * @authControl({
 *   entity: String, // platform entity
 *   action: String, // Action to operate entity
 *   redirectFunc: (props) => { return 'redirectUrl' } // Redirect url
 * })
 * class YourComponent {}
 */
const authControl =
  (entity, action, redirectFunc = () => {}) =>
  Component =>
    class extends React.Component {
      render() {
        if (!isHaveAuth(entity, action)) {
          return <Redirect to={redirectFunc(this.props) || generatePath('properties')} />
        }

        return (
          <div>
            <Component {...this.props} />
          </div>
        )
      }
    }

export default authControl

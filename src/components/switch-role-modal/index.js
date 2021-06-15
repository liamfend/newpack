import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Radio, Button, message } from 'antd'
import { connect } from 'react-redux'
import modal from '~components/modal'
import * as authActions from '~actions/auth'
import { formatAuthPayload } from '~helpers/auth'
import generatePath from '~settings/routing'

const mapStateToProps = state => ({
  authList: state.auth.get('authList'),
})

const mapDispatchToProps = dispatch => ({
  setSelectRole: payload => {
    dispatch(authActions.setSelectRole(payload))
  },
})

@modal()
@connect(mapStateToProps, mapDispatchToProps)
export default class SwitchRoleModal extends React.Component {
  constructor() {
    super()

    this.state = {
      selectedRole: null,
    }

    this.availableRoleList = [
      'admin',
      'pms_landlord',
      'content_manager',
      'content_manager_level_2',
      'regional_supply_head',
      'supply',
      'financial',
    ]
  }

  handleRoleConfirm = () => {
    const { pathname } = this.props.location
    if (
      pathname.includes('account/account-management') &&
      this.state.selectedRole === 'content_manager_level_2'
    ) {
      this.props.history.push(generatePath('myProfile', {}))
    }
    if (this.state.selectedRole) {
      this.props.setSelectRole(formatAuthPayload(this.props.authList, this.state.selectedRole))
      this.props.onClose()
      message.success(
        this.props.t('cms.switch_role_modal.success_message', {
          role: this.props.t(`cms.switch_role_modal.role.${this.state.selectedRole}`),
        }),
      )
    }

    if (this.state.selectedRole === 'financial' && !pathname.includes('billing')) {
      const url = generatePath('billing', {})
      window.location.href = url
    }

    if (
      ['financial', 'admin'].indexOf(this.state.selectedRole) === -1 &&
      pathname.includes('billing')
    ) {
      const url = generatePath('properties', {})
      window.location.href = url
    }
  }

  render() {
    if (
      !(
        this.props.authList.identity &&
        this.props.authList.identity.identity &&
        this.props.authList.identity.identity.frontendScopes
      )
    ) {
      return false
    }

    return (
      <div className="switch-role-modal">
        <div className="switch-role-modal__container">
          <div className="switch-role-modal__position-container">
            <div className="switch-role-modal__header-container">
              <h3 className="switch-role-modal__title">
                {this.props.t('cms.switch_role_modal.title.switch_role')}
              </h3>
              <button
                className="switch-role-modal__btn switch-role-modal__btn--close"
                onClick={this.props.onClose}
              >
                <Icon type="close" style={{ fontSize: '12px', color: '#9e9e9e' }} />
              </button>
            </div>
            <div className="switch-role-modal__content-container">
              <div className="switch-role-modal__role-list">
                <Radio.Group
                  name="radiogroup"
                  onChange={e => {
                    this.setState({ selectedRole: e.target.value })
                  }}
                >
                  <For
                    each="role"
                    index="index"
                    of={this.props.authList.identity.identity.frontendScopes}
                  >
                    <If condition={this.availableRoleList.indexOf(role.role) !== -1}>
                      <Radio
                        key={index}
                        value={role.role}
                        style={{
                          display: 'block',
                          height: '48px',
                          lineHeight: '48px',
                          backgroundColor: '#f8f8f6',
                        }}
                      >
                        {this.props.t(`cms.switch_role_modal.role.${role.role}`)}
                      </Radio>
                    </If>
                  </For>
                </Radio.Group>
              </div>
            </div>
            <div className="switch-role-modal__footer-container">
              <Button
                size="large"
                type="primary"
                className="switch-role-modal__btn switch-role-modal__btn--confirm"
                disabled={this.state.selectedRole === null}
                onClick={this.handleRoleConfirm}
              >
                {this.props.t('cms.switch_role_modal.btn.confirm')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SwitchRoleModal.propTypes = {
  setSelectRole: PropTypes.func.isRequired,
  authList: PropTypes.shape({
    identity: PropTypes.shape({
      identity: PropTypes.shape({
        frontendScopes: PropTypes.array,
      }),
    }),
  }).isRequired,
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  location: PropTypes.object,
  history: PropTypes.object,
}

SwitchRoleModal.defaultProps = {
  authList: {
    identity: {
      identity: {
        frontendScopes: [],
      },
    },
  },
  setSelectRole: () => {},
  location: {},
  history: {},
}

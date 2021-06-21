import React from 'react'
import PropTypes from 'prop-types'
import { Button, message, Spin } from 'antd'
import { connect } from 'react-redux'
import modal from '~components/modal'
import { Roles as RolesIcon } from '~components/svgs'
import generatePath from '~settings/routing'
import RoleItem from '~client/components/switch-role-page/role-item'
import * as authActions from '~actions/auth'
import { formatAuthPayload, getAvailableRoles } from '~helpers/auth'
import { pmsAllowRoles, communicationStatus } from '~constants'

const mapStateToProps = state => ({
  authList: state.auth.get('authList'),
  getAuthListStatus: state.auth.get('getAuthList').toJS().communication.status,
})

const mapDispatchToProps = dispatch => ({
  setSelectRole: payload => {
    dispatch(authActions.setSelectRole(payload))
  },
})

const rolesHashMap = {
  admin: 'role-admin',
  content_manager: 'role-content-supervisor',
  content_manager_level_2: 'role-content-specialist',
  pms_landlord: 'role-landlord',
  supply: 'role-supply',
  regional_supply_head: 'role-regional-supply-head',
  financial: 'financial',
}

@modal()
@connect(mapStateToProps, mapDispatchToProps)
export default class SwitchRolePage extends React.Component {
  constructor() {
    super()

    this.state = {
      selectedRole: null,
    }
  }

  handleRoleConfirm = () => {
    if (this.state.selectedRole) {
      this.props.setSelectRole(formatAuthPayload(this.props.authList, this.state.selectedRole))
      this.props.onClose()
      message.success(
        this.props.t('cms.switch_role_modal.success_message', {
          role: this.props.t(`cms.switch_role_modal.role.${this.state.selectedRole}`),
        }),
      )
    }

    this.changeHref()
  }

  handleSelectRole = role => {
    this.setState({
      selectedRole: role,
    })
  }

  componentWillReceiveProps(nextProps) {
    const { authList, getAuthListStatus } = nextProps
    if (
      this.props.getAuthListStatus === communicationStatus.FETCHING &&
      getAuthListStatus === communicationStatus.IDLE
    ) {
      const roleArr = getAvailableRoles(authList.identity.identity.frontendScopes)
      if (roleArr.length === 1) {
        this.props.onClose()
        this.props.setSelectRole(formatAuthPayload(authList, roleArr[0]))
        message.success(
          this.props.t('cms.switch_role_modal.success_message', {
            role: this.props.t(`cms.switch_role_modal.role.${roleArr[0]}`),
          }),
        )

        this.changeHref()
      }
    }
  }

  changeHref = () => {
    const { pathname } = window.location
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
    return (
      <div className="switch-role-page">
        <div className="switch-role-page__container">
          <Choose>
            <When
              condition={
                !(
                  this.props.authList.identity &&
                  this.props.authList.identity.identity &&
                  this.props.authList.identity.identity.frontendScopes
                )
              }
            >
              <Spin />
            </When>
            <Otherwise>
              <div className="switch-role-page__position-container">
                <RolesIcon className="switch-role-page__icon-roles" />
                <h3 className="switch-role-page__title">
                  {this.props.t('cms.switch_role_modal.description.switch_role')}
                </h3>
                <div className="switch-role-page__roles-wrapper">
                  <For
                    each="role"
                    index="index"
                    of={this.props.authList.identity.identity.frontendScopes}
                  >
                    <If condition={pmsAllowRoles.indexOf(role.role) !== -1}>
                      <RoleItem
                        key={index}
                        t={this.props.t}
                        hash={rolesHashMap[role.role]}
                        role={role}
                        isSelected={this.state.selectedRole === role.role}
                        handleSelectRole={() => this.handleSelectRole(role.role)}
                      />
                    </If>
                  </For>
                </div>
                <Button
                  size="large"
                  type="primary"
                  className="switch-role-page__btn switch-role-page__btn--confirm"
                  disabled={this.state.selectedRole === null}
                  onClick={this.handleRoleConfirm}
                >
                  {this.props.t('cms.switch_role_page.btn.confirm')}
                </Button>
              </div>
            </Otherwise>
          </Choose>
        </div>
      </div>
    )
  }
}

SwitchRolePage.propTypes = {
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
  getAuthListStatus: PropTypes.string,
}

SwitchRolePage.defaultProps = {
  authList: {
    identity: {
      identity: {
        frontendScopes: [],
      },
    },
  },
  setSelectRole: () => {},
  getAuthListStatus: '',
}

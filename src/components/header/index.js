import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Icon, Layout, Modal } from 'antd';
import { Link } from 'react-router-dom';
import GlobalSearch from '~components/global-search';
import Svg from '~components/svg';
import { fireCustomEvent } from '~helpers/custom-events';

export default class Header extends React.Component {
  getMenu = () => (
    <Menu style={ { width: 160, padding: 0 } }>
      <Menu.Item className="dashboard-header__menu">
        <Link to="/account/my-profile" className="dashboard-header__link">
          <Svg className="dashboard-header__menu-icon" hash="my-profile" />
          <span className="dashboard-header__menu-text">
            { this.props.t('cms.header.dropdown.menu.my_profile') }
          </span>
        </Link>
      </Menu.Item>
      <If condition={ this.props.cmsUser && this.props.cmsUser.userRoles
        && this.props.cmsUser.userRoles.length > 1 }
      >
        <Menu.Item className="dashboard-header__menu">
          <span onClick={ this.handleSwitchRole } role="button" tabIndex="0" style={ { outline: 0 } }>
            <Svg className="dashboard-header__menu-icon" hash="switch" />
            <span className="dashboard-header__menu-text">
              { this.props.t('cms.header.dropdown.menu.switch_role') }
            </span>
          </span>
        </Menu.Item>
      </If>
      <Menu.Item className="dashboard-header__menu">
        <span onClick={ this.logoutModal } role="button" tabIndex="0" style={ { outline: 0 } }>
          <Svg className="dashboard-header__menu-icon" hash="logout" />
          <span className="dashboard-header__menu-text">
            { this.props.t('cms.header.dropdown.menu.log_out') }
          </span>
        </span>
      </Menu.Item>
    </Menu>
  );

  logoutModal = () => {
    Modal.confirm({
      className: '',
      icon: <Icon type="exclamation-circle" theme="filled" />,
      title: this.props.t('cms.header.dropdown.menu.log_out.modal.title'),
      okText: this.props.t('cms.form.pop_confirm.yes'),
      cancelText: this.props.t('cms.form.pop_confirm.no'),
      width: 380,
      onOk: this.props.logoutUser,
    });
  }

  handleSwitchRole = () => {
    fireCustomEvent('triggerSwitchRole');
  };

  render() {
    const { location, history } = this.props;
    return (
      <Layout.Header className="dashboard-header">
        <Icon
          className="dashboard-header__trigger dashboard-header__item"
          type={ this.props.collapsed ? 'menu-unfold' : 'menu-fold' }
          onClick={ this.props.toggleCollapseSidebar }
          style={ { color: '#9e9e9e' } }
        />
        <div className="dashboard-header__item dashboard-header__search">
          <If condition={
            location.pathname !== '/special-offers'
            && location.pathname !== '/contract'
            && location.pathname !== '/reviews'
            && !location.pathname.match('/locations')
            && !location.pathname.match('/reconciliation')
          }
          >
            <GlobalSearch
              t={ this.props.t }
              pathname={ location.pathname }
              search={ location.search }
              history={ history }
            />
          </If>
        </div>
        <div className="dashboard-header__item">
          <Link to="/help-center" className="dashboard-header__help-center" target="_blank">
            <Svg className="dashboard-header__help-center-icon" hash="help-center" />
          </Link>
          <Dropdown overlay={ this.getMenu }>
            <div>
              <span className="dashboard-header__user">
                <Svg className="dashboard-header__icon" hash="account-photo" />
              </span>
              <div className="dashboard-header__user-details">
                <If condition={ this.props.cmsUser }>
                  <span className="dashboard-header__name">
                    {this.props.cmsUser.firstName}&nbsp;{this.props.cmsUser.lastName}
                  </span>
                </If>
                <If condition={ this.props.currentRoleSlug }>
                  <span className="dashboard-header__text">
                    { this.props.t(`cms.switch_role_modal.role.${this.props.currentRoleSlug}`) }
                  </span>
                </If>
              </div>
            </div>
          </Dropdown>
        </div>
      </Layout.Header>
    );
  }
}

Header.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.object,
  currentRoleSlug: PropTypes.string,
  cmsUser: PropTypes.object,
  logoutUser: PropTypes.func,
  history: PropTypes.object,
  collapsed: PropTypes.bool,
  toggleCollapseSidebar: PropTypes.func,
};

Header.defaultProps = {
  t: () => {},
  location: {},
  currentRoleSlug: '',
  cmsUser: {},
  logoutUser: () => {},
  history: {},
  collapsed: false,
  toggleCollapseSidebar: () => {},
};

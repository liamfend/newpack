import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter, Route, Switch } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import { Layout, Icon, Menu } from 'antd';
import UserGuide from '~pages/help-center/user-guide';
import ThingsToKnow from '~pages/help-center/things-to-know';
import CommissionAndContract from '~pages/help-center/commission-and-contract';
import ListingYourProperties from '~pages/help-center/listing-your-properties';
import PriceAndAvailability from '~pages/help-center/price-and-availability';
import TopHostQuestions from '~pages/help-center/top-host-questions';
import MyAccount from '~pages/help-center/my-account';
import * as accountActions from '~actions/account';
import generatePath from '~settings/routing';
import { logout } from '~actions/auth';
import { HelpCenterLogo as HelpCenterLogoIcon } from "~components/svgs";

const { Sider, Content, Header } = Layout;

const mapStateToProps = (state) => {
  const account = state.dashboard.account.toJS();

  return {
    cmsUser: account.account,
    token: state.auth.getIn(['base', 'token']),
  };
};

const mapDispatchToProps = dispatch => ({
  logoutUser: () => {
    dispatch(logout());
  },
  getCmsUser: () => {
    dispatch(accountActions.getCmsUser());
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class HelpCenter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentKey: [this.getDefaultKey(props)],
    };
  }

  componentDidMount() {
    if (this.props.token) {
      this.props.getCmsUser();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({ currentKey: [this.getDefaultKey(nextProps)] });
    }
  }

  showSiderBar = () => this.props.location.pathname !== '/help-center';

  handleLogout = () => {
    this.props.logoutUser();
  };

  getDefaultKey = (props) => {
    if (props.location.pathname.includes('things-to-know')) {
      return 'things-to-know';
    } else if (props.location.pathname.includes('listing-your-properties')) {
      return 'listing-your-properties';
    } else if (props.location.pathname.includes('price-and-availability')) {
      return 'price-and-availability';
    } else if (props.location.pathname.includes('commission-and-contract')) {
      return 'commission-and-contract';
    } else if (props.location.pathname.includes('my-account')) {
      return 'my-account';
    }
    return 'things-to-know';
  };

  handleMenuClick = (key) => {
    this.setState({ currentKey: [key] });
  }

  render() {
    if (!this.props.token || this.props.token.length === 0) {
      return (
        <Redirect
          to={ generatePath(
            'login',
            {},
            {
              redirectUrl: this.props.location.pathname,
            },
          ) }
        />
      );
    }

    return (
      <div className="help-center">
        <Layout className="help-center__container">
          <Header className="help-center__header-container">
            <div className="help-center__header-logo">
              <Link to="/help-center">
                <HelpCenterLogoIcon className="help-center__header-logo-icon" />
              </Link>
            </div>
            <div className="help-center__user-info">
              <span className="help-center__icon-container">
                <Icon type="user" fill="#ffffff" />
              </span>
              { this.props.cmsUser && this.props.cmsUser.firstName ?
                this.props.t('cms.help_center.header.welcome', {
                  firstName: this.props.cmsUser.firstName,
                }) : '' }
              <button className="help-center__logout" onClick={ this.handleLogout }>
                { this.props.t('cms.help_center.header.log_out') }
              </button>
            </div>
          </Header>
          <Layout>
            <If condition={ this.showSiderBar() }>
              <Sider width={ 312 } theme="light" className="help-center__sider-bar-container">
                <div className="help-center__sider-bar">
                  <Menu className="help-center__menu" defaultSelectedKeys={ this.state.currentKey } onClick={ ({ key }) => { this.handleMenuClick(key); } }>
                    <Menu.Item className="help-center__item" key="things-to-know">
                      <Link to="/help-center/things-to-know" className="help-center__menu-link">
                        { this.props.t('cms.help_center.menu.item.things_to_know') }
                      </Link>
                    </Menu.Item>
                    <Menu.Item className="help-center__item" key="listing-your-properties">
                      <Link to="/help-center/listing-your-properties" className="help-center__menu-link">
                        { this.props.t('cms.help_center.menu.item.listing_your_properties') }
                      </Link>
                    </Menu.Item>
                    <Menu.Item className="help-center__item" key="price-and-availability">
                      <Link to="/help-center/price-and-availability" className="help-center__menu-link">
                        { this.props.t('cms.help_center.menu.item.price_and_availability') }
                      </Link>
                    </Menu.Item>
                    <Menu.Item className="help-center__item" key="commission-and-contract">
                      <Link to="/help-center/commission-and-contract" className="help-center__menu-link">
                        { this.props.t('cms.help_center.menu.item.commission_and_contract') }
                      </Link>
                    </Menu.Item>
                    <Menu.Item className="help-center__item" key="my-account">
                      <Link to="/help-center/my-account" className="help-center__menu-link">
                        { this.props.t('cms.help_center.menu.item.my_account') }
                      </Link>
                    </Menu.Item>
                    <Menu.Item className="help-center__item help-center__item--disabled" disabled>
                      <Link to="/help-center/my-account" className="help-center__menu-link" disabled>
                        { this.props.t('cms.help_center.menu.item.review_management') }
                        <span className="help-center__coming-soon-tips">
                          { this.props.t('cms.help_center.menu.tips.coming_soon') }
                        </span>
                      </Link>
                    </Menu.Item>
                    <Menu.Item className="help-center__item help-center__item--disabled" disabled>
                      <Link to="/help-center/your-account" disabled className="help-center__menu-link">
                        { this.props.t('cms.help_center.menu.item.bookings_and_reconciliation') }
                        <span className="help-center__coming-soon-tips">
                          { this.props.t('cms.help_center.menu.tips.coming_soon') }
                        </span>
                      </Link>
                    </Menu.Item>
                  </Menu>
                </div>
              </Sider>
            </If>
            <Layout>
              <Content className="help-center__content-container">
                <Switch>
                  <Route path="/help-center/my-account" component={ MyAccount } />
                  <Route path="/help-center/things-to-know" component={ ThingsToKnow } />
                  <Route path="/help-center/top-host-questions" component={ TopHostQuestions } />
                  <Route path="/help-center/price-and-availability" component={ PriceAndAvailability } />
                  <Route path="/help-center/listing-your-properties" component={ ListingYourProperties } />
                  <Route path="/help-center/commission-and-contract" component={ CommissionAndContract } />
                  <Route path="/help-center" component={ UserGuide } />
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </div>
    );
  }
}

HelpCenter.propTypes = {
  cmsUser: PropTypes.object,
  logoutUser: PropTypes.func,
  getCmsUser: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  t: PropTypes.func,
  token: PropTypes.string,
};

HelpCenter.defaultProps = {
  cmsUser: null,
  logoutUser: () => {},
  getCmsUser: () => {},
  location: {
    pathname: '',
  },
  t: () => {},
  token: null,
};

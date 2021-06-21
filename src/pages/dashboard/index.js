import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout, Menu, message } from 'antd';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import cookies from 'js-cookie';
import {
  LogoSmall as LogoSmallIcon,
  LogoMain as LogoMainIcon,
  Contract as ContractIcon,
  Tag as TagIcon,
  NewReviews as NewReviewsIcon,
  Billing as BillingIcon,
  Location as LocationIcon,
  NewBooking as NewBookingIcon,
  CoomingSoonIcon as CoomingSoonIconIcon,
  IconReconciliation as IconReconciliationIcon,
  AccountIcon as AccountIconIcon,
} from "~components/svgs";
import {Property,Landlord} from '~components/svgs'
import Header from '~components/header';
import PropertyList from '~pages/dashboard/properties';
import LandlordManagement from '~pages/dashboard/landlord';
import LandlordDetails from '~client/pages/dashboard/landlord/details';
import PendingApproveList from '~pages/dashboard/pending-approve/list';
// import PropertyEdit from '~pages/dashboard/properties/edit';
import PropertyListingManagement from '~pages/dashboard/properties/listing-management';
import PropertyCommission from '~pages/dashboard/properties/commission';
import PropertyDepositAndFees from '~pages/dashboard/properties/deposit-and-fees';
import ReferenceAndContact from '~pages/dashboard/properties/reference-and-contact';
import PropertyCreate from '~pages/dashboard/properties/create';
import PropertyRecord from '~pages/dashboard/properties/record';
import PropertyTerms from '~pages/dashboard/properties/terms';
import SpecialOffer from '~pages/dashboard/special-offer/index';
import CreateOffer from '~pages/dashboard/special-offer/create-offer';
import EditOffer from '~pages/dashboard/special-offer/edit-offer';
import Constructing from '~pages/dashboard/constructing';
import { logout, getUserAuth, setSelectRole } from '~actions/auth';
import { fireCustomEvent } from '~helpers/custom-events';
import generatePath from '~settings/routing';
import Country from '~pages/dashboard/location/country/index';
import CityEdit from '~pages/dashboard/location/city/edit';
import AreaEdit from '~pages/dashboard/location/area/edit';
import UniversityEdit from '~pages/dashboard/location/university/edit';
import PropertyHomepage from '~pages/dashboard/properties/homepage';
import City from '~pages/dashboard/location/city/index';
import Area from '~pages/dashboard/location/area/index';
import University from '~pages/dashboard/location/university/index';
import Account from '~pages/dashboard/account';
import Billing from '~pages/dashboard/billing';
import BillingTransferList from '~pages/dashboard/billing/transfer';
import BillingTransferDetails from '~pages/dashboard/billing/transfer/details';
import BillingReceiveList from '~pages/dashboard/billing/receive';
import BillingReceiveDetails from '~pages/dashboard/billing/receive/details';
import BillingRefundList from '~pages/dashboard/billing/refund';
import BillingRefundDetails from '~pages/dashboard/billing/refund/details';
import Reviews from '~pages/dashboard/reviews';
import Contract from '~pages/dashboard/contract/index';
import showElementByAuth, {
  isRegionalSupplyHeadRole,
  showLandlordManaging,
  isInternalRole,
  isLandlordRole,
  isFinancialRole,
  isSupplyRole,
  isAdminRole,
  isContentSupervisorRole,
} from '~helpers/auth';
import ChangeLog from '~pages/dashboard/properties/change-log';
import ListingManagement from '~pages/dashboard/properties/change-log/listing-management';
import CommissionManagement from '~pages/dashboard/properties/change-log/commission-management';
import ContractRecord from '~pages/dashboard/properties/change-log/contract-record';
import PolicySetting from '~pages/dashboard/properties/change-log/policy-setting';
import DepositAndFees from '~pages/dashboard/properties/change-log/deposit-and-fees';
import { platformEntity, entityAction, cookieNames } from '~constants';
import { getItem } from '~base/global/helpers/storage';
import SwitchRolePage from '~client/components/switch-role-page';
import SwitchRoleModal from '~client/components/switch-role-modal';
import * as accountActions from '~actions/account';
import BasicSetting from '~pages/dashboard/account/basic-setting';
import Reconciliation from '~pages/dashboard/reconciliation';
import ReconciliationLandlord from '~pages/dashboard/reconciliation/landlord';
import ReconciliationBookingDetails from '~pages/dashboard/reconciliation/booking-details';

const mapStateToProps = state => ({
  token: state.auth.getIn(['base', 'token']),
  role: state.auth.getIn(['base', 'role']),
  currentRoleSlug: state.auth.get('auth').currentRoleSlug,
  cmsUser: state.dashboard.account.toJS().account,
});

const mapDispatchToProps = dispatch => ({
  logoutUser: () => {
    dispatch(logout());
  },
  getUserAuth: (onSuccess) => {
    dispatch(getUserAuth(onSuccess));
  },
  setSelectRole: (payload) => {
    dispatch(setSelectRole(payload));
  },
  getCmsUser: () => {
    dispatch(accountActions.getCmsUser(() => {}));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      nowTab: this.props.location.pathname,
      showSwitchRolePage: true,
      showSwitchRoleModal: false,
      automaticCloseMenu: true,
    };

    this.locationType = ['countries', 'cities', 'areas', 'universities'];
    this.locationEntityMapping = {
      countries: platformEntity.LOCATIONS_COUNTRIES,
      cities: platformEntity.LOCATIONS_CITIES,
      areas: platformEntity.LOCATIONS_AREAS,
      universities: platformEntity.UNIVERSITIES_UNIVERSITIES,
    };
    this.customSidebar = false;
  }

  componentDidMount() {
    this.handleUserAuth(this.props);
    message.config({
      maxCount: 1,
    });
    window.addEventListener('resize', this.packUpMenu);
    window.addEventListener('triggerSwitchRole', this.handleSwitchRole);
    window.addEventListener('triggerCloseMenu', this.closeMenu);
    this.packUpMenu();
    this.props.getCmsUser();

    const { pathname } = this.props.location;
    if (pathname.includes('account/account-management') && !showLandlordManaging()) {
      this.props.history.push(generatePath('myProfile', {}));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.packUpMenu);
    window.removeEventListener('triggerSwitchRole', this.handleSwitchRole);
    window.removeEventListener('triggerCloseMenu', this.closeMenu);
  }

  handleCloseSwitchRolePage = () => {
    this.setState({
      showSwitchRolePage: false,
    });
  };

  handleCloseSwitchRoleModal = () => {
    this.setState({
      showSwitchRoleModal: false,
    });
  };

  handleSwitchRole = () => {
    this.props.getUserAuth(() => {
      this.setState({
        showSwitchRoleModal: true,
      });
    });
  };

  handleUserAuth = (props) => {
    const auth = getItem('PMS_CURRENT_USER_AUTH');
    if (!auth || auth.authToken !== cookies.get(cookieNames.token)) {
      props.getUserAuth(() => {
        this.setState({ showSwitchRolePage: true });
      });
    } else {
      props.setSelectRole(auth.payload);
      this.setState({ showSwitchRolePage: false });
    }
  };

  packUpMenu = () => {
    const windowWidth = document.body.clientWidth;
    const pendingApprove = document.querySelector('.pending-approve');
    const pendingApproveWidth = pendingApprove ? pendingApprove.clientWidth : 0;

    if (
      (windowWidth - pendingApproveWidth) <= 924
      && !this.state.collapsed
      && !this.customSidebar
    ) {
      this.setState({ collapsed: true });
    }

    if (
      (windowWidth - pendingApproveWidth) > 924
      && this.state.collapsed
      && !this.customSidebar
    ) {
      this.setState({ collapsed: false });
    }
  }

  closeMenu = () => {
    if (this.state.automaticCloseMenu) {
      this.setState({
        collapsed: true,
        automaticCloseMenu: false,
      });
    }
  }

  toggleCollapseSidebar = () => {
    this.customSidebar = true;
    this.setState({
      collapsed: !this.state.collapsed,
    });

    setTimeout(() => {
      fireCustomEvent('toggleCollapseSidebarTriggers');
    }, 200);
  };

  getSelectTab = () => {
    const { pathname } = this.props.location;
    if (pathname.includes('reviews')) {
      return 'reviews';
    }
    if (pathname.includes('bookings')) {
      return 'bookings';
    }
    if (pathname.includes('properties') || pathname.includes('property')) {
      return 'properties';
    }
    if (pathname.includes('landlords') || pathname.includes('landlord')) {
      if (!pathname.includes('reconciliation/landlord')) {
        return 'landlords';
      }
    }
    if (pathname.includes('special-offers')) {
      return 'special-offers';
    }
    if (pathname.includes('reconciliation')) {
      return 'reconciliation';
    }
    if (pathname.includes('locations/countries')) {
      return 'countries';
    }
    if (pathname.includes('locations/universities') || pathname.includes('locations/university')) {
      return 'universities';
    }
    if (pathname.includes('locations/areas') || pathname.includes('locations/area')) {
      return 'areas';
    }
    if (pathname.includes('locations/cities') || pathname.includes('locations/city')) {
      return 'cities';
    }
    if (pathname.includes('contract')) {
      return 'contract';
    }

    if (pathname.includes('account/my-profile')) {
      return 'my-profile';
    }

    if (pathname.includes('account/account-management')) {
      return 'account-management';
    }

    if (pathname.includes('billing')) {
      return 'billing';
    }

    if (pathname.includes('reconciliation')) {
      return 'reconciliation';
    }

    return '';
  }

  isNoContentMarginPage = () => {
    const { pathname } = this.props.location;

    if (
      pathname.includes('/homepage')
      || pathname.includes('/commission')
      || pathname.includes('/deposit-and-fees')
      || (pathname.includes('/property/') && !pathname.includes('/create'))
      || pathname.includes('/landlord/')
      || pathname.includes('/billing')
      || pathname.includes('/reconciliation')
    ) {
      return true;
    }

    return false;
  };

  getDefaultOpenKeys = (tab) => {
    if (this.locationType.indexOf(tab) !== -1) {
      return ['location'];
    }

    if (['my-profile', 'account-management'].indexOf(tab) !== -1) {
      return ['account'];
    }

    return [''];
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

    const { Content, Sider } = Layout;
    const tab = this.getSelectTab();
    return (
      <Layout className="dashboard">
        <Sider
          collapsible={ false }
          collapsed={ this.state.collapsed }
          width={ this.state.collapsed ? '64' : '200' }
          trigger="null"
          className={ classNames('sidebar', {
            'sidebar--collapsed': this.state.collapsed,
          }) }
        >
          <div className="sidebar__logo-container">
            <If condition={ this.state.collapsed }>
              <LogoSmallIcon className="sidebar__logo-small" />
            </If>
            <If condition={ !this.state.collapsed }>
              <LogoMainIcon className="sidebar__logo" />
            </If>
          </div>
          <Menu
            theme="dark"
            mode={ this.state.collapsed ? 'vertical' : 'inline' }
            selectedKeys={ [tab] }
            defaultOpenKeys={ this.getDefaultOpenKeys(tab) }
            className="sidebar__menu"
          >
            <If
              condition={ showElementByAuth(
                platformEntity.PROPERTIES_PROPERTIES,
                entityAction.READ,
              ) }
            >
              <Menu.Item
                key="properties"
                className="sidebar__menu__item"
                title={ this.props.t('cms.sidebar.menu.properties') }
              >
                <Link to="/properties" className="sidebar__menu__link">
                  <Property
                    className="sidebar__icon sidebar__icon--property"
                    hash="property"
                  />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.properties')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If
              condition={ showElementByAuth(
                platformEntity.LANDLORDS_LANDLORDS,
                entityAction.READ,
              ) }
            >
              <Menu.Item
                key="landlords"
                className="sidebar__menu__item"
                title={ this.props.t('cms.sidebar.menu.landlord') }
              >
                <Link to="/landlords" className="sidebar__menu__link">
                  <Landlord
                    className="sidebar__icon sidebar__icon--property"
                    hash="landlord"
                  />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.landlord')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If
              condition={ showElementByAuth(
                platformEntity.PROPERTIES_CONTRACTS,
                entityAction.READ,
              ) }
            >
              <Menu.Item
                key="contract"
                title={ this.props.t('cms.sidebar.menu.contract') }
                className="sidebar__menu__item"
              >
                <Link to="/contract" className="sidebar__menu__link">
                  <ContractIcon className="sidebar__icon" />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.contract')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If
              condition={ showElementByAuth(
                platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS,
                entityAction.READ,
              ) }
            >
              <Menu.Item
                key="special-offers"
                className="sidebar__menu__item"
                title={ this.props.t('cms.sidebar.menu.special_offers') }
              >
                <Link to="/special-offers" className="sidebar__menu__link">
                  <TagIcon className="sidebar__icon sidebar__icon--tag" />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.special_offers')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If
              condition={
                !isLandlordRole() &&
                showElementByAuth(
                  platformEntity.REVIEWS_REVIEWS,
                  entityAction.READ,
                )
              }
            >
              <Menu.Item
                key="reviews"
                className="sidebar__menu__item"
                title={ this.props.t('cms.sidebar.menu.reviews') }
              >
                <Link to="/reviews" className="sidebar__menu__link">
                  <NewReviewsIcon className="sidebar__icon" />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.reviews')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If
              condition={
                showElementByAuth(
                  platformEntity.ORDER_TRANSFERS,
                  entityAction.READ,
                ) ||
                showElementByAuth(
                  platformEntity.ORDER_RECEIVES,
                  entityAction.READ,
                ) ||
                showElementByAuth(
                  platformEntity.ORDER_REFUNDS,
                  entityAction.READ,
                )
              }
            >
              <Menu.Item
                key="billing"
                className="sidebar__menu__item"
                title={ this.props.t('cms.sidebar.menu.billing') }
              >
                <Link to="/billing" className="sidebar__menu__link">
                  <BillingIcon className="sidebar__icon" />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.billing')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If condition={ isInternalRole() && !isFinancialRole() }>
              <Menu.SubMenu
                key="location"
                className="sidebar__submenu"
                title={
                  <span className={ 'sidebar__label-container' }>
                    <LocationIcon className="sidebar__icon" />
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.location')}
                    </span>
                  </span>
                }
              >
                <For of={ this.locationType } each="type" index="index">
                  <If
                    condition={ showElementByAuth(
                      this.locationEntityMapping[type],
                      entityAction.READ,
                    ) }
                  >
                    <Menu.Item key={ type } className="sidebar__locale-menu">
                      <Link to={ `/locations/${type}` }>
                        <span className="sidebar__text">
                          {this.props.t(
                            `cms.sidebar.menu.location.${type}`,
                          )}
                        </span>
                      </Link>
                    </Menu.Item>
                  </If>
                </For>
              </Menu.SubMenu>
            </If>

            <Menu.Item
              key="bookings"
              className="sidebar__menu__item"
              title={ this.props.t('cms.sidebar.menu.bookings') }
              style={ { display: 'none' } }
            >
              <Link to="/bookings" className="sidebar__menu__link">
                <NewBookingIcon className="sidebar__icon" />
                <If condition={ !this.state.collapsed }>
                  <span className="sidebar__text">
                    {this.props.t('cms.sidebar.menu.bookings')}
                  </span>
                  <CoomingSoonIconIcon className="sidebar__icon sidebar__icon--coming-soon" />
                </If>
              </Link>
            </Menu.Item>

            <If
              condition={
                isSupplyRole() ||
                isAdminRole() ||
                isRegionalSupplyHeadRole() ||
                isContentSupervisorRole()
              }
            >
              <Menu.Item
                key="reconciliation"
                className="sidebar__menu__item"
                title={ this.props.t('cms.sidebar.menu.reconciliation') }
              >
                <Link to="/reconciliation" className="sidebar__menu__link">
                  <IconReconciliationIcon className="sidebar__icon sidebar__icon--reconciliation" />
                  <If condition={ !this.state.collapsed }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.reconciliation')}
                    </span>
                  </If>
                </Link>
              </Menu.Item>
            </If>

            <If
              condition={ showElementByAuth(
                platformEntity.IDENTITY_CMS_USERS,
                entityAction.READ,
              ) }
            >
              <Menu.SubMenu
                key="account"
                className="sidebar__submenu"
                title={
                  <span className={ 'sidebar__label-container' }>
                    <AccountIconIcon className="sidebar__icon" />
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.account')}
                    </span>
                  </span>
                }
              >
                <Menu.Item key="my-profile" className="sidebar__locale-menu">
                  <Link to={ '/account/my-profile' }>
                    <span className="sidebar__text">
                      {this.props.t('cms.sidebar.menu.account.my_profile')}
                    </span>
                  </Link>
                </Menu.Item>
                <If condition={ showLandlordManaging() && !isFinancialRole() }>
                  <Menu.Item
                    key="account-management"
                    className="sidebar__locale-menu"
                  >
                    <Link to={ '/account/account-management' }>
                      <span className="sidebar__text">
                        {this.props.t(
                          'cms.sidebar.menu.account.account_management',
                        )}
                      </span>
                    </Link>
                  </Menu.Item>
                </If>
              </Menu.SubMenu>
            </If>
          </Menu>
        </Sider>
        <Layout className="dashboard__layout">
          <Header
            t={ this.props.t }
            cmsUser={ this.props.cmsUser }
            collapsed={ this.state.collapsed }
            toggleCollapseSidebar={ this.toggleCollapseSidebar }
            location={ this.props.location }
            history={ this.props.history }
            currentRoleSlug={ this.props.currentRoleSlug }
            logoutUser={ this.props.logoutUser }
          />
          <Content
            className={ classNames('dashboard__content', {
              'dashboard__content--properties':
                this.props.location.pathname === '/properties',
              'dashboard__content--no-margin': this.isNoContentMarginPage(),
            }) }
          >
            <Switch>
              <Route path={ '/reviews' } exact component={ Reviews } />
              <Route path={ '/bookings' } exact component={ Constructing } />
              <Route path={ '/properties' } exact component={ PropertyList } />
              <Route
                path={ '/property/:propertySlug/edit' }
                exact
                component={ PropertyListingManagement }
              />
              <Route
                path={ '/property/:propertySlug/homepage' }
                exact
                component={ PropertyHomepage }
              />
              <Route
                path={ '/property/:propertySlug/commission' }
                exact
                component={ PropertyCommission }
              />
              <Route
                path={ '/property/:propertySlug/record' }
                exact
                component={ PropertyRecord }
              />
              <Route
                path={ '/property/:propertySlug/deposit-and-fees' }
                exact
                component={ PropertyDepositAndFees }
              />
              <Route
                path={ '/property/:propertySlug/terms' }
                exact
                component={ PropertyTerms }
              />
              <Route
                path={ '/property/:propertySlug/change-log' }
                exact
                component={ ChangeLog }
              />
              <Route
                path={ '/property/:propertySlug/change-log/listing-management' }
                exact
                component={ ListingManagement }
              />
              <Route
                path={
                  '/property/:propertySlug/change-log/commission-management'
                }
                exact
                component={ CommissionManagement }
              />
              <Route
                path={ '/property/:propertySlug/change-log/contract-record' }
                exact
                component={ ContractRecord }
              />
              <Route
                path={ '/property/:propertySlug/change-log/policy-setting' }
                exact
                component={ PolicySetting }
              />
              <Route
                path={ '/property/:propertySlug/change-log/deposit-and-fees' }
                exact
                component={ DepositAndFees }
              />
              <Route
                path={ '/property/:propertySlug/reference-and-contact' }
                exact
                component={ ReferenceAndContact }
              />
              <Route
                path={ '/property/create' }
                exact
                component={ PropertyCreate }
              />
              <Route path={ '/landlords' } exact component={ LandlordManagement } />
              <Route
                path={ '/landlord/:landlordSlug' }
                exact
                component={ LandlordDetails }
              />
              <Route path={ '/special-offers' } exact component={ SpecialOffer } />
              <Route
                path={ '/special-offers/create' }
                exact
                component={ CreateOffer }
              />
              <Route
                path={ '/special-offers/edit/:id' }
                exact
                component={ EditOffer }
              />
              <Route path={ '/locations/countries' } exact component={ Country } />
              <Route path={ '/locations/cities' } exact component={ City } />
              <Route path={ '/locations/areas' } exact component={ Area } />
              <Route
                path={ '/locations/area/:slug/edit' }
                exact
                component={ AreaEdit }
              />
              <Route
                path={ '/locations/universities' }
                exact
                component={ University }
              />
              <Route
                path={ '/locations/city/:slug/edit' }
                exact
                component={ CityEdit }
              />
              <Route
                path={ '/locations/university/:slug/edit' }
                exact
                component={ UniversityEdit }
              />
              <Route
                path={ '/account/my-profile' }
                exact
                component={ BasicSetting }
              />
              <Route
                path={ '/account/account-management' }
                exact
                component={ Account }
              />
              <Route path={ '/contract' } exact component={ Contract } />
              <Route path={ '/billing' } exact component={ Billing } />
              <Route
                path={ '/billing/transfers' }
                exact
                component={ BillingTransferList }
              />
              <Route
                path={ '/billing/transfer/:id/detail' }
                exact
                component={ BillingTransferDetails }
              />
              <Route
                path={ '/billing/receivables' }
                exact
                component={ BillingReceiveList }
              />
              <Route
                path={ '/billing/receive/:id/detail' }
                exact
                component={ BillingReceiveDetails }
              />
              <Route
                path={ '/billing/refunds' }
                exact
                component={ BillingRefundList }
              />
              <Route
                path={ '/billing/refund/:id/detail' }
                exact
                component={ BillingRefundDetails }
              />
              <Route
                path={ '/reconciliation' }
                exact
                component={ Reconciliation }
              />
              <Route
                path={ '/reconciliation/landlord/:id' }
                exact
                component={ ReconciliationLandlord }
              />
              <Route
                path={ '/reconciliation/landlord/:id/:opportunityId' }
                exact
                component={ ReconciliationBookingDetails }
              />
            </Switch>
            <If condition={ this.props.location.pathname === '/properties' }>
              <div className="dashboard__pending-approve">
                <PendingApproveList
                  showSwitchRoleModal={ this.state.showSwitchRolePage }
                />
              </div>
            </If>
          </Content>
        </Layout>
        <If condition={ this.state.showSwitchRolePage }>
          <SwitchRolePage
            activeModal={ this.state.showSwitchRolePage }
            onClose={ this.handleCloseSwitchRolePage }
            t={ this.props.t }
          />
        </If>
        <If condition={ this.state.showSwitchRoleModal }>
          <SwitchRoleModal
            activeModal={ this.state.showSwitchRoleModal }
            onClose={ this.handleCloseSwitchRoleModal }
            t={ this.props.t }
            history={ this.props.history }
            location={ this.props.location }
          />
        </If>
      </Layout>
    );
  }
}

Dashboard.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }),
  token: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  getUserAuth: PropTypes.func.isRequired,
  getCmsUser: PropTypes.func.isRequired,
  currentRoleSlug: PropTypes.string,
  cmsUser: PropTypes.object,
};

Dashboard.defaultProps = {
  location: {
    pathname: '',
  },
  token: '',
  logoutUser: () => {},
  t: () => {},
  history: {
    push: () => {},
  },
  getUserAuth: () => {},
  getCmsUser: () => {},
  currentRoleSlug: '',
  cmsUser: {},
};

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Tabs } from 'antd';
import { platformEntity, entityAction } from '~constants';
import authControl from '~components/auth-control';
import { showLandlordManaging, isAdminRole } from '~helpers/auth';
import LandlordManagement from '~pages/dashboard/account/landlord-management';
import InternalManagement from '~pages/dashboard/account/internal-management';

const mapStateToProps = (state) => {
  const auth = state.auth.get('auth');

  return {
    auth,
  };
};

@connect(mapStateToProps)
@withTranslation()
@authControl(platformEntity.IDENTITY_CMS_USERS, entityAction.READ)
export default class Account extends React.Component {
  render() {
    return (
      <div className="account">
        <Tabs type="card">
          <If condition={ isAdminRole() }>
            <Tabs.TabPane tab={ this.props.t('cms.account.internal_management.tab') } key="1">
              <InternalManagement
                t={ this.props.t }
                history={ this.props.history }
                auth={ this.props.auth }
              />
            </Tabs.TabPane>
          </If>
          <If condition={ showLandlordManaging() }>
            <Tabs.TabPane tab={ this.props.t('cms.account.landlord_management.tab') } key="2">
              <LandlordManagement
                t={ this.props.t }
                history={ this.props.history }
                auth={ this.props.auth }
              />
            </Tabs.TabPane>
          </If>
        </Tabs>
      </div>
    );
  }
}

Account.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  auth: PropTypes.object,
};

Account.defaultProps = {
  t: () => {},
  history: '',
  auth: {},
};

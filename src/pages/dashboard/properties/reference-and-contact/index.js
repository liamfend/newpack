import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import * as actions from '~actions/properties/reference-and-contact';
import { communicationStatus } from '~constants';
import { Spin } from 'antd';
import LeaveAlert from '~components/leave-alert';
import Header from '~components/property-header';
import Content from '~pages/dashboard/properties/reference-and-contact/content';
import generatePath from '~settings/routing';
import { isEmptyObject } from '~client/helpers/property-edit';

const mapStateToProps = (state) => {
  const referenceAndContact = state.dashboard.referenceAndContact.toJS();

  return {
    getStatus: referenceAndContact.communication.get.status,
    referenceAndContact: referenceAndContact.payload,
    accountOwners: referenceAndContact.accountOwners,
    currentRoleSlug: state.auth.get('auth').currentRoleSlug,
    getAccountOwnersStatus: referenceAndContact.communication.getAccountOwners.status,
  };
};

const mapDispatchToProps = dispatch => ({
  getReferenceAndContact: (slug, successCallback) => {
    dispatch(actions.getReferenceAndContact(slug, successCallback));
  },
  getAccountOwners: (params, successCallback) => {
    dispatch(actions.getAccountOwners(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class ReferenceAndContact extends React.Component {
  constructor() {
    super();
    this.state = {
      isChanged: false,
      isFetchingSave: false,
    };
  }
  componentDidMount() {
    this.getLatestReferenceAndContact();

    // add browser alert
    window.onbeforeunload = (e) => {
      if (this.state.isChanged) {
        const msg = this.props.t('cms.properties.edit.leave_alert.content');
        // eslint-disable-next-line no-param-reassign
        e = e || window.event;
        if (e) {
          e.returnValue = msg;
        }

        return msg;
      }
      return null;
    };
  }

  getLatestReferenceAndContact = () => {
    const { match } = this.props;
    this.props.getReferenceAndContact(decodeURIComponent(match.params.propertySlug), () => {
      if (isEmptyObject(this.props.referenceAndContact)) {
        this.props.history.push(generatePath('properties', {}));
      }
    });
  }

  handleUpdateReferenceContact = () => {
    this.content.onSubmit(() => {
      this.setState({
        isChanged: false,
      });
      this.getLatestReferenceAndContact();
    });
  }

  handleChanged = () => {
    this.setState({
      isChanged: true,
    });
  }

  handleChangeIsFetching = (isFetchingSave = false) => {
    this.setState({
      isFetchingSave,
    });
  }

  render() {
    const { t, history, getStatus, referenceAndContact } = this.props;
    return (
      <div className="reference-and-contact">
        <LeaveAlert
          history={ history }
          t={ t }
          when={ this.state.isChanged }
        />
        <Choose>
          <When condition={ getStatus !== communicationStatus.IDLE }>
            <div className="property-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <Header
              t={ t }
              property={ referenceAndContact }
              type="reference-and-contact"
              handleSave={ this.handleUpdateReferenceContact }
              isFetchingSave={ this.state.isFetchingSave }
            />
            <If condition={ Object.keys(referenceAndContact).length > 0 }>
              <Content
                t={ t }
                onRef={ (node) => { this.content = node; } }
                property={ referenceAndContact }
                onChange={ this.handleChanged }
                onChangeIsFetching={ this.handleChangeIsFetching }
                getAccountOwners={ this.props.getAccountOwners }
                accountOwners={ this.props.accountOwners }
                currentRoleSlug={ this.props.currentRoleSlug }
                isGettingAccountOwners={
                  this.props.getAccountOwnersStatus === communicationStatus.FETCHING
                }
              />
            </If>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

ReferenceAndContact.propTypes = {
  t: PropTypes.func.isRequired,
  getStatus: PropTypes.string,
  referenceAndContact: PropTypes.object,
  getReferenceAndContact: PropTypes.func.isRequired,
  history: PropTypes.object,
  match: PropTypes.object,
  getAccountOwners: PropTypes.func,
  accountOwners: PropTypes.array,
  currentRoleSlug: PropTypes.string,
  getAccountOwnersStatus: PropTypes.string,
};

ReferenceAndContact.defaultProps = {
  t: () => {},
  getStatus: '',
  referenceAndContact: {},
  getReferenceAndContact: () => {},
  history: {},
  match: {},
  getAccountOwners: () => {},
  accountOwners: [],
  currentRoleSlug: '',
  getAccountOwnersStatus: '',
};

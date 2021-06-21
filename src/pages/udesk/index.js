import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Card, Icon } from 'antd';
import queryString from 'query-string';
import { connect } from 'react-redux';
import md5 from 'js-md5';
import { communicationStatus } from '~constants';
import getEnvironment, { environments } from '~base/global/helpers/environment';
import * as actions from '~actions/udesk';

const mapStateToProps = (state) => {
  const udesk = state.udesk.toJS();

  return {
    student: udesk.student,
    partner: udesk.partner,
    communication: udesk.communication,
  };
};

const mapDispatchToProps = dispatch => ({
  getStudentDetail: (params) => {
    dispatch(actions.getStudentDetail(params));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
export default class Udesk extends React.Component {
  constructor() {
    super();

    this.environment = getEnvironment();

    this.authKey = this.environment === environments.PROD
      ? '9405630abdf9c1d3f4b37d3dd24c4bfd'
      : '33ebe5b6e14329fb3fa4d80fb30fae58';

    this.salesforceDomain = this.environment === environments.PROD
      ? 'https://student.lightning.force.com'
      : 'https://student--dev.lightning.force.com';

    this.state = {
      initialized: false,
      rejectAccess: false,
    };
  }

  componentDidMount() {
    const search = this.props.location.search || '';
    const searchObj = queryString.parse(search);

    const verified = this.verifyUser(search, searchObj);

    if (!verified) {
      return false;
    }

    this.props.getStudentDetail({
      userUuid: searchObj.userUuid || null,
      phone: this.getPhone(),
      wechatId: searchObj.unionid || null,
      referrerName: searchObj.referrerName || null,
      referrerEmail: searchObj.referrerEmail || null,
      partnerCode: searchObj.partnerCode || null,
      partnerName: searchObj.partnerName || null,
    });
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.communication.status === communicationStatus.FETCHING
      && nextProps.communication.status !== communicationStatus.FETCHING
    ) {
      this.setState({
        initialized: true,
      });
    }
  }

  getPhone = () => {
    const search = this.props.location.search || '';

    const middleString = search.split('phone=')[1];
    if (middleString) {
      return decodeURIComponent(decodeURIComponent(middleString.split('&')[0]));
    }
    return '';
  }

  verifyUser = (search, searchObj) => {
    const searchWithOutQuestionMark = search.split('?')[1];

    if (!searchWithOutQuestionMark) {
      return false;
    }

    const [requestStr] = searchWithOutQuestionMark.split('&sign=');
    const sign = searchObj.sign;

    // Decode twice as it encoded twice
    if (md5(`${decodeURIComponent(decodeURIComponent(requestStr))}&${this.authKey}`) !== sign) {
      this.setState({
        rejectAccess: true,
      });
      return false;
    }

    return true;
  }

  getTitle = () => (
    <span>
      { `${this.props.student.firstName} ${this.props.student.lastName}` }
      <a
        href={ `${this.salesforceDomain}/c/RecordFinderApp.app?user_uuid=${this.props.student.userUuid}` }
        className="udesk__force-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        ( Open in Salesforce )
      </a>
    </span>
  )

  render() {
    return (
      <div className="udesk">
        <Choose>
          <When condition={ this.state.rejectAccess }>
            Access denied
          </When>
          <When condition={ this.props.partner && this.props.partner.partnerCode }>
            <Card title={ `PARTNER: ${decodeURIComponent(this.props.partner.referrerName)}` } className="udesk__card">
              <ul className="udesk__student__list">
                <li className="udesk__student__item">
                  <span className="udesk__student__title">Referrer Email:</span>
                  <span className="udesk__student__content">{ this.props.partner.referrerEmail }</span>
                </li>
                <li className="udesk__student__item">
                  <span className="udesk__student__title">Partner Code:</span>
                  <span className="udesk__student__content">{ this.props.partner.partnerCode }</span>
                </li>
                <li className="udesk__student__item">
                  <span className="udesk__student__title">Partner Name:</span>
                  <span className="udesk__student__content">{ decodeURIComponent(this.props.partner.partnerName) }</span>
                </li>
              </ul>
            </Card>
          </When>
          <When condition={ Object.keys(this.props.student).length > 0 }>
            <Card title={ this.getTitle() } className="udesk__card">
              <ul className="udesk__student__list">
                <li className="udesk__student__item">
                  <span className="udesk__student__title">Email Address:</span>
                  <span className="udesk__student__content">{ this.props.student.emailAddress }</span>
                </li>
                <li className="udesk__student__item">
                  <span className="udesk__student__title">Phone Number:</span>
                  <span className="udesk__student__content">{ this.props.student.phoneNumber }</span>
                </li>
                <li className="udesk__student__item">
                  <span className="udesk__student__title">Destination University:</span>
                  <span className="udesk__student__content">{ this.props.student.destinationUniversity }</span>
                </li>
              </ul>
            </Card>
          </When>
          <When condition={ this.state.initialized }>
            <Card title="New user" className="udesk__card">
              <div className="udesk__new-user">
                <a
                  href={ `${this.salesforceDomain}/c/StudentAccountApp.app?phone=${this.getPhone()}` }
                  target="_blank"
                  className="udesk__new-user__link"
                  rel="noopener noreferrer"
                >
                  Click to create user
                </a>
              </div>
            </Card>
          </When>
          <When condition={ this.props.communication.status === communicationStatus.FETCHING }>
            <span className="udesk__loading">
              <Icon type="loading" width="3rem" height="3rem" />
            </span>
          </When>
        </Choose>
      </div>
    );
  }
}

Udesk.propTypes = {
  student: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    emailAddress: PropTypes.string,
    phoneNumber: PropTypes.string,
    userUuid: PropTypes.string,
    destinationUniversity: PropTypes.string,
  }),
  partner: PropTypes.shape({
    referrerEmail: PropTypes.string,
    referrerName: PropTypes.string,
    partnerCode: PropTypes.string,
    partnerName: PropTypes.string,
  }),
  communication: PropTypes.shape({
    status: PropTypes.string,
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  getStudentDetail: PropTypes.func.isRequired,
};

Udesk.defaultProps = {
  student: {
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    userUuid: '',
    destinationUniversity: '',
  },
  partner: {
    referrerEmail: '',
    referrerName: '',
    partnerCode: '',
    partnerName: '',
  },
  communication: {
    status: '',
  },
  location: {
    search: '',
  },
  getStudentDetail: () => {},
};

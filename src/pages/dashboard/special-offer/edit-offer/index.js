import React from 'react';
import PropTypes from 'prop-types';
import { message, Tabs } from 'antd';
import { withTranslation } from 'react-i18next';
import Content from '~components/special-offer/content';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Map from '~components/special-offer/map';
import { operateType, communicationStatus, platformEntity, entityAction } from '~constants';
import Admin from '~components/special-offer/admin';
import * as actions from '~actions/special-offer/offer-list';
import generatePath from '~settings/routing';
import authControl from '~components/auth-control';


const TabPane = Tabs.TabPane;
const mapDispatchToProps = dispatch => ({
  updateSpecialOffer: (params) => {
    dispatch(actions.updateSpecialOffer(params));
  },
  getOperatingOffer: (id) => {
    dispatch(actions.getOperatingOffer(id));
  },
});

const mapStateToProps = state => ({
  operatingOffer: state.dashboard.specialOfferList.get('operatingOffer').toJS(),
  communication: state.dashboard.specialOfferList.get('communication').toJS(),
});

@connect(
  mapStateToProps,
  mapDispatchToProps,
)
@withRouter
@withTranslation()
@authControl(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.READ)
export default class EditOffer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      operateType: this.props.t('cms.special_offer.create.state.content'),
    };
  }

  componentDidMount() {
    this.props.getOperatingOffer(decodeURIComponent(this.props.match.params.id));
  }

  changeStep = (value) => {
    this.setState({
      operateType: value,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.communication.update.status === communicationStatus.FETCHING) {
      if (nextProps.communication.update.status === communicationStatus.IDLE) {
        this.redirectToList();
        message.success(this.props.t('cms.message.special_offer.edited_success'), 3);
      } else if (nextProps.communication.update.status !== communicationStatus.FETCHING) {
        message.error(this.props.t('cms.message.error'), 3);
      }
    }
  }

  redirectToList = () => {
    const url = generatePath('specialOffer');
    this.props.history.push(url);
  }

  render() {
    return (<div>
      <Tabs defaultActiveKey={ this.props.t('cms.special_offer.create.state.content') } className="create-offer__tab-header" onChange={ this.changeStep }>
        <TabPane
          tab={ this.props.t('cms.special_offer.create.state.content') }
          key={ this.props.t('cms.special_offer.create.state.content') }
        >
          { this.props.t('cms.special_offer.create.state.content') }
        </TabPane>
        <TabPane
          tab={ this.props.t('cms.special_offer.create.state.map') }
          key={ this.props.t('cms.special_offer.create.state.map') }
        >
          { this.props.t('cms.special_offer.create.state.map') }
        </TabPane>
        <TabPane
          tab={ this.props.t('cms.special_offer.create.state.admin') }
          key={ this.props.t('cms.special_offer.create.state.admin') }
        >
          { this.props.t('cms.special_offer.create.state.admin') }
        </TabPane>
      </Tabs>
      <If condition={ this.state.operateType === this.props.t('cms.special_offer.create.state.content') }>
        <Content
          updateSpecialOffer={ this.props.updateSpecialOffer }
          offerInfo={ this.props.operatingOffer }
          operateType={ operateType.edit }
        />
      </If>
      <If condition={ this.state.operateType === this.props.t('cms.special_offer.create.state.map') } >
        <Map
          offerInfo={ this.props.operatingOffer }
          operateType={ operateType.edit }
          redirectToList={ this.redirectToList }
        />
      </If>
      <If condition={ this.state.operateType === this.props.t('cms.special_offer.create.state.admin') }>
        <Admin
          offerInfo={ this.props.operatingOffer }
          operateType={ operateType.edit }
          updateSpecialOffer={ this.props.updateSpecialOffer }
        />
      </If>
    </div>);
  }
}

EditOffer.propTypes = {
  t: PropTypes.func.isRequired,
  operatingOffer: PropTypes.func.isRequired,
  updateSpecialOffer: PropTypes.func.isRequired,
  communication: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  match: PropTypes.object.isRequired,
  getOperatingOffer: PropTypes.func.isRequired,
};

EditOffer.defaultProps = {
  communication: {},
  history: {
    push: () => {},
  },
  t: () => {},
  match: {},
  getOperatingOffer: () => {},
  operatingOffer: () => {},
  updateSpecialOffer: () => {},
};

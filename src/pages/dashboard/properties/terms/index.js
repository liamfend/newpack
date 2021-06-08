import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { List, Spin, message } from 'antd';
import { connect } from 'react-redux';
import * as termsActions from '~actions/properties/terms';
import Header from '~components/property-header';
import TermsRow from '~pages/dashboard/properties/terms/terms-row';
import TermsModal from '~pages/dashboard/properties/terms/terms-modal';
import Svg from '~components/svg';

import authControl from '~components/auth-control';
import { platformEntity, entityAction, communicationStatus } from '~constants';
import generatePath from '~settings/routing';
import showElementByAuth from '~helpers/auth';

const mapStateToProps = (state) => {
  const propertyTerms = state.dashboard.propertyTerms.toJS();

  return {
    getStatus: propertyTerms.communication.get.status,
    property: propertyTerms.property,
    terms: propertyTerms.propertyTerms || [],
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyTerms: (slug) => {
    dispatch(termsActions.getPropertyTerms(slug));
  },
  deletePropertyTerms: (params, successCallback) => {
    dispatch(termsActions.deletePropertyTerms(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(
  platformEntity.PROPERTIES_TERMS,
  entityAction.READ,
  props => generatePath('property.homepage', { propertySlug: props.match.params.propertySlug }),
)
class Terms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      handleType: 'create',
      editingTerm: null,
    };
  }

  componentDidMount() {
    this.props.getPropertyTerms(decodeURIComponent(this.props.match.params.propertySlug));
  }

  onAdd = () => {
    if (this.props.property && this.props.property.status === 'NEW') {
      message.error(this.props.t('cms.terms.create.status.error'));
      return;
    }
    this.setState({
      showModal: true,
      handleType: 'create',
      editingTerm: null,
    });
  }

  onEdit = (term) => {
    this.setState({
      showModal: true,
      handleType: 'edit',
      editingTerm: term,
    });
  }

  onDelete = (term) => {
    if (!term || !term.id) {
      return;
    }
    this.props.deletePropertyTerms({
      id: term.id,
    }, () => {
      this.props.getPropertyTerms(this.props.match.params.propertySlug);
    });
  }

  render() {
    const { t, property } = this.props;
    return (
      <div className="property-terms">
        <If condition={ property && property.id }>
          <Header
            t={ t }
            property={ property }
            type="terms"
          />
        </If>
        <Choose>
          <When
            condition={
              this.props.getStatus !== communicationStatus.IDLE
            }
          >
            <div className="property-terms__loading"><Spin /></div>
          </When>
          <When condition={ this.props.terms && this.props.terms.length > 0 }>
            <div className="property-terms__contain">
              <If
                condition={
                  showElementByAuth(platformEntity.PROPERTIES_TERMS, entityAction.CREATE)
                }
              >
                <button
                  type="button"
                  className="property-terms__add"
                  onClick={ this.onAdd }
                >
                  { `+ ${t('cms.terms.btn.add')}` }
                </button>
              </If>

              <List
                size="large"
                dataSource={ this.props.terms }
                renderItem={ item => (
                  <List.Item
                    key={ item.title }
                  >
                    <TermsRow
                      term={ item }
                      t={ this.props.t }
                      onEdit={ () => this.onEdit(item) }
                      onDelete={ () => this.onDelete(item) }
                    />
                  </List.Item>
                ) }
              />
            </div>
          </When>
          <Otherwise>
            <div className="property-terms__empty-contain">
              <div className="property-terms__empty">
                <Svg className="property-terms__empty-icon" hash="no-terms" />
                <p className="property-terms__empty-text">
                  { this.props.t('cms.terms.list.empty.text') }
                </p>
                <If
                  condition={
                    showElementByAuth(platformEntity.PROPERTIES_TERMS, entityAction.CREATE)
                  }
                >
                  <button
                    type="button"
                    className="property-terms__empty-create"
                    onClick={ this.onAdd }
                  >
                    { t('cms.terms.list.empty.btn.add') }
                  </button>
                </If>
              </div>
            </div>
          </Otherwise>
        </Choose>

        <If condition={ this.state.showModal }>
          <TermsModal
            t={ t }
            handleType={ this.state.handleType }
            defaultTerms={ this.state.editingTerm || {} }
            onClose={ () => this.setState({ showModal: false, editingTerm: null }) }
          />
        </If>
      </div>
    );
  }
}

Terms.propTypes = {
  t: PropTypes.func,
  property: PropTypes.object,
  terms: PropTypes.array,
  getPropertyTerms: PropTypes.func,
  match: PropTypes.object,
  getStatus: PropTypes.string,
  deletePropertyTerms: PropTypes.func,
};

Terms.defaultProps = {
  t: () => {},
  property: {},
  terms: [],
  match: {
    params: {
      propertySug: '',
    },
  },
  getStatus: '',
  getPropertyTerms: () => {},
  deletePropertyTerms: () => {},
};

export default Terms;

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Form, Spin, Icon } from 'antd';
import { connect } from 'react-redux';
import * as recordActions from '~actions/properties/record';
import RecordUpdate from '~pages/dashboard/properties/record/record-update';
import ContractEmpty from '~pages/dashboard/contract/contract-empty';
import RecordFormModal from '~pages/dashboard/properties/record/record-form-modal';
import RecordList from '~pages/dashboard/properties/record/record-list';
import RecordLandlord from '~pages/dashboard/properties/record/record-landlord';
import Header from '~components/property-header';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import authControl from '~components/auth-control';
import { isLandlordRole } from '~helpers/auth';

import generatePath from '~settings/routing';
import { isEmptyObject } from '~client/helpers/property-edit';

const mapStateToProps = (state) => {
  const propertyNote = state.dashboard.recordReducer.toJS();

  return {
    property: propertyNote.propertyNote || {},
    getPropertyStatus: propertyNote.communication.propertyNote.status,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyNote: (id, successCallBack) => {
    dispatch(recordActions.getPropertyNote(id, successCallBack));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(
  platformEntity.PROPERTIES_PROPERTIES_CONTRACTS,
  entityAction.READ,
  props => generatePath('property.homepage', { propertySlug: props.match.params.propertySlug }),
)
class Record extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalType: 'add',
      editNodeInfo: {},
      firstLoading: true,
    };
    this.fileArray = [];
  }

  componentDidMount() {
    this.props.getPropertyNote(decodeURIComponent(this.props.match.params.propertySlug), () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
      this.setState({
        firstLoading: false,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.property && nextProps.property.contracts !== this.props.property.contracts) {
      const contracts = Object.assign({}, nextProps.property.contracts);
      this.fileArray = [];
      Object.values(contracts).map((each) => {
        each.files.map((item) => {
          this.fileArray.push(item);
          return true;
        });
        return true;
      });
    }
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  setEditNodeInfo = (editNodeInfo) => {
    this.setState({ editNodeInfo });
  }

  openModal = (type = 'add') => {
    this.setState({
      showModal: true,
      modalType: type,
    });
  }

  render() {
    const { t, property, getPropertyStatus } = this.props;

    return (
      <div className="property-record">
        <If condition={ getPropertyStatus !== communicationStatus.IDLE && this.state.firstLoading }>
          <div className="property-edit__loading"><Spin /></div>
        </If>
        <Form>
          <Header
            t={ t }
            property={ property }
            type="record"
          />
          <div
            className={ classNames('contract-content__loading', {
              'contract-content__loading--show': getPropertyStatus !== communicationStatus.IDLE && !this.state.firstLoading,
            })
            }
            style={
              getPropertyStatus !== communicationStatus.IDLE && !this.state.firstLoading ?
                { paddingTop: '10px' } :
                {}
            }
          >
            <Icon type="loading" style={ { fontSize: '30px' } } />
          </div>
          <div className="property-record__content">
            <Choose>
              <When condition={ isLandlordRole() }>
                <RecordLandlord
                  t={ t }
                  fileArray={ this.fileArray }
                />
              </When>
              <Otherwise>
                <RecordUpdate
                  openModal={ this.openModal }
                  t={ t }
                  property={ property }
                  fileArray={ this.fileArray }
                />
                <If condition={ !property.notes || property.notes.length === 0 }>
                  <ContractEmpty
                    t={ t }
                    typeName={ 'record' }
                    openModal={ this.openModal }
                  />
                </If>
                <If condition={ property.notes && property.notes.length > 0 }>
                  <RecordList
                    openModal={ this.openModal }
                    t={ t }
                    property={ property }
                    setEditNodeInfo={ this.setEditNodeInfo }
                    getPropertyNote={ this.props.getPropertyNote }
                    match={ this.props.match }
                  />
                </If>
                <If condition={ this.state.showModal }>
                  <RecordFormModal
                    activeModal
                    form={ this.props.form }
                    t={ t }
                    closeModal={ this.closeModal }
                    modalType={ this.state.modalType }
                    property={ property }
                    editNodeInfo={ this.state.editNodeInfo }
                    getPropertyNote={ this.props.getPropertyNote }
                    match={ this.props.match }
                  />
                </If>
              </Otherwise>
            </Choose>
          </div>
        </Form>
      </div>
    );
  }
}

Record.propTypes = {
  form: PropTypes.object.isRequired,
  t: PropTypes.func,
  property: PropTypes.object,
  getPropertyNote: PropTypes.func,
  match: PropTypes.object,
  getPropertyStatus: PropTypes.object,
  history: PropTypes.object,
};

Record.defaultProps = {
  property: {},
  t: () => {},
  getPropertyNote: () => {},
  match: {},
  getPropertyStatus: {},
  history: {},
};

export default Form.create({
  name: 'record_form',
})(Record);

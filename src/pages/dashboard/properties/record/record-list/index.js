import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as recordActions from '~actions/properties/property-list';
import { connect } from 'react-redux';
import { Icon, Popconfirm, Row, Col, message } from 'antd';
import moment from 'moment';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

const mapDispatchToProps = dispatch => ({
  deletePropertyNote: (params, successCallback, failedCallback) => {
    dispatch(recordActions.deletePropertyNote(params, successCallback, failedCallback));
  },
});

@connect(null, mapDispatchToProps)

export default class RecordList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      descArray: [true],
    };
  }

  showDesc = (index) => {
    const { descArray } = this.state;
    descArray[index] = !descArray[index];
    this.setState(this.state);
  }

  editModal = (e, noteItem) => {
    e.stopPropagation();
    this.props.openModal('edit');
    this.props.setEditNodeInfo(noteItem);
  }

  handleDeleteRecord = (editNodeInfo) => {
    this.props.deletePropertyNote({ id: editNodeInfo.id }, () => {
      message.success(this.props.t('cms.property.record.form_modal.delete.success'));
      this.props.getPropertyNote(
        decodeURIComponent(this.props.match.params.propertySlug),
        (res) => {
          if (res.property.notes.length > 0) {
            this.setState({
              descArray: [true],
            });
          }
        });
    },
    () => {
      message.error(this.props.t('cms.auth.login.alert.clienterror'));
    },
    );
  }

  render() {
    const { t, property } = this.props;

    return (
      <div className="record-list">
        <If condition={ property.notes }>
          <For index="index" each="item" of={ property.notes }>
            <div key={ index }>
              <Row
                className="record-list__outer-box"
              >
                <div
                  role="button"
                  tabIndex="0"
                  className={ classNames('record-list__each-box', { 'record-list__each-box--bg': this.state.descArray[index] }) }
                  onClick={ () => this.showDesc(index) }
                >
                  <Col span={ 16 }>
                    <If condition={ !this.state.descArray[index] }>
                      <Icon type="down" />
                    </If>
                    <If condition={ this.state.descArray[index] }>
                      <Icon type="up" />
                    </If>
                    <div className="record-list__note-title">
                      {item.title ? item.title : 'Untitled note'}
                    </div>
                  </Col>
                  <Col span={ 5 }>
                    <div className="record-list__update-time">
                      {t('cms.property.record.note_content.update_time')}: {moment(item.updatedAt).format('DD/MM/YYYY')}
                    </div>
                  </Col>
                  <Col span={ 3 }>
                    <div className="record-list__btn-box">
                      <If condition={ showElementByAuth(
                        platformEntity.PROPERTIES_CONTRACTS,
                        entityAction.UPDATE,
                      ) }
                      >
                        <button
                          className="listings-tab__edit-listing-btn"
                          onClick={ e => this.editModal(e, item) }
                        >
                          <Icon
                            type="edit"
                            style={ {
                              color: '#38b2a6',
                            } }
                          />
                        </button>
                      </If>
                      <If condition={ showElementByAuth(
                        platformEntity.PROPERTIES_CONTRACTS,
                        entityAction.DELETE,
                      ) }
                      >
                        <Popconfirm
                          placement="topRight"
                          title={ t('cms.property.record.form_modal.delete.tips') }
                          onConfirm={
                            (e) => {
                              e.stopPropagation();
                              this.handleDeleteRecord(item);
                            }
                          }
                          onCancel={ (e) => { e.stopPropagation(); } }
                          okText={ t('cms.properties.edit.btn.yes') }
                          okType="danger"
                          cancelText={ t('cms.properties.edit.btn.no') }
                        >
                          <Icon
                            className="listings-tab__delete-listing-btn"
                            type="delete"
                            style={ {
                              color: '#38b2a6',
                            } }
                            onClick={ (e) => { e.stopPropagation(); } }
                          />
                        </Popconfirm>
                      </If>
                    </div>
                  </Col>
                </div>
              </Row>
              <If condition={ this.state.descArray[index] }>
                <div className="record-list__desc">
                  <div className="record-list__full-note">
                    {item.title ? item.title : 'Untitled note'}
                  </div>
                  <If condition={ item.description }>
                    <div
                      className="record-list__desc-text"
                      dangerouslySetInnerHTML={ { __html: item.description } }
                    />
                  </If>
                  <div className="record-list__stage">
                    <span className="record-list__stage--before">{item.oldContractStage ? t(`cms.property.record.form_modal.stage.${item.oldContractStage.toLowerCase()}`) : t('cms.property.record.form_modal.stage.prospect')}</span>
                    <Icon type="arrow-right" />
                    <span className="record-list__stage--current">{t(`cms.property.record.form_modal.stage.${item.newContractStage.toLowerCase()}`)}</span>
                  </div>
                  <div className="record-list__desc-bottom">
                    <span className="record-list__create">
                      {t('cms.property.record.note_content.create_time')}: {moment(item.createdAt).format('DD/MM/YYYY')}
                    </span>
                    <If condition={
                      item.updatedUser
                      && (item.updatedUser.firstName || item.updatedUser.lastName)
                    }
                    >
                      <span className="record-list__interval">|</span>
                      <span className="record-list__edit">
                        {t('cms.property.record.note_content.edit_by')}: {`${item.updatedUser.firstName}.${item.updatedUser.lastName}`}
                      </span>
                    </If>
                  </div>
                </div>
              </If>
            </div>
          </For>
        </If>
      </div>
    );
  }
}

RecordList.propTypes = {
  openModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  setEditNodeInfo: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  deletePropertyNote: PropTypes.func,
  getPropertyNote: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

RecordList.defaultProps = {
  deletePropertyNote: () => {},
};

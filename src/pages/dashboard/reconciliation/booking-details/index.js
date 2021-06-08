/* eslint-disable   */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { get } from 'lodash';
import { Breadcrumb, Descriptions, Card, Divider, Button, Table, Modal, message, Popconfirm } from 'antd';
import Svg from '~components/svg';
import formatPrice from '~helpers/currency';
import { stringDateFormat, getGender, getSecondaryStatus } from '~pages/dashboard/reconciliation/utils';
import { closeActiveOpportunityCases } from '~actions/reconciliation/bookinglist';
import nationality from '~helpers/nationality';
import { showPassportName } from '~helpers';
import authControl from '~components/auth-control';
import { platformEntity, entityAction } from '~constants';
import ChangeBookingStatusModal from '~pages/dashboard/reconciliation/booking-details/statusModal'; 
import ReconciliationBookingComment from '~components/reconciliation-booking-comment';
import CaseOwnerContact from '~components/case-owner-contact';
import ChangesTable from '~pages/dashboard/reconciliation/booking-details/changes-table';
import NavigationBar from '~pages/dashboard/reconciliation/booking-details/navigation-bar';
import { secondaryLandlordBookingStatus } from '~constants/reconciliation-booking';
import ReconciliationOpportunityModal from '~components/reconciliation-opportunity-modal';
import useOpportunityDetails from '~pages/dashboard/reconciliation/booking-details/useOpportunityDetails';

/* eslint-disable   */
const Index = ({ match }) => {
  const { t } = useTranslation();
  const { opportunityId } = match.params;
  const {
    handleToggleEditOpportunityModal,
    handleClickConfirm,
    handleChangeBookingStatus,
    handleClickAssign,
    showLogicManualCase,
    setShowStatusModal,
    setShowCloseCaseModal,
    setChangeBookingBtnDisabled,
    setLandlordBookingStatus,
    setUpdateCounter,
    MAINSTATE,
    lastNote,
    showStatusModal,
    isShowCloseCaseModal,
    isShowBookingModal,
    changeBookingBtnDisabled,
    pageInfo,
    opportunityDetail,
    columns,
    opportunityActive,
    updateCounter,
  } = useOpportunityDetails({ opportunityId });

  return (
    opportunityDetail ? <div className="reconciliation-booking">
      <div className="reconciliation-booking__card">
        <div className="nav">
          <Breadcrumb>
            <Breadcrumb.Item>
              <a href="/reconciliation/">{ t('cms.reconciliation.breadcrumb.title') }</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a href={`/reconciliation/landlord/${match.params.id}`}>
                { get(opportunityDetail, 'completedXbooking.landlordName', '-') }
              </a>
            </Breadcrumb.Item>
              <Breadcrumb.Item>{ `${showPassportName(get(opportunityDetail, 'student', {}))}'s booking`}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="discribe--wapper ">
          <Descriptions
            title={ `${get(opportunityDetail, 'completedXbooking.referenceId')}:${showPassportName(get(opportunityDetail, 'student', {}))}`}
          >
            <Descriptions.Item label={t('cms.reconciliation.booking.details.header.Completeat')}>
              { stringDateFormat(get(opportunityDetail, 'completedAt')) }
            </Descriptions.Item>
            <Descriptions.Item label={t('cms.reconciliation.booking.details.header.OpportunityID')} span={ 2 }>
              { get(opportunityDetail, 'referenceId') }
            </Descriptions.Item>
            <Descriptions.Item label={t('cms.reconciliation.booking.details.header.Completeby')}>
              { get(opportunityDetail, 'completedBy') || '-' }
            </Descriptions.Item>
            <Descriptions.Item label={t('cms.reconciliation.booking.details.header.Currencyapplied')} span={ 2 }>
              { get(opportunityDetail, 'currency') }
            </Descriptions.Item>
          </Descriptions>
          <div className="btns-box" >
            <Button
              type='primary'
              className='changebooking'
              disabled={ changeBookingBtnDisabled }
              onClick={ handleChangeBookingStatus }
            >
              {t('cms.reconciliation.booking.details.header.Changebookingstatus')}
            </Button>
            <div style={{ display: 'flex' }}>
              <div className='status-box'>
                <div>{t('cms.reconciliation.booking.details.header.BookingStatus')}</div>
                <div>{MAINSTATE.getValueByKey(get(opportunityDetail, 'landlordBookingStatus'))}</div>
              </div>
              {
                get(opportunityDetail, 'secondaryLandlordBookingStatus') ?
                <div className='status-box'>
                  <div>{ t('cms.reconciliation.booking.details.header.SecondaryBookingStatus') }</div>
                  <div>{ getSecondaryStatus(get(opportunityDetail, 'landlordBookingStatus')).getValueByKey(get(opportunityDetail, 'secondaryLandlordBookingStatus')) }</div>
                </div> : null
              }
            </div>
          </div>
        </div>
      </div>

      <div className="reconciliation-booking__tabs">
        <NavigationBar opportunityDetail={ opportunityDetail } />
        <If condition={ lastNote } >
          <div className="reconciliation-booking__comment-case">
            <div className="reconciliation-booking__booking-comment">
                <Card
                  title={t('cms.reconciliation.booking.details.cards.label.Bookingcomment')}
                  bordered={false}
                  className="comment-card"
                  extra={
                    <If condition={ showLogicManualCase(lastNote) }>
                      <span className="booking-card__extra-container">
                        <Popconfirm
                          overlayClassName="property-detail-wrapper__popconfirm"
                          overlayStyle={ { maxWidth: 214 } }
                          placement="topRight"
                          title={ t('cms.reconciliation.booking.details.comment.assign.title') }
                          onConfirm={ handleClickAssign }
                          okText={ t('cms.properties.edit.btn.yes') }
                          okType="danger"
                          cancelText={ t('cms.properties.edit.btn.no') }
                        >
                          <button
                            className="reconciliation-booking__booking-content__edit-btn"
                          >
                            <Svg
                              hash='icon-reconciliation-assign'
                              className="reconciliation-booking__assign-icon"
                            />
                          </button>
                        </Popconfirm>
                      </span>
                    </If>
                  }
                  >
                    <ReconciliationBookingComment
                      opportunityStateChangesNote={ lastNote }
                      bookingStatus={ get(opportunityDetail, 'landlordBookingStatus') }
                      isActiveOpportunity={ opportunityActive }
                    />
                </Card>
            </div>
            <If condition={
              [
                secondaryLandlordBookingStatus.CASE_ASSIGNED,
                secondaryLandlordBookingStatus.CASE_DONE
              ].includes(get(opportunityDetail, 'secondaryLandlordBookingStatus'))
            }>
              <div className="reconciliation-booking__case-owner">
                <Card
                  title={ t('cms.reconciliation.booking.details.cards.label.CaseOwner') }
                  bordered={ false }
                  className="case-owner-contact-card"
                >
                  <CaseOwnerContact
                    opportunityStateChangesNote={ lastNote || {} }
                  />
                </Card>
              </div>
            </If>
          </div>
        </If>

        <div className="reconciliation-booking__content" id="booking_details">
          <div className="box-cards">
            <Card
              title={ t('cms.reconciliation.booking.details.cards.label.Bookingdetails') }
              bordered={ false }
              className="booking-card"
              extra={
                <span className="booking-card__extra-container">
                  <span className="booking-card__extra-remider">
                    <Svg hash='icon-reconciliation-reader' className="booking-card__extra-icon" />
                    <span className="booking-card__extra-content">
                      { t('cms.reconciliation.booking.details.info.reminder.content') }
                    </span>
                  </span>
                  <button
                    className="reconciliation-booking__booking-detail__edit-btn"
                    onClick={ handleToggleEditOpportunityModal }
                  >
                    <Svg hash='icon-edit' className="editor-icon" />
                  </button>
                </span>
              }
            >
              <div className='details-wapper'>
                <div className="details-info" >
                  <Descriptions column={ 1 }>
                    <Descriptions.Item label={ t('cms.reconciliation.booking.details.info.label.movein') }>
                      { stringDateFormat(get(opportunityDetail, 'finalMoveInDate')) }
                    </Descriptions.Item>
                    <Descriptions.Item label={ t('cms.reconciliation.booking.details.info.label.moveout') }>
                      { stringDateFormat(get(opportunityDetail, 'finalMoveOutDate')) }
                    </Descriptions.Item>
                    <Descriptions.Item label={ t('cms.reconciliation.booking.details.info.label.Finalprice') }>
                      { formatPrice(get(opportunityDetail, 'finalPrice', 0), get(opportunityDetail, 'currency'))  }
                    </Descriptions.Item>
                  </Descriptions>
                </div>
                <div className='comission'>
                  <div className='rowline'>
                    <div className="comission__title">
                      {t('cms.reconciliation.booking.details.info.label.Normalommissionvalue')}
                    </div>
                    <div className="comission__price">
                      { formatPrice(get(opportunityDetail, 'completedXbooking.commission.value'), get(opportunityDetail, 'completedXbooking.commission.currency')) }
                    </div>
                  </div>
                  <div className='rowline'>
                    <div className="comission__title">
                      {t('cms.reconciliation.booking.details.info.label.Bonuscommissionvalue')}
                    </div>
                    <div className="comission__price">
                      { formatPrice(get(opportunityDetail, 'completedXbooking.commission.bonusValue'), get(opportunityDetail, 'completedXbooking.commission.currency')) }
                    </div>
                  </div>
                  <Divider />
                  <div className='rowline'>
                    <div className="comission__title">
                      {t('cms.reconciliation.booking.details.info.label.Totalcommissionvalue')}
                    </div>
                    <div className='patch-blod'>
                      { formatPrice(get(opportunityDetail, 'completedXbooking.commission.totalCommissionValue'), get(opportunityDetail, 'completedXbooking.commission.currency')) }
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="product-card-container">
              <Card
                title={ t('cms.reconciliation.booking.details.cards.label.Productinformation') }
                bordered={ false }
                className="product-card"
                extra={
                  <a className="mainbtn changeproduct">
                    { t('cms.reconciliation.booking.details.info.label.Changeproduct') }
                  </a>
                }
              >
                <Table
                  columns={ columns }
                  dataSource={ [opportunityDetail] }
                  pagination={ false }
                /> 
              </Card>
            </div>
          </div>
          <If condition={get(opportunityDetail, 'secondaryLandlordBookingStatus') !== secondaryLandlordBookingStatus.CASE_CLOSED}>
            <div className="booking-userinfo">
              <Card bordered={ false }>
                <Card.Meta
                  avatar={ <Svg hash='account-photo' className="account-photo-icon" /> }
                  title={ showPassportName(get(opportunityDetail, 'student', {})) }
                  description={ get(opportunityDetail, 'student.emailAddress') }
                />
                <Divider />
                <Descriptions layout="vertical" column={1} colon={false}>
                  <Descriptions.Item label={t('cms.reconciliation.booking.details.userinfo.label.Passportnumber')}>
                    { get(opportunityDetail, 'student.passportNumber') || '-' }
                  </Descriptions.Item>
                  <Descriptions.Item label={t('cms.reconciliation.booking.details.userinfo.label.Phone')}>
                    { get(opportunityDetail, 'student.phoneNumber') || '-' }
                  </Descriptions.Item>
                  <Descriptions.Item label={t('cms.reconciliation.booking.details.userinfo.label.Birthday')}>
                    { stringDateFormat(get(opportunityDetail, 'student.dateOfBirth')) }
                  </Descriptions.Item>
                  <Descriptions.Item label={t('cms.reconciliation.booking.details.userinfo.label.Gender')}>
                    { getGender(get(opportunityDetail, 'student.gender')) }
                  </Descriptions.Item> 
                  <Descriptions.Item label={t('cms.reconciliation.booking.details.userinfo.label.Nationality')}>
                    { get(nationality.list.find(f => f.code === get(opportunityDetail, 'student.nationality')), 'name') || '-' }
                  </Descriptions.Item>
                  <Descriptions.Item label={t('cms.reconciliation.booking.details.userinfo.label.Destinationuniversity')}>
                    { get(opportunityDetail, 'student.destinationUniversity') ? get(opportunityDetail, 'student.destinationUniversity').replace(/-/ig,' ') : '-' }
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          </If>
        </div>

        <If condition={
          get(opportunityDetail, 'opportunityStateChanges', []).length > 0
        }>
          <ChangesTable list={ get(opportunityDetail, 'opportunityStateChanges') } />
        </If>
      </div>
      {
        showStatusModal &&
        <ChangeBookingStatusModal
          status={{
            landlordBookingStatus: get(opportunityDetail, 'landlordBookingStatus'),
            secondaryLandlordBookingStatus: get(opportunityDetail, 'secondaryLandlordBookingStatus'),
          }}
          opportunityId={ get(opportunityDetail, 'id') }
          payload={[showStatusModal, setShowStatusModal, setLandlordBookingStatus]}
         />
      }
      {
        <Modal 
          visible={ isShowCloseCaseModal }
          icon={ null }
          okText={ pageInfo.confirm.okText }
          okType={ "primary" }
          destroyOnClose={ true }
          cancelText={ pageInfo.confirm.cancelText }
          maskClosable={ false }
          onCancel={ ()=>{
            setChangeBookingBtnDisabled(false)
            setShowCloseCaseModal(false)
          } }
          onOk={ () => {
            closeActiveOpportunityCases({opportunityId: get(opportunityDetail, 'id')}, (closeResult) => { 
              if (closeResult.closeActiveOpportunityCases) {
                message.success(pageInfo.confirm.succ);
              } else {
                message.error(pageInfo.confirm.failed);
              }
              setUpdateCounter(updateCounter + 1);
              setChangeBookingBtnDisabled(false)
              setShowCloseCaseModal(false)
            })
          }}
        >
          <div className="reconciliation-bkdetails__title">
            {pageInfo.confirm.title}
          </div>          
          {pageInfo.confirm.content}
        </Modal>
      }

      <If condition={ isShowBookingModal }>
        <ReconciliationOpportunityModal
          activeModal={ isShowBookingModal }
          handleClickClose={ handleToggleEditOpportunityModal }
          onConfirm={ handleClickConfirm }
          editOpportunity={
            {
              finalMoveInDate: get(opportunityDetail, 'finalMoveInDate') || '',
              finalMoveOutDate: get(opportunityDetail, 'finalMoveOutDate') || '',
              finalPrice: get(opportunityDetail, 'finalPrice') || 0,
              currency: get(opportunityDetail, 'currency'),
            }
          }
        />
      </If>
    </div> : null
  );
}

export default authControl(platformEntity.BOOKINGS_OPPORTUNITIES, entityAction.READ)(Index);

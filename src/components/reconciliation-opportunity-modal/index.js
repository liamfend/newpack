import React, { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Icon, InputNumber, DatePicker, Form, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import modal from '~components/modal'
import { getSymbolFromCurrency } from '~base/global/helpers/currency'

const ReconciliationOpportunityModal = ({ handleClickClose, onConfirm, form, editOpportunity }) => {
  const { t } = useTranslation()
  const finalMoveInDateRef = useRef(null)
  const finalMoveOutDateRef = useRef(null)
  const { getFieldDecorator } = form
  const dateFormat = 'DD/MM/YYYY'

  useEffect(() => {
    form.setFieldsValue({
      finalMoveInDate: editOpportunity.finalMoveInDate
        ? moment(editOpportunity.finalMoveInDate, 'YYYY-MM-DD')
        : null,
      finalMoveOutDate: editOpportunity.finalMoveOutDate
        ? moment(editOpportunity.finalMoveOutDate, 'YYYY-MM-DD')
        : null,
      finalPrice: editOpportunity.finalPrice,
    })
  }, [])

  const disabledDate = useCallback(
    current => current < moment(form.getFieldValue('finalMoveInDate')).add(1, 'days'),
    [form.getFieldValue('finalMoveInDate')],
  )

  return (
    <div className="reconciliation-opportunity-modal">
      <div className="reconciliation-opportunity-modal__container">
        {/* ------ header start ------ */}
        <div className="reconciliation-opportunity-modal__header">
          <div className="reconciliation-opportunity-modal__header-container">
            <h3 className="reconciliation-opportunity-modal__header__title">
              {t('cms.reconciliation.booking.details.edit.modal.header')}
            </h3>
            <button
              className="reconciliation-opportunity-modal__btn reconciliation-opportunity-modal__btn--close"
              onClick={handleClickClose}
            >
              <Icon type="close" style={{ fontSize: '12px', color: '#9e9e9e' }} />
            </button>
          </div>
        </div>
        {/* ------ header end ------ */}

        {/* ------ content start ------ */}
        <Form layout="vertical" className="reconciliation-opportunity-modal__content">
          <Form.Item
            name="finalMoveInDate"
            label={t('cms.reconciliation.booking.details.edit.modal.movein.title')}
          >
            <div ref={finalMoveInDateRef}>
              {getFieldDecorator('finalMoveInDate', {
                trigger: 'onChange',
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (!value && !form.getFieldValue('finalMoveInDate')) {
                        callback(
                          t('cms.reconciliation.booking.details.edit.modal.datepicker.empty'),
                        )
                      } else {
                        callback()
                      }
                    },
                  },
                ],
              })(
                <DatePicker
                  placeholder={t(
                    'cms.reconciliation.booking.details.edit.modal.datepicker.placeholder',
                  )}
                  getCalendarContainer={() => finalMoveInDateRef.current}
                  format={dateFormat}
                  picker="month"
                  style={{ width: '100%' }}
                  inputReadOnly
                />,
              )}
            </div>
          </Form.Item>
          <Form.Item
            label={t('cms.reconciliation.booking.details.edit.modal.moveout.title')}
            name="finalMoveOutDate"
          >
            <div ref={finalMoveOutDateRef}>
              {getFieldDecorator('finalMoveOutDate', {
                trigger: 'onChange',
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (!value && !form.getFieldValue('finalMoveOutDate')) {
                        callback(
                          t('cms.reconciliation.booking.details.edit.modal.datepicker.empty'),
                        )
                      } else {
                        callback()
                      }
                    },
                  },
                ],
              })(
                <DatePicker
                  placeholder={t(
                    'cms.reconciliation.booking.details.edit.modal.datepicker.placeholder',
                  )}
                  getCalendarContainer={() => finalMoveOutDateRef.current}
                  format={dateFormat}
                  picker="month"
                  style={{ width: '100%' }}
                  inputReadOnly
                  disabledDate={disabledDate}
                />,
              )}
            </div>
          </Form.Item>
          <Form.Item
            label={t('cms.reconciliation.booking.details.edit.modal.finalprice.title')}
            name="finalPrice"
          >
            {getFieldDecorator('finalPrice', {
              trigger: 'onChange',
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!value && !form.getFieldValue('finalPrice')) {
                      callback(t('cms.reconciliation.booking.details.edit.modal.finalprice.empty'))
                    } else {
                      callback()
                    }
                  },
                },
              ],
            })(
              <InputNumber
                formatter={value =>
                  `${getSymbolFromCurrency(editOpportunity.currency)} ${value}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ',',
                  )
                }
                parser={value => value.replace(/[^0-9.]/g, '')}
                min={0}
                precision={2}
              />,
            )}
          </Form.Item>
        </Form>

        <div className="reconciliation-opportunity-modal__bottom">
          <Button
            size="large"
            onClick={handleClickClose}
            className="reconciliation-opportunity-modal__bottom-default"
          >
            {t('cms.reconciliation.booking.details.edit.modal.cancel')}
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              onConfirm(form)
            }}
            className="reconciliation-opportunity-modal__bottom-primary"
          >
            {t('cms.reconciliation.booking.details.edit.modal.confirm')}
          </Button>
        </div>
        {/* ------ content end ------ */}
      </div>
    </div>
  )
}

ReconciliationOpportunityModal.propTypes = {
  onConfirm: PropTypes.func,
  handleClickClose: PropTypes.func,
  form: PropTypes.object.isRequired,
  editOpportunity: PropTypes.shape({
    finalMoveInDate: PropTypes.string,
    finalMoveOutDate: PropTypes.string,
    finalPrice: PropTypes.string,
    currency: PropTypes.string,
  }),
}

ReconciliationOpportunityModal.defaultProps = {
  onConfirm: () => {},
  handleClickClose: () => {},
  form: PropTypes.object.isRequired,
  editOpportunity: {
    finalMoveInDate: '',
    finalMoveOutDate: '',
    finalPrice: '',
    currency: '',
  },
}

export default Form.create({
  name: 'reconciliation-opportunity-modal-form',
})(modal()(ReconciliationOpportunityModal))

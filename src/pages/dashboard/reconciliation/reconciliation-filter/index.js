import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';
/* eslint-disable   */
export default function index({ form, handleReset, handleSearch }) {
  const { t } = useTranslation();
  const { getFieldDecorator } = form;

  return (
    <Form>
      <div className="reconciliation-filter">
        <span className="reconciliation-filter__label">
          { t('cms.reconciliation_list.filter.search_term.label') }:
        </span>
        <Form.Item className="reconciliation-filter__item">
        { getFieldDecorator('idsType', {
            initialValue: 'xbookingReferenceIds',
          })(
            <Select
              className="reconciliation-filter__select"
              placeholder={ t('cms.reconciliation.landlord.selector.placeholder') }
            >
              <Select.Option
                key="xbookingReferenceIds"
                value="xbookingReferenceIds"
                className="reconciliation-filter__select-option"
              >
                { t('cms.reconciliation_list.filter.student_booking_id.label') }
              </Select.Option>
              <Select.Option
                key="landlordApplicationIds"
                value="landlordApplicationIds"
                className="reconciliation-filter__select-option"
              >
                { t('cms.reconciliation_list.filter.partner_booking_id.label') }
              </Select.Option>
            </Select>,
          )}
        </Form.Item>
        <Form.Item
          className="reconciliation-filter__item--ids"
        >
          { getFieldDecorator('ids')
          (
            <Input
              placeholder={ t('cms.reconciliation_list.filter.booking_id.placeholder') }
            />,
          )}
        </Form.Item>

        <div className="reconciliation-filter__btns">
          <Form.Item className="btns">
            <Button
              type="button"
              className="mg"
              onClick={ handleReset }
            >
              {t('cms.reconciliation.landlord.filter.reset')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={ handleSearch }
            >
              {t('cms.reconciliation.landlord.filter.submit')}
            </Button>
          </Form.Item>
        </div>
      </div>
    </Form>
  );
}

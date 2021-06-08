/* eslint-disable   */
import React, { useState } from "react";
import { Modal, Form, Select, Input ,message} from "antd";
import {
  getMainStatus,
  getPendingReason,
  getSecondaryStatus,
} from "~pages/dashboard/reconciliation/utils";
import { updateLandlordStatus } from "~actions/reconciliation/bookinglist";
import FileUpload from "./FileUpload";
import usePageInfo from '~pages/dashboard/reconciliation/booking-details/pageInfo'
import { EmojiRegex } from '~helpers/validate';

const StatusModal = (props) => {
  const { getFieldDecorator } = props.form;
  const {
    landlordBookingStatus,
  } = props.status;
  const [mainStateSelecte, setMainStateSelecte] = useState();
  const [textAreaValue, setTextAreaValue] = useState("");
  const [fileList, setFileList] = useState([]);
  const [show,setShow,setLandlordBookingStatus] = props.payload
  
  const MAINSTATE = getMainStatus();
  const PENDINGREASON = getPendingReason();
  const pageInfo = usePageInfo()

  const textAreaOnchange = (e) => {
    setTextAreaValue(e.currentTarget.value);
  };

  return (
    <Modal
      className="reconciliation-bkdetails" 
      okText={pageInfo.modal.btnConfirm}
      cancelText={pageInfo.modal.btnCancel}
      maskClosable={false}
      onCancel={() => {
        setShow(false);
      }}
      visible={true}
      onOk={() => {
        props.form.validateFields((err, values) => {
          if (!err) {
            let parms = {
              id: props.opportunityId,
              data: {
                landlordBookingStatus: values.mainState,
                secondaryLandlordBookingStatus: values.secondary,
              },
            };
            if (mainStateSelecte === MAINSTATE.keys[1]) {
              parms.data.secondaryLandlordBookingStatus = getSecondaryStatus(
                mainStateSelecte
              ).keys[0];
              parms.data.noteData = {
                pendingNote: values.pendingReason,
                description: values.description,
                files: fileList.length
                  ? fileList.map((fs) => ({
                      name: fs.name,
                      contentType: fs.type,
                      source: fs.response.source,
                    }))
                  : [],
              };
            }
            updateLandlordStatus(parms, (result) => {
              setLandlordBookingStatus(parms);
              message.success(pageInfo.modal.succ);
              setShow(false);
            });
          }
        });
      }}
    >
      <div className="reconciliation-bkdetails__title">
        {pageInfo.modal.title}
      </div>

      <Form layout="vertical" className='form-maxheight'>
        <Form.Item label={pageInfo.modal.mainStateLabel}>
          {getFieldDecorator(pageInfo.keys.mainState, {
            rules: [
              {
                type: "string",
                required: true,
                message: pageInfo.modal.emptyError,
              },
            ],
          })(
            <Select
              placeholder = {pageInfo.modal.lbs}
              onChange={(_value) => {
                setMainStateSelecte(_value);
                props.form.resetFields([`${pageInfo.keys.secondary}`]);
              }}
            >
              {MAINSTATE.keys.map(
                (_status, _index) =>
                  _status != landlordBookingStatus && (
                    <Select.Option value={_status} key={_index}>
                      {MAINSTATE.value[_index]}
                    </Select.Option>
                  )
              )}
            </Select>
          )}
        </Form.Item>
        {mainStateSelecte === MAINSTATE.keys[1] && (
          <Form.Item label={pageInfo.modal.pendingReason}>
            {getFieldDecorator(pageInfo.keys.pendingReason, {
              rules: [
                {
                  type: "string",
                  required: true,
                  message: pageInfo.modal.emptyError,
                },
              ],
            })(
              <Select  placeholder = {pageInfo.modal.pr}>
                {PENDINGREASON.keys.map((_status, _index) => (
                  <Select.Option key={_index} value={_status}>
                    {PENDINGREASON.getValueByKey(_status)}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        )}
        {getSecondaryStatus(mainStateSelecte).keys.length > 0 &&
          mainStateSelecte !== MAINSTATE.keys[1] && (
            <Form.Item
              key={mainStateSelecte}
              label={pageInfo.modal.secondaryLabel}
            >
              {getFieldDecorator(pageInfo.keys.secondary, { 
                rules: [
                  {
                    type: "string",
                    required: true,
                    message: pageInfo.modal.emptyError,
                  },
                ],
              })(
                <Select  placeholder = {pageInfo.modal.ss}>
                  {getSecondaryStatus(mainStateSelecte).keys.map(
                    (_status, _index) => (
                      <Select.Option key={_index} value={_status}>
                        {getSecondaryStatus(mainStateSelecte).getValueByKey(
                          _status
                        )}
                      </Select.Option>
                    )
                  )}
                </Select>
              )}
            </Form.Item>
          )}

        {mainStateSelecte === MAINSTATE.keys[1] && (
          <React.Fragment>
            <Form.Item label={pageInfo.modal.description}>
              {getFieldDecorator(pageInfo.keys.description, {
                rules: [
                  {
                    type: "string",
                    required: true,
                    whitespace:true,
                    message: pageInfo.modal.emptyError,
                  },
                ],
              })(
                <Input.TextArea
                className='textarea-box'
                  onChange={textAreaOnchange}
                  onInput={(e) =>
                    (e.currentTarget.value = e.currentTarget.value.replace(
                      EmojiRegex,
                      ""
                    ))
                  }
                  maxLength={500}
                  placeholder={pageInfo.modal.descripitionHolder}
                ></Input.TextArea>
              )}
               <div className="limit-number">{textAreaValue.length}/500</div>
            </Form.Item>
            <Form.Item label={pageInfo.modal.files}>
              <FileUpload doneFile={setFileList} />
            </Form.Item>
          </React.Fragment>
        )}
      </Form>
    </Modal>
  );
};

export default Form.create({ name: "statemodal" })(StatusModal);

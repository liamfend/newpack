/* eslint-disable max-len */
import React from 'react';
import { Collapse, Icon } from 'antd';

const { Panel } = Collapse;

export default class MyAccount extends React.Component {
  render() {
    const firstCustomPanelStyle = {
      borderRadius: 4,
      marginTop: 40,
      paddingBottom: 48,
      border: 0,
      borderBottom: '1px solid #e7e7e7',
      overflow: 'hidden',
    };

    return (
      <div className="my-account center-style">
        <h1 className="center-style__title">My account</h1>

        <div className="center-style__content">
          The Account section is designed for you to update his basic information. You can change his first name, last name and reset password in the account setting section.
        </div>
        <Collapse
          bordered={ false }
          expandIcon={ ({ isActive }) =>
            <Icon type="caret-up" style={ { fontSize: '16px', right: '32px' } } rotate={ isActive ? 0 : 180 } />
          }
          expandIconPosition="right"
        >
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                1. How can I change my personal information？
              </h3>
            ) }
            key={ 1 }
            style={ firstCustomPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <p className="center-style__bold-line-container">
                    You can directly change your <span className="center-style__bold">first name</span> and <span className="center-style__bold">last name</span> in the input box.
                  </p>
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-13.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-13.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-13@2x.jpg 2x"
                    alt="13"
                  />
                  <div className="center-style__row-28" />
                  If you want to change your password, just click [Modify],  and you can start to input your new password.
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-14.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-14.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-14@2x.jpg 2x"
                    alt="14"
                  />
                  <div className="center-style__note">
                    <Icon type="exclamation-circle" theme="filled" className="center-style__note-icon" />
                    <span className="center-style__bold">Note:</span>
                    If you cannot choose intentional date, please kindly check the Move in date and Tenancy length content.
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}


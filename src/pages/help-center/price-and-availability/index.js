/* eslint-disable max-len */
import React from 'react';
import { Collapse, Icon } from 'antd';

const { Panel } = Collapse;

export default class PriceAndAvailability extends React.Component {
  render() {
    const customPanelStyle = {
      borderRadius: 4,
      marginTop: 48,
      paddingBottom: 48,
      border: 0,
      borderBottom: '1px solid #e7e7e7',
      overflow: 'hidden',
    };

    const firstCustomPanelStyle = {
      borderRadius: 4,
      marginTop: 40,
      paddingBottom: 48,
      border: 0,
      borderBottom: '1px solid #e7e7e7',
      overflow: 'hidden',
    };

    return (
      <div className="price-and-availability center-style">
        <h1 className="center-style__title">Price & Availability</h1>

        <div className="center-style__content">
          The listing information filing part is divided into 3 parts: Tenancy Details, Availability and Price and General Setting. Updating your listing information in time will help the guest get accurate room status to avoid any disputes.
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
                1. How to set a listing?
              </h3>
            ) }
            key={ 1 }
            style={ firstCustomPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <label className="center-style__content-title">Tenancy Details</label>
                  To create a listing tenancy, You need to complete all 3 fields - Move in date, Tenancy length, and Move out date. <br />
                  <div className="center-style__row-40" />

                  <ul className="center-style__list">
                    <li className="center-style__list-item">
                      Fill in the Move in date first, and you are not allowed to choose any date before TODAY.
                    </li>
                    <li className="center-style__list-item">
                      The unit of tenancy length will be decided by the location of the property, which cannot be changed.<br />
                    </li>
                    <li className="center-style__list-item">
                      Move out date range is decided by the combination of Move in date and Tenancy length, therefore, <br />
                      <div className="center-style__note">
                        <Icon type="exclamation-circle" theme="filled" className="center-style__note-icon" />
                        <span className="center-style__bold">Note:</span>
                        If you cannot choose intentional date, please kindly check the Move in date and Tenancy length content.
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="center-style__content">
                  <label className="center-style__content-title">Availability and Price</label>
                  <ul className="center-style__list">
                    <li className="center-style__list-item">
                      For Price type, you can choose Exact or Range to describe his price type.
                      <div className="center-style__note">
                        <Icon type="exclamation-circle" theme="filled" className="center-style__note-icon" />
                        <span className="center-style__bold">Note:</span>
                        When you choose price type as [Range], the price max should be larger than the price min.
                      </div>
                      <div className="center-style__row-24" />
                    </li>
                    <li className="center-style__list-item">
                      The original price will always equals Price min, which can not be changed.
                    </li>
                    <li className="center-style__list-item">
                      When you Fixed amount, the Discount Value and Current price will be linked, which means any change in one field will cause the change of the other.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                2. How to make a listing active or inactive on Student.com?
              </h3>
            ) }
            key={ 2 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  The Live on - Live until will control the period of time when the listing will be effectively display on Student.com. The listing will only be active during this period of time that you set.
                  <div className="center-style__note">
                    <Icon type="exclamation-circle" theme="filled" className="center-style__note-icon" />
                    <span className="center-style__bold">Note:</span>
                    If you want your listings always active, you can tick the [Open end].
                  </div>
                </div>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                3. How to confirm if the guest can see my listings?
              </h3>
            ) }
            key={ 3 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  The guest will see your listing only after it is successfully published, you can click the property name to view your listings on Student.com after the property is published.
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

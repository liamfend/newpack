/* eslint-disable max-len */
import React from 'react';
import { Collapse, Icon } from 'antd';

const { Panel } = Collapse;

export default class CommissionAndContract extends React.Component {
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
      <div className="commission-and-contract center-style">
        <h1 className="center-style__title">Commission and Contract</h1>
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
                1. What can I know in Commission management section?
              </h3>
            ) }
            key={ 1 }
            style={ firstCustomPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  You are able to view the current commission setting under the property.
                  If you are in the commission management section,
                  you will see all the commission cards that being set by Student.com.
                  <img
                    className="center-style__image"
                    src="/public/help-center/image-11.jpg"
                    srcSet="/public/help-center/image-11.jpg 1x, /public/help-center/image-11@2x.jpg 2x"
                    alt="11"
                  />
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Commission Status:</span>There are totally 3 kinds of status for a commission tier.
                  </p>
                  <div className="commission-and-contract__status-container">
                    <p className="commission-and-contract__status">
                      <span className="commission-and-contract__status-label commission-and-contract__status-label--active">Active </span>
                      The commission is currently effective.
                    </p>
                    <p className="commission-and-contract__status">
                      <span className="commission-and-contract__status-label commission-and-contract__status-label--inactive">Inactive </span>
                      The commission is not yet effective until the commission effective date comes
                    </p>
                    <p className="commission-and-contract__status">
                      <span className="commission-and-contract__status-label commission-and-contract__status-label--expire">Expire </span>
                      The commission effective date has passed，
                      and the commission is no longer effective.
                    </p>

                  </div>
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Commission name:</span>
                    The commission name is used to distinguish different commissions.
                  </p>
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Commission value:</span>
                    There are two types of commission value - Fixed amount commission & Percentage commission.
                  </p>
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Bonus commission:</span>
                    <span className="commission-and-contract__bouns">Bonus</span>
                    means this commission tier is an extra bonus on the basic of normal commission.
                  </p>
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Commission effective date:</span>
                    It shows that during which period of time, the commission tier is effective.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                2. What can I know in Contract record section?
              </h3>
            ) }
            key={ 2 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <img
                    className="center-style__image"
                    src="/public/help-center/image-12.jpg"
                    srcSet="/public/help-center/image-12.jpg 1x, /public/help-center/image-12@2x.jpg 2x"
                    alt="12"
                  />
                  The contract record section is used to store the official contract between the hose and Student.com.
                  Therefore, if the contract is dually signed,
                  it should be uploaded by Student.com and you will be able to see the contract related to this property.
                </div>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                3. I cannot see any active commission tiers / contracts or i find some mistakes here in any of these two sections.
              </h3>
            ) }
            key={ 3 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  If you did not find any active commission tiers,
                  contract records or you noticed any details incorrect,
                  please kindly email us: xxxxxxxxxxxx
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

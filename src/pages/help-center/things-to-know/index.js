/* eslint-disable max-len */
import React from 'react';
import { Icon, Collapse, Steps } from 'antd';
import {
  CreateProperty as CreatePropertyIcon,
  UpdateListing as UpdateListingIcon,
  WaitingApproval as WaitingApprovalIcon,
  PublishProperty as PublishPropertyIcon,
} from "~components/svgs";

/**
 *
 * This is static page, so don't read translation, unless it is necessary to read trans
 *
 */

const { Panel } = Collapse;
const { Step } = Steps;

export default class ThingsToKnow extends React.Component {
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
      <div className="things-to-know center-style">
        <h1 className="center-style__title">Things to Know</h1>
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
                1. What can I do in the Portal
              </h3>
            ) }
            key={ 1 }
            style={ firstCustomPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <p className="center-style__content">
                  The Landlord Portal is designed to let the hosts self manage their properties inside the system.The system provides different function blocks as below which aim to cover an integrated journey as a landlord.
                </p>
                <p className="center-style__content">
                  <label className="center-style__content-title">Property</label>
                  In this section, You can not only manage your price & availabilities, optimize property description, set your required policy and rules, etc. but also check property contract and commission setting any time.
                </p>
                <p className="center-style__content">
                  <label className="center-style__content-title">Reviews (coming soon)</label>
                  Managing Reviews from tenants is an extremely important part to increasing property word of mouth, and in this part, you can have a systematic management of property reviews to provide more intimate services.
                </p>
                <p className="center-style__content">
                  <label className="center-style__content-title">Bookings (coming soon)</label>
                  In this section, you can have real-time tracking of every status of all the bookings made on Student.com. Meanwhile, an automatic reconciliation function will help to increase your working efficiency.
                </p>
                <p className="center-style__content">
                  <label className="center-style__content-title">Account</label>
                  You can change your personal information and password in this part for your account security.
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            header={ (
              <h3 className="center-style__block-title">
                2. Sequence flow to publish a property?
              </h3>
            ) }
            key={ 2 }
            style={ customPanelStyle }
          >
            <div className="center-style__block center-style__block--things-to-know-special">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <CreatePropertyIcon className="center-style__content-icon" />
                  <div className="center-style__text-container">
                    <label className="center-style__content-title center-style__content-title--no-margin" style={ { fontSize: '16px' } }>
                      Student.com create property
                    </label>
                    <div className="center-style__row-8" />
                    The Student.com will help you to create your property after internal verification.
                  </div>
                </div>
                <div className="center-style__content">
                  <UpdateListingIcon className="center-style__content-icon" />
                  <div className="center-style__text-container">
                    <label className="center-style__content-title center-style__content-title--no-margin" style={ { fontSize: '16px' } }>
                      Update listings
                    </label>
                    <div className="center-style__row-8" />
                    You can start to describe your property and manage price & availability.
                  </div>
                </div>
                <div className="center-style__content">
                  <WaitingApprovalIcon className="center-style__content-icon" />
                  <div className="center-style__text-container">
                    <label className="center-style__content-title center-style__content-title--no-margin" style={ { fontSize: '16px' } }>
                      Wait for Student.com approval
                    </label>
                    <div className="center-style__row-8" />
                    After all required fields are correctly filled, you can submit your property for approval.
                  </div>
                </div>
                <div className="center-style__content">
                  <PublishPropertyIcon className="center-style__content-icon" />
                  <div className="center-style__text-container">
                    <label className="center-style__content-title center-style__content-title--no-margin" style={ { fontSize: '16px' } }>
                      Publish your property
                    </label>
                    <div className="center-style__row-8" />
                    Property will be published on Student.com after being approved.
                  </div>
                </div>
                <Steps direction="vertical" className="center-style__steps">
                  <Step className="center-style__step" status="process">1</Step>
                  <Step className="center-style__step" status="process">2</Step>
                  <Step className="center-style__step" status="process">3</Step>
                  <Step className="center-style__step" status="process">4</Step>
                </Steps>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                3. Student.com property audit process.
              </h3>
            ) }
            key={ 3 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <p className="center-style__content">
                  <label className="center-style__content-title">Audit time</label>
                  Generally, it will take not more than 3 working days for Student.com to audit your listings. Your properties will be directly put online if they successfully get approved while you will also get feedbacks if we consider property information is not appropriate to be put on Student.com.
                </p>
                <div className="center-style__content">
                  <label className="center-style__content-title">Key points for auditing</label>
                  <ul className="center-style__list">
                    <li className="center-style__list-item">The property information is real and sufficient.</li>
                    <li className="center-style__list-item">The property photos or videos are appropriate without any content that is infringing.</li>
                    <li className="center-style__list-item"> Content can not contains your personal contact information.</li>
                    <li className="center-style__list-item">The price and availability is logical and real，no exaggerated or shallow promotions are included in your listings.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            header={ (
              <h3 className="center-style__block-title">
                4. Property status introduction
              </h3>
            ) }
            key={ 4 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <p className="center-style__content">
                  Your property can be able to  pass through 3 phases on Student.com
                </p>
                <div className="center-style__content">
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Editing:</span> Properties that being editing and yet to be published <br />
                  </p>
                  <p className="center-style__bold-line-container">
                    <span className="center-style__bold">Published:</span> Property that being published on Student.com<br />
                  </p>
                  <p className="center-style__bold-line-container center-style__bold-line-container--no-margin">
                    <span className="center-style__bold">Unpublished:</span> Properties that being unpublished from Student.com <br />
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

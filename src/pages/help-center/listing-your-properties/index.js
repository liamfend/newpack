/* eslint-disable max-len */
import React from 'react';
import { Collapse, Icon } from 'antd';

const { Panel } = Collapse;

export default class ListingYourProperties extends React.Component {
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
      <div className="listing-your-properties center-style">
        <h1 className="center-style__title">Listing Your Properties</h1>
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
                1. How to properly describe your properties?
              </h3>
            ) }
            key={ 1 }
            style={ firstCustomPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <label className="center-style__content-title">Tips 1:  Vividly describe your property in details. </label>
                  <i>(This will help your guest to have a general ideas about your what your property is like.)</i>
                  <div className="center-style__row-16" />
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-1.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-1.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-1@2x.jpg 2x"
                    alt="1"
                  />
                  <ul className="center-style__list">
                    <li className="center-style__list-item">
                      <div className="center-style__bold-line-container">
                        <span className="center-style__bold">Headline:</span> Vividly describe your property in a single sentence.
                      </div>
                      <div className="center-style__example-container">
                        <span className="center-style__bold">Example:</span> Experience city living from your base at Manchester House, surrounded by the area’s vibrant culture and lively social scene
                      </div>
                    </li>
                    <li className="center-style__list-item">
                      <div className="center-style__bold-line-container">
                        <span className="center-style__bold">Description:</span> You can introduce your property in 3 parts.<br />
                        Part 1: Introduce the surroundings of your property, such as commercial facilities, public transportation or places of interest, etc.
                        <div className="center-style__example-container">
                          <span className="center-style__bold">Example:</span> Kick off your weekend with an epic American-style brunch at Moose Coffee – try the Double Dutch pancakes with sausage, bacon, eggs and syrup. Get your shopping fix at Selfridges, or browse the stores in the Arndale Centre, then take a break from the fast pace of city life and discover the latest exhibition at Manchester Art Gallery. If shopping’s not your thing, take a tour of Old Trafford football stadium, the home of Manchester United. After dark, go bar hopping in the bohemian Northern Quarter, where you can sip cocktails at Tusk and play your favourite tunes on the jukebox at Odd Bar.
                        </div>
                        Part 2: Introduce universities nearby and how far are those from your property.
                        <div className="center-style__example-container">
                          <span className="center-style__bold">Example:</span> Manchester House is located in the heart of Manchester’s city centre, so everything you need is within easy reach. Walk to Manchester Metropolitan University in three minutes, and get to Manchester Business School in five. Stroll to the University of Manchester in six minutes, and get to Salford University in 20 minutes by bus. When you want to travel further afield, you’re a 20-minute walk from Manchester Piccadilly train station.
                        </div>
                        Part 3: Introduce the in-house facilities of your property.
                        <div className="center-style__example-container">
                          <span className="center-style__bold">Example:</span> You’ll share your spacious flat with friends, but you’ll have your own private bathroom so there’s no need to queue for the shower. There’s a modern fitted kitchen with an oven and fridge freezer, as well as plenty of storage space for all your favourite foods. Stock your fridge at the nearby supermarket and cook dinner with your flatmates, then eat together at the breakfast bar. When you don’t feel like cooking, grab takeaway pizza from nearby Pizza Co and relax on the sofa to watch a movie on the flatscreen TV, or enjoy Chinese food at nearby Azuma. Retreat to your room when you need to concentrate on college work – there’s Wi-Fi, a large desk, comfy chair and lots of shelf space to store your books and files. With work out of the way, grab a change of clothes from your wardrobe and head down the road to meet friends for drinks at Sandbar or enjoy live music at The Deaf Institute.
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="center-style__content">
                  <label className="center-style__content-title">Tips 2:  Accurately locate your property. </label>
                  (It helps your guest to decide if the property is convenient to get to his destination.)<br />
                  <div className="center-style__row-40" />
                  <p className="center-style__line-with-dot">You can change your property location by completing your property address in [Address line 1] and [Address line 2].</p>
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-2.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-2.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-2@2x.jpg 2x"
                    alt="2"
                  />
                  <p className="center-style__line-with-dot">Moving the map location to get accurate longitude and latitude.</p>
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-3.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-3.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-3@2x.jpg 2x"
                    alt="3"
                  />
                  <p className="center-style__line-with-dot">You can also click [Search again] to reselect your property address.</p>
                  <img
                    className="center-style__image center-style__image--no-margin"
                    src="/bundles/microapp-cms/images/public/help-center/image-4.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-4.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-4@2x.jpg 2x"
                    alt="4"
                  />
                </div>
                <div className="center-style__content">
                  <label className="center-style__content-title">Tips 3:  Describe rooms arrangement in details.</label>
                  (It helps your guest to know what kind of room he will stay.)<br />
                  <div className="center-style__row-40" />
                  <p className="center-style__line-with-dot">You can fine below introduction and examples about all Room details.</p>
                  <div className="center-style__row-16" />
                  <table className="center-style__table">
                    <thead>
                      <tr className="center-style__tr">
                        <th className="center-style__th">Information</th>
                        <th className="center-style__th" colSpan="2">Definition</th>
                        <th className="center-style__th">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--subtitle" colSpan="4">Room Details</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Room name</td>
                        <td className="center-style__td center-style__td--nowrap" colSpan="2">Room name</td>
                        <td className="center-style__td">E.g. Skyline</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold" rowSpan="3">Category</td>
                        <td className="center-style__td center-style__td--nowrap">Shared room</td>
                        <td className="center-style__td">A communal space, which sleeps two or more in separate beds, and guests will share additional living spaces and facilites.</td>
                        <td className="center-style__td" rowSpan="3">E.g. Shared room</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Private room</td>
                        <td className="center-style__td">A sepearte room, the guest can sleep/study in his own space but may share additional living spaces and facilities with others.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Entire place</td>
                        <td className="center-style__td">A fullly self-contained property, the guest will own his private living space, cooking and bathing facilties.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Number of beds</td>
                        <td className="center-style__td" colSpan="2">How many beds in the room</td>
                        <td className="center-style__td">E.g. 3</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Room size</td>
                        <td className="center-style__td" colSpan="2">What is the size of the room</td>
                        <td className="center-style__td">E.g. 25 Sqm</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Floor No.</td>
                        <td className="center-style__td" colSpan="2">On which floor does the room locate</td>
                        <td className="center-style__td">E.g. 5-8</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Direction of the view</td>
                        <td className="center-style__td" colSpan="2">How is the view like from the room</td>
                        <td className="center-style__td">E.g Skyline with beautiful sunset</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold" rowSpan="4">Bed size</td>
                        <td className="center-style__td center-style__td--nowrap">Category</td>
                        <td className="center-style__td">Is the bed size in your room unified or different</td>
                        <td className="center-style__td">E.g. Different</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Bed type</td>
                        <td className="center-style__td">What is the type of the bed</td>
                        <td className="center-style__td">E.g. Single bed</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Bed size</td>
                        <td className="center-style__td">What is the size of the bed</td>
                        <td className="center-style__td">E.g. 120 x 200</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Bed qty</td>
                        <td className="center-style__td">What is the quantity of the bed under the same size.</td>
                        <td className="center-style__td">E.g. 2</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Max occupancy</td>
                        <td className="center-style__td" colSpan="2">How many people can stay in the room at most.</td>
                        <td className="center-style__td">E.g. 3</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Dual occupancy</td>
                        <td className="center-style__td" colSpan="2">If this room allow dual occupancy</td>
                        <td className="center-style__td">E.g. Dual occupancy not allowed</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold" rowSpan="5">Bathroom arrangement</td>
                        <td className="center-style__td center-style__td--nowrap">Private</td>
                        <td className="center-style__td">The guest can have his own bathroom outside the bedroom.</td>
                        <td className="center-style__td" rowSpan="5">E.g. Private ensuite</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Private ensuit</td>
                        <td className="center-style__td">The guest can have his own bathroom inside the bedroom.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Shared</td>
                        <td className="center-style__td">The guest need to share the bathroom with others, and the bathroom is outside the bedroom.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Shared ensuit</td>
                        <td className="center-style__td">The guest need to share the bathroom with others, and the bathroom is inside the bedroom.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Mix</td>
                        <td className="center-style__td">The guest have his own bathroom while there will also have a shared bathroom in other shared spaces.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold" rowSpan="2">Kitchen arrangement</td>
                        <td className="center-style__td center-style__td--nowrap">Private</td>
                        <td className="center-style__td">The guest can have his own kitchen without sharing with others.</td>
                        <td className="center-style__td" rowSpan="2">E.g. Private</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--nowrap">Shared</td>
                        <td className="center-style__td"> The guest has to share the kitchen with others.</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--subtitle" colSpan="4">Facility in this room</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Facility in this room</td>
                        <td className="center-style__td" colSpan="2">Which facilities are in this room</td>
                        <td className="center-style__td">E.g. Wifi</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--subtitle" colSpan="4">Unit Details</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Latest furnished</td>
                        <td className="center-style__td" colSpan="2">When did your room last furnished</td>
                        <td className="center-style__td">E.g. 01/01/2019</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Room arrangement</td>
                        <td className="center-style__td" colSpan="2">Apartment</td>
                        <td className="center-style__td" />
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Min number of beds</td>
                        <td className="center-style__td" colSpan="2">What is the min number of beds for this room type in a unit</td>
                        <td className="center-style__td">E.g. 4</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Max number of bedrooms</td>
                        <td className="center-style__td" colSpan="2">What is the max number of beds for this room type in a unit</td>
                        <td className="center-style__td">E.g. 6</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Number of bathrooms</td>
                        <td className="center-style__td" colSpan="2">How many bathrooms in the unit</td>
                        <td className="center-style__td">E.g. 1</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Number of kitchens</td>
                        <td className="center-style__td" colSpan="2">How many kitchens in the unit</td>
                        <td className="center-style__td">E.g. 1</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--subtitle" colSpan="4">Unit Rules</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Gender mix</td>
                        <td className="center-style__td" colSpan="2">If mixed gender allowed in the unit</td>
                        <td className="center-style__td">E.g. Female only</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Dietary preferences</td>
                        <td className="center-style__td" colSpan="2">Is there any dietary preferences in the unit</td>
                        <td className="center-style__td">E.g. Not sepcific</td>
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td center-style__td--bold">Smoking preferences</td>
                        <td className="center-style__td" colSpan="2">Is smoking allowed in the unit</td>
                        <td className="center-style__td">E.g. Don&apos;t allow</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                2. How to upload photos and videos?
              </h3>
            ) }
            key={ 2 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <span className="center-style__bold">The gallery tab</span> is used for uploading photos, videos and virtual tour links to describe the property. It is divided into two parts:<br />
                  <span className="center-style__bold">Photo library</span> part on the left and <span className="center-style__bold">Gallery management</span> part on the right.
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-5.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-5.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-5@2x.jpg 2x"
                    alt="5"
                  />
                  <ul className="center-style__list">
                    <li className="center-style__list-item">
                      <span className="center-style__bold">Photo library</span> is designed as a photo pool so that you can upload all the photos and videos inside for quick sorting.
                    </li>
                    <li className="center-style__list-item">
                      <span className="center-style__bold">Gallery management</span> part is for arranging photos and videos so that they can be displayed in the right section.
                    </li>
                  </ul>
                </div>

                <div className="center-style__content">
                  <label className="center-style__content-title">Subsection introduction in Gallery management part</label>
                  <p className="center-style__line-with-dot">Property level</p>
                  <div className="center-style__row-16" />
                  <table className="center-style__table center-style__table--upload-media">
                    <tbody>
                      <tr className="center-style__tr">
                        <td className="center-style__td" width="18%">Hero image</td>
                        <td className="center-style__td">It is used for uploading popular images of both property and room and they will be displayed on the first screen in property gallery in Student.com. Therefore, images with high quality are recommended.</td>
                        <td className="center-style__td" width="14%" />
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td">Building exterior</td>
                        <td className="center-style__td">It is used for uploading images or videos that describe property outside.</td>
                        <td className="center-style__td" />
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td">Common indoor spaces</td>
                        <td className="center-style__td">It is used for uploading images or videos that describe common indoor areas such as gym, cinema, etc.</td>
                        <td className="center-style__td" />
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td">Common outdoor spaces</td>
                        <td className="center-style__td">It is used for uploading images or videos that describe common outdoor areas such as football cout, outdoor swimming pool.</td>
                        <td className="center-style__td" />
                      </tr>
                      <tr className="center-style__tr">
                        <td className="center-style__td">General</td>
                        <td className="center-style__td">It is used for uploading images or videos that describe a general view from inside to outside of the property.</td>
                        <td className="center-style__td" />
                      </tr>
                    </tbody>
                  </table>
                  <div className="center-style__row-32" />
                  <p className="center-style__line-with-dot">Room level</p>
                  <p className="center-style__line-with-space-left">
                    Rooms subsections will be auto created when you create rooms in [Room] tab.
                  </p>
                </div>

                <div className="center-style__content">
                  <label className="center-style__content-title">How to upload images and videos?</label>
                  a.  You can drag or click the files in the uploading area, and files that uploading will be shown in the model that show up.
                  <div className="center-style__row-8" />
                  b.  Once you confirm uploaded, the files will be arranged into designated areas.
                  <div className="center-style__row-8" />
                  c.   You can also minimize the model so that he can, at the same time, edit other information of the property.
                  <div className="center-style__note">
                    <Icon type="exclamation-circle" theme="filled" className="center-style__note-icon" />
                    <span className="center-style__bold">Note:</span>
                    You cannot click [Review] btn when the uploading model is minimized and all the files will NOT be arranged until the you manually confirms uploaded files.
                  </div>
                </div>

                <div className="center-style__content">
                  <label className="center-style__content-title">What can I do after I uploaded all the photos and videos?</label>
                  You can move the files from Photo library to your target areas or you can move files from one subsection to another subsection.
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-6.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-6.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-6@2x.jpg 2x"
                    alt="6"
                  />
                  You can delete photos or videos if you don&apos;t want them any more.
                  <img
                    className="center-style__image"
                    src="/bundles/microapp-cms/images/public/help-center/image-7.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-7.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-7@2x.jpg 2x"
                    alt="7"
                  />
                  You can preview the files you uploaded.
                  <img
                    className="center-style__image center-style__image--no-margin"
                    src="/bundles/microapp-cms/images/public/help-center/image-8.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-8.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-8@2x.jpg 2x"
                    alt="8"
                  />
                </div>
              </div>
            </div>
          </Panel>
          <Panel
            header={ (
              <h3 className="center-style__block-title">
                3. Visual upgrades: Virtual tour
              </h3>
            ) }
            key={ 3 }
            style={ customPanelStyle }
          >
            <div className="center-style__block">
              <div className="center-style__content-container">
                <div className="center-style__content">
                  <label className="center-style__content-title">How to add virtual tour link</label>
                  You can start to add virtual tour link by clicking the button as below.
                  <img
                    className="center-style__image center-style__image--no-margin"
                    src="/bundles/microapp-cms/images/public/help-center/image-9.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-9.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-9@2x.jpg 2x"
                    alt="9"
                  />
                </div>
                <div className="center-style__content">
                  You can add different virtual tour links under 3 different levels.
                  <div className="center-style__row-8" />
                  <ul className="center-style__list center-style__list--hyphen">
                    <li className="center-style__list-item">
                      <label className="center-style__content-title">Overall virtual tour link</label>
                      Overall virtual tour link covers the view from inside to outside or even including some city views. Therefore it should be unrepeatable under the same locale.
                    </li>
                    <li className="center-style__list-item">
                      <label className="center-style__content-title">Property virtual tour link</label>
                      Property virtual tour link should cover views that about the property, such as property common areas, property exteriors. And you can also clarify the link into one specific area, which is the same as uploading images and videos.
                    </li>
                    <li className="center-style__list-item">
                      <label className="center-style__content-title">Room virtual tour link</label>
                      Room virtual tour link should cover views of the room, such as unit arrangement, room inside, shared kitchen, etc. You can also bind one virtual tour link to multiple rooms if they share similar indoor views.
                    </li>
                  </ul>
                  <div className="center-style__row-24" />
                  <img
                    className="center-style__image center-style__image--no-margin"
                    src="/bundles/microapp-cms/images/public/help-center/image-10.jpg"
                    srcSet="/bundles/microapp-cms/images/public/help-center/image-10.jpg 1x, /bundles/microapp-cms/images/public/help-center/image-10@2x.jpg 2x"
                    alt="10"
                  />
                  <div className="center-style__row-24" />
                  When the Click [Confirm] button, the virtual tour links are created, and you can re-edit the links by clicking the same button or the icon that attached next to the area title.
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

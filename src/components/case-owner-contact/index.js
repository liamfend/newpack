import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import moment from 'moment';

export default function CaseOwnerContact(props) {
  const { opportunityCase } = props.opportunityStateChangesNote;

  const ownByUserData = opportunityCase && opportunityCase.ownByUser ? opportunityCase.ownByUser : '';

  const contactArray = [
    {
      title: 'contact_name',
      content: ownByUserData ? (ownByUserData.name || '') : '',
    },
    {
      title: 'contact_email',
      content: ownByUserData ? (ownByUserData.email || '') : '',
    },
    {
      title: 'case_update',
      content: (opportunityCase && opportunityCase.updatedAt) ?
        moment(opportunityCase.updatedAt).format('DD/MM/YYYY HH:mm:ss') : '',
    },
  ];

  return (
    <div className="case-owner-contact">
      <ul className="case-owner-contact__container">
        <For each="ownerItem" of={ contactArray } index="index">
          <li className="case-owner-contact__item" key={ ownerItem.title }>
            <span className="case-owner-contact__title">
              { i18next.t(`cms.reconciliation.booking.details.cards.label.case_owner.${ownerItem.title}.label`) }
            </span>
            <span className="case-owner-contact__content">
              { ownerItem.content || '-' }
            </span>
          </li>
        </For>
      </ul>
    </div>
  );
}

CaseOwnerContact.propTypes = {
  opportunityStateChangesNote: PropTypes.object,
};

CaseOwnerContact.defaultProps = {
  opportunityStateChangesNote: {},
};

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { get } from 'lodash';

const ChangesTable = ({ opportunityDetail }) => {
  const { t } = useTranslation();
  const types = ['booking_details', 'reconciliation_history'];
  const [activeKey, setActiveKey] = useState('booking_details');

  const handleNavigationBarBtn = (type) => {
    setActiveKey(type);

    const targetElement = document.getElementById(`${type}`);
    if (targetElement) {
      window.scrollTo(0, (targetElement.offsetTop + 30));
    }
  };

  return (
    <div className="reconciliation-details__navigation-bar">
      <For of={ types } each="type">
        <button
          key={ type }
          onClick={ () => { handleNavigationBarBtn(type); } }
          className={ classNames('reconciliation-details__navigation-bar__btn', {
            'reconciliation-details__navigation-bar__btn--active': activeKey === type,
            'reconciliation-details__navigation-bar__btn--hidden': type === 'reconciliation_history' && !(get(opportunityDetail, 'opportunityStateChanges', []).length > 0),
          }) }
        >
          { t(`cms.reconciliation.booking.details.cards.label.${type}`) }
        </button>
      </For>
    </div>
  );
};

ChangesTable.propTypes = {
  opportunityDetail: PropTypes.object,
};

ChangesTable.defaultProps = {
  opportunityDetail: {},
};

export default ChangesTable;

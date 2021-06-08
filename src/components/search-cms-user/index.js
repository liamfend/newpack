import React, { useState } from 'react';
import { Spin, Empty, Input, Icon } from 'antd';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import useSearchCmsUser from '~components/search-cms-user/useSearchCmsUser';

export default function SearchCmsUser({ onChange, ...reset }) {
  const [selectedUuid, setSlectedUuid] = useState(null);
  const {
    handleSearchCmsUser,
    isFetchingCmsUser,
    searchedCmsUsers,
    isAlreadySearched,
  } = useSearchCmsUser();

  return (
    <div className="search-cms-user__search-result-input">
      <Input
        placeholder={ i18next.t('cms.reconciliation.placeholder.search_updated_by') }
        onChange={ e => handleSearchCmsUser(e.target.value) }
        { ...reset }
      />
      <Choose>
        <When condition={ isFetchingCmsUser }>
          <div className="search-cms-user__search-loading">
            <Spin />
          </div>
        </When>
        <When condition={ searchedCmsUsers.length > 0 }>
          <div className="search-cms-user__options-wrap">
            <For index="index" each="cmsUser" of={ searchedCmsUsers }>
              <div
                key={ cmsUser.id }
                role="presentation"
                className="search-cms-user__name-option"
                onClick={ () => {
                  setSlectedUuid(selectedUuid === cmsUser.userUuid ? null : cmsUser.userUuid);
                  onChange(selectedUuid === cmsUser.userUuid ? null : cmsUser.userUuid);
                } }
              >
                { `${cmsUser.firstName} ${cmsUser.lastName}` }
                <If condition={ selectedUuid === cmsUser.userUuid }>
                  <Icon className="search-cms-user__selected-icon" type="check" />
                </If>
              </div>
            </For>
          </div>
        </When>
        <When condition={ isAlreadySearched }>
          <div className="search-cms-user__empty-result">
            <Empty image={ Empty.PRESENTED_IMAGE_SIMPLE } />
          </div>
        </When>
      </Choose>
    </div>
  );
}

SearchCmsUser.propTypes = {
  onChange: PropTypes.func,
};

SearchCmsUser.defaultProps = {
  onChange: () => {},
};

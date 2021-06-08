import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Svg from '~components/svg';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

export default class ContractEmpty extends React.Component {
  componentDidMount() {
    this.addListener();
  }

  addListener = () => {
    const addAction = document.querySelector('.contract-empty__click-action');
    if (addAction) {
      addAction.addEventListener('click', () => this.props.openModal());
    }
  }

  componentWillUnmount() {
    const addAction = document.querySelector('.contract-empty__click-action');
    if (addAction) {
      addAction.removeEventListener('click', () => this.props.openModal());
    }
  }

  renderContent = () => {
    const { t, typeName } = this.props;
    if (typeName === 'contract') {
      return {
        dangerouslySetInnerHTML: {
          __html: t('cms.contract.filter.empty_content', {
            add: `<span class="contract-empty__click-action">${t('cms.contract.filter.empty.add_new')}</span>`,
          }),
        },
      };
    }
    return {
      dangerouslySetInnerHTML: {
        __html: t('cms.property.record.empty_content', {
          update: `<span class="contract-empty__click-action">${t('cms.property.record.update_contract.btn')}</span>`,
        }),
      },
    };
  }

  render() {
    return (
      <div className={ classNames('contract-empty', { 'contract-empty__full-filter': this.props.filterState }) }>
        <Svg className="contract-empty__icon" hash="contract-empty" />
        <If condition={ showElementByAuth(
          platformEntity.PROPERTIES_CONTRACTS,
          entityAction.CREATE,
        ) }
        >
          <span
            className="contract-empty__add-new"
            { ...this.renderContent() }
          />
        </If>
      </div>);
  }
}

ContractEmpty.propTypes = {
  filterState: PropTypes.bool,
  t: PropTypes.func.isRequired,
  typeName: PropTypes.string.isRequired,
  openModal: PropTypes.func.isRequired,
};

ContractEmpty.defaultProps = {
  filterState: false,
};

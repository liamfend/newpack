import React from 'react';
import PropTypes from 'prop-types';
import { Input, Form } from 'antd';
import SearchComponent from '~components/search-component';

class AccountOwnerSearch extends React.Component {
  constructor() {
    super();

    this.state = {
      searchComponentVisible: false,
      selectAccountOwnerList: [],
    };
  }

  initAccountOwners = () => {
    const { accountOwners, includeRoleArr } = this.props;

    if (accountOwners.length === 0) {
      this.props.getAccountOwners({
        includeRoleSlugs: includeRoleArr,
      }, () => {
        this.initSelectedAccountOwner();
      });
    } else {
      this.initSelectedAccountOwner();
    }
  }

  initSelectedAccountOwner = () => {
    const { accountOwners, accountManager } = this.props;

    if (!accountManager) {
      this.setState({
        selectAccountOwnerList: [],
      });
      return;
    }

    const selectCmsUser = accountOwners.find(cmsUser => cmsUser.name === accountManager);

    if (selectCmsUser) {
      this.setState({
        selectAccountOwnerList: [selectCmsUser.id],
      });
    }
  };

  handleFocusInput = () => {
    this.setState({ searchComponentVisible: true });

    if (this.props.isNeedInit) {
      this.initAccountOwners();
    }
  }

  handleChangeSearchComponent = ({ currentItem }) => {
    if (!currentItem) {
      return;
    }

    this.props.form.setFieldsValue({ accountManager: currentItem.name });
    this.setState({
      selectAccountOwnerList: [currentItem.id],
    });
  }

  render() {
    const {
      t,
      labelPlaceholder,
      inputPlaceholder,
      disabledClassName,
      isFetching,
      accountOwners,
      isDisabled,
      accountManager,
    } = this.props;

    return (
      <Form.Item
        className={ disabledClassName }
        label={ labelPlaceholder }
        colon={ false }
      >
        {this.props.form.getFieldDecorator('accountManager', {
          rules: [
            {
              required: true,
              message: this.props.t('cms.landlord.modal.error.blank'),
            },
          ],
          initialValue: accountManager || '',
          validateTrigger: 'onBlur',
        })(
          <Input
            placeholder={ inputPlaceholder }
            ref={ (node) => { this.targetInput = node.input; } }
            onFocus={ this.handleFocusInput }
            disabled={ isDisabled }
          />,
        )}
        <If condition={ this.state.searchComponentVisible }>
          <SearchComponent
            t={ t }
            targetInput={ this.targetInput }
            container={ this.searchComponentContainer }
            options={ accountOwners }
            type={ 'input' }
            onChange={ this.handleChangeSearchComponent }
            selectList={ this.state.selectAccountOwnerList }
            keyValue="id"
            className="search-cms-user"
            ref={ (node) => { this.searchComponent = node; } }
            showSelectAll={ false }
            isFetching={ isFetching }
          />
        </If>
      </Form.Item>
    );
  }
}

AccountOwnerSearch.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object, // eslint-disable-line react/require-default-props
  labelPlaceholder: PropTypes.string,
  inputPlaceholder: PropTypes.string,
  disabledClassName: PropTypes.string,
  includeRoleArr: PropTypes.array,
  accountOwners: PropTypes.array,
  isDisabled: PropTypes.bool,
  isFetching: PropTypes.bool,
  accountManager: PropTypes.string,
  isNeedInit: PropTypes.bool,
  getAccountOwners: PropTypes.func,
};

AccountOwnerSearch.defaultProps = {
  t: () => {},
  form: {}, // eslint-disable-line react/require-default-props
  labelPlaceholder: '',
  inputPlaceholder: '',
  disabledClassName: '',
  includeRoleArr: [],
  accountOwners: [],
  isDisabled: false,
  isFetching: false,
  accountManager: '',
  isNeedInit: true,
  getAccountOwners: () => {},
};

export default AccountOwnerSearch;

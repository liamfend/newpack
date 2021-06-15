import React from 'react'
import { Button, Icon, message, Popconfirm } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class PropertyDetailWrapper extends React.Component {
  constructor() {
    super()

    this.state = {
      loading: false,
    }
  }

  handleSave = () => {
    this.setState({ loading: true })
    const { onClickSave, t, isPublished } = this.props

    onClickSave(res => {
      if (res.status === 'success') {
        if (res.isUpdated) {
          message.success(
            t(`cms.properties.edit.message.${isPublished ? 'publish_success' : 'save_success'}`),
          )
        }
      }
      if (res.status === 'err') {
        if (res.e && res.e.message) {
          if (res.e.message.includes('PROPERTY_PENDING_DRAFT_EXISTS')) {
            message.error(t('cms.error.property_pending_draft_exists'))
          } else {
            message.error(`${t('cms.message.error')}: ${res.e.message}`)
          }
        } else {
          message.error(`${t('cms.message.error')}: ${res.err.message}`)
        }
      }
      this.setState({ loading: false })
    })
  }

  handleInsistSave = () => {
    const { rejectedDraftIds } = this.props
    this.props.expirePropertyDraft(rejectedDraftIds, () => {
      this.handleSave()
    })
  }

  render() {
    const { t, children, isPublished, isHidden, rejectedDraftIds, isValidated } = this.props
    return (
      <div
        className={classNames('property-detail-wrapper', {
          'property-detail-wrapper--hidden': isHidden,
          'property-detail-wrapper--reminder': rejectedDraftIds.length > 0,
        })}
      >
        <div className="property-detail-wrapper__content">{children}</div>
        <div className="property-detail-wrapper__footer">
          <div className="property-detail-wrapper__warning">
            <If condition={isPublished}>
              <Icon
                type="info-circle"
                theme="filled"
                className="property-detail-wrapper__warning-icon"
              />
              <span className="property-detail-wrapper__warning-text">
                {t('cms.form.warning.check_before_publish')}
              </span>
            </If>
          </div>
          <Choose>
            <When condition={isValidated && rejectedDraftIds.length > 0}>
              <Popconfirm
                overlayClassName="property-detail-wrapper__popconfirm"
                overlayStyle={{ maxWidth: 210 }}
                placement="topRight"
                title={t('cms.pending_approval.double_confirm.change_detail.title')}
                onConfirm={this.handleInsistSave}
                okText={t('cms.properties.edit.btn.yes')}
                okType="danger"
                cancelText={t('cms.properties.edit.btn.no')}
              >
                <Button className="property-detail-wrapper__btn" type="primary">
                  {isPublished ? t('cms.properties.edit.btn.publish') : t('cms.form.button.save')}
                </Button>
              </Popconfirm>
            </When>
            <Otherwise>
              <Button
                onClick={this.handleSave}
                className="property-detail-wrapper__btn"
                type="primary"
                loading={this.state.loading}
              >
                {isPublished ? t('cms.properties.edit.btn.publish') : t('cms.form.button.save')}
              </Button>
            </Otherwise>
          </Choose>
        </div>
      </div>
    )
  }
}

PropertyDetailWrapper.propTypes = {
  t: PropTypes.func,
  children: PropTypes.any,
  isPublished: PropTypes.bool,
  onClickSave: PropTypes.func,
  isHidden: PropTypes.bool,
  rejectedDraftIds: PropTypes.array,
  expirePropertyDraft: PropTypes.func,
  isValidated: PropTypes.bool,
}

PropertyDetailWrapper.defaultProps = {
  t: () => {},
  children: '',
  isPublished: false,
  onClickSave: () => {},
  isHidden: false,
  rejectedDraftIds: [],
  expirePropertyDraft: () => {},
  isValidated: false,
}

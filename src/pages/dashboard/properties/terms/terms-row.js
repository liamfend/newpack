import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { toLower } from 'lodash';
import moment from 'moment';
import { IconEdit as IconEditIcon, Delete as DeleteIcon, Files as FilesIcon } from "~components/svgs";
import { platformEntity, entityAction } from '~constants';
import showElementByAuth from '~helpers/auth';
import { Popconfirm } from 'antd';

const TermsRow = ({
  term,
  t,
  onEdit,
  onDelete,
}) => (
  <div className="property-terms__row">
    <div className="property-terms__row__section">
      <div className="property-terms__row__section-left">
        <span className="property-terms__row__name">
          { term.title }
        </span>
        <If condition={ term.status }>
          <div className={ classNames('property-terms__row__status', {
            'property-terms__row__status--active': term.status === 'ACTIVE',
          }) }
          >
            <div className={ classNames('property-terms__row__status__point', {
              'property-terms__row__status__point--active': term.status === 'ACTIVE',
            }) }
            />
            <span className={ classNames('property-terms__row__status__text', {
              'property-terms__row__status__text--active': term.status === 'ACTIVE',
            }) }
            >
              { t(`cms.terms.status.${toLower(term.status)}`) }
            </span>
          </div>
        </If>
      </div>
      <div className="property-terms__row__section-left">
        <If
          condition={
            showElementByAuth(platformEntity.PROPERTIES_TERMS, entityAction.UPDATE)
          }
        >
          <button
            type="button"
            className="property-terms__row__edit-button"
            onClick={ onEdit }
          >
            <IconEditIcon className="property-terms__row__edit-icon" />
          </button>
        </If>
        <If
          condition={
            showElementByAuth(platformEntity.PROPERTIES_TERMS, entityAction.UPDATE)
            && showElementByAuth(platformEntity.PROPERTIES_TERMS, entityAction.DELETE)
          }
        >
          <div className="property-terms__row__button-line" />
        </If>
        <If
          condition={
            showElementByAuth(platformEntity.PROPERTIES_TERMS, entityAction.DELETE)
          }
        >
          <Popconfirm
            title={ t('cms.terms.delete.tip') }
            placement="left"
            okType="danger"
            onConfirm={ onDelete }
            okText={ t('cms.properties.edit.btn.yes') }
            cancelText={ t('cms.properties.edit.btn.no') }
          >
            <button
              type="button"
              className="property-terms__row__edit-button"
            >
              <DeleteIcon className="property-terms__row__delete-icon" />
            </button>
          </Popconfirm>
        </If>
      </div>
    </div>

    <div className="property-terms__row__content">

      <div className="property-terms__row__content-left">
        <span className="property-terms__row__content-text">
          { `${t('cms.terms.list.row.name')}: ${term.title}`}
        </span>
        <div className="property-terms__row__content-text">
          { `${t('cms.terms.list.row.url')}: `}
          <a
            className="property-terms__row__content-url"
            href={ term.url }
            target="_blank"
            rel="noopener noreferrer"
          >
            { term.url }
          </a>
        </div>
        <span className="property-terms__row__content-text">
          { `${t('cms.terms.list.row.create.date')}: ${term.createdAt ? moment(term.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-'}`}
        </span>
      </div>

      <div className="property-terms__row__content-left">
        <span className="property-terms__row__content-text">
          { `${t('cms.terms.list.row.valid.date')}: ${moment(term.validFrom).format('DD/MM/YYYY')} - ${term.validTill ? moment(term.validTill).format('DD/MM/YYYY') : t('cms.terms.list.row.openend.date')}`}
        </span>
        <div className="property-terms__row__content-file">
          <span className="property-terms__row__content-file-text">
            { `${t('cms.terms.list.row.file')}: `}
          </span>
          <FilesIcon className="property-terms__row__file-icon" />
          <a
            className="property-terms__row__content-file-text"
            href={ term.url }
            target="_blank"
            rel="noopener noreferrer"
          >
            { term.fileName }
          </a>
        </div>
        <span className="property-terms__row__content-text">
          { `${t('cms.terms.list.row.update.date')}: ${term.updatedAt ? moment(term.updatedAt).format('DD/MM/YYYY HH:mm:ss') : '-'}`}
        </span>
      </div>
    </div>
  </div>
);

TermsRow.propTypes = {
  term: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

TermsRow.defaultProps = {
  term: {},
  t: () => {},
  onEdit: () => {},
  onDelete: () => {},
};

export default TermsRow;

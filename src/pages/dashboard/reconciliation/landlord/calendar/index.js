import { useTranslation } from 'react-i18next';
import Svg from '~components/svg';
import React, { useState } from 'react';
import { toLower } from 'lodash';
import { DatePicker, Button, Icon, Select, Input, Tooltip } from 'antd';
import { SE2Str, getSecondaryStatus, getMainStatus, getFilterOpportunityStage } from '~pages/dashboard/reconciliation/utils';
/* eslint-disable   */
export default function calendar({ value: propsValue, field, className, txt, landlordProperties, type, clickOpen, onApply, close }) {
  const { t } = useTranslation();
  const [value, setValue] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(1);
  const [dates, setDates] = useState([]);
  const MAINSTATE = getMainStatus();
  const opportunityStages = getFilterOpportunityStage();
  const disabledDate = current => { 
    if(current&&current.diff((new Date().getFullYear()-1)+'0102','days')<0){
      return true
    } 
    if (!dates || dates.length === 0) { 
      return false;
    }  
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 365;
    const tooEarly = dates[0] && dates[0].diff(current, 'days') >365; //antd 3.x bugs fixed 
    return tooEarly || tooLate;
  };
  const dateFormat = 'DD/MM/YYYY'; 

  const getIconByField = (field)=>{
    let result  = 'filter-calendar'
    switch (field) {
      case 'status':
        result = 'filter-progress'
        break;
      case 'opportunityStage':
        result = 'opportunity-stage'
        break;
      case 'property':
        result = 'filter-home'
        break;
      default:
        break;
    } 
    return result 
  }

  const generateSecondaryStatus = (status1) => {
    let status2Array = getSecondaryStatus(status1) //{keys:[],value:[]}
    return status2Array.keys.map((s, i) => (<Select.Option key={i} value={s}   >
      {status2Array.value[i]}
    </Select.Option>))
  }

  const propertiesNameText = () => {
    let text = '';
    if (propsValue) {
      text = propsValue.map(item => JSON.parse(item).name).toString();
    }

    return text;
  }

  return (
    <div
      key={ `${field}_${forceUpdate}` }
      className={ `reconciliation-cards ${className} ${propsValue != null ? 'recon-cards-done' : ''} ${type === 'small' ? 'recon-cards-small' : ''}` }
      onClick={()=>{
        clickOpen&&clickOpen()
      }}
    >
      <div className="title">
        <Svg hash={getIconByField(field)} className="cdicon" /> <span>{ txt }</span>
        <Icon type="close" className="closebtn" onClick={  (e)=>{e.stopPropagation(); close()}  } />
      </div>
      {
        field === 'moveout' && (
          propsValue != null ?
            <div className="value">{SE2Str(propsValue)}</div>
            :
            <React.Fragment>
              <DatePicker.RangePicker
                format={ dateFormat }
                disabledDate={disabledDate}
                allowClear={false}
                onCalendarChange={v  => {
                  setDates(v);
                }}
                style={ { width: '100%' } } 
                onChange={ (dates) => { 
                  setValue(dates);
                } }
              />
            </React.Fragment>
        )
      }
      {
        field === 'movein' && (
          propsValue != null ?
            <div className="value">{ SE2Str(propsValue) }</div>
            :
            <React.Fragment>
              <DatePicker.RangePicker
              format={ dateFormat }
             disabledDate={disabledDate}
             allowClear={false}
             onCalendarChange={v => {
              setDates(v);
            }}
                style={ { width: '100%' } }
                onChange={ (dates) => {
                  setValue(dates);
                } }
              />
            </React.Fragment>
        )
      }

      {
        field === 'booking' && (
          propsValue != null ?
            <div className="value">{SE2Str(propsValue)}</div>
            :
            <React.Fragment>
              <DatePicker.RangePicker
               format={ dateFormat }
               disabledDate={disabledDate}
               allowClear={false}
               onCalendarChange={v => {
                setDates(v);
              }}
                style={ { width: '100%' } }
                onChange={ (dates) => {
                  setValue(dates);
                } }
              />
            </React.Fragment>
        )
      }
      {
        field === 'opportunityStage' && (
          propsValue != null ?
            <div className="value">
              { propsValue ?
                t(`cms.reconciliation.landlord.table.stage.${toLower(propsValue)}`) : '-' }
            </div>
            :
            <React.Fragment>
              <div>{t('cms.reconciliation.landlord.drawer.filter.opportunity_stage')}</div>
              <Select
                style={{ width: '100%' }}
                placeholder={ t('cms.reconciliation.landlord.drawer.filter.opportunity_stage.placeholder') }
                onChange={(opportunityStage) => {
                  setValue(opportunityStage);
                }}
              >
                {
                  opportunityStages.keys.map((stage,index) =>(
                  <Select.Option key={ stage } value={ stage }>
                    { opportunityStages.value[index] }
                  </Select.Option>))
                }
              </Select>
            </React.Fragment>
        )
      }
      {
        field === 'status' && (
          propsValue != null ?
            <div className="value">
              { MAINSTATE.getValueByKey(propsValue.status1) }
              { propsValue.status2 &&
                " - ".concat(getSecondaryStatus(propsValue.status1).getValueByKey(propsValue.status2)) }
              </div>
            :
            <React.Fragment>
              <div>{t('cms.reconciliation.landlord.cards.name.status_primary')}</div>
              <Select
                style={{ width: '100%' }}
                placeholder={ t('cms.reconciliation.landlord.drawer.filter.primary_status.placeholder') }
                onChange={(sValue) => {
                  setValue({
                    status1: sValue
                  });
                }}
              >
                {
                  MAINSTATE.keys.map( (s,i) =>(<Select.Option key={i} value={s}  >
                        {MAINSTATE.value[i]}
                    </Select.Option>))
                }
              </Select>
              {
                value&&value.status1&&['PENDING_APPROVAL','UNCLAIMABLE','APPROVED'].indexOf(value.status1)>=0&&
                <React.Fragment>
                  <div style={{marginTop:'20px'}}>{t("cms.reconciliation.landlord.cards.name.status_secondary")}</div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder={ t('cms.reconciliation.landlord.drawer.filter.secondary_status.placeholder') }
                    onChange={(sValue) => {
                      setValue({
                        ...value,
                        status2: sValue
                      });
                    }}
                  >
                    { 
                      generateSecondaryStatus(value.status1)
                    }
              </Select>
                  </React.Fragment>
              }
              
            </React.Fragment>
        )
      }
      {
        field === 'notes' && (
          propsValue != null ?
            <div className="value">{propsValue}</div>
            :
            <React.Fragment>
              <Input
                placeholder={t('cms.reconciliation.landlord.input.placeholder')}
                onChange={ (e) => {
                  setValue(e.target.value);
                } }
              />
            </React.Fragment>
        )
      }
      {
        field === 'property' && (
          propsValue != null ?
            <div className="value value--property-name">
              { propertiesNameText() }
              <If condition={ propsValue && propsValue.length > 1 }>
                <Tooltip
                  overlayStyle={ { width: 187 } }
                  placement="top"
                  title={ propertiesNameText() }
                >
                  <span className="value__name-count">
                    +{ propsValue && propsValue.length - 1 }
                  </span>
                </Tooltip>
              </If>
            </div>
            :
            <React.Fragment>
              <Select
                mode="multiple"
                style={ { width: '100%' } }
                placeholder={t('cms.reconciliation.landlord.selector.placeholder')}
                onChange={ (v) => { 
                  setValue( v) 
                } }
              >
                { 
                  landlordProperties.map((item, i) => 
                  <Select.Option key={ item.node.id + i } value={JSON.stringify({id:item.node.id,name:item.node.name})}>{item.node.name }</Select.Option>)
                }
              </Select>
            </React.Fragment>
        )
      }
      {
        propsValue ?
          null :
          <div className="btns">
            <Button onClick={ () => {
              setForceUpdate(forceUpdate + 1);
              setValue(null);
              setDates([])
            } }
          >{t('cms.reconciliation.landlord.cards.reset')}</Button>
            <Button type="primary"
              disabled={!value}
              onClick={() => {
                setDates([]);
                onApply(value);
              }}
            >
              {t('cms.reconciliation.landlord.cards.confirm')}
            </Button>
          </div>
      }
    </div>
  );
}

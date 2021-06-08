import { useTranslation } from 'react-i18next';
import { get } from 'lodash';
import Svg from '~components/svg';
import { listLandlordReconciliationOpportunities, getLandlordReconciliation, getCommission, getLandlordProperties } from '~actions/reconciliation/bookinglist';
import { Icon, Descriptions, Alert, Breadcrumb, Form, Drawer } from 'antd';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import authControl from '~components/auth-control';
import { platformEntity, entityAction } from '~constants';
import Filter from '~pages/dashboard/reconciliation/reconciliation-filter';
import StudentTable from '~pages/dashboard/reconciliation/landlord/table';
import DrawerFilter from '~pages/dashboard/reconciliation/landlord/drawer';
import Cards from '~pages/dashboard/reconciliation/landlord/calendar';
import Comission from '~pages/dashboard/reconciliation/landlord/comission';
import Export from '~pages/dashboard/reconciliation/landlord/export';
import { getSelected } from '~helpers/jstool';
import { Base64 } from 'js-base64';

/* eslint-disable   */

const Index = ({ form, communication, getLandlordReconciliation, getLandlordProperties, getlist, history, getCommission, list, match }) => {
  const { t } = useTranslation();
  const [showDrawerFilter, setShowDrawerFilter] = useState(false);
  const [showComission, setShowComission] = useState(false);
  //useState([{txt:'Move in date',value:[moment().startOf('month').add(-1,'month'),moment().endOf('month').add(-1,'month')],field:'movein'}]);
  const [filters, setFilters] = useState([]);
  const [searchInput,setSearchInput]  = useState(null) 
  const [pageIndex, setPageIndex] = useState(1) 
  const [rowKeys, setRowKeys] = useState([])
  const [landlord, setLandlord] = useState({
    approvedBookingNumber:0,
    location: ' - ',
    name : ' - ',
    reconciliationOption: ' - ',
    slug:'',
    totalBookingNumber:0
  }) 
  const firstEnter = useRef(true) 
  const [comissionEntity, setComissionEntity] = useState({
    currencyGroup:[],
    propertyGroup:[]
  }) 
  const [landlordProperties,setLandlordProperties] = useState([]) 
  const [pageSize, setPageSize] = useState(20) 
  const landlordId = decodeURIComponent(match.params.id)||''  
  const [comissionLoading, setComissionLoading] = useState(false);

  const handleApplyModalFilter = (currentFilterValues) => {
    setFilters(currentFilterValues);
    setPageIndex(1)
    setShowDrawerFilter(false);
  };

  const [canbeNextClick, setCanbeNextClick] = useState(false) 
  useEffect(()=>{
    var _filters = []
    let _search = Base64.decode( (window.location.search).substr(1) ).split('-->')
     
      if( _search&&_search.length==2){ 
           _filters =  JSON.parse( (_search[0])) 
         setFilters(_filters)
         let _pages = JSON.parse( (_search[1]))
         setPageIndex(_pages.pageIndex)
         setPageSize(_pages.pageSize) 
      }
    
    getLandlordReconciliation({ landlordIds: [landlordId] }, (data)=>{
      let result = {
        approvedBookingNumber:0,
        location: ' - ',
        name : ' - ',
        reconciliationOption: ' - ',
        totalBookingNumber:0,
        slug:''
      }
      if(data.listReconciliationLandlords&&data.listReconciliationLandlords.edges){
         
        let temp = data.listReconciliationLandlords.edges[0]
        result.approvedBookingNumber = temp.approvedBookingNumber
        result.totalBookingNumber = temp.totalBookingNumber
        if(temp.landlord){
          result.location = temp.landlord.billingCity + ', ' + temp.landlord.billingCountry
          result.name = temp.landlord.name
          if(temp.landlord.reconciliationOption){
             let optionDic = {
              'BOOKING_COMPLETED':['Booking completed','booking'],
              'STUDENT_CHECK_IN':['Move in','movein'],
              'STUDENT_CHECK_OUT':['Move out','moveout'] 
            }[`${temp.landlord.reconciliationOption}`]
            result.reconciliationOption = optionDic[0]
            if(_filters.length==0){
              setFilters([
                {txt:`${optionDic[0]} date`,value:[moment().startOf('month').add(-1,'month'),moment().startOf('month')],field:optionDic[1]},
                {txt: 'Booking stage', value: 'COMPLETED', field: 'opportunityStage'}
              ]);
            } 
          }
          result.slug = temp.landlord.slug
        } 
      }
      setLandlord(result)

      //获取landlord properties
       getLandlordProperties({slug:result.slug},(properties)=>{ 
          if(properties&&properties.properties&&properties.properties.edges){ 
            setLandlordProperties(properties.properties.edges)
          } 
       })
      
    })
  },[])


  const getApiParams = (filters,onlyFilter=false) => {
    let obj = {}
    filters.map(f => {
      if(!f){
        return 
      }
      let key = typeof f==='string'? f: f.field
      switch (key) {
        case 'movein':
          obj['finalMoveInDateStart'] =  f.value[0].format('YYYY-MM-DD')
          obj['finalMoveInDateEnd'] = f.value[1].format('YYYY-MM-DD')
          break;
        case 'moveout':
          obj['finalMoveOutDateStart'] = f.value[0].format('YYYY-MM-DD')
          obj['finalMoveOutDateEnd'] = f.value[1].format('YYYY-MM-DD')
          break;
        case 'booking':
          obj['completedAtStart'] =  f.value[0].format('YYYY-MM-DD')
          obj['completedAtEnd'] =  f.value[1].format('YYYY-MM-DD')
          break;
        case 'property':
            if(f.value&&f.value.length>0){ 
              obj['propertyIds'] = []  
              f.value.map( p =>{
                obj['propertyIds'].push(JSON.parse(p).id)
              })
            } 
            break;
        case 'status': 
              obj['landlordBookingStatus'] = f.value.status1
              obj['secondaryLandlordBookingStatus'] = f.value.status2
            break;
        case 'opportunityStage':
            obj['opportunityStage'] = f.value;
          break;
        case 'ex_status': 
          obj['landlordBookingStatus'] = f.value
        break; 
            
        default:
          break;
      }
    })
   
    if(!onlyFilter){
     if (searchInput && searchInput.idsType && searchInput.ids) {
       let bookingIds = searchInput.ids.replace(/\s/ig,'').split(',').filter(item => item != '')  //todo : repalce space  and chinse ,
       obj[searchInput.idsType] = bookingIds;
     }
   }
    
    return obj
  } 

  useEffect(() => {
    if(firstEnter.current){
      firstEnter.current = false
      return
    }

    let apiParams = getApiParams(filters)
    getlist({
      pageNumber: pageIndex,
      pageSize: pageSize,
      landlordId: landlordId,
      ...apiParams
    },(json)=>{ })

    history.replace(`?${ Base64.encodeURI( JSON.stringify(filters) + '-->' + JSON.stringify({pageIndex:pageIndex,pageSize}) ) }`)
  }, [searchInput, filters, pageIndex, pageSize, landlordId])


  useEffect(() => {
    if(!showComission){
      return;
    }

    setComissionLoading(true);

    let apiParams = getApiParams(filters);
    getCommission({
      landlordId,
      ...apiParams,
    }, (data) => {
      let temp = data.landlordCommissionGroup;
      setComissionEntity(temp);
      setComissionLoading(false);
    });
  }, [showComission, filters, landlordId])
 

  const  handleReset = () => {
    form.resetFields();
    setSearchInput(null)
    setPageIndex(1)
  };
 
  const handleSearch = e => {
    e.preventDefault(); 
    form.validateFields((err, values) => {
      if(!err && form.isFieldsTouched()){
        if (values.ids && values.idsType) {
          setCanbeNextClick(true)
          setSearchInput(values)
          setPageIndex(1)
        } else {
          if (canbeNextClick) {
            setSearchInput(values)
            setPageIndex(1)
            setCanbeNextClick(false)
          }
        }
      }
    });
  };

  const handleClickLandlordReconciliationItem = useCallback((record) => {
    if (!getSelected()) {
      history.push(`${landlordId}/${get(record, 'node.id')}`)
    }
  }, [landlordId]);

  return (
    <div className="reconciliation">
      <div className="reconciliation__card">
        <div className="nav">
          <Breadcrumb>
            <Breadcrumb.Item>
              <a href="/reconciliation">{t('cms.reconciliation.breadcrumb.title')}</a>
            </Breadcrumb.Item>
              <Breadcrumb.Item>{ landlord.name }</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="discribe--wapper "> 
          <Descriptions
            title={ landlord.name }
          >
            <Descriptions.Item label={t('cms.reconciliation.landlord.description.reconciliation_option')}>{ landlord.reconciliationOption }</Descriptions.Item>
            <Descriptions.Item label={t('cms.reconciliation.landlord.description.total_booking_number')} span={ 2 }>{ landlord.totalBookingNumber }</Descriptions.Item>
            <Descriptions.Item label={t('cms.reconciliation.landlord.description.billing_location')}>{ landlord.location }</Descriptions.Item>
            <Descriptions.Item label={t('cms.reconciliation.landlord.description.approved_booking_number')} span={ 2 }>{ landlord.approvedBookingNumber }</Descriptions.Item>
          </Descriptions>
          <div className="btns--box">
            {/* <Button  style={{marginRight:'16px'}}>Contact partner</Button>
            <Button type="primary">Compare</Button> */}
          </div>
        </div>
      </div>
      <Filter
        form={ form }
        handleSearch={ handleSearch }
        handleReset={ handleReset }
      />
      <div className="reconciliation__content">
        <div className="toolbar">
          <Icon
            type="filter"
            className="icons"
            onClick={ () => {
              setShowDrawerFilter(!showDrawerFilter);
            } }
          />
          <Export
            getlist={ getlist }
            filters={ filters }
            landlordId={ landlordId }
            getApiParams={ getApiParams }
          />
          {/* The code is commented out for later use */}
          {/* <Icon type="setting" className="icons" /> */}
          <span
            className="toolbar__board-wrap"
            onClick={ () => {
              setShowComission(true);
            } }
          >
            <Svg hash="board" className="cdicon" />
          </span>
        </div>

        <div className="filter-box">
          {
            filters.map((item, index) => (
              <Cards
                key={ `small_cards_${index}` }
                className="recon-cards-small"
                field={ item.field }
                value={ item.value }
                txt={ item.txt }
                clickOpen = {()=>{
                  setShowDrawerFilter(true)
                }}
                close={ () => {
                  // 先删除本页面的， 在删除 filter的
                  setFilters(filters.filter(f => f.field !== item.field));
                  setPageIndex(1)
                } }
              />
            )) 
          }
        </div>

        <Alert
          showIcon
          type="info"
          className="reconciliation__alert"
          message ={ t('cms.reconciliation.landlord.alert.message').replace('{{total}}',(list&&list.total)||0).replace('{{rowKeys}}',rowKeys.length||0)  }
        />

        <StudentTable
          communication={communication}
          list={list}
          filters={filters}
          pageNumber={pageIndex}
          pageSize={pageSize}
          onChange={(pn) => {
            setPageIndex(pn)
          }}
          handlePageSizeChange={(current, size) => {
            setPageSize(size)
            setPageIndex(1)
          }}
          rowKeys={(keys) => {
            setRowKeys(keys)
          }}
          onRow={record => {
            return {
              onClick: () => handleClickLandlordReconciliationItem(record)
            };
          }}
        />

        <Drawer
          placement="right"
          closable={ false }
          onClose={ () => { setShowComission(false); } }
          visible={ showComission }
          maskStyle={ { backgroundColor: 'transparent' } }
          width="600px"
        >
          <Comission
            data={ comissionEntity }
            communication={ communication }
            loading={ comissionLoading }
            onClose={ () => { setShowComission(false); } }
          />
        </Drawer>
      </div>
      {
        showDrawerFilter && <DrawerFilter
          onClose={ () => { setShowDrawerFilter(false); } }
          onApply={ handleApplyModalFilter }
          landlordProperties={landlordProperties}
          visible
          cards={ filters }
        />
      }

    </div>
  );
}; 
export default  connect(state=>({list: state.dashboard.reconciliation.get('list').toJS(), 
                                communication:state.dashboard.reconciliation.get('communication').toJS()}), 
                                      {getlist:listLandlordReconciliationOpportunities,
                                        getLandlordReconciliation:getLandlordReconciliation,
                                        getCommission:getCommission,
                                        getLandlordProperties:getLandlordProperties
                                      })(
                                        Form.create({ name: 'search' })(authControl(platformEntity.BOOKINGS_OPPORTUNITIES, entityAction.READ)(Index))
               
 )

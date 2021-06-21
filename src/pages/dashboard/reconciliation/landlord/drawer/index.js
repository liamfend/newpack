import React, { useState, useMemo } from 'react';
import { Drawer, Button, Dropdown, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import Cards from '~pages/dashboard/reconciliation/landlord/calendar';

/* eslint-disable   */
export default function index(props) {
  const { t } = useTranslation();

  const cards = useMemo(()=>{
    const obj = {};
    props.cards.map((card) => {
      obj[`${card.field}`] = card.value;
    });
     return{
      cardlist : props.cards.map(card => card.field),
      obj
     }  
  },props.cards) 

  const [currentCard, setCurrentCard] = useState(null); // 当前创建的card ，还没有apply的
  const [cardList, setCardList] = useState(cards.cardlist); // 已经apply的所有card,['field']
  const [cardListValues, setCardListValues] = useState(cards.obj||{}); // 已经apply 的 card 的 value值的存储
    
  const menusArray = [
    {
      txt: t('cms.reconciliation.landlord.drawer.filter.movein'),
      field: 'movein',
    },
    {
      txt: t('cms.reconciliation.landlord.drawer.filter.moveout'),
      field: 'moveout',
    },
    {
      txt: t('cms.reconciliation.landlord.drawer.filter.booking'),
      field: 'booking',
    },
    {
      txt: t('cms.reconciliation.landlord.drawer.filter.property'),
      field: 'property',
    },
    {
      txt: t('cms.reconciliation.landlord.drawer.filter.status'),
      field: 'status',
    },
    {
      txt: t('cms.reconciliation.landlord.drawer.filter.opportunity_stage'),
      field: 'opportunityStage',
    },
  ];
  // 因为选择完毕会禁止选择第二项过滤器  所以可以在允许选择后 再删除上一个apply的过滤器
  const menus = useMemo(() => (<Menu>
    {
      menusArray.filter(f => cardList.indexOf(f.field) === -1).map((t, i) => (<Menu.Item key={ `menuitem${i}` }><a
        rel={ t.txt }
        onClick={
          () => {
            setCurrentCard(t.field); // 设置当前可编辑的card 为xx
          }
        }
      >{t.txt}</a></Menu.Item>))
    }
  </Menu>), [cardList]);


  const removeCards = (card) => {
    setCardList(cardList.filter(f => f !== card));
    const tempValues = { ...cardListValues };
    delete tempValues[`${card}`];
    setCardListValues({ ...tempValues });
  };

  const generteCards = (className, idprex, removeCallBack) => cardList.map((card, index) => (<Cards
    className={ className }
    key={ `${idprex}cards_${index}` }
    field={ card }
    value={ cardListValues[`${card}`] }
    txt={ menusArray.filter(m => m.field === card)[0].txt }
    close={ () => {
      removeCards(card);
      removeCallBack && removeCallBack(generteCards, cardListValues);
    } }
  />));

  return (

    <Drawer
      className="drawfilter"
      title={ t('cms.reconciliation.landlord.drawer.filter.title')}
      placement="right"
      maskClosable={ false }
      onClose={ props.onClose }
      visible={ props.visible }
      width={ 425 }
    >

      <Dropdown trigger={ ['click'] } overlay={ menus } placement="bottomCenter" disabled={ currentCard != null }>

        <Button icon="filter" className={ ['addfilter', currentCard === null ? 'light' : ''].join(' ') }>Add New Filter</Button>

      </Dropdown>
      {
        currentCard ?
          <Cards
            field={ currentCard }
            landlordProperties={props.landlordProperties}
            onApply={ (value) => {
              setCardListValues({ ...cardListValues, [`${currentCard}`]: value });
              setCardList([...cardList,currentCard]);
              setCurrentCard(null);
            } }
            txt={ menusArray.filter(m => m.field === currentCard)[0].txt }
            close={ () => {
              setCurrentCard(null);
            } }

          />
          :
          null
      }
      {
        // 稍后提取公共组建  不在这个页面遍历
        cardList.map((card, index) => (<Cards
          key={ `cards_${index}` }
          field={ card }
          value={ cardListValues[`${card}`] }
          txt={ menusArray.filter(m => m.field === card)[0].txt }
          close={ () => {
            removeCards(card);
          } }
        />))
      }

      <div className="bottom-tools">
        <div
          className="clearall"
          onClick={ () => {
            setCurrentCard(null);
            setCardList([]);
            setCardListValues({});
          } }
        >{t('cms.reconciliation.landlord.filter.clear')} </div>
        <div className="btns">
          <Button onClick={ props.onClose }>{t('cms.reconciliation.landlord.filter.cancle')}</Button>
          <Button
            type="primary"
            style={ { marginLeft: '1rem' } }
            disabled={ !(cardList && currentCard == null) }
            onClick={ () => {
              const list = cardList.map(card => ({
                value: cardListValues[`${card}`],
                txt: menusArray.filter(m => m.field === card)[0].txt,
                field: card,
              }));
              props.onApply(list);
            } }
          >{t('cms.reconciliation.landlord.filter.apply')} </Button>
        </div>
      </div>

    </Drawer>
  );
}

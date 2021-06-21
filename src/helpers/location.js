import store from '~client/store';
import i18n from '~settings/i18n';
import { message } from 'antd';
import * as cityActions from '~actions/location/city';
import * as areaActions from '~actions/location/area';
import * as universityActions from '~actions/location/university';
import { locationType } from '~constants';

const updatePayloadDetails = (data, type, changedFields, tab) => {
  const newData = { ...data };
  const editedTab = {};
  const editedFields = {};
  Object.keys(changedFields).map((key) => {
    const field = changedFields[key];
    if (!field.dirty && typeof field.touched !== 'undefined') {
      newData[key] = field.value;
      editedFields[key] = {
        value: field.value,
        validate: !field.errors,
        touched: !!field.touched,
      };
    }
    return true;
  });

  editedTab[tab] = editedFields;
  if (JSON.stringify(editedFields) === JSON.stringify({})) return false;
  switch (type) {
    case locationType.CITY_TYPE:
      store.dispatch(cityActions.setCityDetail({ city: newData }));
      break;
    case locationType.AREA_TYPE:
      store.dispatch(areaActions.setAreaDetail({ area: newData }));
      break;
    case locationType.UNIVERSITY_TYPE:
      store.dispatch(universityActions.setUniversityDetail({ university: newData }));
      break;
    default:
  }

  return editedTab;
};

export const handleSEOTemplate = (name, template, type) => {
  const replaceTarget = `[${type}]`;
  return template.replace(replaceTarget, name);
};

export const handleSaveData = (data, baseData, saveDataType, changedState, published = null) => {
  if (data && baseData) {
    const updateData = {};
    const changFields = Object.values(changedState).filter(value => !!value);
    if (changFields.length === 0 && published === null) {
      return false;
    }

    if (published !== null) {
      updateData.published = published;
    }

    ['details', 'content', 'seo'].map((type) => {
      if (changedState[type]) {
        const targetData = Object.keys(changedState[type]);
        targetData.map((dataType) => {
          if (
            (dataType === 'heroImage' || dataType === 'smallHeroImage')
            && changedState.content[dataType]
            && changedState.content[dataType].validate
            && changedState.content[dataType].touched
          ) {
            if (changedState.content[dataType].value) {
              const imageData = {};
              imageData[`${saveDataType.toLowerCase()}Id`] = data.id;
              imageData.contentType = changedState.content[dataType].value.contentType;
              imageData.extension = changedState.content[dataType].value.extension;
              imageData.filename = changedState.content[dataType].value.filename;
              imageData.height = changedState.content[dataType].value.height;
              imageData.width = changedState.content[dataType].value.width;
              imageData.imageHash = changedState.content[dataType].value.imageHash;

              if (
                baseData[dataType]
                && baseData[dataType].id
              ) {
                imageData.id = baseData[dataType].id;
              }

              if (dataType === 'heroImage') {
                imageData.hero = true;
                updateData.heroImage = imageData;
              }

              if (dataType === 'smallHeroImage') {
                imageData.smallHero = true;
                updateData.smallHeroImage = imageData;
              }
            } else {
              updateData[dataType] = null;
            }
          }

          if (
            !(dataType === 'heroImage' || dataType === 'smallHeroImage')
            && changedState[type][dataType]
            && changedState[type][dataType].validate
            && changedState[type][dataType].touched
          ) {
            if (dataType === 'rank') {
              updateData[dataType] = changedState[type][dataType].value ?
                parseFloat(changedState[type][dataType].value) :
                changedState[type][dataType].value;
            } else {
              updateData[dataType] = changedState[type][dataType].value;
            }
          }
          return true;
        });
      }
      return true;
    });

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    updateData.id = data.id;
    return updateData;
  }

  return false;
};

export const successMessageAction = (data, type, hasPublished) => {
  if (!data.payload ||
    hasPublished === data.payload.published ||
    hasPublished === null
  ) {
    message.success(
      i18n.t('cms.location.layout.update_success.message', { type }));
  } else {
    message.success(i18n.t(`cms.location.layout.${hasPublished ? 'publish' : 'unpublish'}_success.message`, { type }));
  }

  return true;
};

export default updatePayloadDetails;

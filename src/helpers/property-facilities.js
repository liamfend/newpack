import i18n from '~settings/i18n';
import { updateMutation } from '~client/constants';

export const facilitiesGroups = {
  amenity: ['furnished', 'laundry_facilities', 'others'],
  security: ['controlled_access_gate', 'maintenance_team', 'security_officer'],
  bills: ['cleaning_service', 'contents_insurance', 'electricity', 'gas', 'heating', 'meals_included', 'water', 'wifi'],
  rule: [],
};


export const combine = () => {
  const arr = [].concat.apply([], arguments); // eslint-disable-line

  return Array.from(new Set(arr));
};

export const addTagAndLabel = (facilities, formatedFacilities) => {
  const editedFieldsWidthTag = {};
  Object.keys(formatedFacilities).map((fieldName) => {
    const field = formatedFacilities[fieldName];
    if (typeof field.value === 'boolean') {
      // check button
      const facility = facilities.find(item => item.slug === fieldName);
      if (facility) {
        field.tag = facility.tags[0];
        field.label = facility.label;
      }
    } else if (fieldName === 'others') {
      // other
      field.tag = 'amenity';
    } else {
      // radio button
      const facility = facilities.find(item => item.slug === field.value);
      if (facility) {
        field.tag = facility.tags[0];
        field.label = `${i18n.t(`cms.properties.edit.facilities.item.label.${facility.group}`)}(${facility.label})`;
      }
    }
    editedFieldsWidthTag[fieldName] = field;
    return true;
  });
  return editedFieldsWidthTag;
};

export const getOtherLabelBySlugs = (slugArray, facilities) => {
  const labels = [];
  slugArray.map((slug) => {
    const item = facilities.find(facility => facility.slug === slug);
    labels.push(item ? item.label : slug);
    return true;
  });

  return i18n.t('cms.properties.edit.facilities.item.label.others_facilities', {
    facilities: labels.length > 0 ? labels.join(', ') : '',
  });
};

const extractRadioGroup = (tag, facilities) => {
  const result = {};

  facilitiesGroups[tag].map((group) => {
    const groupItems = facilities.filter(item => item.group === group && item.checked);
    if (groupItems.length > 0) {
      if (group === 'others') {
        const value = groupItems.map(item => item.slug);
        result[group] = { value, tag };
      } else {
        result[group] = { value: groupItems[0].slug, tag, label: `${i18n.t(`cms.properties.edit.facilities.item.label.${groupItems[0].group}`)}(${groupItems[0].label})` };
      }
    }
    return true;
  });
  return result;
};

export const formatFacilityFromData = (facilities) => {
  let formatedFacilities = {};
  Object.keys(facilitiesGroups).map((tag) => {
    const checkedFields = {};
    facilities.filter(item => item.tags.includes(tag) && !item.group && item.checked !== false)
      .map((item) => {
        checkedFields[item.slug] = { value: item.checked, tag, label: item.label };
        return true;
      });
    const tagFields = Object.assign({}, checkedFields, extractRadioGroup(tag, facilities));
    formatedFacilities = Object.assign(formatedFacilities, tagFields);
    return true;
  });
  return formatedFacilities;
};

export const combineFullFacilities = (originFacilities, editedFacilities) => {
  let formatedFacilities = formatFacilityFromData(originFacilities);
  const originalOther = formatedFacilities.other;
  const newOther = editedFacilities.other;
  formatedFacilities = Object.assign(
    {},
    formatedFacilities,
    addTagAndLabel(originFacilities, editedFacilities),
  );
  if (originalOther && newOther) {
    formatedFacilities.others = combine(originalOther, newOther);
  }
  return formatedFacilities;
};

export const getFacilityText = (tagItems, facilities, showDeleted) => {
  const text = [];
  let deletedText = '';
  Object.keys(tagItems).map((key) => {
    const item = tagItems[key];
    if (item.value === true) {
      text.push(`${item.label}`);
    } else if (item.value === false) {
      deletedText += `${item.label},`;
    } else if (key === 'others') {
      text.push(getOtherLabelBySlugs(item.value, facilities));
    } else {
      text.push(`${item.label}`);
    }
    return true;
  });
  if (showDeleted && deletedText) {
    deletedText = deletedText.substr(0, deletedText.length - 1);
    text.push(`<span style="text-decoration:line-through">${deletedText}</span>`);
  }
  return text.join(', ');
};

export const formatReviewFacilities = (facilityFields, facilities, showDeleted = false) => {
  const result = [];
  Object.keys(facilitiesGroups).map((tag) => {
    const fields = {};
    Object.keys(facilityFields).map((fieldName) => {
      const field = facilityFields[fieldName];
      if (field.tag === tag) {
        fields[fieldName] = { key: fieldName, value: field.value, label: field.label };
      }
      return true;
    });
    if (Object.keys(fields).length > 0) {
      const text = getFacilityText(fields, facilities, showDeleted);
      result.push({ key: tag, text, name: `cms.properties.edit.facilities.type_title.${tag}` });
    }
    return true;
  });
  return result;
};

export const formatfacilitiesForSave = (editedFacilities, originFacilities) => {
  const result = [];
  Object.keys(editedFacilities).map((fieldName) => {
    const field = editedFacilities[fieldName];
    if (typeof field.value === 'boolean') {
      const originalItem =
        originFacilities.find(item => item.slug === fieldName);
      if (originalItem && originalItem.checked !== field.value) {
        result.push({
          slug: fieldName,
          _action: field.value ? updateMutation.INSERT : updateMutation.DELETE,
        });
      }
    } else if (typeof field.value === 'string') {
      const originalSelect =
        originFacilities.find(item => `group_${item.group}` === fieldName && item.checked);
      if (originalSelect && originalSelect.slug !== field.value) {
        result.push({ slug: originalSelect.slug, _action: updateMutation.DELETE });
        result.push({ slug: field.value, _action: updateMutation.INSERT });
      } else if (!originalSelect) {
        result.push({ slug: field.value, _action: updateMutation.INSERT });
      }
    } else if (fieldName === 'others') {
      const stayed = [];
      const otherFacilities = originFacilities.filter(item => item.group === 'others');
      field.value.map((slug) => {
        if (otherFacilities.find(item => item.slug === slug && item.checked)) {
          stayed.push(slug);
        } else {
          result.push({ slug: '', label: slug, _action: updateMutation.INSERT });
        }
        return true;
      });
      otherFacilities.map((item) => {
        if (!stayed.includes(item.slug) && item.checked) {
          result.push({ slug: item.slug, _action: updateMutation.DELETE });
        }
        return true;
      });
    }
    return true;
  });
  return result;
};

export const formatfacilitiesForPreview = (editedFacilities, originFacilities) => {
  const newFacilities = [...originFacilities];
  Object.keys(editedFacilities).map((fieldName) => {
    const field = editedFacilities[fieldName];
    if (typeof field.value === 'boolean') {
      const originalItem =
        newFacilities.find(item => item.slug === fieldName);
      if (originalItem && newFacilities.checked !== field.value) {
        originalItem.checked = field.value;
      }
    } else if (typeof field.value === 'string') {
      const originalSelect =
        newFacilities.find(item => `group_${item.group}` === fieldName && item.checked);
      const newSelect = newFacilities.find(
        item => `group_${item.group}` === fieldName && item.slug === field.value,
      );
      if (originalSelect && originalSelect.slug !== field.value) {
        originalSelect.checked = false;
        newSelect.checked = true;
      } else if (!originalSelect) {
        newSelect.checked = true;
      }
    } else if (fieldName === 'others') {
      const stayed = [];
      const otherFacilities = originFacilities.filter(item => item.group === 'others');
      field.value.map((slug) => {
        if (otherFacilities.find(item => item.slug === slug && item.checked)) {
          stayed.push(slug);
        } else {
          newFacilities.push({
            checked: true,
            group: 'others',
            label: slug,
            name: slug,
            rank: 9990,
            slug: `others_${slug.replace(' ', '_').replace('/', '').toLowerCase()}`,
            tags: ['amenity'],
          });
        }
        return true;
      });
      otherFacilities.map((item) => {
        if (!stayed.includes(item.slug) && item.checked) {
          newFacilities.splice(
            newFacilities.indexOf(newFacilities.find(facility => facility.slug === item.slug)),
            1,
          );
        }
        return true;
      });
    }
    return true;
  });
  return newFacilities;
};


export const filterUnchangedFacilities = (changedFields, originalFacilities) => {
  const originalFields = formatFacilityFromData(originalFacilities);
  const result = {};
  Object.keys(changedFields).map((fieldName) => {
    const originalField = originalFields[fieldName];
    const changedField = changedFields[fieldName];
    if ((!originalField && changedField.value)
      || (originalField && originalField.value !== changedField.value)) {
      result[fieldName] = changedField;
    }

    return true;
  });
  return result;
}
;

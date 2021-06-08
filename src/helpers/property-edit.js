import axios from 'axios'
import { cookieNames, updateMutation } from '~client/constants'
import cookies from 'js-cookie'
import Immutable from 'immutable'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'
import { propertyFormatOption } from '~constants/property-format'
import store from '~client/store'

import {
  formatReviewFacilities,
  addTagAndLabel,
  filterUnchangedFacilities,
  combineFullFacilities,
  formatfacilitiesForSave,
  formatfacilitiesForPreview,
} from '~helpers/property-facilities'
import { getItem } from '~base/global/helpers/storage'
import { formatLibraries, formatList, formatUpdateParamOfGallery } from '~helpers/gallery'
import { cloneObject } from '~helpers'
import { newRoomFacilities } from '~constants/pending-approval'

debugger
export const getAuthorization = () => {
  const authorization = `Bearer ${cookies.get(cookieNames.token)}`
  return authorization
}

export const checkSlugExist = (slug, notExistCallback, existCallback) => {
  const headers = {
    Authorization: getAuthorization(),
    'Accept-Language': 'en-us',
  }
  const authPayload = getItem('PMS_CURRENT_USER_AUTH')
  if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
    headers['Current-Role'] = authPayload.payload.currentRoleSlug
  }

  axios({
    method: 'post',
    url: endpoints.getPropertyDetail.url(),
    data: queries.checkPropertySlug({ slug }),
    headers,
  }).then(res => {
    if (!res.data.errors && res.data.data) {
      if (res.data.data.property === null) {
        notExistCallback()
      } else if (notExistCallback) {
        if (existCallback) {
          existCallback()
        }
      }
    }
  })
}

export const getNameBySlug = query =>
  new Promise(resolve => {
    const headers = {
      Authorization: getAuthorization(),
      'Accept-Language': 'en-us',
    }
    const authPayload = getItem('PMS_CURRENT_USER_AUTH')

    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug
    }

    axios({
      method: 'post',
      url: endpoints.getPropertyDetail.url(),
      data: query,
      headers,
    }).then(res => {
      if (!res.data.errors && res.data.data) {
        const resultKey = Object.keys(res.data.data)[0]
        if (resultKey) {
          resolve(res.data.data[resultKey].name)
        }
      }
    })
  })

export const getProperty = slug =>
  new Promise((resolve, reject) => {
    const headers = {
      Authorization: getAuthorization(),
      'Accept-Language': 'en-us',
    }
    const authPayload = getItem('PMS_CURRENT_USER_AUTH')

    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug
    }

    axios({
      method: 'post',
      url: endpoints.getPropertyDetail.url(),
      data: queries.getPropertyDetail({ slug }),
      headers,
    })
      .then(res => {
        if (!res.data.errors && res.data.data) {
          resolve(res.data.data.property)
        } else {
          reject('error')
        }
      })
      .catch(() => {
        reject('error')
      })
  })

export const publishProperty = property =>
  new Promise((resolve, reject) => {
    const publish = property.statuses !== 'PUBLISHED'
    const headers = {
      Authorization: getAuthorization(),
      'Accept-Language': 'en-us',
    }
    const authPayload = getItem('PMS_CURRENT_USER_AUTH')

    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug
    }
    axios({
      method: 'post',
      url: endpoints.publishProperty.url(),
      data: queries.publishProperty({ id: property.id, publish }),
      headers,
    })
      .then(res => {
        if (
          !res.data.errors &&
          res.data.data &&
          res.data.data.publishProperty &&
          res.data.data.publishProperty.status === 'SUCCESS'
        ) {
          resolve(
            Object.assign({}, property, {
              statuses: property.statuses !== 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED',
            }),
          )
        } else {
          reject('error')
        }
      })
      .catch(() => {
        reject('error')
      })
  })

export const htmlMinify = html => {
  if (!html) return ''
  let str = html
  // remove newline / carriage return
  // eslint-disable-next-line no-useless-escape
  // str = str
  //   .replace(/\n/g, '')
  //   .replace(/[\s ]+\</g, '<')
  //   .replace(/\>[\s ]+\</g, '><')
  //   .replace(/\>[\s ]+/g, '>')
  return str
}

export const stripHtml = html => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = htmlMinify(html)
  return tmp.textContent || ''
}

export const getHtmlLength = html => {
  if (!html) return 0
  return stripHtml(html).length
}

// 根据字段内的value值得到其显示值
// e.g. Billing cycle: WEEKLY => By Week
const getTextByValue = (text, value, originalData) => {
  if (!text) {
    if (typeof value === 'number' && isNaN(value)) {
      return ''
    }
    return value
  }
  if (typeof text === 'function') {
    return text(value, originalData)
  }
  if (typeof text === 'object') {
    return originalData.getIn(text)
  }
  return ''
}

const getValueFromOriginal = (value, originalData) => {
  let result = value
  if (typeof value === 'function') {
    result = value(originalData.toJS())
  }
  if (typeof value === 'object') {
    result = originalData.getIn(value)
  }
  return Immutable.Iterable.isIterable(result) ? result.toJS() : result
}

export const isEmptyObject = object => {
  if (!object) return true
  return JSON.stringify(object) === JSON.stringify({})
}

export const formateReviewUniversities = (universities, type) => {
  let value = ''
  if (universities && universities.length > 0) {
    universities.map((university, index) => {
      value = index === 0 ? value.concat(university[type]) : value.concat(', ', university[type])
      return true
    })
  } else {
    value = '-'
  }

  return value
}

// originalData: property data from graphql
// editedFields: edited fields data from redux
//              {
//                details: {
//                  name: { value: 'ss', validate: true, touched: true}
//                }
//              }
// return: { details: [{key:name, value: 'ss', text: 'proeprty name'} ...]}
export const formateReviewFullData = (originalData, editedFields = {}) => {
  const property = Immutable.fromJS(originalData)
  const result = {}
  Object.keys(propertyFormatOption).map(tabName => {
    const tabOption = propertyFormatOption[tabName]
    let resultTab = []
    if (tabName === 'facilities') {
      const formatedFacilities = combineFullFacilities(
        originalData.facilities,
        editedFields ? editedFields.facilities : {},
      )
      resultTab = formatReviewFacilities(formatedFacilities, originalData.facilities)
    } else if (tabName === 'gallery') {
      resultTab = editedFields ? editedFields[tabName] : {}
    } else {
      Object.keys(tabOption).map(fieldName => {
        let value = getValueFromOriginal(tabOption[fieldName].value, property)
        if (editedFields) {
          const editedField = editedFields[tabName][fieldName]
          if (editedField && editedField.validate && editedField.touched) {
            if (fieldName === 'universities') {
              value = formateReviewUniversities(editedField.value, 'label')
            } else {
              value = editedField.value
            }
          }
        }
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          JSON.stringify(value) !== '[]'
        ) {
          let text = ''
          if (fieldName === 'universities') {
            value = typeof value === 'string' ? value : formateReviewUniversities(value, 'name')
            text = value
          } else {
            text = getTextByValue(tabOption[fieldName].displayValue, value, property)
          }
          resultTab.push({ key: fieldName, value, name: tabOption[fieldName].name, text })
        }
        return true
      })
    }
    result[tabName] = resultTab
    return true
  })

  return result
}

// originalData: property data from graphql
// editedFields: edited fields data from redux
//              {
//                details: {
//                  name: { value: 'ss', validate: true, touched: true}
//                }
//              }
// return: { details: [{key:name, value: 'ss', text: 'proeprty name'} ...]}
export const formateReviewEditedData = (originalData, editedFields) => {
  if (!editedFields) return null

  const property = Immutable.fromJS(originalData)
  const result = {}
  Object.keys(propertyFormatOption).map(tabName => {
    const tabOption = propertyFormatOption[tabName]
    let resultTab = []
    if (tabName !== 'facilities') {
      Object.keys(tabOption).map(fieldName => {
        let value
        const editedField = editedFields[tabName][fieldName]
        if (editedField && editedField.validate && editedField.touched) {
          if (fieldName === 'universities') {
            value = formateReviewUniversities(editedField.value, 'label')
          } else {
            value = editedField.value
          }
        }
        if (value !== undefined) {
          const originalValue = getValueFromOriginal(tabOption[fieldName].value, property)
          let originalText = getTextByValue(
            tabOption[fieldName].displayValue,
            originalValue,
            property,
          )
          originalText = !originalText ? '' : originalText
          let editedtext = ''
          if (fieldName === 'universities') {
            value = typeof value === 'string' ? value : formateReviewUniversities(value, 'name')
            editedtext = value
            originalText =
              typeof originalText === 'string'
                ? originalText
                : formateReviewUniversities(originalText, 'name')
          } else {
            editedtext = getTextByValue(tabOption[fieldName].displayValue, value, property)
          }
          if (editedtext !== originalText) {
            resultTab.push({
              key: fieldName,
              value,
              name: tabOption[fieldName].name,
              text: editedtext,
            })
          }
        }
        return true
      })
    } else {
      const richFields = addTagAndLabel(originalData.facilities, editedFields.facilities)
      const changedFacilities = filterUnchangedFacilities(richFields, originalData.facilities)
      resultTab = formatReviewFacilities(changedFacilities, originalData.facilities, true)
    }
    result[tabName] = resultTab
    return true
  })

  return result
}

export const getPhoneNumber = phoneNumber => {
  if (!phoneNumber) return ''
  const phoneArray = phoneNumber.split(' ')
  if (phoneArray.length > 1) {
    return phoneArray[1]
  }
  return ''
}

export const isContactEmpty = contact =>
  !contact.contactName && !contact.contactEmail && !getPhoneNumber(contact.contactPhone)

const contactsDispose = (changedValue, originalValue) => {
  const result = []
  const value = changedValue.filter(item => !isContactEmpty(item))

  value.map(contact => {
    if (!contact.id) {
      result.push(Object.assign(contact, { _action: updateMutation.INSERT }))
    } else {
      const originalContact = originalValue.find(item => item.id === contact.id)
      if (originalContact && JSON.stringify(originalContact) !== JSON.stringify(contact)) {
        result.push(Object.assign(contact, { _action: updateMutation.UPDATE }))
      }
    }
    return true
  })

  originalValue.map(contact => {
    if (!value.find(item => item.id === contact.id)) {
      result.push(Object.assign(contact, { _action: updateMutation.DELETE }))
    }
    return true
  })
  return result.length > 0
    ? result.map(contact => {
        const newContact = Object.assign({}, contact)
        Object.keys(contact).forEach(key => {
          if (!contact[key]) newContact[key] = null
        })
        return newContact
      })
    : null
}

export const isBookingTeamContactEmpty = bookingTeamContact =>
  !bookingTeamContact.contactName &&
  !bookingTeamContact.contactEmail &&
  !getPhoneNumber(bookingTeamContact.contactPhone) &&
  !bookingTeamContact.occupation

const bookingTeamContactsDispose = (changedValue, originalValue) => {
  const result = []
  const value = changedValue.filter(item => !isBookingTeamContactEmpty(item))

  value.map(bookingTeamContact => {
    if (!bookingTeamContact.id) {
      result.push(Object.assign(bookingTeamContact, { _action: updateMutation.INSERT }))
    } else {
      const originalContact = originalValue.find(item => item.id === bookingTeamContact.id)
      if (
        originalContact &&
        JSON.stringify(originalContact) !== JSON.stringify(bookingTeamContact)
      ) {
        result.push(Object.assign(bookingTeamContact, { _action: updateMutation.UPDATE }))
      }
    }
    return true
  })

  originalValue.map(bookingTeamContact => {
    if (!value.find(item => item.id === bookingTeamContact.id)) {
      result.push(Object.assign(bookingTeamContact, { _action: updateMutation.DELETE }))
    }
    return true
  })
  return result.length > 0
    ? result.map(bookingTeamContact => {
        const newContact = Object.assign({}, bookingTeamContact)
        Object.keys(bookingTeamContact).forEach(key => {
          if (!bookingTeamContact[key]) newContact[key] = null
        })
        return newContact
      })
    : null
}

const linkDispose = (value, originalValue) => {
  const result = []
  value.map(link => {
    if (!link.id) {
      if (link.link) {
        result.push(Object.assign(link, { _action: updateMutation.INSERT }))
      }
    } else {
      const originalLink = originalValue.find(item => item.id === link.id)
      if (originalLink && JSON.stringify(originalLink) !== JSON.stringify(link)) {
        result.push(Object.assign(link, { _action: updateMutation.UPDATE }))
      }
    }
    return true
  })

  originalValue.map(link => {
    if (!value.find(item => item.id === link.id)) {
      result.push(Object.assign(link, { _action: updateMutation.DELETE }))
    }
    return true
  })
  result.map(item => Object.assign(item, { type: 'vr' }))
  return result.length > 0 ? result : null
}

const specialFieldDispose = (fieldName, value, property) => {
  switch (fieldName) {
    case 'links': {
      return linkDispose(value, property.links)
    }
    case 'contacts': {
      return contactsDispose(value, property.contacts)
    }
    case 'bookingTeamContacts': {
      return bookingTeamContactsDispose(value, property.bookingTeamContacts)
    }
    default:
      return value
  }
}

const formatUniversitiesParam = (result, property) => {
  const newUniversities = []
  result.universities.map(item => {
    const university = {}
    const actionKey = '_action'
    university.universityId = item.key
    university[actionKey] = updateMutation.INSERT

    newUniversities.push(university)
    return true
  })

  if (property && property.universities && property.universities.length > 0 && newUniversities) {
    property.universities.map(item => {
      if (newUniversities.filter(university => university.universityId === item.id).length === 0) {
        const university = {}
        const actionKey = '_action'
        university.universityId = item.id
        university[actionKey] = updateMutation.DELETE

        newUniversities.push(university)
      }
      return true
    })
  }

  return newUniversities
}

export const formatUpdateParam = (id, changedFields, property) => {
  const result = { id }
  Object.keys(changedFields).map(topicKey => {
    if (topicKey === 'virtualLinks' && Object.values(changedFields.virtualLinks).length) {
      const { overallLinks, propertyLinks } = changedFields.virtualLinks
      result.links = overallLinks.value
        .concat(propertyLinks.value)
        .filter(link => link.action)
        .map(link => {
          const newLink = { ...link }
          const action = '_action'
          newLink[action] = link.action
          delete newLink.action
          if (/fake_id/g.test(newLink.id)) {
            delete newLink.id
          }
          return newLink
        })
      return true
    }

    // Gallery will be handled until rooms are formatted
    if (topicKey === 'gallery') {
      return true
    }
    const topic = changedFields[topicKey]
    if (topicKey === 'facilities' && !isEmptyObject(changedFields.facilities)) {
      const facilitiesParams = formatfacilitiesForSave(
        changedFields.facilities,
        property.facilities,
      )
      if (facilitiesParams && facilitiesParams.length > 0) {
        result[topicKey] = facilitiesParams
      }
    } else if (topicKey === 'rooms') {
      if (Object.keys(topic).length > 0) {
        result.unitTypes = topic.map(room => {
          // remove unnecessary fields for update property
          const pureRoom = Object.assign({}, room)
          pureRoom.facilities.map(facility => {
            // eslint-disable-next-line no-param-reassign
            delete facility.checked
            // eslint-disable-next-line no-param-reassign
            delete facility.group
            return true
          })
          pureRoom.links.map((link, index) => {
            if (/fake-id/g.test(link.unitTypeId)) {
              delete pureRoom.links[index].unitTypeId
            }
            return true
          })
          delete pureRoom.isChangedByLink
          return pureRoom
        })
      }
    } else {
      Object.keys(topic).map(fieldName => {
        if (topic[fieldName].validate && topic[fieldName].touched) {
          const value = specialFieldDispose(fieldName, topic[fieldName].value, property)
          if (value !== null || fieldName === 'rank') {
            result[fieldName] = value
          }
        }
        return true
      })
    }
    return true
  })

  // format gallery params
  const { images, videos, unitTypes } = formatUpdateParamOfGallery(
    id,
    changedFields,
    property,
    result,
  )
  if (images.length > 0) {
    result.images = images
  }

  result.videos = videos
  if (unitTypes.length > 0) {
    result.unitTypes = unitTypes
  }

  // remove fake id of new rooms
  if (result.unitTypes) {
    result.unitTypes.forEach(item => {
      const room = item
      const actionKey = '_action'
      if (room[actionKey] === updateMutation.INSERT) {
        delete room.id
      }
    })
  }

  if (result.area) {
    delete result.area
  }

  // format universities params
  if (result.universities) {
    result.universities = formatUniversitiesParam(result, property)
  }

  return result
}

export const clearListingFakeId = updateParams => {
  if (!updateParams.unitTypes) {
    return updateParams
  }
  const result = cloneObject(updateParams)
  result.unitTypes = result.unitTypes.map(unit => {
    const pureUnit = Object.assign({}, unit)
    // TODO: to figure out why will have new action
    /* eslint-disable no-underscore-dangle */
    const filterListings = pureUnit.listings.filter(
      listing => !listing._action || listing._action !== 'NEW',
    )
    pureUnit.listings = filterListings.map(listing => {
      const pureListing = Object.assign({}, listing)
      if (/fake-id/g.test(pureListing.id)) {
        delete pureListing.id
      }

      return pureListing
    })

    return pureUnit
  })

  return result
}

export const setEditedFields = (tabName, changedFileds) => {
  const editedTab = {}
  const editedFields = {}
  Object.keys(changedFileds).map(key => {
    const field = changedFileds[key]
    if (!field.dirty) {
      editedFields[key] = {
        value: field.value,
        validate: !field.errors,
        touched: !!field.touched,
      }
    }
    return true
  })
  editedTab[tabName] = editedFields
  if (JSON.stringify(editedFields) === JSON.stringify({})) return
  store.dispatch(actions.setEditedFields(editedTab))
}

export const isChangedFieldsEmpty = data => {
  if (!data) return true
  const topicNames = Object.keys(data)
  if (topicNames.length === 0) return true
  const changedTopic = topicNames.find(topicName => Object.keys(data[topicName]).length > 0)
  return changedTopic === undefined
}

export const isRoomChanged = roomData => {
  if (!roomData) return false
  return !!roomData.find(
    room =>
      (room.node.action && !room.node.isChangedByLink) ||
      room.node.listings.find(listing => listing.action),
  )
}

export const hasUnsavedData = (data, rooms) => {
  if (!data) return false
  const keys = Object.keys(data)
  if (keys.length === 0) return false
  const invalidTopic = keys.find(topicName =>
    Object.keys(data[topicName]).find(fieldName => {
      const field = data[topicName][fieldName]
      return field.touched
    }),
  )
  if (invalidTopic || isRoomChanged(rooms)) return true
  return false
}

const checkLabelValid = fields => {
  if (!fields) return true
  return !Object.keys(fields).find(key => fields[key].validate === false)
}

export const getEditedFieldsValidate = editedFields => {
  const result = {}
  Object.keys(editedFields).map(topicName => {
    result[topicName] = checkLabelValid(editedFields[topicName])
    return true
  })
  return result
}

export const isEditedFieldsAllValid = editedFieldsValid =>
  !Object.keys(editedFieldsValid).find(topicName => editedFieldsValid[topicName] === false)

export const contactValidator = contacts => {
  // 与 base 的正则相同
  // eslint-disable-next-line no-useless-escape
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const phoneRegex = /^(\+[0-9\s]{1,5}\s|\(\+[0-9\s]{1,5}\)\s{0,1})?(\d+\s?)*\d{8,}$/

  const validate = contacts.map(contact => {
    const validPhone =
      contact.contactPhone &&
      contact.contactPhone.includes(' ') &&
      contact.contactPhone.split(' ')[1]
        ? phoneRegex.test(contact.contactPhone)
        : true
    const validEmail = contact.contactEmail ? emailRegex.test(contact.contactEmail) : true
    return { contactPhone: !!validPhone, contactEmail: !!validEmail }
  })
  const isAllValid = !JSON.stringify(validate).includes('false')
  return { isAllValid, validate }
}

export const contactInfoValidator = contacts => {
  // 与 base 的正则相同
  // eslint-disable-next-line no-useless-escape
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  const validate = contacts.map(contact => {
    const { contactName, contactPhone, contactEmail, occupation } = contact
    const validNameNotEmpty = !(contactName === '' && (contactPhone || contactEmail || occupation))
    const validName = contactName ? contactName.length <= 80 : true
    const validPhone =
      contactPhone && contactPhone.includes(' ') && contact.contactPhone.split(' ')[1]
        ? contact.contactPhone.length < 32
        : true
    const validEmail = contactEmail ? emailRegex.test(contactEmail) : true
    const validOccupation = occupation ? occupation.length <= 255 : true
    return {
      contactNameNotEmpty: !!validNameNotEmpty,
      contactName: !!validName,
      contactPhone: !!validPhone,
      contactEmail: !!validEmail,
      occupation: !!validOccupation,
    }
  })
  const isAllValid = !JSON.stringify(validate).includes('false')
  return { isAllValid, validate }
}

// 只有valid的字段才会被提交，报错的字段仍要保留
export const clearSavedFields = editedFields => {
  const result = {}
  Object.keys(editedFields).map(topicName => {
    const topic = {}
    if (topicName !== 'rooms') {
      Object.keys(editedFields[topicName]).map(fieldName => {
        const field = editedFields[topicName][fieldName]
        const isSaved = field.touched && field.validate
        if (!isSaved) {
          topic[fieldName] = field
        }
        return true
      })
    }
    result[topicName] = topic
    result.roomsDataChanged = false
    result.listingsDataChanged = false
    result.bulkListingsDataChanged = false
    return true
  })
  return result
}

export const isGalleryChanged = (originalData, changedFields) => {
  if (Object.values(changedFields.virtualLinks).length) {
    return true
  }
  if (!changedFields.gallery || !changedFields.gallery.data) {
    return false
  }
  const changedList = changedFields.gallery.data.value && changedFields.gallery.data.value.list
  const originalList = formatList(
    formatLibraries(originalData.unitTypes.edges || [], originalData.links),
    originalData,
  )
  const ignoreKey = 'property:photo'
  const originalListKeys = Object.keys(originalList).filter(key => key !== ignoreKey)
  const changedListKeys = changedList && Object.keys(changedList).filter(key => key !== ignoreKey)

  const isDifferentLength = !!originalListKeys.concat(changedListKeys).find(key => {
    const originalLength = originalList[key] ? originalList[key].length : 0
    const changedLength = changedList && changedList[key] ? changedList[key].length : 0
    return originalLength !== changedLength
  })
  if (isDifferentLength) {
    return true
  }
  const isDifferentItem = !!originalListKeys.find(key =>
    originalList[key].find((originalItem, i) => {
      const changedItem = changedList[key][i]
      return JSON.stringify(changedItem) !== JSON.stringify(originalItem)
    }),
  )
  if (isDifferentItem) {
    return true
  }
  return false
}

export const handlePropertyGroup = properties => {
  if (properties && properties.length > 0) {
    // properties.length >> 1 equals Math.float(properties.length / 2)
    // properties.length & 1 equals properties.length % 2 !== 0
    // eslint-disable-next-line  no-bitwise
    const lineNum = properties.length & 1 ? (properties.length >> 1) + 1 : properties.length >> 1
    const results = []
    for (let i = 0; i < lineNum; i++) {
      // eslint-disable-next-line  no-mixed-operators
      const temp = properties.slice(i * 2, i * 2 + 2)
      results.push(temp)
    }

    return results
  }
  return []
}

export const getPropertyOrder = (groupKey, key) => {
  const result = (groupKey + 1) * 2
  return key % 2 !== 0 ? result : result - 1
}

export const formatUpdateLandlordInfoParam = (changedFields, property) => {
  const result = { id: property.id }
  Object.keys(changedFields).map(topicKey => {
    const topic = changedFields[topicKey]
    Object.keys(topic).map(fieldName => {
      if (topic[fieldName].validate && topic[fieldName].touched) {
        const value = specialFieldDispose(fieldName, topic[fieldName].value, property)
        if (value !== null) {
          result[fieldName] = value
        }
      }
      return true
    })

    return true
  })

  return result
}

const formatUnitTypesPreviewData = (property, cloneRoomsListing) => {
  cloneRoomsListing.map(room => {
    const originRoom = property.unitTypes.edges.find(unit => unit.node.id === room.node.id)

    if (room.node.action === 'DELETE') {
      property.unitTypes.edges.splice(property.unitTypes.edges.indexOf(originRoom), 1)
    } else if (room.node.action === 'INSERT') {
      const roomData = { ...room.node }
      if (roomData.listings) {
        roomData.listings.map(listing => {
          // eslint-disable-next-line no-param-reassign
          listing.id = btoa(
            JSON.stringify({
              type: 'Listing',
              id: listing.id,
            }),
          )
          if (listing.availability && listing.availability === 'SOLD_OUT') {
            // eslint-disable-next-line no-param-reassign
            listing.state = listing.availability
          }
          return true
        })
      }
      if (roomData.unitTypeBedSizes && roomData.unitTypeBedSizes.length > 0) {
        roomData.unitTypeBedSizes = room.node.unitTypeBedSizes.filter(
          bedSize =>
            (!bedSize.action && !bedSize._action) ||
            (bedSize.action && !bedSize._action && bedSize.action !== 'DELETE') ||
            (bedSize._action && !bedSize.action && bedSize._action !== 'DELETE'),
        )
      }
      property.unitTypes.edges.push({
        node: {
          ...roomData,
          price: {
            discountedMinPrice: null,
            isFrom: true,
            minPrice: 0,
          },
          images: {
            edges: [],
          },
          id: btoa(
            JSON.stringify({
              type: 'UnitType',
              id: roomData.id,
            }),
          ),
        },
      })
    } else {
      // update room in property
      Object.keys(room.node).map(key => {
        if (key === 'listings') {
          room.node.listings.map(listing => {
            const originListing = originRoom.node.listings.find(
              targetListing => targetListing.id === listing.id,
            )
            if (listing.action === 'INSERT') {
              if (listing.availability && listing.availability === 'SOLD_OUT') {
                // eslint-disable-next-line no-param-reassign
                listing.state = listing.availability
              }
              originRoom.node.listings.push({
                ...listing,
                id: btoa(
                  JSON.stringify({
                    type: 'Listing',
                    id: listing.id,
                  }),
                ),
              })
            } else if (listing.action === 'DELETE') {
              originRoom.node.listings.splice(originRoom.node.listings.indexOf(originListing), 1)
            } else {
              Object.keys(listing).map(field => {
                if (
                  typeof listing[field] !== 'undefined' &&
                  typeof originListing[field] !== 'undefined' &&
                  typeof listing.action !== 'undefined'
                ) {
                  originListing[field] = listing[field]
                  if (field === 'availability' && listing[field] === 'SOLD_OUT') {
                    // eslint-disable-next-line no-param-reassign
                    originListing.state = listing[field]
                  }
                }
                return true
              })
            }
            return true
          })
        } else if (key === 'unitTypeBedSizes') {
          originRoom.node[key] = room.node[key].filter(
            bedSize =>
              (!bedSize.action && !bedSize._action) ||
              (bedSize.action && !bedSize._action && bedSize.action !== 'DELETE') ||
              (bedSize._action && !bedSize.action && bedSize._action !== 'DELETE'),
          )
        } else if (
          typeof room.node[key] !== 'undefined' &&
          typeof originRoom.node[key] !== 'undefined' &&
          typeof room.node.action !== 'undefined'
        ) {
          originRoom.node[key] = room.node[key]
        }
        return true
      })
    }

    return true
  })
}

const formatDraftRankType = rankType => {
  if (rankType === 'STAR') {
    return { rankStar: true, rankBlacksheep: false }
  }
  if (rankType === 'BLACKSHEEP') {
    return { rankStar: false, rankBlacksheep: true }
  }

  return { rankStar: false, rankBlacksheep: false }
}

export const getEditedFieldsValue = editedFields => {
  const editedFieldsValue = {}
  if (!editedFields) {
    return editedFieldsValue
  }
  Object.keys(editedFields).map(tabName => {
    const editedValue = editedFields[tabName]
    if (editedValue && Object.keys(editedValue).length !== 0) {
      editedFieldsValue[tabName] = editedFields[tabName].value
    } else {
      editedFieldsValue[tabName] = null
    }

    return true
  })
  return editedFieldsValue
}

const formatGalleryPreview = (property, changedFields) => {
  if (changedFields.data && changedFields.data.value && changedFields.data.value.list) {
    // eslint-disable-next-line no-param-reassign
    property.images.edges = []
    // eslint-disable-next-line no-param-reassign
    property.videos = []
    Object.keys(changedFields.data.value.list).map(key => {
      const imageInfo = key.split(':')
      if (imageInfo[0] && imageInfo[1]) {
        if (imageInfo[0] === 'property') {
          changedFields.data.value.list[key].map(changeMedia => {
            if (changeMedia.contentType.includes('video')) {
              property.videos.push({
                ...changeMedia,
                category: imageInfo[1].toUpperCase(),
              })
            } else if (changeMedia.contentType.includes('image')) {
              property.images.edges.push({
                node: {
                  ...changeMedia,
                  category: imageInfo[1].toUpperCase(),
                  source: `${changeMedia.filename}-${changeMedia.imageHash}.${changeMedia.extension}`,
                },
              })
            }
            return true
          })
        } else if (imageInfo[0] === 'room') {
          const targetRoom = property.unitTypes.edges.find(room => {
            if (room.node.action === 'INSERT') {
              return JSON.parse(atob(room.node.id)).id === imageInfo[1]
            }
            return room.node.id === imageInfo[1]
          })
          if (targetRoom) {
            if (!targetRoom.node.images) {
              targetRoom.node.images = {}
            }
            targetRoom.node.images.edges = []
            targetRoom.node.videos = []
            changedFields.data.value.list[key].map(changeMedia => {
              if (changeMedia.contentType.includes('video')) {
                targetRoom.node.videos.push({
                  ...changeMedia,
                })
              } else if (changeMedia.contentType.includes('image')) {
                targetRoom.node.images.edges.push({
                  node: {
                    ...changeMedia,
                    discriminator: 'discriminator',
                    source: `${changeMedia.filename}-${changeMedia.imageHash}.${changeMedia.extension}`,
                  },
                })
              }
              return true
            })
          }
        }
      }
      return true
    })
  }
}

export const formatPreviewData = (originalData, changedFields, cloneRoomsListing) => {
  const property = { ...originalData.property }
  Object.keys(changedFields)
    .sort(key => (key === 'rooms' ? -1 : 1)) // need to handle room data first
    .map(topicKey => {
      if (topicKey === 'virtualLinks' && Object.values(changedFields.virtualLinks).length) {
        const { overallLinks, propertyLinks, roomLinks } = changedFields.virtualLinks
        property.links = overallLinks.value
          .concat(propertyLinks.value)
          .filter(link => !link.action || link.action !== 'DELETE')
          .map(link => {
            const newLink = { ...link }
            if (!newLink.area) {
              newLink.area = 'GENERAL'
            }
            return newLink
          })

        if (roomLinks) {
          // To init all rooms' links
          property.unitTypes.edges.map(room => {
            // eslint-disable-next-line no-param-reassign
            room.node.links = []
            return true
          })
          roomLinks.value.map(roomLink => {
            roomLink.unitTypeIdToLinkId
              .filter(link => !link.action || link.action !== 'DELETE')
              .map(link => {
                const targetRoom = property.unitTypes.edges.find(
                  unitTypes => JSON.parse(atob(unitTypes.node.id)).id === link.unitTypeId,
                )
                if (targetRoom) {
                  targetRoom.node.links.push(link)
                }
                return true
              })
            return true
          })
        }
      }
      // Gallery will be handled until rooms are formatted
      if (topicKey === 'gallery') {
        formatGalleryPreview(property, changedFields[topicKey])
      }
      const topic = changedFields[topicKey]
      if (topicKey === 'facilities' && !isEmptyObject(changedFields.facilities)) {
        const facilitiesParams = formatfacilitiesForPreview(
          changedFields.facilities,
          property.facilities,
        )
        if (facilitiesParams && facilitiesParams.length > 0) {
          property[topicKey] = facilitiesParams
        }
      } else if (topicKey === 'rooms' && cloneRoomsListing.length > 0) {
        formatUnitTypesPreviewData(property, cloneRoomsListing)
      } else {
        const fieldNames = Object.keys(topic)
        fieldNames.map(fieldName => {
          if (topic[fieldName].validate && topic[fieldName].touched) {
            const value = specialFieldDispose(
              fieldName,
              topic[fieldName].value,
              originalData.property,
            )
            if (value !== null && typeof property[fieldName] !== 'undefined') {
              property[fieldName] = value
            } else if (fieldName === 'rankType' && value !== null) {
              property.rankStar = value === 'STAR'
              property.rankBlacksheep = value === 'BLACKSHEEP'
            } else if (fieldName === 'postalCode' && value !== null) {
              property.zipCode = value
            } else if (fieldName === 'addressLine_2' && value !== null) {
              property.addressLine2 = value
            }
          }
          return true
        })
      }

      return true
    })

  return property
}

const mergeFacilities = (originalFacilities, draftFacilities) => {
  let result = [...originalFacilities]

  if (draftFacilities && Object.keys(draftFacilities).length !== 0) {
    Object.keys(draftFacilities).map(groupName => {
      if (groupName.startsWith('group_')) {
        result = result.map(facility => {
          const newFacility = Object.assign({}, facility)
          const pureGroupName = groupName.replace('group_', '')

          if (newFacility.group === pureGroupName) {
            newFacility.checked = false
            if (newFacility.slug === draftFacilities[groupName]) {
              newFacility.checked = true
            }
          }

          return newFacility
        })
      } else if (groupName === 'others') {
        result = result.filter(facility => {
          if (facility.group === 'others' && !draftFacilities.others.includes(facility.slug)) {
            return false
          }

          return true
        })
        draftFacilities.others.map(slug => {
          if (result.every(facility => facility.slug !== slug)) {
            result.push({
              checked: true,
              group: 'others',
              label: slug,
              slug: `others_${slug}`,
              tags: ['amenity'],
            })
          }
          return true
        })
      } else {
        const updatedFacility = result.find(facility => facility.slug === groupName)
        if (updatedFacility) {
          updatedFacility.checked = draftFacilities[groupName]
        }
      }

      return true
    })
  }

  return {
    facilities: result,
  }
}

export const mergeUnitTypes = (
  originalUnitTypes,
  draftUnitTypes,
  draftLinks,
  draftGallery,
  isClone = false,
) => {
  let result = cloneObject(originalUnitTypes.edges)

  if (Array.isArray(draftUnitTypes) && draftUnitTypes.length !== 0) {
    draftUnitTypes.map(draftUnit => {
      const rowUnit = result.find(unit => unit.node.id === draftUnit.id)
      if (rowUnit) {
        const { _action: draftUnitAction } = draftUnit
        if (draftUnitAction === updateMutation.DELETE) {
          if (isClone) {
            Object.assign(rowUnit.node, { action: updateMutation.DELETE })
          } else {
            result = result.filter(unit => unit.node.id !== draftUnit.id)
          }
        } else if (draftUnitAction === updateMutation.UPDATE) {
          const { _action, facilities, unitTypeBedSizes, listings, id, links, ...restDraftUnit } =
            draftUnit
          if (facilities && facilities.length !== 0) {
            rowUnit.node.facilities = rowUnit.node.facilities.map(rowUnitFacility => {
              const newRowUnitFacility = Object.assign({}, rowUnitFacility)
              facilities.map(draftUnitFacility => {
                const { _action: draftUnitFacilityAction } = draftUnitFacility
                if (newRowUnitFacility.slug === draftUnitFacility.slug) {
                  if (draftUnitFacilityAction === updateMutation.INSERT) {
                    newRowUnitFacility.checked = true
                  }
                  if (draftUnitFacilityAction === updateMutation.DELETE) {
                    newRowUnitFacility.checked = false
                  }
                  if (isClone) {
                    newRowUnitFacility.action = draftUnitFacilityAction
                  }
                }

                return true
              })
              return newRowUnitFacility
            })
          }
          if (unitTypeBedSizes && unitTypeBedSizes.length !== 0) {
            unitTypeBedSizes.map(draftUnitTypeBedSize => {
              const { _action: draftUnitTypeBedSizeAction, ...restUnitTypeBedSize } =
                draftUnitTypeBedSize
              if (draftUnitTypeBedSizeAction === updateMutation.INSERT) {
                if (isClone) {
                  rowUnit.node.unitTypeBedSizes.push(
                    Object.assign(restUnitTypeBedSize, {
                      action: updateMutation.INSERT,
                    }),
                  )
                } else {
                  rowUnit.node.unitTypeBedSizes.push(restUnitTypeBedSize)
                }
              }
              if (draftUnitTypeBedSizeAction === updateMutation.UPDATE) {
                const updatedUnitBedSize = rowUnit.node.unitTypeBedSizes.find(
                  unitTypeBedSize => unitTypeBedSize.id === draftUnitTypeBedSize.id,
                )
                if (updatedUnitBedSize) {
                  Object.assign(updatedUnitBedSize, restUnitTypeBedSize)
                  if (isClone) {
                    Object.assign(updatedUnitBedSize, restUnitTypeBedSize, {
                      action: updateMutation.UPDATE,
                    })
                  }
                }
              }
              if (draftUnitTypeBedSizeAction === updateMutation.DELETE) {
                if (isClone) {
                  const deletedRowUnitBedSize = rowUnit.node.unitTypeBedSizes.find(
                    unitTypeBedSize => unitTypeBedSize.id === draftUnitTypeBedSize.id,
                  )
                  if (deletedRowUnitBedSize) {
                    deletedRowUnitBedSize.action = updateMutation.DELETE
                  }
                } else {
                  rowUnit.node.unitTypeBedSizes = rowUnit.node.unitTypeBedSizes.filter(
                    unitTypeBedSize => unitTypeBedSize.id !== draftUnitTypeBedSize.id,
                  )
                }
              }
              return true
            })
          }
          if (listings && listings.length !== 0) {
            listings.map(draftListing => {
              const { _action: draftListingAction, ...restDraftListing } = draftListing
              if (draftListingAction === updateMutation.INSERT) {
                if (isClone) {
                  rowUnit.node.listings.push(
                    Object.assign(restDraftListing, {
                      action: updateMutation.INSERT,
                    }),
                  )
                } else {
                  rowUnit.node.listings.push(restDraftListing)
                }
              }
              if (draftListingAction === updateMutation.UPDATE) {
                const updatedListing = rowUnit.node.listings.find(
                  rowListing => rowListing.id === draftListing.id,
                )
                if (updatedListing) {
                  Object.assign(updatedListing, restDraftListing)
                  if (isClone) {
                    Object.assign(updatedListing, { action: updateMutation.UPDATE })
                  }
                }
              }
              if (draftListingAction === updateMutation.DELETE) {
                if (isClone) {
                  const rowUnitListing = rowUnit.node.listings.find(
                    rowListing => rowListing.id === draftListing.id,
                  )
                  rowUnitListing.action = updateMutation.DELETE
                } else {
                  rowUnit.node.listings = rowUnit.node.listings.filter(
                    rowListing => rowListing.id !== draftListing.id,
                  )
                }
              }
              return true
            })
          }
          if (links && links.length !== 0) {
            links.map(draftLink => {
              const { _action: draftLinkAction, ...restDraftLink } = draftLink
              if (draftLinkAction === updateMutation.INSERT) {
                if (isClone) {
                  rowUnit.node.links.push(
                    Object.assign(restDraftLink, {
                      action: updateMutation.INSERT,
                    }),
                  )
                } else {
                  rowUnit.node.links.push(restDraftLink)
                }
              }
              if (draftLinkAction === updateMutation.UPDATE) {
                const updatedLink = rowUnit.node.links.find(rowLink => rowLink.id === draftLink.id)
                if (updatedLink) {
                  Object.assign(updatedLink, restDraftLink)
                  if (isClone) {
                    Object.assign(updatedLink, { action: updateMutation.UPDATE })
                  }
                }
              }
              if (draftLinkAction === updateMutation.DELETE) {
                if (isClone) {
                  const rowUnitLink = rowUnit.node.links.find(
                    rowLink => rowLink.id === draftLink.id,
                  )
                  rowUnitLink.action = updateMutation.DELETE
                } else {
                  rowUnit.node.links = rowUnit.node.links.filter(
                    rowLink => rowLink.id !== draftLink.id,
                  )
                }
              }
              return true
            })
          }
          if (isClone) {
            Object.assign(rowUnit.node, restDraftUnit, {
              action: draftUnitAction,
            })
          } else {
            Object.assign(rowUnit.node, restDraftUnit)
          }
        }
      } else {
        const {
          _action: draftUnitAction,
          facilities,
          unitTypeBedSizes,
          listings,
          links,
          ...noActionDraftUnit
        } = draftUnit
        if (draftUnitAction === updateMutation.INSERT) {
          // new facilities
          noActionDraftUnit.facilities = newRoomFacilities.map(initUnitFacility => {
            const newRowUnitFacility = Object.assign({}, initUnitFacility)
            facilities.map(draftUnitFacility => {
              const { _action: draftUnitFacilityAction } = draftUnitFacility
              if (initUnitFacility.slug === draftUnitFacility.slug) {
                if (draftUnitFacilityAction === updateMutation.INSERT) {
                  newRowUnitFacility.checked = true
                }
                if (draftUnitFacilityAction === updateMutation.DELETE) {
                  newRowUnitFacility.checked = false
                }
                if (isClone) {
                  newRowUnitFacility.action = draftUnitFacilityAction
                }
              }

              return true
            })

            return newRowUnitFacility
          })

          // new unitTypeBedSizes
          noActionDraftUnit.unitTypeBedSizes = []
          unitTypeBedSizes.map((bedSize, index) => {
            const { _action: bedSizeAction, ...restBedSize } = bedSize
            if (
              bedSizeAction === updateMutation.INSERT ||
              bedSizeAction === updateMutation.UPDATE
            ) {
              noActionDraftUnit.unitTypeBedSizes.push(
                Object.assign(restBedSize, {
                  id: `fake-id-${index}`,
                }),
              )
            }

            return true
          })

          // new listings
          noActionDraftUnit.listings = []
          listings.map(listing => {
            const { _action: listingAction, ...restListing } = listing
            if (isClone) {
              noActionDraftUnit.listings.push(
                Object.assign(restListing, {
                  action: listingAction,
                }),
              )
            } else if (
              listingAction === updateMutation.INSERT ||
              listingAction === updateMutation.UPDATE
            ) {
              noActionDraftUnit.listings.push(restListing)
            }

            return true
          })

          // new links
          noActionDraftUnit.links = []
          links.map(link => {
            const { _action: linkAction, ...restLink } = link
            if (isClone) {
              noActionDraftUnit.links.push(
                Object.assign(restLink, {
                  action: linkAction,
                }),
              )
            } else if (
              linkAction === updateMutation.INSERT ||
              linkAction === updateMutation.UPDATE
            ) {
              noActionDraftUnit.links.push(restLink)
            }

            return true
          })

          if (isClone) {
            result.unshift({
              node: Object.assign(noActionDraftUnit, {
                action: updateMutation.INSERT,
              }),
            })
          } else {
            result.unshift({ node: noActionDraftUnit })
          }
        }
      }

      return true
    })
  }

  if (Array.isArray(draftLinks.roomLinks) && draftLinks.roomLinks.length !== 0) {
    const draftUnitLinkArr = draftLinks.roomLinks.reduce(
      (acc, cur) => [...acc, ...cur.unitTypeIdToLinkId],
      [],
    )
    draftUnitLinkArr.map(draftUnitLink => {
      const rowUnit = result.find(
        unit => JSON.parse(atob(unit.node.id)) === draftUnitLink.unitTypeId,
      )

      if (rowUnit) {
        const { action, ...restDraftUnitLink } = draftUnitLink
        if (action === updateMutation.INSERT) {
          if (isClone) {
            rowUnit.node.links.push(
              Object.assign(restDraftUnitLink, {
                action: updateMutation.INSERT,
              }),
            )
          } else {
            rowUnit.node.links.push(restDraftUnitLink)
          }
        }
        if (action === updateMutation.UPDATE) {
          const updatedRowUnitLink = rowUnit.node.links.find(link => link.id === draftUnitLink.id)
          if (updatedRowUnitLink) {
            if (isClone) {
              Object.assign(updatedRowUnitLink, restDraftUnitLink, {
                action: updateMutation.UPDATE,
              })
            } else {
              Object.assign(updatedRowUnitLink, restDraftUnitLink)
            }
          }
        }
        if (action === updateMutation.DELETE) {
          if (isClone) {
            const deletedUnitLink = rowUnit.node.links.find(link => link.id === draftUnitLink.id)
            if (deletedUnitLink) {
              Object.assign(deletedUnitLink, { action: updateMutation.DELETE })
            }
          } else {
            rowUnit.node.links = rowUnit.node.links.filter(link => link.id !== draftUnitLink.id)
          }
        }
      }
      return true
    })
  }

  if (Object.keys(draftGallery).length !== 0) {
    Object.keys(draftGallery.data.list).map(categoryKey => {
      // categoryKey e.g.
      // 1.[property:imageVideoCateporty]
      // 2.[room:unitId]
      const categoryArr = categoryKey.split(':')
      if (categoryArr[0] === 'room') {
        const withNodeUnitDraftImages = []
        const unitDraftVideos = []
        draftGallery.data.list[categoryKey].map(unitDraftImageOrVideo => {
          if (
            unitDraftImageOrVideo.contentType &&
            unitDraftImageOrVideo.contentType.includes('image')
          ) {
            withNodeUnitDraftImages.push({ node: unitDraftImageOrVideo })
          } else {
            unitDraftVideos.push(unitDraftImageOrVideo)
          }
          return true
        })
        result = result.map(rowUnit => {
          const cloneRowUnit = cloneObject(rowUnit)
          if (rowUnit.node.id === categoryArr[1]) {
            cloneRowUnit.node.images = { edges: withNodeUnitDraftImages }
            cloneRowUnit.node.videos = unitDraftVideos
          }
          return cloneRowUnit
        })
      }
      return true
    })
  }

  if (isClone) return result

  return {
    unitTypes: { edges: result },
  }
}

const mergeLinks = (originalLinks, draftLinks) => {
  let resultLinks = [...originalLinks]
  Object.keys(draftLinks).map(draftLinkType => {
    const draftLinkArr = draftLinks[draftLinkType]

    if (draftLinkType === 'overallLinks' || draftLinkType === 'propertyLinks') {
      draftLinkArr.map(classifiedLink => {
        const { action } = classifiedLink
        if (action === updateMutation.INSERT) {
          resultLinks.push(classifiedLink)
        }
        if (action === updateMutation.UPDATE) {
          const updatedLink = resultLinks.find(rowLink => rowLink.id === classifiedLink.id)
          if (updatedLink) {
            Object.assign(updatedLink, classifiedLink)
          }
        }
        if (action === updateMutation.DELETE) {
          resultLinks = resultLinks.filter(rowLink => rowLink.id !== classifiedLink.id)
        }
        return true
      })
    }
    return true
  })
  return {
    links: resultLinks,
  }
}

const imageAndVideoCategories = {
  building_exterior: 'BUILDING_EXTERIOR',
  common_indoor_spaces: 'COMMON_INDOOR_SPACES',
  common_outdoor_spaces: 'COMMON_OUTDOOR_SPACES',
  photo: 'PHOTO',
  general: 'GENERAL',
  room: 'ROOM',
  cover_photo: 'GENERAL',
}

const mergeImagesAndVideos = draftGallery => {
  let resultImages = []
  let resultVideos = []
  if (Object.keys(draftGallery).length === 0) {
    return {}
  }

  Object.keys(draftGallery.data.list).map(categoryKey => {
    // categoryKey e.g.
    // 1.[property:imageVideoCateporty]
    // 2.[room:unitId]
    const categoryArr = categoryKey.split(':')
    if (categoryArr[0] === 'property') {
      const withNodeDraftImages = []
      const draftVideos = []
      draftGallery.data.list[categoryKey].map(draftImageOrVideo => {
        Object.assign(draftImageOrVideo, {
          category: imageAndVideoCategories[categoryArr[1]],
          hero: categoryArr[1] === 'cover_photo',
        })

        if (draftImageOrVideo.contentType && draftImageOrVideo.contentType.includes('image')) {
          withNodeDraftImages.push({ node: draftImageOrVideo })
        } else {
          draftVideos.push(draftImageOrVideo)
        }
        return true
      })
      resultImages = [...resultImages, ...withNodeDraftImages]
      resultVideos = [...resultVideos, ...draftVideos]
    }

    return true
  })

  return {
    images: { edges: resultImages },
    videos: resultVideos,
  }
}

export const mergePropertyAndDraft = (property, editedFields) => {
  const { details, address, facilities, rooms, virtualLinks, gallery } = editedFields
  const result = Object.assign({}, property)
  const draftDetails = getEditedFieldsValue(details)
  const draftAddress = getEditedFieldsValue(address)
  const draftFacilities = getEditedFieldsValue(facilities)
  const draftLinks = getEditedFieldsValue(virtualLinks)
  const draftGallery = getEditedFieldsValue(gallery)

  const { rankType, city, ...restDraftDetails } = draftDetails
  const { addressLine_2: addressLine2, postalCode, areaId, ...restDraftAddress } = draftAddress

  if (rankType) {
    Object.assign(result, formatDraftRankType(rankType))
  }
  if (addressLine2 !== undefined) {
    Object.assign(result, { addressLine2 })
  }
  if (postalCode !== undefined) {
    Object.assign(result, { zipCode: postalCode })
  }
  if (areaId !== undefined) {
    Object.assign(result, { area: { id: areaId } })
  }

  const mergedFacilities = mergeFacilities(result.facilities, draftFacilities)
  const mergedUnitTypes = mergeUnitTypes(result.unitTypes, rooms, draftLinks, draftGallery)
  const mergedLinks = mergeLinks(result.links, draftLinks)
  const mergedImagesAndVideos = mergeImagesAndVideos(draftGallery)

  Object.assign(
    result,
    restDraftDetails,
    restDraftAddress,
    mergedFacilities,
    mergedUnitTypes,
    mergedLinks,
    mergedImagesAndVideos,
  )
  return result
}

/**
 *
 * @param {object} changedFields
 * @param {string} editTab
 * remove untouched fields when having current touched field in draft;
 */
export const removeUntouchedFields = (changedFields, editTab) => {
  const fields = cloneObject(changedFields)
  const editedFields = store.getState().dashboard.propertyEdit.toJS().editedFields
  Object.keys(fields).map(fieldKey => {
    if (
      !fields[fieldKey].touched &&
      editedFields[editTab] &&
      editedFields[editTab][fieldKey] &&
      editedFields[editTab][fieldKey].touched
    ) {
      delete fields[fieldKey]
    }
    return true
  })
  return fields
}

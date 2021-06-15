import { useMemo } from 'react'

const useAvailabilityAndPrice = ({ form, showPlaceHolder }) => {
  const handleDiscountValueChange = (inputName, value) => {
    let priceMin
    let discountValue
    let currentPrice = 0

    if (inputName === 'discountValue' && value) {
      discountValue = value
    } else {
      discountValue =
        form.getFieldValue('discountValue') > 0 ? form.getFieldValue('discountValue') : 0
    }

    if (inputName === 'priceMin' && value) {
      priceMin = value
    } else {
      priceMin = form.getFieldValue('priceMin')
    }

    const discountType = form.getFieldValue('discountType')

    if (!priceMin || !discountType) {
      return true
    }

    switch (discountType) {
      case 'NO_DISCOUNT':
        currentPrice = priceMin
        break
      case 'PERCENTAGE':
        // eslint-disable-next-line  no-mixed-operators
        currentPrice = discountValue ? (priceMin * (100 - discountValue)) / 100 : priceMin
        break
      case 'ABSOLUTE':
        currentPrice = discountValue ? priceMin - discountValue : priceMin
        break
      default:
        currentPrice = priceMin
    }

    form.setFieldsValue({ currentPrice })
    return true
  }

  const handlePriceMinChange = e => {
    if (
      Number.isInteger(e) &&
      ['PERCENTAGE', 'ABSOLUTE'].indexOf(form.getFieldValue('discountType')) !== -1
    ) {
      handleDiscountValueChange('priceMin', e)
      form.validateFields(['discountValue'])
    }

    form.setFieldsValue({ originPrice: e })
  }

  const handlePriceTypeChange = () => {
    form.resetFields(['priceMax'])
  }

  const handleDiscountTypeChange = () => {
    form.resetFields(['currentPrice', 'discountValue'])
  }

  const handleCurrentPriceChange = value => {
    const currentPrice = value
    const priceMin = form.getFieldValue('priceMin')
    const discountType = form.getFieldValue('discountType')
    let discountValue = 0

    if (!priceMin || !discountType || !currentPrice) {
      return true
    }

    switch (discountType) {
      case 'NO_DISCOUNT':
        discountValue = 0
        break
      case 'ABSOLUTE':
        discountValue = priceMin - currentPrice
        break
      default:
        discountValue = 0
    }

    form.setFieldsValue({ discountValue })
    return true
  }

  const discountValueParameter = useMemo(
    () => ({
      min: 0,
      max: form.getFieldValue('discountType') === 'PERCENTAGE' ? 100 : Infinity,
      precision: 2,
      disabled:
        showPlaceHolder ||
        !form.getFieldValue('priceMin') ||
        form.getFieldValue('discountType') === 'NO_DISCOUNT' ||
        !form.getFieldValue('discountType'),
      formatter: value =>
        form.getFieldValue('discountType') === 'PERCENTAGE' ? `${value}%` : value,
      parser: value =>
        form.getFieldValue('discountType') === 'PERCENTAGE' ? value.replace('%', '') : value,
      onChange: value => {
        handleDiscountValueChange('discountValue', value)
      },
    }),
    [showPlaceHolder, form.getFieldValue('discountType'), form.getFieldValue('priceMin')],
  )

  return {
    handlePriceMinChange,
    handlePriceTypeChange,
    handleDiscountTypeChange,
    handleCurrentPriceChange,
    discountValueParameter,
  }
}

export default useAvailabilityAndPrice

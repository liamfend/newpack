/* global google */
import { googleMapKey } from '~constants';
import axios from 'axios';

export const textSearch = (value, location) => new Promise((resolve, reject) => {
  try {
    if (location) {
      const pyrmont = new google.maps.LatLng(location.lat, location.lng);
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        location: pyrmont,
        radius: '50000',
        query: value,
      };
      service.textSearch(request, (results, status) => {
        if (status === 'OK' || status === 'ZERO_RESULTS') {
          const places = results.map((item) => {
            const lat = item.geometry.location.lat();
            const lng = item.geometry.location.lng();
            return {
              address: item.formatted_address,
              location: { lat, lng },
              id: item.place_id,
              name: item.name,
            };
          });
          resolve(places);
        } else {
          reject('result returned, but error');
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
});

const unneedTypes = [
  'political',
  'postal_code',
  'postal_town',
  'postal_code_suffix',
];

export const geocoding = value => new Promise((resolve, reject) => {
  axios({
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${value}&key=${googleMapKey}`,
  }).then((response) => {
    if (response && response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      if (result) {
        const codeItem = result.address_components.find(item => item.types.includes('postal_code'));
        const city = result.address_components.find(item =>
          item.types.includes('locality') ||
          item.types.includes('postal_town') ||
          item.types.includes('administrative_area_level_3'),
        );
        // 结果中不需要出现 国家、城市、邮政编码等
        const preciseItems = result.address_components.filter(
          component => !component.types.find(type => unneedTypes.includes(type)),
        );
        resolve({
          address: preciseItems.map(item => item.long_name).join(', '),
          zipCode: codeItem ? codeItem.long_name : '',
          shippingCity: city ? city.long_name : '',
        });
      } else {
        resolve(null);
      }
    }
    reject('no result');
  });
});

export const universityTextSearch = value => new Promise((resolve, reject) => {
  try {
    const pyrmont = { lat: -33.867, lng: 151.195 };
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: pyrmont,
      radius: '50000000000000000000000',
      query: value,
    };
    service.textSearch(request, (results, status) => {
      if (status === 'OK' || status === 'ZERO_RESULTS') {
        const places = results.map(item => ({
          address: item.formatted_address,
          id: item.place_id,
          name: item.name,
        }));
        resolve(places);
      } else {
        reject('result returned, but error');
      }
    });
  } catch (error) {
    console.error(error);
  }
});

const cityType = [
  'administrative_area_level_1',
  'administrative_area_level_2',
  'administrative_area_level_3',
  'administrative_area_level_4',
  'administrative_area_level_5',
];

export const universityGeocoding = value => new Promise((resolve, reject) => {
  axios({
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${value}&key=${googleMapKey}&language=en-GB`,
  }).then((response) => {
    if (response && response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      if (result) {
        const codeItem = result.address_components.find(item => item.types.includes('postal_code'));
        const countryItem = result.address_components.find(item => item.types.includes('country'));
        const cityItems = result.address_components.find(
          component => component.types.find(type => cityType.includes(type)),
        );
        const streetNumberItems = result.address_components.find(item => item.types.includes('street_number'));
        const streetNameItems = result.address_components.find(item => item.types.includes('route'));
        const location = result.geometry.location;
        const address = result.formatted_address;

        resolve({
          country: countryItem ? countryItem.long_name : '',
          city: cityItems ? cityItems.long_name : '',
          location,
          address,
          zipCode: codeItem ? codeItem.long_name : '',
          streetNumber: streetNumberItems ? streetNumberItems.long_name : '',
          streetName: streetNameItems ? streetNameItems.long_name : '',
        });
      } else {
        resolve(null);
      }
    }
    reject('no result');
  });
});

export const formatAddressFromPlace = (place) => {
  if (place.address_components &&
    place.geometry.location &&
    place.geometry &&
    place.name
  ) {
    const fieldsData = {};
    const codeItem = place.address_components.find(item => item.types.includes('postal_code'));

    fieldsData.address = place.name;
    fieldsData.coordinates = { value: {}, action: 'change' };
    fieldsData.coordinates.value.lat = place.geometry.location.lat();
    fieldsData.coordinates.value.lng = place.geometry.location.lng();
    fieldsData.postalCode = codeItem ? codeItem.long_name : '';
    return fieldsData;
  }
  return null;
};


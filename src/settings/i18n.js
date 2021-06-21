import axios from 'axios'
import i18n from 'i18next'
const HTTPApi = require('i18next-http-backend')

var a = require.context('../resources/translations', true, /\.(\w){2}-(\w){2}\.yml$/)
console.log(a)
const config = {
  debug: false,
  fallbackLng: 'en-us',
  lowerCaseLng: true,
  load: 'currentOnly',
  keySeparator: '=>',
  ns: ['cms'],
  defaultNS: 'cms',
  lng: 'en-us',
  interpolation: {
    escapeValue: false,
    prefix: '%',
    suffix: '%',
  },
  react: {
    wait: true,
  },
  backend: {
    loadPath: '/%ns%.%lng%.json',
    ajax: (url, options, callback) => {
      axios
        .get(url)
        .then(response => {
          console.log(response)
          callback(JSON.stringify(response.data), response)
        })
        .catch(e => {
          callback(null, {
            status: 404,
          })
          throw e
        })
    },
  },
}

i18n.use(HTTPApi).init(config)

export default i18n

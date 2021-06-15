// import React from 'react'
// import ReactDOM from 'react-dom'

// ReactDOM.render(<div>aaaa</div>, document.getElementById('root'))
import '~client/settings/axios'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { ConfigProvider } from 'antd'
import enUS from 'antd/lib/locale-provider/en_US'
import i18n from '~client/settings/i18n'
import store from '~client/store'
import Auth from '~pages/auth'
import Dashboard from '~pages/dashboard'
import Comments from '~pages/comments'
import HelpCenter from '~pages/help-center'
import Udesk from '~pages/udesk'
import httpsRedirect from '~helpers'
import './index.scss'

httpsRedirect()

const isAuthorised = state => (
  <Choose>
    <When condition={state.token}>
      <Redirect to="/properties" />
    </When>
    <Otherwise>
      <Redirect to="/login" />
    </Otherwise>
  </Choose>
)
console.log('test lint a')
ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider locale={enUS}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <Suspense fallback="">
            <div>
              <Switch>
                <Route path="/" exact render={() => isAuthorised(store.getState().auth.toJS())} />
                <Route path="/login" component={Auth} />
                <Route path="/forgot-password/:email?" component={Auth} />
                <Route path="/set-password" component={Auth} />
                <For
                  each="path"
                  of={[
                    '/properties',
                    '/property',
                    '/landlords',
                    '/landlord',
                    '/special-offers',
                    '/locations/countries',
                    '/locations/cities',
                    '/locations/areas',
                    '/locations/universities',
                    '/locations/city',
                    '/locations/area',
                    '/locations/university',
                    '/account',
                    '/contract',
                    '/bookings',
                    '/reviews',
                    '/billing',
                    '/reconciliation',
                  ]}
                >
                  <Route key={path} path={path} component={Dashboard} />
                </For>
                <Route path="/comments/:propertySlug" component={Comments} />
                <Route path="/udesk" component={Udesk} />
                <Route path="/help-center" component={HelpCenter} />
                <Redirect to="/login" />
              </Switch>
            </div>
          </Suspense>
        </BrowserRouter>
      </I18nextProvider>
    </ConfigProvider>
  </Provider>,
  document.getElementById('root'),
)

'use strict'

/**
 * Returns a function to make requests to app_id
 * param {PODIO} podio - An initiated podio object
 * param {int} app_id
 * return function, the inner function returns a promise
 */
module.exports = (podio, app_id, app_token) => {
  return (data) => {
    const checkAuthenticatedApp = () => {
      return new Promise((resolve, reject) => {
        if (podio.authObject.ref.type === 'app' &&
            podio.authObject.ref.id === app_id) {
              resolve()
        } else {
          // Not the right app, reject to authenticateWithApp is run.
          reject();
        }
      })
    }

    const promisifiedAuthenticateWithApp = () => {
      return new Promise((resolve, reject) => {
        const cb = (err, result) => {
          if (err){
            reject(err);
          } else {
            resolve(result);
          }
        }

        podio.authenticateWithApp(app_id, app_token, cb);
      });
    }

    const request = () => {
      return podio.request('POST', `/item/app/${app_id}/`, {
        fields: data
      })
    }

    return podio.isAuthenticated()
      .then(checkAuthenticatedApp)
      .catch(promisifiedAuthenticateWithApp)
      .then(request);
  }
}

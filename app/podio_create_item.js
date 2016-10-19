'use strict'

/**
 * Returns a function to make requests to app_id
 * param {PODIO} podio - An initiated podio object
 * param {int} app_id
 * return function, the inner function returns a promise
 */
module.exports = (podio, app_id, app_token) => {
  return (data) => {
    const req = podio.request.bind(podio, 'POST', `/item/app/${app_id}/`, {
                  fields: data
                })

     //const req = console.log.bind(null, 'req called');

    return new Promise(function (resolve, reject) {
      podio.isAuthenticated().then(() => {
        console.log('isAuthenticated')
        req().then(resolve).catch(reject)
      }).catch((err) => {
        podio.authenticateWithApp(app_id, app_token, (err, responseData) => {
          console.log('AFTER authenticateWithApp ' + app_id)
          if (err){
            reject(new Error(err))
          } else {
            req().then(resolve).catch(reject)
          }
        })
      })
    })
  }
}

const userSettings = require('../helpers/userSettings')
const _ = require('lodash')
const fetch = require('node-fetch')
const { join } = require('./path')
const backendHelper = require('../helpers/backendHelper')

/**
 *
 * @param {string} userId
 *
 * @returns {{Authorization: string}}
 */
const createAuthHeader = function (userId) {
  const password = userSettings.getPasswordForUser(userId)
  return {
    Authorization: 'Basic ' +
      Buffer.from(userId + ':' + password).toString('base64')
  }
}
/**
 *
 * @param {string} userId
 *
 * @returns {{<header>: string}}
 */
const createOCSRequestHeaders = function (userId) {
  return {
    ...createAuthHeader(userId),
    'OCS-APIREQUEST': true
  }
}
/**
 *
 * @param {node-fetch.Response} response
 * @param {string} message
 *
 * @throws Error
 * @returns {node-fetch.Response}
 */
const checkStatus = function (response, message) {
  if (response.ok) { // response.status >= 200 && response.status < 300
    return response
  } else {
    throw Error(message + ' Status:' + response.status + ' ' + response.statusText)
  }
}

/**
 *
 * @param {node-fetch.Response} response
 * @param {string} message
 *
 * @throws Error
 * @returns {node-fetch.Response}
 */
const checkOCSStatus = function (response, message) {
  const statusCode = _.get(response, 'ocs.meta.statuscode')
  if (statusCode === 200) {
    return response
  } else {
    throw Error(message + ' Status:' + statusCode)
  }
}

/**
 *
 * @param {string} url
 * @param {object} options
 *
 * @returns {node-fetch.Response}
 */
const fetcher = (url, options) => fetch(url, options)

/**
 *
 * @param {string} path
 * @param {object} params
 * @param {string} userId
 * @param {object} header
 *
 * @returns {node-fetch}
 */
const requestEndpoint = function (path, params, userId = 'admin', header = {}) {
  const headers = { ...createAuthHeader(userId), ...header }
  const options = { ...params, headers }
  const url = join(backendHelper.getCurrentBackendUrl(), 'remote.php/dav', path)
  return fetcher(url, options)
}

/**
 *
 * @param {string} path
 * @param {object} params
 * @param {string} userId
 * @param {object} header
 *
 * @returns {node-fetch}
 */
const requestOCSEndpoint = function (path, params, userId = 'admin', header = {}) {
  const headers = { ...createOCSRequestHeaders(userId), ...header }
  const options = { ...params, headers }
  const separator = path.includes('?') ? '&' : '?'
  const url = join(backendHelper.getCurrentBackendUrl(), 'ocs/v2.php', path + separator + 'format=json')
  return fetcher(url, options)
}

module.exports = {
  createAuthHeader,
  createOCSRequestHeaders,
  checkStatus,
  checkOCSStatus,
  requestEndpoint,
  requestOCSEndpoint,
  // ocs request methods
  getOCS: (url, params, userId, header) => requestOCSEndpoint(url, { ...params, method: 'GET' }, userId, header),
  putOCS: (url, params, userId, header) => requestOCSEndpoint(url, { ...params, method: 'PUT' }, userId, header),
  postOCS: (url, params, userId, header) => requestOCSEndpoint(url, { ...params, method: 'POST' }, userId, header),
  deleteOCS: (url, params, userId, header) => requestOCSEndpoint(url, { ...params, method: 'DELETE' }, userId, header),
  // dav request methods
  get: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'GET' }, userId, header),
  put: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'PUT' }, userId, header),
  delete: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'DELETE' }, userId, header),
  move: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'MOVE' }, userId, header),
  mkcol: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'MKCOL' }, userId, header),
  propfind: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'PROPFIND' }, userId, header),
  report: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'REPORT' }, userId, header),
  proppatch: (url, params, userId, header) => requestEndpoint(url, { ...params, method: 'PROPPATCH' }, userId, header)
}

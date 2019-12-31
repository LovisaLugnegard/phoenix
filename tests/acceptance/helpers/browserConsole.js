import { client } from 'nightwatch-api'

function cleanupLogMessage (message) {
  return message
    .replace(/\\u003C/gi, '')
    .replace(/\\n/g, '\n') // revive newlines
}

function formatLog (log) {
  return new Date(log.timestamp).toLocaleTimeString() + ' - ' +
    log.level + ' - ' +
    cleanupLogMessage(log.message)
}

async function getAllLogs () {
  let logs = []
  await client.getLog('browser', entries => {
    logs = entries
  })
  return logs
}

export async function getAllLogsWithDateTime (level = null) {
  let logs = await getAllLogs()
  if (level) {
    logs = logs.filter(entry => entry.level === level)
  }
  return logs
    .filter(e => !e.message.includes('favicon.ico'))
    .map(formatLog)
}

exports.checkConsoleErrors = async function () {
  const logs = await exports.getAllLogs()
  return logs.filter((entry) => {
    return entry.level === 'SEVERE'
  }).map((entry) => {
    if (entry.message.indexOf('favicon.ico') >= 0) {
      return
    }
    return new Date(entry.timestamp).toUTCString() + ' - ' + cleanupLogMessage(entry.message)
  })
}

const fetch = require('node-fetch')
const { createHash } = require('crypto')

const cachedAmendmentIDs = {}

async function fetchAmendmentNames() {
  return fetch(
    'https://raw.githubusercontent.com/ripple/rippled/develop/src/ripple/protocol/impl/Feature.cpp',
  )
    .then((res) => res.text())
    .then((text) => {
      const amendmentNames = []
      text.split('\n').forEach((line) => {
        const name = line.match(/^\s*\/?\/?\s*"(.+)",.*$/)
        if (name) {
          amendmentNames.push(name[1])
        }
      })
      return amendmentNames
    })
}

async function nameOfAmendmentID(id) {
  if (cachedAmendmentIDs[id]) {
    return cachedAmendmentIDs[id]
  }
  const amendmentNames = await fetchAmendmentNames()
  amendmentNames.forEach((name) => {
    cachedAmendmentIDs[sha512Half(Buffer.from(name, 'ascii'))] = name
  })
  return cachedAmendmentIDs[id] || id
}

function sha512Half(buffer) {
  return createHash('sha512')
    .update(buffer)
    .digest('hex')
    .toUpperCase()
    .slice(0, 64)
}

module.exports = {
  nameOfAmendmentID
}

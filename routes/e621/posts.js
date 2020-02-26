const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  router = express.Router(),
  { check, validationResult } = require('express-validator'),
  debug = require('debug')(`e621 posts`)

/* GET posts. */
router.get(
  '/',
  [
    check('limit')
      .isInt()
      .optional(),
    check('pid')
      .isInt()
      .optional(),
    check('tags')
      .isString()
      .optional(),
    check('score')
      .isInt()
      .optional(),
  ],
  async function(req, res) {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // Get the requested parameters and create a url to request data with it
    const requestUrl = applyUrlParameters(req)
    debug(requestUrl)

    // Process through wich the xml request gets transformed to optimized json
    let jsonResult = await xmlToJsonFromUrl(requestUrl, 'posts', 'e621', true)

    // Reply to the client
    res.json(jsonResult)
  }
)

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const limit = req.query.limit || 100, // Default is 100
    pageId = req.query.pid, // Default is ?
    tags = encodeURIComponent(req.query.tags), // Default is ''
    score = req.query.score // Default is 0

  // Return full url
  let builtUrl =
    domainConfig.apiUrl +
    'index.json' +
    '?' +
    domainConfig.userAgent + // Necessary for this site's API
    '&limit=' +
    limit

  if (pageId) {
    builtUrl += '&page=' + pageId
  }

  // Always add tags in case score is added

  // Weird encodeURIComponent workflow, because this doesnt have a default, because this doesnt have a default
  if (tags === 'undefined') {
    builtUrl += '&tags='
  } else {
    builtUrl += '&tags=' + tags
  }

  if (score) {
    builtUrl += '+score:>=' + score
  }

  // Return the complete built url
  return builtUrl
}

module.exports = router
import { Request, Response } from 'express'

// Configuration
import domainData from './domainData'

// Util
import fetchAndTransform from '@/util/booru/fetchAndTransform'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route xxx posts`)

/**
 * Helper function for building an URL
 * @param req Request for extracting queries
 */
function applyUrlParameters(req: Request): string {
  // Default query parameters
  const limit = req.query.limit || 20
  const pageId = req.query.pid
  const tags = req.query.tags || ''
  let rating = req.query.rating as string
  const score = req.query.score
  // const order = req.query.order

  let builtUrl: string = domainData.postsApi + '&limit=' + limit

  if (pageId) {
    builtUrl += '&pid=' + pageId
  }

  // Always add tags in case score is added
  builtUrl += '&tags=' + tags

  if (rating) {
    let prefix: string

    switch (rating.charAt(0)) {
      case '-':
        // debug('Sign detected')
        prefix = '-'
        rating = rating.substring(1)
        break

      // No '+' case because + gets encoded to space

      default:
        prefix = '+'
        break
    }

    builtUrl += prefix + 'rating:' + rating
  }

  if (score) {
    builtUrl += '+score:' + score
  }

  return builtUrl
}

/**
 * Route
 */
module.exports = async (req: Request, res: Response): Promise<void> => {
  // Get the requested parameters and create a url to request data with it
  const requestUrl: string = applyUrlParameters(req)
  // debug(requestUrl)

  // Process through wich the xml request gets transformed to optimized json
  const jsonResult: object = await fetchAndTransform({
    url: requestUrl,
    template: 'posts',
    domain: 'xxx',

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore // Disabled because its already a boolean by the express-validator middleware
    useCorsProxy: req.query.corsProxy,
  })

  // Reply
  res.json(jsonResult)
}
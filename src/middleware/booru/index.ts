import { Request, Response, NextFunction } from 'express'

import { DomainData } from 'booru.interface'

import booruList from 'ext/r34-shared/booru-list.json'

import constants from '@/configuration'
const host = constants.host

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:route randomPost`)

export function randomMiddlewareWithoutAPI(domainData: DomainData) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get short from domain data
    const booruShort = domainData['short'].slice(0, -1)

    // Use short as an identifier to get max_count
    const maxCount = booruList.find((booru) => booru.short === booruShort)[
      'max_count'
    ]

    // Generate random post ID
    const randomPostID = Math.floor(Math.random() * Math.floor(maxCount))

    // Save for next route
    req.query.id = (randomPostID as unknown) as string

    // debug(randomPostID, booruShort, maxCount)

    next()
  }
}

export const randomMiddlewareWithAPI = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Modify order to be random
  req.query.order = 'random'

  // Default to 1 as the limit
  req.query.limit = req.query.limit ?? ((1 as unknown) as string)

  next()
}

/**
 * Generate a response for every default booru route
 * @param domainData DomainData
 */
export function defaultResponse(domainData: DomainData) {
  return (req: Request, res: Response): void => {
    res.json({
      message: `This endpoint is for ${domainData.url}`,

      posts: `${host}/${domainData.short}posts`,

      'single-post': `${host}/${domainData.short}single-post`,

      'random-post': `${host}/${domainData.short}random-post`,

      tags: `${host}/${domainData.short}tags`,
    })
  }
}

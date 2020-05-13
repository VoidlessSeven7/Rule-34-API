import constants from '@/configuration'

import postCleaner from './postCleaner'
import tagCleaner from './tagCleaner'

// Definitions
import { IPassedData } from 'passed-data.interface'

/**
 * Cleans a JSON object according to its template and domain
 * @param {String} template Specific treatment for the Json Object (posts, tags, autocomplete)
 * @param {String} domain Domain specific quirk treatment
 * @param {Object} data Json Object to be cleaned
 * @param {Number} limit Number to limit how many tags should be processed
 * @param {Boolean} useCorsProxy Should response be proxied
 */
export default ({
  template,
  domain,
  data,
  limit,
  useCorsProxy,
}: IPassedData): Array<object> => {
  // Define CORS Proxy URL
  let { corsProxyUrl } = constants

  if (!useCorsProxy) {
    corsProxyUrl = ''
  }

  // Clean json of unnecessary data
  switch (template) {
    case 'posts':
      return postCleaner({ data, domain, corsProxyUrl })

    case 'tags':
      return tagCleaner({ data, domain })

    case 'autocomplete':
      return tagCleaner({ data, domain, limit })
  }
}
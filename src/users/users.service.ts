import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common'
import { AxiosResponse, AxiosRequestConfig } from 'axios'
import {
  GumroadAPIRequest,
  GumroadAPIResponse,
} from './interfaces/gumroad.interface'

@Injectable()
export class UsersService {
  protected readonly gumroadLicenseVerificationEndpoint =
    'https://api.gumroad.com/v2/licenses/verify'

  constructor(private readonly httpService: HttpService) {}

  public async verifyGumroadLicense(
    productPermalink: GumroadAPIRequest['product_permalink'],
    licenseKey: GumroadAPIRequest['license_key'],
    incrementUsesCount: GumroadAPIRequest['increment_uses_count'] = true
  ): Promise<GumroadAPIResponse> {
    const requestConfig: AxiosRequestConfig = {
      method: 'POST',

      url: this.gumroadLicenseVerificationEndpoint,

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      data:
        'product_permalink=' +
        productPermalink +
        '&license_key=' +
        licenseKey +
        '&increment_uses_count=' +
        incrementUsesCount,
    }

    const response = this.httpService.request(requestConfig)

    const responseData: AxiosResponse<GumroadAPIResponse> = await response
      .toPromise()

      .catch((error) => {
        throw new UnauthorizedException(undefined, error.response.data.message)
      })

    return responseData.data
  }

  public createUserDataFromGumroadResponse(
    gumroadResponse: GumroadAPIResponse
  ) {
    const now = new Date(Date.now())

    let isSubscriptionCancelled = false

    if (gumroadResponse.purchase.subscription_cancelled_at) {
      const cancelledAtDate = new Date(
        gumroadResponse.purchase.subscription_cancelled_at
      )

      isSubscriptionCancelled = now > cancelledAtDate
    }

    const isSubscriptionValid =
      gumroadResponse.success === true &&
      isSubscriptionCancelled === false &&
      gumroadResponse.purchase.subscription_failed_at === null

    const details = {
      success: gumroadResponse.success,
      is_subscription_valid: isSubscriptionValid,
      user_data: { email: gumroadResponse.purchase.email },
    }

    return details
  }
}

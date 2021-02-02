import { HttpException, HttpModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { GumroadAPIResponse } from './interfaces/gumroad.interface'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot(), ConfigService],
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)

    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('verifyGumroadLicense', () => {
    it('should verify a correct license', async () => {
      const productPermalink = configService.get<string>(
        'TEST_GUMROAD_PRODUCT_PERMALINK'
      )
      const licenseKey = configService.get<string>('TEST_GUMROAD_LICENSE_KEY')

      const data = await service.verifyGumroadLicense(
        productPermalink,
        licenseKey,
        false
      )

      expect(data.success).toBe(true)
    })

    it('should throw HttpException on incorrect license', async () => {
      const productPermalink = 'RandomString'
      const licenseKey = 'This-is-totally-invented'

      await expect(
        service.verifyGumroadLicense(productPermalink, licenseKey, false)
      ).rejects.toThrowError(HttpException)
    })
  })

  describe('extractDetailsFromGumroadResponse', () => {
    const validGumroadResponse: GumroadAPIResponse = {
      success: true,
      uses: 0,
      purchase: {
        permalink: '',
        product_permalink: '',
        email: 'email@example.com',
        sale_timestamp: '',
        license_key: '',
        recurrence: '',
        refunded: false,
        disputed: false,
        dispute_won: false,
        id: '',
        created_at: new Date(),
        subscription_cancelled_at: null,
        subscription_failed_at: null,
      },
    }

    const validReturn = {
      success: true,
      is_subscription_valid: true,
      user_data: {
        email: 'email@example.com',
      },
    }

    it('should correctly output valid subscription', async () => {
      const testGumroadResponse: GumroadAPIResponse = validGumroadResponse

      const expectedReturn = validReturn

      expect(
        service.createUserDataFromGumroadResponse(testGumroadResponse)
      ).toStrictEqual(expectedReturn)
    })

    it('should correctly output invalid subscription', async () => {
      const testGumroadResponse: GumroadAPIResponse = validGumroadResponse

      // Past Date
      testGumroadResponse.purchase.subscription_cancelled_at = new Date(
        '2020-11-17T02:27:36Z'
      )

      const expectedReturn = validReturn

      expectedReturn.is_subscription_valid = false

      expect(
        service.createUserDataFromGumroadResponse(testGumroadResponse)
      ).toStrictEqual(expectedReturn)
    })
  })
})

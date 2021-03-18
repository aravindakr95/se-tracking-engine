import config from '../config/config';

import HttpResponseType from '../enums/http/http-response-type';
import AccountStatus from '../enums/account/account-status';

import { objectHandler } from '../helpers/utilities/normalize-request';
import { compareField, hashField } from '../helpers/auth/encryption-handler';
import { signAuthToken } from '../helpers/auth/token-handler';
import sendEmailPostMark from '../helpers/mail/mailer';
import customException from '../helpers/utilities/custom-exception';

export default function makeAuthEndPointHandler({ authList }) {
  async function loginConsumer(httpRequest) {
    let isValidPw = false;
    const { email, password } = httpRequest.body;

    try {
      const consumer = await authList.findConsumerByEmail({ email }).catch((error) => {
        throw customException(error.message);
      });

      if (consumer && consumer.status === AccountStatus.INACTIVE) {
        throw customException(
          `Account number '${consumer.accountNumber}' is pending for verification`,
          HttpResponseType.FORBIDDEN,
        );
      }

      if (consumer) {
        isValidPw = await compareField({
          password,
          hash: consumer.password,
        });
      }

      if (isValidPw) {
        const { deviceToken } = consumer;

        if (deviceToken) {
          return objectHandler({
            status: HttpResponseType.SUCCESS,
            data: { accessToken: deviceToken },
            message: `Consumer '${email}' authentication successful`,
          });
        }
        throw customException(
          'Device token not found in the database',
          HttpResponseType.NOT_FOUND,
        );
      } else {
        throw customException(
          'Invalid email or password',
          HttpResponseType.AUTH_REQUIRED,
        );
      }
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  async function registerConsumer(httpRequest) {
    const { body } = httpRequest;
    const { email, accountNumber } = httpRequest.body;

    try {
      const deviceToken = signAuthToken({ email, accountNumber });

      const editedFields = {
        password: hashField({ password: body.password }),
        deviceToken,
      };

      const fields = { ...body, ...editedFields };

      const consumer = await authList.addConsumer(fields).catch((error) => {
        throw customException(error.message);
      });

      const commonDetails = {
        bodyTitle: `${config.supplier} Electricity EBILL Registration Completed`,
        serverVer: `V${config.version}`,
      };

      const templateConsumer = { ...consumer.toObject(), ...commonDetails };

      if (!templateConsumer) {
        throw customException(
          `Consumer '${body.email}' account create failed`,
        );
      }

      // WARNING: limited resource use with care
      await sendEmailPostMark(templateConsumer, 'registration-complete').catch((error) => {
        throw customException(error.message);
      });

      return objectHandler({
        status: HttpResponseType.SUCCESS,
        message: `Consumer account '${consumer.email}' created successful`,
      });
    } catch (error) {
      return objectHandler({
        code: error.code,
        message: error.message,
      });
    }
  }

  return async function handle(httpRequest) {
    switch (httpRequest.path) {
      case '/login':
        return loginConsumer(httpRequest);
      case '/register':
        return registerConsumer(httpRequest);
      default:
        return objectHandler({
          code: HttpResponseType.METHOD_NOT_ALLOWED,
          message: `${httpRequest.method} method not allowed`,
        });
    }
  };
}

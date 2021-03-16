import config from '../config/config';

import HttpResponseType from '../enums/http/http-response-type';
import AccountStatus from '../enums/account/account-status';

import { objectHandler } from '../helpers/utilities/normalize-request';
import CustomException from '../helpers/utilities/custom-exception';
import hashValidator from '../helpers/validators/hash-validator';
import hasher from '../helpers/hasher';
import jwtHandler from '../helpers/validators/token-handler';
import sendEmailPostMark from '../helpers/mail/mailer';

export default function makeAuthEndPointHandler({ authList }) {
  async function loginConsumer(httpRequest) {
    let isValidPw = false;
    const { email, password } = httpRequest.body;

    try {
      const consumer = await authList.findConsumerByEmail({ email }).catch((error) => {
        throw CustomException(error.message);
      });

      if (consumer && consumer.status === AccountStatus.INACTIVE) {
        throw CustomException(
          `Account number '${consumer.accountNumber}' is pending for verification`,
          HttpResponseType.FORBIDDEN,
        );
      }

      if (consumer) {
        isValidPw = await hashValidator({
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
        throw CustomException(
          'Device token not found in the database',
          HttpResponseType.NOT_FOUND,
        );
      } else {
        throw CustomException(
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

    try {
      const deviceToken = await jwtHandler(body).catch((error) => {
        throw CustomException(error.message);
      });

      const editedFields = {
        password: hasher({ password: body.password }),
        deviceToken,
      };

      Object.assign(body, editedFields);

      const consumer = await authList.addConsumer(body).catch((error) => {
        throw CustomException(error.message);
      });

      const templateConsumer = Object.assign(consumer.toObject(), {
        bodyTitle: `${config.supplier} Electricity EBILL Registration Completed`,
        serverVer: `V${config.version}`,
      });

      if (!templateConsumer) {
        throw CustomException(
          `Consumer '${body.email}' account create failed`,
        );
      }

      // WARNING: limited resource use with care
      await sendEmailPostMark(templateConsumer, 'registration-complete').catch((error) => {
        throw CustomException(error.message);
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

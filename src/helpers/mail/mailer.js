import { ServerClient } from 'postmark';

import config from '../../config/config';

async function sendEmailPostMark(model, subscribers, alias, index = 0) {
  try {
    const client = await new ServerClient(config.notifier.mailAuthToken);

    if (Array.isArray(subscribers)) {
      return await client.sendEmailWithTemplate({
        From: config.notifier.admin,
        To: subscribers[index].email,
        TemplateAlias: alias,
        TemplateModel: model,
      });
    }

    return await client.sendEmailWithTemplate({
      From: config.notifier.admin,
      To: subscribers,
      TemplateAlias: alias,
      TemplateModel: model,
    });
  } catch (error) {
    return error;
  }
}

export default sendEmailPostMark;

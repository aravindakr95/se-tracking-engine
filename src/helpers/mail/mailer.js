import { ServerClient } from 'postmark';

import config from '../../config/config';

async function sendEmailPostMark(model, alias) {
    try {
        let client = await new ServerClient(config.notifier.mailAuthToken);

        return await client.sendEmailWithTemplate({
            From: config.notifier.admin,
            To: model.email,
            TemplateAlias: alias,
            TemplateModel: model
        });
    } catch (error) {
        return error;
    }
}

module.exports = { sendEmailPostMark };

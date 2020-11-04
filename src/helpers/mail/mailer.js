import { ServerClient } from 'postmark';

import config from '../../config/config';

async function sendEmailPostMark(model, alias) {
    try {
        let client = await new ServerClient(config.postmarkAuthToken);

        return await client.sendEmailWithTemplate({
            From: config.adminEmail,
            To: model.email,
            TemplateAlias: alias,
            TemplateModel: model
        });
    } catch (error) {
        return error;
    }
}

module.exports = { sendEmailPostMark };

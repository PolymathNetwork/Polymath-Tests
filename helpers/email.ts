import { ImapSimple, connect } from 'imap-simple';
import * as deasync from 'deasync';
import { Config, FetchOptions } from 'imap';
import { simpleParser } from 'mailparser';


export class EmailHandler {
    private connection: ImapSimple;
    private static instance: EmailHandler;
    constructor(protected opts: Config) {
        deasync(async callback => {
            if (EmailHandler.instance) {
                await EmailHandler.instance.connection.end();
                EmailHandler.instance = null;
            }
            this.connection = await connect({ imap: this.opts });
            await this.connection.openBox('INBOX');
            callback(null);
        })();
        EmailHandler.instance = this;
    }
    public async fetchTo(to: string): Promise<string[]> {
        let searchCriteria = [
            'UNSEEN', ['TO', to]
        ];
        let fetchOptions: FetchOptions = {
            bodies: [''],
            markSeen: true
        };
        let results = await this.connection.search(searchCriteria, fetchOptions);
        let messages: string[] = [];
        for (let message of results) {
            let part = message.parts.find(part => part.which === '');
            if (!part) console.log(`Error finding content for message ${JSON.stringify(part)}`);
            let parsed = await simpleParser(part.body);
            messages.push((parsed.html as string) || parsed.textAsHtml)
        }
        return messages;
    }
}
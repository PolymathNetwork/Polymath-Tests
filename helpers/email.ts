import { ImapSimple, connect } from 'imap-simple';
import * as deasync from 'deasync';
import { Config, FetchOptions } from 'imap';
import { simpleParser } from 'mailparser';
import { stringify } from 'circular-json';


export class EmailHandler {
    private connection: ImapSimple;
    private static instance: EmailHandler;
    constructor(protected opts: Config) {
        deasync(async callback => {
            if (EmailHandler.instance && EmailHandler.instance.connection) {
                await EmailHandler.instance.connection.end();
                EmailHandler.instance = null;
            }
            try {
                this.connection = await connect({ imap: this.opts });
                await this.connection.openBox('INBOX');
            } catch (error) {
                console.error(`Can't connect to the email account, email will be disabled ${error}`);
            }
            callback(null);
        })();
        EmailHandler.instance = this;
    }
    public async fetchTo(to: string): Promise<string[]> {
        if (!this.connection) {
            console.error(`Can't fetch email, connection hasn't been initialized`);
            return null;
        }
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
            if (!part) console.log(`Error finding content for message ${stringify(part)}`);
            let parsed = await simpleParser(part.body);
            messages.push((parsed.html as string) || parsed.textAsHtml)
        }
        return messages;
    }
}
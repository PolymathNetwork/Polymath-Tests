import { oh, TestConfig, assert } from 'framework/helpers';
import * as mongoose from 'mongoose';
import * as deasync from 'deasync';
import { IDataModelObject } from 'framework/object/core';

export enum NoticeType {
    error, warning, info
}

export enum Scope {
    all, issuer, investor
}

const NoticeSchema = {
    type: { type: String, enum: ['error', 'warning', 'info'] },
    scope: { type: String, enum: ['all', 'issuers', 'investors'] },
    title: String,
    content: String,
    isOneTime: Boolean,
    isValid: Boolean,
}

export class NoticeModel extends IDataModelObject {
    public type: NoticeType = oh.chance.pickOneEnum(NoticeType);
    public scope: Scope = Scope.all;
    public title: string = oh.chance.string({ length: 25 });
    public content: string = oh.chance.string({ length: 125 });
    public isOneTime: boolean = false;
    public isValid: boolean = true;
    public get mongo() {
        return {
            type: NoticeType[this.type],
            scope: Scope[this.scope],
            title: this.title,
            content: this.content,
            isOneTime: this.isOneTime,
            isValid: this.isValid
        }
    }
}


export class Mongo {
    private notice: mongoose.Model<mongoose.Document>;
    private connection: typeof mongoose;
    private static _instance: Mongo;
    public static get instance(): Mongo {
        if (!this._instance) {
            this._instance = new Mongo();
        }
        return this._instance;
    };
    private constructor() {
        let self = this;
        deasync(async callback => {
            try {
                await self.connect(true);
            } catch (error) {
                console.log(`An error ocurred while connecting to mongodb, dependant tests will fail ${error}`);
            }
            callback(null);
        })();
    }
    public static get hasDb(): boolean {
        let db = TestConfig.instance.protractorConfig.dbConfig;
        return !!(db && db.mongo);
    }
    public async resetDb(): Promise<this> {
        for (let collection in this.connection.connection.collections) {
            try {
                await this.connection.connection.collection(collection).drop();
            } catch (error) { }
        }
        // We can't drop admin
        //await this.connection.connection.dropDatabase();
        return this;
    }
    public static async resetDb(instance: Mongo = Mongo._instance): Promise<Mongo> {
        if (instance) {
            return instance.resetDb();
        } else if (this.hasDb) {
            return Mongo.instance.resetDb();
        }
        return null;
    }
    public async connect(dropDb: boolean = true): Promise<this> {
        if (this.connection) return this;
        let db = TestConfig.instance.protractorConfig.dbConfig;
        assert(db && db.mongo, `Can't initialize Mongo Connector with ${JSON.stringify(db)}`)
        this.connection = await mongoose.connect(db.mongo);
        if (dropDb) this.resetDb();
        this.notice = this.connection.model('Notice', new mongoose.Schema(NoticeSchema, { timestamps: true }));
        return this;
    }
    public async disconnect(): Promise<void> {
        await this.connection.disconnect();
    }
    public static async disconnect(instance: Mongo = Mongo._instance) {
        if (instance) {
            await instance.disconnect();
        }
    }
    public async deleteAllNotices(): Promise<this> {
        await this.notice.deleteMany({});
        return this;
    }
    public async addNotice(opts: NoticeModel): Promise<mongoose.Document> {
        return await this.notice.create(opts.mongo);
    }
}
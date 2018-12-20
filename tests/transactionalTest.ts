import { IssuerTestData } from "./issuerTestData";
import { Modal, PolyModal } from "objects/features/general/modal";
import { TransactionResult, Status, Transaction } from "objects/features/general/transaction";
import { AbstractPage } from "framework/object/abstract";
import { CorePage } from "objects/pages/base";

export class TransactionalTest {
    constructor(public data: IssuerTestData) { }
    public static async GoToTransactions(clickFn: () => Promise<Modal>, openModal?: Modal): Promise<Transaction> {
        let modal = openModal || await clickFn();
        if (!modal) debugger;
        let transaction: Modal | Transaction = modal;
        while (transaction instanceof Modal) {
            if (transaction instanceof PolyModal) {
                await transaction.handleTransaction();
                modal = await clickFn();
                transaction = await modal.next() as Modal;
            } else transaction = await transaction.next();
        }
        await transaction.refresh('failed');
        if (transaction.failed) throw `Transaction failed`;
        return transaction;
    }
    public static async MassApproveTransactions(transaction: Transaction, lookForNext: boolean = true, approveNumber: number = null): Promise<AbstractPage | TransactionResult> {
        let result: TransactionResult | CorePage;
        let totalCompleted = 0;
        while (
            (approveNumber == null || approveNumber > totalCompleted++) &&
            (result = await transaction.next(lookForNext)) instanceof TransactionResult) {
            if (result.status === Status.Fail) throw `Transaction ${result.name} with ethScan ${result.ethscan} failed`;
        }
        return result;
    }
    public static async ApproveTransactions(clickFn: () => Promise<Modal>, openModal?: Modal, lookForNext: boolean = true): Promise<AbstractPage> {
        let transaction = await TransactionalTest.GoToTransactions(clickFn, openModal)
        return await TransactionalTest.MassApproveTransactions(transaction, lookForNext) as CorePage;
    }
    public async approveTransactions(clickFn: () => Promise<Modal>, openModal?: Modal, lookForNext: boolean = true): Promise<AbstractPage> {
        return await TransactionalTest.ApproveTransactions(clickFn, openModal, lookForNext);
    }
}
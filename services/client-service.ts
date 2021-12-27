import { AzureClientDAO, ClientDAO } from "../daos/client-dao-azure";
import Account from "../entities/account";
import Client from "../entities/client";
import ResourceNotFoundError from "../errors/resource-not-found-error";
import TransactionError from "../errors/transaction-error";

export interface ClientService{

    addClient(client:Client):Promise<Client>

    retrieveAllClients():Promise<Client[]>
    
    retrieveClientById(clientId:string):Promise<Client>

    updateClient(client:Client):Promise<Client>

    deleteClient(clientId:string):Promise<Client>

    addAccountToClient(clientId:string, account:Account):Promise<Client>

    retrieveClientAccounts(clientId:string):Promise<Account[]>

    retrieveClientAccount(clientId:string, accountName:string):Promise<Account>
    
    retrieveClientAccountsOver(clientId:string, threshold:number):Promise<Account[]>

    retrieveClientAccountsUnder(clientId:string, threshold:number):Promise<Account[]>
    
    updateClientAccountBalance(clientId:string, accountName:string, operation:string, diff:number):Promise<Client>

    deleteClientAccount(clientId:string, accountName:string):Promise<Account>
    
    deleteAllClientAccounts(clientId:string):Promise<Account[]>
}

export class ClientServices implements ClientService{

    constructor(private clientDao:AzureClientDAO){}
    
    /**Passes Client Object to client DAO for creation
     * @param client Client object with a blank id and empty array of accounts
     * @returns Promise of a client object that was created and sent to database
     */
    async addClient(client: Client): Promise<Client> {
        if(client.accounts.length === 0){
            client.accounts = [{accountName:"First Checking", accountType:"Checking", balance:0}];
        }
        return await this.clientDao.createClient(client);
    }

    /**Gets an array of all current clients
     *@returns Promise of an array of all Client objects stored in the database
     */
    async retrieveAllClients(): Promise<Client[]> {
        return await this.clientDao.getAllClients();
    }

    /**Gets a specific client from the database
     * @param clientId String unique id of the client we want to get
     * @returns Promise of a client object with id matching clientId
     */
    async retrieveClientById(clientId: string): Promise<Client> {
        return await this.clientDao.getClientById(clientId);
    }

    /**Updates a given Client's information
     * @param client client object to update in the database
     * @returns Promise of the updated client object
     */
    async updateClient(client:Client): Promise<Client> {
        return await this.clientDao.updateClient(client);
    }

    /**Deletes a client from the database
     * @param clientId String unique id of the client we want to get
     * @returns Promise of the client that was removed from the database
     */
    async deleteClient(clientId: string): Promise<Client> {
        return await this.clientDao.removeClient(clientId);
    }

    /**Adds a specific account to a client record
     * @param ClientId String unique id of the client we want to get
     * @param accountName name of account to be added
     * @returns Promise of the account that was removed from the specified client
     */
    async addAccountToClient(clientId: string, account: Account): Promise<Client> {
        const client = await this.clientDao.getClientById(clientId);
        const accounts = client.accounts;
        accounts.push(account);
        return await this.clientDao.updateClient(client);
    }

    /**Gets all accounts for a given client
     * @param ClientId String unique id of the client we want to get
     * @returns Promise for an array of client accounts
     */
    async retrieveClientAccounts(clientId: string): Promise<Account[]> {
        const client = await this.clientDao.getClientById(clientId);
        return client.accounts;
    }

    /**Gets a specific account for a client
     * @param clientId String unique id of the client we want to get
     * @param accountName Name of account to be checked
     * @returns Promise of an Account object for the specified client   
     */
    async retrieveClientAccount(clientId: string, accountName: string): Promise<Account> {
        const accounts = await this.retrieveClientAccounts(clientId);
        for(const a of accounts){
            if (a.accountName === accountName){
                return a;
            }
        }
        throw new ResourceNotFoundError(`Account with id ${accountName} could not be found for client ${clientId}`, accountName);
    }

    /**Gets all accounts over a certain amount
     * @param clientId String unique id of the client we want to get
     * @param threshold Number we are checking for a value greater than or equal to
     * @returns Promise of an array of a client's accounts with a value greater than or equal to the threshold
     */
    async retrieveClientAccountsOver(clientId: string, threshold: number): Promise<Account[]> {
        const accounts:Account[] = await this.retrieveClientAccounts(clientId);
        const accountsOver = [];
        for(const a of accounts){
            if(a.balance >= threshold){
                accountsOver.push(a);
            }
        }
        return accountsOver;
    }

    /**Gets all accounts under a certain amount
     * @param clientId String unique id of the client we want to get
     * @param threshold Number we are checking for a value less than or equal to
     * @returns Promise of an array of a client's accounts with a value less than or equal to the threshold
     */
    async retrieveClientAccountsUnder(clientId: string, threshold: number): Promise<Account[]> {
        const accounts = await this.retrieveClientAccounts(clientId);
        const accountsOver = [];
        for(const a of accounts){
            if(a.balance <= threshold){
                accountsOver.push(a);
            }
        }
        return accountsOver;
    }

    /**Updates the available funds for a given account of a given client
     * @param clientId String unique id of the client we want to get
     * @param accountName Account object we want to manipulate
     * @param operation 'withdraw' or 'deposit'
     * @param diff Amount the account will be updated by
     * @returns Promise of the updated client object
     */
    async updateClientAccountBalance(clientId: string, accountName: string, operation: string, diff: number): Promise<Client> {
        const client = await this.clientDao.getClientById(clientId);
        const accounts = client.accounts;
        let found = false;
        for(let a of accounts){
            if(a.accountName === accountName){
                found = true;
                if (operation === 'withdraw'){
                    if(a.balance < diff){
                        throw new TransactionError(`Insuficient funds: Account Balance: ${a.balance}, withdrawl amount: ${diff}`, `Withdraw ${diff}`);
                    }
                    else{
                        a.balance -= diff;
                    }
                }
                else if(operation === 'deposit'){
                    a.balance += diff;
                }
                else{
                    throw new TransactionError("Transaction not defined", operation);
                }
            }
        }
        if (!found){
            throw new ResourceNotFoundError(`Account with name ${clientId} could not be found for client ${accountName}`,accountName);
        }
        return await this.clientDao.updateClient(client);
    }

    /**Deletes a specific account from a client record
     * @param clientId String unique id of the client we want to get
     * @param accountName Account object to be removed
     * @returns Promise of the account that was removed from the specified client
     */
    async deleteClientAccount(clientId: string, accountName: string): Promise<Account> {
        const client = await this.clientDao.getClientById(clientId);
        const accounts = client.accounts;
        let target = null;
        for(let i = 0; i < accounts.length; i++){
            if(accounts[i].accountName === accountName){
                target = accounts[i];
                accounts.splice(i, 1);
            }
        }
        if(!target){
            throw new ResourceNotFoundError(`Account with name ${accountName} could not be found for client ${clientId}`,accountName);
        }
        await this.clientDao.updateClient(client);
        return target;
    }

    /**Removes all accounts from a given client
     * @param clientId String unique id of the client we want to get
     * @returns Promise of an Account array of removed accounts
     */
    async deleteAllClientAccounts(clientId: string): Promise<Account[]> {
        const client = await this.clientDao.getClientById(clientId);
        const accountsRemoved = client.accounts;
        client.accounts = []
        await this.clientDao.updateClient(client);
        return accountsRemoved;
    }
    
}
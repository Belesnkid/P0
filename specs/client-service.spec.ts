import { ClientServices } from "../services/client-service";
import { azureClientDao } from "../daos/client-dao-azure";
import Client from "../entities/client";
import Account from "../entities/account";
import ResourceNotFoundError from "../errors/resource-not-found-error";

describe("Client Services Tests", () =>{
    const clientServices:ClientServices = new ClientServices(azureClientDao);
    let savedClient:Client = null;

    it("Should add a client to the database", async ()=>{
        const newClient:Client = {fname:"Jimmy", lname:"Jumbo", id:'', accounts:[]};
        savedClient = await clientServices.addClient(newClient);
        expect(savedClient).not.toBeFalsy();
    });
    it("Should get all clients from the database", async () =>{
        const listOfClients:Client[] = await clientServices.retrieveAllClients();
        expect(listOfClients.length).toBeGreaterThanOrEqual(1);
    });
    it("Should retrieve a specific client from the database", async () => {
        const retrievedClient:Client = await clientServices.retrieveClientById(savedClient.id);
        expect(retrievedClient.id).toBe(savedClient.id);
    });
    it("Should update the client in the database with matching id",async () => {
        const updatedClient:Client = {fname:"Daniel",lname:"Belenski", id:savedClient.id, accounts:savedClient.accounts};
        savedClient = await clientServices.updateClient(updatedClient);
        expect(savedClient.fname).toBe(updatedClient.fname);
    });
    it("Should add an account to a specified client",async () => {
        const newAccount:Account = {accountName:"Holiday Fund", accountType:"Checking", balance:500};
        savedClient = await clientServices.addAccountToClient(savedClient.id, newAccount);
        expect(savedClient.accounts.length).toBe(2);
    });
    it("Should retrieve all accounts for a client", async () => {
        const clientAccounts:Account[] = await clientServices.retrieveClientAccounts(savedClient.id);
        expect(clientAccounts.length).toBe(savedClient.accounts.length);
    });
    it("Should retrieve a specific account from a specific client",async () => {
        const retrievedAccount:Account = await clientServices.retrieveClientAccount(savedClient.id, savedClient.accounts[1].accountName);
        expect(retrievedAccount.accountName).toBe(savedClient.accounts[1].accountName);
    });
    it("Should retrieve all client accounts with a balance greater than 100",async () => {
        const greaterAccounts:Account[] = await clientServices.retrieveClientAccountsOver(savedClient.id, 100);
        expect(greaterAccounts.length).toBe(1);
    });
    it("Should retrieve all client accounts with a balance less than 100",async () => {
        const lesserAccounts:Account[] = await clientServices.retrieveClientAccountsUnder(savedClient.id, 100);
        expect(lesserAccounts.length).toBe(1);
    });
    it("Should update the balance of a specific account for a specific client",async () => {
        savedClient = await clientServices.updateClientAccountBalance(savedClient.id, savedClient.accounts[0].accountName, "deposit", 500);
        expect(savedClient.accounts[0].balance).toBe(500);
    });
    it("Should remove a specified account from a specified client",async () => {
        const removedAccount:Account = await clientServices.deleteClientAccount(savedClient.id, savedClient.accounts[0].accountName);
        savedClient = await clientServices.retrieveClientById(savedClient.id);
        expect(savedClient.accounts.length).toBe(1);
    });
    it("Should remove all accounts for a client",async () => {
        const accounts:Account[] = await clientServices.deleteAllClientAccounts(savedClient.id);
        savedClient = await clientServices.retrieveClientById(savedClient.id);
        expect(savedClient.accounts.length).toBe(0);
    });
    it("Should remove a specified client from the database", async () => {
        const removedClient:Client = await clientServices.deleteClient(savedClient.id);
        expect(async () => {
            await clientServices.retrieveClientById(savedClient.id);
        }).rejects.toThrow(ResourceNotFoundError);
    });
});
import { AzureClientDAO } from "../daos/client-dao-azure";
import Client from "../entities/client";
import ResourceNotFoundError from "../errors/resource-not-found-error";

describe("Client Dao Tests", () => {
    const clientDao:AzureClientDAO = new AzureClientDAO();
    let savedClient:Client = null;

    it("Create an Associate", async () =>{
        const newClient:Client = {fname:"Michael",lname:"Schwartz", id:'', accounts:[]};
        savedClient = await clientDao.createClient(newClient);
        expect(savedClient).not.toBeFalsy();
    });

    it("Get all Clients", async () =>{
        const clients:Client[] = await clientDao.getAllClients();
        expect(clients.length).toBeGreaterThanOrEqual(1);
    });

    it("Get a Specific Client", async () =>{
        const client:Client = await clientDao.getClientById(savedClient.id);
        expect(client.id).toBe(savedClient.id);
    });

    it("Update a Client's information", async () =>{
        savedClient.fname = "Yogurt";
        const updatedClient = await clientDao.updateClient(savedClient);
        expect((updatedClient).fname).toBe(savedClient.fname);
    });

    it("Deletes a Client from the database", async () =>{
        await clientDao.removeClient(savedClient.id);
        expect(async () =>{
            await clientDao.getClientById(savedClient.id);
        }).rejects.toThrow(ResourceNotFoundError);
    });
});
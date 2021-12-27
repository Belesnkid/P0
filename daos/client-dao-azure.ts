import Client from "../entities/client";
import { CosmosClient } from "@azure/cosmos";
import { v4 } from "uuid";
import ResourceNotFoundError from "../errors/resource-not-found-error";

//creating the connection to the Database
const myClient = new CosmosClient(process.env.MyCosmosConnection);
const db = myClient.database('P0-DB');
const container = db.container('Clients');

//DAO to manipulate data and interract with the Database
export interface ClientDAO{
    //Create
    createClient(client:Client): Promise<Client>;
    
    //Read
    getAllClients():Promise<Client[]>;
    getClientById(id:string):Promise<Client>;

    //Update
    updateClient(client:Client):Promise<Client>;

    //Delete
    removeClient(id:string):Promise<Client>;
}

export class AzureClientDAO implements ClientDAO{

    /**Creates a client and adds it to the database
     * @param client Client object with a blank id and empty array of accounts
     * @returns Promise of a client object that was created and sent to database
     */
    async createClient(client: Client): Promise<Client> {
        client.id = v4();
        const response = await container.items.create(client);
        return response.resource;
    }

    /**Gets a list of all clients in the database
     *@returns Promise of an array of Client objects stored in the database
     */
    async getAllClients(): Promise<Client[]> {
        const response = await container.items.readAll<Client>().fetchAll();
        return response.resources.map(c => ({fname:c.fname, lname:c.lname, id:c.id, accounts:c.accounts}))
    }

    /**Gets a specific client from the database
     * @param id String unique id of the client we want to get
     * @returns Promise of a client object with id matching id
     */
    async getClientById(id: string): Promise<Client> {
        const response = await container.item(id,id).read<Client>();
        if (!response.resource){
            throw new ResourceNotFoundError(`The resource with id ${id} could not be found.`, id);
        }
        return response.resource;
    }

    /**Updates a given Client's information
     * @param id String unique id of the client we want to get
     * @returns Promise of the updated client object
     */
    async updateClient(client:Client): Promise<Client> {
        const response = await container.items.upsert<Client>(client);
        if (!response.resource){
            throw new ResourceNotFoundError(`The resource with id ${client.id} could not be found.`, client.id);
        }
        return response.resource;
    }

    /**Deletes a client from the database
     * @param id String unique id of the client we want to get
     * @returns Promise of the client that was removed from the database
     */
    async removeClient(id: string): Promise<Client> {
        const client = await this.getClientById(id);
        if (!client){
            throw new ResourceNotFoundError(`The resource with id ${id} could not be found.`, id);
        }
        const response = await container.item(id,id).delete();
        return client;
    }
    
}

export const azureClientDao = new AzureClientDAO();
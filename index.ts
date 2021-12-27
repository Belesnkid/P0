import Express from "express";
import { azureClientDao } from "./daos/client-dao-azure";
import { ClientServices, ClientService } from "./services/client-service";
import Client from "./entities/client";
import Account from "./entities/account";
import errorHandler from "./errors/error-handler";

const app = Express();
app.use(Express.json());

const clientServices:ClientService = new ClientServices(azureClientDao);

app.get("/clients", async (req,res)  => {
    try{
        const clients:Client[] = await clientServices.retrieveAllClients();
        console.log("Retrieved all clients");
        res.status(200);
        res.send(clients);
    } catch(error){
        errorHandler(error, req, res);
    }
})
app.post("/clients", async (req,res) => {
    try{
        const newClient:Client = req.body;
        const createdClient:Client = await clientServices.addClient(newClient);
        console.log("Client Created Successfully");
        res.status(201);
        res.send(createdClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})
app.get("/clients/:id", async (req, res) => {
    try{
        const myClient:Client = await clientServices.retrieveClientById(req.params.id);
        console.log(`Successfully Retrieved Client with ID ${myClient.id}`);
        res.status(201);
        res.send(myClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})
app.put("/clients/:id", async (req,res) => {
    try{
        const {fname,lname,id,accounts} = req.body;
        const updatedClient = await clientServices.updateClient({fname,lname,id,accounts});
        console.log(`Successfully updated client with ID ${updatedClient.id}`);
        res.status(201);
        res.send(updatedClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})

app.delete("/clients/:id", async (req,res) =>{
    try{
        const deletedClient:Client = await clientServices.deleteClient(req.params.id);
        console.log(`Successfully Deleted Client with ID ${deletedClient.id}`);
        res.status(205);
        res.send(deletedClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})

app.post("/clients/:id/accounts", async (req,res) =>{
    try{
        const newAccount:Account = req.body;
        const myClient:Client = await clientServices.retrieveClientById(req.params.id);
        myClient.accounts.push(newAccount);
        const updatedClient = await clientServices.updateClient(myClient);
        console.log(`${newAccount.accountName} account has been added for client with ID ${updatedClient.id}`);
        res.status(201);
        res.send(updatedClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})

app.get("/clients/:id/accounts", async (req,res) =>{
    try{
        const accounts:Account[] = await clientServices.retrieveClientAccounts(req.params.id);
        console.log(`Accounts retrieved for client with ID ${req.params.id}`);
        res.status(200);
        res.send(accounts);
    } catch(error){
        errorHandler(error, req, res);
    }
})

//updates a specific client account balance
app.patch("/clients/:id/:accountName/:accountAction/:amount", async (req,res) =>{
    try{
        const myClient:Client = await clientServices.updateClientAccountBalance(req.params.id, req.params.accountName, req.params.accountAction, Number(req.params.amount));
        console.log(`Account Updated Successfully for client with ID ${req.params.id}`);
        res.status(201);
        res.send(myClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})

//query route
app.get("/clients/:id/accounts", () =>{

})

app.listen(3000, ()=> console.log("App has started"));
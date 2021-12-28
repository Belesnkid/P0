import Express from "express";
import { azureClientDao } from "./daos/client-dao-azure";
import { ClientServices } from "./services/client-service";
import Client from "./entities/client";
import Account from "./entities/account";
import errorHandler from "./errors/error-handler";

const app = Express();
app.use(Express.json());

//instantiating client services for database interraction AND data manipulation of said records
const clientServices:ClientServices = new ClientServices(azureClientDao);

//gets a list of all client records in the database
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

//Creates a new client record in the database
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

//gets a specific client record from the database
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

//updates a client's information with new information where the id matches in the database
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

//deletes client with matching id from the database
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

//add an account to a specific client
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

//gets all client accounts for a specific client
//query route => localhost:3000/clients/:id/accounts?amountLessThan=2000&amountGreaterThan=400
app.get("/clients/:id/accounts", async (req,res) =>{
    const {amountLessThan,amountGreaterThan} = req.query;
    if(amountLessThan === undefined && amountGreaterThan === undefined){
        try{
            const accounts:Account[] = await clientServices.retrieveClientAccounts(req.params.id);
            console.log(`Accounts retrieved for client with ID ${req.params.id}`);
            res.status(200);
            res.send(accounts);
        } catch(error){
            errorHandler(error, req, res);
        }
    }
    else if (amountLessThan === undefined && amountGreaterThan != undefined){
        try {
            const accounts:Account[] = await clientServices.retrieveClientAccountsOver(req.params.id, Number(amountGreaterThan));
            console.log(`Checking accounts for client with ID ${req.params.id}`);
            res.status(200);
            res.send(accounts);
        } catch(error){
            errorHandler(error, req, res);
        }
    }
    else if (amountLessThan != undefined && amountGreaterThan === undefined){
        try{
            const accounts:Account[] = await clientServices.retrieveClientAccountsUnder(req.params.id, Number(amountLessThan));
            console.log(`Checking accounts for client with ID ${req.params.id}`);
            res.status(200);
            res.send(accounts);
        } catch(error){
            errorHandler(error, req, res);
        }
    }
    else{
        try{
            const accounts:Account[] = await clientServices.retrieveClientAccounts(req.params.id);
            const accountsInRange:Account[] = [];
            console.log(`Accounts retrieved for client with ID ${req.params.id}`);
            for(let a of accounts){
                if(a.balance <= Number(amountLessThan) && a.balance >= Number(amountGreaterThan)){
                    accountsInRange.push(a);
                }
            }
            res.status(201);
            if (accountsInRange.length === 0){
                res.send(`There are no accounst with a current balance between ${amountGreaterThan} and ${amountLessThan} for client with ID ${req.params.id}`);
            }
            else{
                res.send(accountsInRange);
            }
        } catch(error){
        errorHandler(error, req, res)
        }
    }
})

//updates a specific client account balance
app.patch("/clients/:id/:accountName/:accountAction", async (req,res) =>{
    try{
        const myClient:Client = await clientServices.updateClientAccountBalance(req.params.id, req.params.accountName, req.params.accountAction, Number(req.body.amount));
        console.log(`Account Updated Successfully for client with ID ${req.params.id}`);
        res.status(201);
        res.send(myClient);
    } catch(error){
        errorHandler(error, req, res);
    }
})

//retrieves a specific account from a specific client record
app.get("/clients/:id/:accountName", async (req,res) =>{
    try{
        const account:Account = await clientServices.retrieveClientAccount(req.params.id, req.params.accountName);
        console.log(`Retrieved account ${account} for client with ID ${req.params.id}`);
        res.status(200);
        res.send(account);
    } catch(error){
        errorHandler(error, req, res);
    }
})

//deletes a specific account from a specific client record or all accounts
app.delete("/clients/:id/:accountName", async (req,res) =>{
    if(req.params.accountName != 'accounts'){
        try{
            const deletedAccount:Account = await clientServices.deleteClientAccount(req.params.id,req.params.accountName);
            res.status(200);
            res.send(deletedAccount);
        } catch(error){
            errorHandler(error, req, res);
        }
    }
    else{
        try{
            const deletedAccounts:Account[] = await clientServices.deleteAllClientAccounts(req.params.id);
            res.status(200);
            res.send(deletedAccounts);
        } catch(error){
            errorHandler(error, req, res);
        }
    }
})

//Shhh...
app.listen(3000, ()=> console.log("App has started"));
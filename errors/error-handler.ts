import { Response, Request } from "express";
import ResourceNotFoundError from "./resource-not-found-error";
import TransactionError from "./transaction-error";

//Error handler to check what went wrong
export default function errorHandler(error: Error | unknown, req: Request, res: Response){
    if (error instanceof ResourceNotFoundError){
        console.log(`Resource Could not be Found`);
        res.status(404);
        res.send(error.message);
    }
    else if (error instanceof TransactionError){
        console.log("Transaction Error");
        res.status(422);
        res.send(error.message);
    }
    else{
        res.status(500);
        res.send("An unknown Error occured");
    }
}
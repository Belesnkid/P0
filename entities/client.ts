import Account from "./account";

//interface for client objects
//constains an array of account objects
export default interface Client{
    id:string;
    fname:string;
    lname:string;
    accounts:Account[];
}
//interface for account objects
export default interface Account{
    accountName:string;
    accountType:"Checking" | "Savings" | "Other";
    balance:number;
}
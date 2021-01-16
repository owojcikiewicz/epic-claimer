import * as path from "path";
import * as fs from "fs"; 

let config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));

interface EpicAccount {
    email: string; 
    password: string; 
};

interface Config {
    accounts: EpicAccount[];
};

function getAccounts(): Config {
    let accounts = config.accounts;

    return accounts;
};

export {getAccounts};
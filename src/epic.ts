import {getAccounts, EpicAccount} from "./config";
import {Launcher} from "epicgames-client";
import {default as ClientLoginAdapter} from "epicgames-client-login-adapter";

let accounts = getAccounts();
let clients = [];

function initClients(): Promise<Array<EpicAccount>> {
    return new Promise(async (resolve, reject) => {
        for (let i in accounts) {
            let login = accounts[i];
            let client = new Launcher();
            
            if (!await client.init()) {
                reject("Error occurred while initializing launcher.");
                return;
            };

            let auth = await ClientLoginAdapter.init({email: login.email, password: login.password});
            let code = await auth.getExchangeCode();
            
            await auth.close();

            if (!await client.login(null, code)) {
                reject("Error occurred while logging in.");
                return;
            };

            clients.push(client);
        };

        resolve(clients);
    });
};

export {initClients as init, clients as list};
import {getAccounts} from "./config";
import {Launcher} from "epicgames-client";
import {default as ClientLoginAdapter} from "epicgames-client-login-adapter";

let accounts = getAccounts();
let clients = [];

function initClients(): Promise<Array<Launcher>> {
    return new Promise(async (resolve, reject) => {
        for (let i in accounts) {
            let login = accounts[i];
            let client = new Launcher();
            let options = {
                email: login.email,
                password: login.password
            };
            
            if (!await client.init()) {
                reject("Error occurred while initializing launcher.");
                return;
            };
            
            try {
                await client.login(options);
                clients.push(client);
            } catch(ex) {
                console.log("[LOGIN] Automatic login failed.");
                let auth = await ClientLoginAdapter.init(options);
                let code = await auth.getExchangeCode();
            
                await auth.close();

                if (!await client.login(null, code)) {
                    reject("Error occurred while logging in.");
                    return;
                };

                clients.push(client);
                console.log("[LOGIN] Manual login successful.");
            };
        };

        resolve(clients);
    });
};

export {initClients as init, clients as list};
import {Launcher} from "epicgames-client";
import {default as ClientLoginAdapter} from "epicgames-client-login-adapter";
import {getAccounts} from "./config";

let accounts = getAccounts();
let clients = [];

async function init() {
    for (let i in accounts) {
        let login = accounts[i];
        let client = new Launcher();
        
        if (!await client.init()) {
            throw new Error("Error occurred while initializing launcher.");
        };

        let auth = await ClientLoginAdapter.init({email: login.email, password: login.password, rememberLastSession: true});
        let code = await auth.getExchangeCode();
        
        await auth.close();

        if (!await client.login(null, code)) {
            throw new Error("Error occurred while logging in.");
        };

        console.log(1);
        console.log(await client.getProfile("SaturdaysHeroes"));
    };
};

export {init};
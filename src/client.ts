import {getAccounts} from "./config";
import {Launcher} from "epicgames-client";
import {Cookie} from "tough-cookie";
import {default as ClientLoginAdapter} from "epicgames-client-login-adapter";

let accounts = getAccounts();
let clients = [];

function getToughCookie(cookie: Cookie): Cookie {
    cookie = Object.assign({}, cookie);
    cookie.key = cookie.name;
    cookie.expires = new Date(cookie.expires * 1000);

    return new Cookie(cookie);
};

function initClients(): Promise<Array<Launcher>> {
    return new Promise(async (resolve, reject) => {
        for (let i in accounts) {
            let login = accounts[i];
            let client = new Launcher();
            let options = {
                email: login.email,
                password: login.password,
                rememberLastSession: true
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

                let cookies = await auth.browser.pages().then(pages => pages[0]).then(p => p.cookies());
                for (let cookie of cookies) {
                    cookie = getToughCookie(cookie);
                    client.http.jar.setCookie(cookie, "https://" + cookie.domain);
                };
            
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
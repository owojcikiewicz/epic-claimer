import * as Clients from "./client";
import {getPromotions, claimPromotions} from "./promos";

// Claim all free games.
Clients.init()
    .then(async clients => {
        for (let client of clients) {
            let country = client.account.country;

            getPromotions(country, country)
                .then(async promos => {
                    await claimPromotions(client, promos);
                    await client.logout();
                    console.log("[LOGIN] Logged out client.");
                })
                .catch(err => {
                    console.log("ERROR: ", err)
                });
        };
    })
    .catch(err => {
        console.log(err);
    });
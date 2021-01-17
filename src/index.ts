import * as Clients from "./client";
import {getFreeGames, getPromotions, claimPromotions} from "./promos";

Clients.init()
    .then(async clients => {
        for (let client of clients) {
            let country = client.account.country;

            getPromotions(country, country)
                .then(async promos => {
                    claimPromotions(client, promos);
                })
                .catch(err => {
                    console.log("ERROR: ", err)
                });
        };
    })
    .catch(err => {
        console.log(err);
    });
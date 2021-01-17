import axios from "axios";

let GAMES_ENDPOINT: string = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country={{country}}&allowCountries={{allowCountries}}&locale={{locale}}";
let PRODUCTS_ENDPOINT: string = "https://store-content.ak.epicgames.com/api/{{locale}}/content/products/{{slug}}";
let BUNDLES_ENDPOINT: string = "https://store-content.ak.epicgames.com/api/{{locale}}/content/bundles/{{slug}}";

function gameIsBundle(game: any): boolean {
    return Boolean(game.categories.find(cat => cat.path === "bundles"));
};

async function getProductFromSlug(slug: string, locale: string = "en-US"): Promise<any> {
    return new Promise((resolve, reject) => {
        let endpoint: string = PRODUCTS_ENDPOINT.replace("{{slug}}", slug).replace("{{locale}}", locale);

        axios.get(endpoint)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err);
            });
    });
};

async function getBundleFromSlug(slug: string, locale: string = "en-US"): Promise<any> {
    return new Promise((resolve, reject) => {
        let endpoint: string = BUNDLES_ENDPOINT.replace("{{slug}}", slug).replace("{{locale}}", locale);

        axios.get(endpoint)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err);
            });
    });
};

async function getFreeGames(country: string = "US", locale: string = "en-US"): Promise<Array<Object>> {
    return new Promise((resolve, reject) => {
        let endpoint: string = GAMES_ENDPOINT.replace("{{country}}", country).replace("{{allowCountries}}", country).replace("{{locale}}", locale);

        axios.get(endpoint)
            .then(async res => {
                let promos = [];

                for await (let game of res.data.data.Catalog.searchStore.elements) {
                    let getPromo = game => (gameIsBundle(game) ? getBundleFromSlug(game.producSlug.split("/")[0], locale): getProductFromSlug(game.productSlug.split("/")[0], locale));

                    await getPromo(game)
                        .then(product => {
                            let page; 

                            if (product.pages) {
                                page = product.pages.find(p => p._urlPattern.includes(game.productSlug));
                            } else {
                                page = product;
                            };

                            if (!page) {
                                [page] = product.pages;
                            };

                            promos.push({
                                "title": product.productName || product._title,
                                "id": page.offer.id,
                                "namespace": page.offer.namespace
                            });
                        })
                        .catch(err => {
                            reject(err);
                        });
                };
                
                resolve(promos);
            })
            .catch(err => {
                reject(err);
            });
    });
};

async function getPromotions(country: string = "US", locale: string = "en-US"): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
        getFreeGames(country, country)
            .then(games => {
                resolve(games);
            })
            .catch(err => {
                reject(err);
            });
    });
};

async function claimPromotions(client, promos: Array<any>): Promise<void> {
    return new Promise(async (resolve, reject) => {
        for await (let promo of promos) {
            try {
                let bought = await client.quickPurchase(promo, 1)
                if (bought) {
                    console.log(`[GAMES] Claimed free game: ${promo.title} (${bought})`);
                } else {
                    console.log(`[GAMES] Failed to claim game: ${promo.title}.`);
                };
            } catch(ex) {
                console.log(`[ERROR] ${ex}`);
                reject(ex);
            };
        };

        resolve();
    });
};

export {getFreeGames, getPromotions, claimPromotions};
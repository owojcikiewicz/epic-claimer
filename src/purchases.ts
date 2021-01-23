import axios from "axios";
import {Launcher} from "epicgames-client";
import cheerio from "cheerio";

let PURCHASE_ENDPOINT = "https://payment-website-pci.ol.epicgames.com/purchase";

async function newPurchase(client: Launcher, offer: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        await client.http.sendGet(`https://launcher-website-prod07.ol.epicgames.com/purchase?showNavigation=true&namespace=${offer.namespace}&offers=${offer.id}`, "", false, {jar: client.http.jar})
            .then(res => {
                console.log(client.http.jar);
                let purchase = res.data;
                let $ = cheerio.load(purchase); 
                let token = $("#purchaseToken").val();

                resolve({token});
            })
            .catch(err => {
                reject(err);
            });
    });
};

async function purchaseOrderPreview(client: Launcher, purchase: any, offer: any): Promise<string> {
    return new Promise((resolve, reject) => {
        axios({
            method: "post",
            url: `${PURCHASE_ENDPOINT}/order-preview`,
            data: {
                useDefault: true,
                setDefault: false,
                namespace: offer.namespace,
                country: null,
                countryName: null,
                orderId: null,
                orderComplete: null,
                orderError: null,
                orderPending: null,
                offers: [
                    offer.id,
                ],
                offerPrice: "",
            },
            headers: {
                "x-requested-with": purchase.token,
                "Authorization": `${client.account.auth.tokenType} ${client.account.auth.accessToken}`
            }
        })
        .then(res => {
            resolve(res.data.syncToken ? res.data : false);
        })
        .catch(err => {
            reject(err);
        });
    });
};

async function purchaseOrderConfirm(client: Launcher, purchase: any, order: any): Promise<string> {
    return new Promise((resolve, reject) => {
        axios({
            method: "post",
            url: `${PURCHASE_ENDPOINT}/confirm-order`,
            data: {
                useDefault: true,
                setDefault: false,
                namespace: order.namespace,
                country: order.country,
                countryName: order.countryName,
                orderId: null,
                orderComplete: null,
                orderError: null,
                orderPending: null,
                offers: order.offers,
                includeAccountBalance: false,
                totalAmount: order.orderResponse.totalPrice,
                affiliateId: "",
                creatorSource: "",
                syncToken: order.syncToken,
            },
            headers: {
                "x-requested-with": purchase.token,
                "Authorization": `${client.account.auth.tokenType} ${client.account.auth.accessToken}`
            }
        })
        .then(res => {
            resolve(res.data && res.data.confirmation);
        })
        .catch(err => {
            reject(err);
        });
    });
};

async function purchase(client: Launcher, offer: any, quantity: number) {
    let purchase = await newPurchase(client, offer);

    if (!purchase || !purchase.token) {
        throw new Error("Unable to acquire purchase token.");
    };

    let order = await purchaseOrderPreview(client, purchase, offer);
    if (!order) return false; 

    return purchaseOrderConfirm(client, purchase, order);
};

export {purchase};
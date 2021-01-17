import * as Clients from "./epic";

// Initialize all clients. 
Clients.init()
    .then(clients => {
        console.log(clients);
    })
    .catch(err => {
        console.log(err);
    });
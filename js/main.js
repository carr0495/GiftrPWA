let app = {
    url: "https://giftr.mad9124.rocks",
    token: "",
    init: function () {
        app.token = sessionStorage.getItem("token");
        app.displayMainPage();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
            .then((reg)=>{
                console.log('service worker registered', reg);
            })
            .catch((err)=>{
                console.log('service worker not registered', err);
            })
        }

    },
    displayMainPage: function () {
        let currentPage = location.href;
        currentPage = currentPage.slice(8);
        let position = currentPage.search('/');
        console.log(position);
        console.log(currentPage);

        currentPage = currentPage.slice(position);

        console.log(currentPage);

        if (currentPage == "/index.html#" || currentPage == "/index.html" || currentPage == "/") {
            console.log("page1");
            let loginButton = document.querySelector('#LoginButton');
            loginButton.addEventListener('click', app.loginAttempt);
            let registerButton = document.querySelector('#RegisterButton');
            registerButton.addEventListener('click', app.registerAttempt);
        } else if (currentPage == "/pages/people.html" || currentPage == "/pages/people.html#") {
            app.getPeoplefFromProfile();
            document.querySelector("#addPersonButton").addEventListener('click', app.addPersonToDB);
            document.querySelector("#LogoutButton").addEventListener('click', app.logout);
        } else if (currentPage == "/pages/gifts.html" || currentPage == "/pages/gifts.html#") {
            app.getGiftsFromPerson();
            document.querySelector("#LogoutButton").addEventListener('click', app.logout);
            document.querySelector("#logoBack").addEventListener('click', app.generatePeoplePage);
            document.querySelector('#addGiftButton').addEventListener('click', app.addGiftToPerson);

        }
    },
    registerAttempt: function () {
        let registerButton = document.querySelector('#RegisterButton');
        let loginButton = document.querySelector('#LoginButton');
        registerButton.classList.add('disabled');
        loginButton.classList.add('disabled');
        let loadingBar = document.querySelector('#loadingBar');
        loadingBar.classList.remove('hidden');

        let em = document.querySelector("#email_input").value;
        let ps = document.querySelector("#password_input").value;
        console.log(em);

        let data = {
            firstName: "na",
            lastName: "na",
            email: em,
            password: ps
        };

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let req = new Request(`${app.url}/auth/users`, {
            headers: headers,
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(data)
        });


        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.errors != null) {
                    console.log("error");
                    loadingBar.classList.add('hidden');
                    registerButton.classList.remove('disabled');
                    loginButton.classList.remove('disabled');
                    data.errors.forEach(error => {
                        M.toast({
                            html: `${error.detail}`
                        });
                    });

                    throw new Error("seems like youre missing something");

                } else {
                    app.loginAttempt();
                }

            })
            .catch(err => {
                console.log(err);
                console.log("FAILED");

            });
    },
    loginAttempt: function () {
        let em = document.querySelector("#email_input").value;
        let ps = document.querySelector("#password_input").value;
        let registerButton = document.querySelector('#RegisterButton');
        let loginButton = document.querySelector('#LoginButton');
        let loadingBar = document.querySelector('#loadingBar');
        registerButton.classList.add('disabled');
        loginButton.classList.add('disabled');
        loadingBar.classList.remove('hidden');
        let data = {
            email: em,
            password: ps
        };

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let req = new Request(`${app.url}/auth/tokens`, {
            headers: headers,
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(data)
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data.data.token);
                app.token = data.data.token;
                console.log(app.token);
                sessionStorage.setItem("token", app.token);

                registerButton.classList.remove('disabled');
                loginButton.classList.remove('disabled');
                loadingBar.classList.add('hidden');


                if (data.errors != null) {
                    console.log("error");
                    loadingBar.classList.add('hidden');
                    registerButton.classList.remove('disabled');
                    loginButton.classList.remove('disabled');
                    data.errors.forEach(error => {
                        M.toast({
                            html: `${error.detail}`
                        });
                    });

                    throw new Error("seems like youre missing something");

                } else {
                    app.generatePeoplePage();
                }
            })
            .catch(err => {
                console.log(err);
                console.log("FAILED");
                registerButton.classList.remove('disabled');
                loginButton.classList.remove('disabled');
                loadingBar.classList.add('hidden');
                M.toast({
                    html: `no registered account with these parameters`
                });
            })

    },
    generatePeoplePage: function () {
        location.href = '/pages/people.html';
        app.token = sessionStorage.getItem('token');
    },
    getPeoplefFromProfile: function () {
        console.log(app.token);
        app.Clear();
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${app.token}`);

        let req = new Request(`${app.url}/api/people`, {
            headers: headers,
            mode: 'cors',
            method: 'GET'
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.data.length == 0) {
                    M.toast({
                        html: `Click + button to add a new person`
                    });
                } else {
                    data.data.forEach(person => {
                        //  console.log(person);                        
                        let BDnm = person.birthDate.search('T');
                        let BD = person.birthDate.slice(0, BDnm);
                        let mainList = document.querySelector("#mainList");
                        let template = document.querySelector("#personListTemplate");
                        let clone = template.content.cloneNode(true);
                        clone.querySelector("#fullName").innerHTML = person.name;
                        clone.querySelector("#personBirthDay").innerHTML = BD;
                        clone.querySelector("#giftBadge").innerHTML = person.gifts.length;
                        clone.querySelector("#personDelButton").setAttribute("data-del-id", person._id);
                        clone.querySelector("#personDelButton").addEventListener('click', app.deletePersonFromDB);
                        clone.querySelector('#delIcon').setAttribute("data-del-id", person._id);
                        clone.querySelector('#addGiftButton').addEventListener('click', app.changeToGiftPage);
                        clone.querySelector('#addGiftButton').setAttribute("data-gift-person", person._id);
                        clone.querySelector('#addGiftIcon').setAttribute("data-gift-person", person._id);
                        mainList.appendChild(clone);
                    });
                }

            })
            .catch(err => {
                console.log(err);

            })
    },
    addPersonToDB: function () {
        let firstName = document.querySelector("#first_name").value;
        let lastName = document.querySelector("#last_name").value;
        let birthday = document.querySelector("#date").value;

        console.log(firstName + " :: " + lastName + " :: " + birthday);

        let data = {
            name: firstName + " " + lastName,
            birthDate: birthday
        };

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${app.token}`);


        let req = new Request(`${app.url}/api/people`, {
            headers: headers,
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(data)
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                app.getPeoplefFromProfile();
            })
            .catch(err => {
                console.log(err);

            })

    },
    deletePersonFromDB: function (ev) {
        let theID = ev.target.getAttribute("data-del-id");



        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${app.token}`);


        let req = new Request(`${app.url}/api/people/${theID}`, {
            headers: headers,
            mode: 'cors',
            method: 'Delete'
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                app.Clear();
                app.getPeoplefFromProfile();
            })
            .catch(err => {
                console.log(err);
            })



    },
    changeToGiftPage: function (ev) {
        sessionStorage.setItem("currentPerson", ev.target.getAttribute("data-gift-person"))
        console.log(ev.target.getAttribute("data-gift-person"));
        location.href = "/pages/gifts.html";


    },
    Clear: function () {
        let mainPage = document.querySelector("#mainList");
        while (mainPage.firstChild) {
            mainPage.removeChild(mainPage.firstChild);
        }
    },
    logout: function () {
        location.href = "/index.html";
        app.token = "";
        console.log("here");
        app.init();
    },
    getGiftsFromPerson: function () {

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${app.token}`);

        let req = new Request(`${app.url}/api/people/${sessionStorage.getItem('currentPerson')}`, {
            headers: headers,
            mode: 'cors',
            method: 'GET'
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.data.gifts.length == 0) {
                    M.toast({
                        html: `Click + button to add a new Gift` //no gifts in this person yet.
                    });
                } else {
                    data.data.gifts.forEach(gift => {
                        console.log(gift);
                        let mainList = document.querySelector('#mainList');
                        let template = document.querySelector('#giftItemTemplate');
                        let clone = template.content.cloneNode(true);
                        // select the items in the template clone and fill values
                        let p = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAN' }).format(gift.price / 100);
                        clone.querySelector("#GiftName").innerHTML = gift.name;
                        clone.querySelector("#giftPrice").innerHTML = p;
                        clone.querySelector('#giftLink').href = "https://" +gift.store.productUrl;
                        clone.querySelector("#deleteGift").setAttribute('data-gift-id',gift._id);
                        console.log(gift._id);
                        clone.querySelector("#deleteGift").addEventListener('click',app.deleteGift);
                        clone.querySelector("#delIcon").setAttribute('data-gift-id',gift._id);
                        clone.querySelector("#delIcon").addEventListener('click',app.deleteGift);
                        mainList.appendChild(clone);
                    });

                }

            })
            .catch(err => {
                console.log(err);
            })
    },
    addGiftToPerson: function () {
        let name = document.querySelector('#gift_name').value;
        let price = document.querySelector('#gift_price').value;
        let url = document.querySelector("#gift_url").value;

        let data = {
            name: name,
            price: price,
            store: {
                productUrl: url
            }
        };

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${app.token}`);


        let req = new Request(`${app.url}/api/people/${sessionStorage.getItem('currentPerson')}/gifts`, {
            headers: headers,
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(data)
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                app.Clear();
                app.getGiftsFromPerson();

            })
            .catch(err => {
                console.log(err);
            })

    },
    deleteGift: function(ev){
        let theID = ev.target.getAttribute("data-gift-id");



        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${app.token}`);


        let req = new Request(`${app.url}/api/people/${sessionStorage.getItem('currentPerson')}/gifts/${theID}`, {
            headers: headers,
            mode: 'cors',
            method: 'DELETE'
        });

        fetch(req)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                app.Clear();
                app.getGiftsFromPerson();
            })
            .catch(err => {
                console.log(err);

            })
    }


}


document.addEventListener('DOMContentLoaded', app.init());
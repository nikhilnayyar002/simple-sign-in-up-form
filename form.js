let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let passRegex = /(?=^.{8,20}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/;
let errors = [];
let api = 'http://localhost:3000/api';
let signInPath = (api + '/authenticate'), signUpPath = (api + '/register'), userProfilePath = (api + '/userProfile');

let userName = document.querySelector('#user-name');
let formTab = document.querySelector('#form-tab');
let signInBtn = document.querySelector('#sign-in-btn');
let signUpBtn = document.querySelector('#sign-up-btn');
let submitBtn = document.querySelector('#submit-btn');
let form = document.querySelector("#form-container");
let userProfile = document.querySelector("#userProfile");

signUpBtn.style.color = "#8a1e92";
initialize();

formTab.addEventListener('click', (e) => {
    let elem = e.target;
    if (elem.id == 'sign-in-btn') {
        signInBtn.style.color = "#8a1e92";
        signUpBtn.style.color = "#6c596d";
        userName.style.display = 'none';
        submitBtn.textContent = "SignIn";
        document.querySelector('#email-error').style.display = "none";
        document.querySelector('#psw-error').style.display = "none";
        document.querySelector('#user-name-error').style.display = "none";
        submitBtn.disabled = '';
        submitBtn.classList.remove("disabled");
    }
    else if (elem.id == 'sign-up-btn') {
        signUpBtn.style.color = "#8a1e92";
        signInBtn.style.color = "#6c596d";
        userName.style.display = 'block';
        submitBtn.textContent = "SignUp";
    }

});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.textContent == "SignIn")
        if (!form.email.value || !form.psw.value) return;
        else {
            return postData(signInPath, { password: form.psw.value, email: form.email.value })
                .then(data => {
                    localStorage.setItem('token', data.token);
                    getData(userProfilePath)
                        .then(data => {
                            console.log(data)
                            form.style.display = 'none';
                            userProfile.style.display = 'table';
                            document.querySelector('#table-data-fullname').textContent = data.user.fullName;
                            document.querySelector('#table-data-email').textContent = data.user.email;
                        })
                        .catch(error => alert(error));
                })
                .catch(error => alert(error));
        }

    if (!form.email.value && !form.psw.value && !!form.usrnm.value) {
        disableSubitBtn(true, 'email-error');
        disableSubitBtn(true, 'psw-error');
        disableSubitBtn(true, 'user-name-error');
    }
    else if (!form.email.value) disableSubitBtn(true, 'email-error');
    else if (!form.psw.value) disableSubitBtn(true, 'psw-error');
    else if (!form.usrnm.value) disableSubitBtn(true, 'user-name-error');
    else {
        postData(signUpPath, { fullName: form.usrnm.value, password: form.psw.value, email: form.email.value })
            .then(data => {
                form.email.value = form.psw.value = form.usrnm.value = '';
                alert("Hey " + data.fullName + "! Signup was successfull! Must Login Now.");
            })
            .catch(error => alert(error));
    }
});


document.querySelector('#logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    form.style.display = 'block';
    userProfile.style.display = 'none';
    document.querySelector('#table-data-fullname').textContent = '';
    document.querySelector('#table-data-email').textContent = '';
})

form.psw.addEventListener('keyup', () => {
    if (submitBtn.textContent == "SignIn") return;
    if (!passRegex.test(form.psw.value))
        disableSubitBtn(true, 'psw-error');
    else
        disableSubitBtn(false, 'psw-error');
})
form.email.addEventListener('keyup', () => {
    if (submitBtn.textContent == "SignIn") return;
    if (!emailRegex.test(form.email.value))
        disableSubitBtn(true, 'email-error');
    else
        disableSubitBtn(false, 'email-error');
})
form.usrnm.addEventListener('keyup', () => {
    if (submitBtn.textContent == "SignIn") return;
    if (!form.usrnm.value.length) 
        disableSubitBtn(true, 'user-name-error');
    else
        disableSubitBtn(false, 'user-name-error');
})

disableSubitBtn = (cond, error) => {
    if (cond && !errors.includes(error))
        errors.push(error);
    else if (!cond) {
        let index = errors.indexOf(error);
        if (index !== -1) errors.splice(index, 1);
    }
    document.querySelector('#' + error).style.display = cond ? "block" : 'none';
    submitBtn.disabled = errors.length ? 'true' : '';
    errors.length ? (submitBtn.classList.add("disabled")) : (submitBtn.classList.remove("disabled"));
}

function postData(url = '', data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
        .then(response => response.json()); // parses JSON response into native Javascript objects 
}
function getData(url = '') {
    // Default options are marked with *
    return fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            "Authorization": "Bearer " + localStorage.getItem('token')
        }
    })
        .then(response => response.json()); // parses JSON response into native Javascript objects 
}

function initialize() {
    let userPayload = getUserPayload();
    if (userPayload && (userPayload.exp > Date.now() / 1000))
        getData(userProfilePath)
            .then(data => {
                console.log(data)
                form.style.display = 'none';
                userProfile.style.display = 'table';
                document.querySelector('#table-data-fullname').textContent = data.user.fullName;
                document.querySelector('#table-data-email').textContent = data.user.email;
            });

    function getUserPayload() {
        let token = localStorage.getItem('token');
        if (token) {
            var userPayload = atob(token.split('.')[1]);
            return JSON.parse(userPayload);
        }
        else
            return null;
    }
}

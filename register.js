// const form = document.getElementById("registerForm");

// form.addEventListener("submit", function(e){

//     e.preventDefault();

//     const name = document.getElementById("name").value;
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
//     const confirmPassword = document.getElementById("confirmPassword").value;

//     if(password !== confirmPassword){
//         alert("Passwords do not match");
//         return;
//     }

//     const user = {
//         name,
//         email,
//         password
//     };

//     localStorage.setItem("user", JSON.stringify(user));

//     alert("Registration Successful");

//     window.location.href = "logIn_Page.html";

// });

const form = document.getElementById("registerForm");
const fullname = document.getElementById("fullname");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const country = document.getElementById("country");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const terms = document.getElementById("terms");

function error(input, msg) {

    input.parentElement.querySelector("small").innerText = msg;

}

function success(input) {

    input.parentElement.querySelector("small").innerText = "";

}

form.addEventListener("submit", (e) => {

    e.preventDefault();

    let valid = true;

    if (fullname.value.trim().length < 3) {

        error(fullname, "Enter Full Name");

        valid = false;

    } else {

        success(fullname);

    }

    if (username.value.trim().length < 4) {

        error(username, "Minimum 4 characters");

        valid = false;

    } else {

        success(username);

    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value)) {

        error(email, "Invalid Email");

        valid = false;

    } else {

        success(email);

    }

    const phonePattern = /^[0-9]{10,15}$/;

    if (!phonePattern.test(phone.value)) {

        error(phone, "Invalid Phone");

        valid = false;

    } else {

        success(phone);

    }

    if (country.value == "") {

        error(country, "Select Country");

        valid = false;

    } else {

        success(country);

    }

    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!strong.test(password.value)) {

        error(password, "8+ chars, uppercase & number");

        valid = false;

    } else {

        success(password);

    }

    if (confirmPassword.value !== password.value) {

        error(confirmPassword, "Passwords don't match");

        valid = false;

    } else {

        success(confirmPassword);

    }

    if (!terms.checked) {

        alert("Accept Terms & Conditions");

        valid = false;

    }

    if (valid) {

        alert("Registration Successful!");

        window.location.href = "dashboard.html";

    }

});

function toggle(inputId, icon) {

    const input = document.getElementById(inputId);

    icon.onclick = () => {

        if (input.type === "password") {

            input.type = "text";

            icon.innerHTML = '<i class="fa fa-eye-slash"></i>';

        } else {

            input.type = "password";

            icon.innerHTML = '<i class="fa fa-eye"></i>';

        }

    }

}

toggle("password", document.getElementById("toggle1"));

toggle("confirmPassword", document.getElementById("toggle2"));
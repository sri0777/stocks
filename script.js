document.addEventListener("DOMContentLoaded", function () {
  var x = document.getElementById("login");
  var y = document.getElementById("register");
  var z = document.getElementById("btn");

  var loginButton = document.getElementById("login-btn");
  var registerButton = document.getElementById("register-btn");

  loginButton.addEventListener("click", function () {
    x.style.left = "50px";
    y.style.left = "450px";
    z.style.left = "0";
  });

  registerButton.addEventListener("click", function () {
    x.style.left = "-400px";
    y.style.left = "50px";
    z.style.left = "110px";
  });
});

import $ from "jquery";
import {promiseGet, promisePost} from "@cervoio/common-ui-lib/src/utilities";
import {NewZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {checkLogin, getAuthCookie} from "./lib/authCheck";

function fillTable() {
    const tableElem = $("table tbody");
    promiseGet("zoos/").then(function(zooList: ZooJson[]) {
        for(const zoo of zooList) {
            tableElem.append(`<tr><td><a href="view_zoo.html?id=${zoo.zoo_id}">${zoo.name}</a></td>" +
                "<td>${zoo.postcode}</td>" +
                "<td>${zoo.latitude}</td>" +
                "<td>${zoo.longitude}</td>" +
                "<td><a href="${zoo.link}">${zoo.link}</a></td></tr>`);
        }
    });
}

function addNewZoo() {
    const formElement = $("form");
    const inputName = <string>formElement.find("input.input-name").val();
    const inputPostcode = <string>formElement.find("input.input-postcode").val();
    const inputLatitude = Number(formElement.find("input.input-lat").val());
    const inputLongitude = Number(formElement.find("input.input-long").val());
    const inputLink = <string>formElement.find("input.input-link").val();
    const newZoo: NewZooJson = {
        name: inputName,
        postcode: inputPostcode,
        link: inputLink,
        latitude: inputLatitude,
        longitude: inputLongitude
    };
    const authHeaders = new Map([["authorization", getAuthCookie()]]);
    console.log(newZoo);
    promisePost("zoos/", newZoo, authHeaders).then(function() {
        formElement.trigger("reset");
    });
}

function addFormRow() {
    const tableElem = $("table");
    tableElem.append("<tfoot>" +
        "<tr>" +
        "<td><input type='text' class='input-name' name='name' /></td>" +
        "<td><input type='text' class='input-postcode' name='postcode' /></td>" +
        "<td><input type='text' class='input-lat' name='latitude' /></td>" +
        "<td><input type='text' class='input-long' name='longitude' /></td>" +
        "<td><input type='text' class='input-link' name='link' />" +
        "<input type='submit' /></td>" +
        "</tr></tfoot>");
    console.log("added form");
}

document.addEventListener("DOMContentLoaded", function () {
    const token = getAuthCookie();
    checkLogin(token).then(function(isLogin) {
        $("#login-status").text(`You are logged in as ${isLogin.username}`);
        fillTable();
        addFormRow();
    }).catch(function (err) {
        $("#login-status").html(`You are not logged in. <a href="login.html">Go to login</a>`);
    });
});

$("#addZoo").on("submit", function() {
    addNewZoo();
    return false;
});
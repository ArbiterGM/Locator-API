"use strict";

const search = document.querySelector("ion-icon");
const heading = document.querySelector("h1");
const inputEl = document.querySelector("input");
const locateMeBtn = document.querySelector(".locate-me");

/////////////////////////////////////////////////////////////////////////
// Initializing map
let map = L.map("map").setView([41.71, 44.81], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Initializing
const init = function () {
  // Render error
  const renderError = function () {
    heading.textContent = `დაფიქსირდა შეცდომა 🛑 შეიყვანეთ კოორდინატები`;
  };

  // Transforming string to number coords in an array
  const textToCoords = function (text) {
    let coordsArr;
    if (!text || text == "0,0") {
      renderError();
      return;
    }
    coordsArr = text.replace(",", " ").split(" ").map(Number).filter(Number);
    map.setView(coordsArr, 13, {
      animate: true,
      pan: {
        duration: 0.7,
      },
    });
    locateCoords(coordsArr);
  };

  // Submitting the coords text as a String
  const submitCoords = function (coords) {
    const regex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    coords = inputEl.value;
    if (!regex.test(coords)) {
      renderError();
      return;
    }
    textToCoords(coords);
  };

  // Submitting string event listener
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitCoords();
  });
  search.addEventListener("click", submitCoords);

  // Injecting in header what country the coordinates are in
  const locateCoords = function (arr) {
    const [lat, lng] = arr;
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.countryName) throw new Error("ქვეყანა ვერ მოიძებნა!🛑");
        heading.textContent = `კოორდინატები არის ${data.countryName} - ში`;
      })
      .catch((err) => {
        heading.textContent = err;
        return;
      });
  };

  locateMeBtn.addEventListener("click", function () {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        map.setView([latitude, longitude], 13, {
          animate: true,
          pan: {
            duration: 0.7,
          },
        });
        heading.textContent = locateCoords([latitude, longitude]);
        inputEl.value = "";
      },
      () => (heading.textContent = "დაფიქსირდა შეცდომა 🛑 გააქტიურეთ ლოკაცია"),
      { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true }
    );
  });
};
init();

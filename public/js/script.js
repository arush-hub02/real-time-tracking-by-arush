const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { longitude, latitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "ARUSH DEEPAK GUPTA",
}).addTo(map);

const markers = {};

// Array of icon URLs (one for each color)
const iconUrls = [
  "/images/blue.png",
  "/images/green.png",
  "/images/purple.png",
  "/images/red.png",
  "/images/yellow.png",
  // Add more URLs as needed
];

// Function to get a custom icon for each user
const getCustomIcon = () => {
  const iconUrl = iconUrls[Math.floor(Math.random() * iconUrls.length)];
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [34, 34],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    // shadowUrl: "path/to/marker-shadow.png",
    shadowSize: [41, 41],
  });
};

socket.on("recieve-location", (data) => {
  const { id, longitude, latitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude], {
      icon: getCustomIcon(),
    }).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

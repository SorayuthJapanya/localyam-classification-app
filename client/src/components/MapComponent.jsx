import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader } from "lucide-react";

const MapComponent = ({ latitude, longitude }) => {
  const [address, setAdress] = useState("");
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  return (
    <MapContainer
      center={[latitude || 18.796143, longitude || 98.979263]}
      zoom={12}
      style={{ height: "300px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={[latitude || 18.796143, longitude || 98.979263]}
        eventHandlers={{
          click: async (e) => {
            const { lat, lng } = e.latlng;

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`
              );
              const data = await res.json();
              setIsAddressLoading(true);
              setAdress(data.display_name);
            } catch (error) {
              setAdress("Failed to fetch address.");
              Swal.fire("Error", "Failed to fetch location data.", "error");
            } finally {
              setIsAddressLoading(false);
            }
          },
        }}
      >
        <Popup>
          ที่อยู่:{" "}
          {isAddressLoading ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            address
          )}
          <br />
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;

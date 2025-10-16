import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    let watchId;
    if (tracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          // TODO: push to backend or to emergency contacts via API
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking]);

  return (
    <section className="container mx-auto p-6">
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        Dark mode section
      </div>

      <div className="bg-gray-100 text-black p-6 rounded-lg mt-4">
        Light mode section
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="text-white text-xl font-bold">Protection Control</h3>
          <p className="text-white/70 mt-2">
            Toggle protection and let AegisAI monitor and assist you in
            emergencies.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setTracking((t) => !t)}
              className={`px-4 py-2 rounded ${
                tracking ? "bg-red-600" : "bg-primary"
              } font-bold`}
            >
              {tracking ? "Stop Tracking" : "Start Tracking"}
            </button>
            <Link to="/chat" className="px-4 py-2 rounded bg-white/10">
              Open AI Chat
            </Link>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-semibold">Current Location</h4>
            <div className="mt-2 text-white/70">
              {location
                ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                : "Location not available. Allow geolocation."}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="mt-2 flex gap-3">
              <button className="px-3 py-2 rounded bg-white/10">
                Call Emergency
              </button>
              <button className="px-3 py-2 rounded bg-white/10">
                Alert Contacts
              </button>
              <button className="px-3 py-2 rounded bg-white/10">
                Medical Guide
              </button>
            </div>
          </div>
        </div>
        <aside className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h4 className="text-white font-bold">Live Feed</h4>
          <p className="text-white/70 mt-2">
            Notifications and alerts will appear here.
          </p>
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded bg-white/3">
              No recent notifications
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

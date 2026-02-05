import React, {useState, useEffect} from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./MyCalendar.css";
import {auth} from "./firebaseconfig";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

/**
 * Main App component that handles user authentication, displays a calendar,
 * and manages notifications.
 *
 * @component
 * @return {JSX.Element} The rendered app component.
 */
function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [date, setDate] = useState(new Date());
  const [details, setDetails] = useState({calendar: "", events: ""});
  const [editText, setEditText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("calendar");
  const [repeatFrequency, setRepeatFrequency] = useState("once");
  const [notifications, setNotifications] = useState([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const role =
    user && user.email === "admin@aitdgoa.edu.in" ? "admin" : "user";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? firebaseUser : null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
          auth,
          username,
          password,
      );
      setUser(userCredential.user);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) {
      return;
    }
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const handleDateChange = async (selectedDate) => {
    setDate(selectedDate);
    setIsDetailsLoading(true);
    const formattedDate = selectedDate.toLocaleDateString("en-CA");
    try {
      const response = await fetch(
          `http://localhost:3001/get-details/${formattedDate}`,
      );
      const data = await response.json();
      setDetails({
        calendar: data.calendar || "",
        events: data.events || "",
      });
      setEditText(
        selectedCategory === "calendar" ? +
        data.calendar || "" : data.events || "",
      );
    } catch (error) {
      setDetails({
        calendar: "Error fetching details",
        events: "Error fetching details",
      });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const saveDetails = async () => {
    setIsSaving(true);
    const formattedDate = date.toLocaleDateString("en-CA");
    try {
      const response = await fetch("http://localhost:3001/add-details", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          date: formattedDate,
          category: selectedCategory,
          details: editText,
          frequency: repeatFrequency,
        }),
      });
      if (response.ok) {
        alert(
            `Details saved for ${date.toDateString()} in`+
          `${selectedCategory} category with a ${repeatFrequency} repeat.`,
        );
        handleDateChange(date);
      } else {
        alert("Error saving details");
      }
    } catch (error) {
      alert("Error saving details: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchNotifications = async () => {
    setIsNotifLoading(true);
    try {
      const response = await fetch("http://localhost:3001/upcoming-events");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    } finally {
      setIsNotifLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(true);
    fetchNotifications();
  };

  const formatDate = (dateStr) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
    }
    return dateStr;
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setEditText(value === "calendar" ? details.calendar : details.events);
  };

  if (!user) {
    return (
      <div className="login-container">
        <img src="192.png" alt="Login" className="login-image" />
        <h1>Login</h1>
        <input
          type="email"
          name="username"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {loginError && <p className="error">{loginError}</p>}
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-bar">
        <span className="admin-info">Hello, {user.email}</span>
        <button
          className="notif-btn"
          onClick={handleBellClick}
          style={{
            marginLeft: "74%",
            marginRight: "7px",
            fontSize: "18px",
            background: "#fff",
            border: "none",
            borderRadius: "4px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
            cursor: "pointer",
            transition: "box-shadow 0.3s ease",
          }}
        >
          🔔
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="content">
        <div className="left-panel">
          <Calendar
            onChange={handleDateChange}
            value={date}
            className="custom-calendar"
          />
        </div>
        <div className="right-panel">
          <h1>Academic Calendar</h1>
          <p className="selected-date">Selected Date: {date.toDateString()}</p>
          <div className="category-selection">
            <label>
              <input
                type="radio"
                name="category"
                value="calendar"
                checked={selectedCategory === "calendar"}
                onChange={handleCategoryChange}
              />
              Calendar
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="events"
                checked={selectedCategory === "events"}
                onChange={handleCategoryChange}
              />
              Events
            </label>
          </div>
          {role === "admin" && (
            <div className="admin-controls">
              <p>
                Add/Edit{" "}
                {selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)}{" "}
                Details
              </p>
              <textarea
                placeholder={`Add details for the selected ${selectedCategory}`}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="details-textarea"
              />
              <div className="frequency-selection">
                <p>Select Repeat Frequency:</p>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="once"
                    checked={repeatFrequency === "once"}
                    onChange={(e) => setRepeatFrequency(e.target.value)}
                  />
                  Once
                </label>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={repeatFrequency === "weekly"}
                    onChange={(e) => setRepeatFrequency(e.target.value)}
                  />
                  Weekly
                </label>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={repeatFrequency === "monthly"}
                    onChange={(e) => setRepeatFrequency(e.target.value)}
                  />
                  Monthly
                </label>
                <label>
                  <input
                    type="radio"
                    name="frequency"
                    value="yearly"
                    checked={repeatFrequency === "yearly"}
                    onChange={(e) => setRepeatFrequency(e.target.value)}
                  />
                  Yearly
                </label>
              </div>
              <br />
              <button className="save-button" onClick={saveDetails} disabled
                ={isSaving}>
                {isSaving ? "Saving..." : "Save Details"}
              </button>
              <hr />
            </div>
          )}
          <p>
            <strong>
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}{" "}
              Details:
            </strong>
          </p>
          {isDetailsLoading ? (
  <p>Loading details...</p>
) : (
          <pre className="details-display">
            {(selectedCategory === "calendar" ?
               details.calendar :
               details.events) || "No details for this date"}
          </pre>
          )}
        </div>
      </div>
      {showNotifications && (
        <div className="notifications-modal">
          <div className="notifications-content">
            <h2>Upcoming Events</h2>
            <button
              className="close-modal"
              onClick={() => setShowNotifications(false)}
            >
              Close
            </button>
            {isNotifLoading ? (
              <p>Loading notifications...</p>
            ) : (
              <>
                {notifications.length > 0 ? (
                  <ul>
                    {notifications.map((item, index) => (
                      <li key={index}>
                        <strong>{formatDate(item.date)}</strong>: {item.events}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming events.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

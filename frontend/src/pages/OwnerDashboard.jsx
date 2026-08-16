import { useEffect, useState } from "react";
import api from "../services/api";

function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [showRegister, setShowRegister] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // LOAD OWNER DASHBOARD
  // ========================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/dashboard");

      console.log(
        "Owner dashboard:",
        response.data
      );

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }

    } catch (error) {
      console.error(
        "Owner dashboard error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load owner dashboard"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);


  // ========================================
  // CREATE STORE
  // ========================================

  const handleCreateStore = async (e) => {
    e.preventDefault();

    setCreating(true);
    setError("");

    try {

      const response = await api.post(
        "/stores",
        {
          name: storeName,
          email: storeEmail,
          address: storeAddress
        }
      );

      console.log(
        "Create store response:",
        response.data
      );

      if (response.data.success) {

        alert("Store created successfully!");

        // Clear form
        setStoreName("");
        setStoreEmail("");
        setStoreAddress("");

        setShowRegister(false);

        // Reload dashboard
        await loadDashboard();
      }

    } catch (error) {

      console.error(
        "Create store error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to create store"
      );

    } finally {
      setCreating(false);
    }
  };


  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };


  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>
          Loading Owner Dashboard...
        </h2>
      </div>
    );
  }


  // ========================================
  // ERROR
  // ========================================

  if (error && !dashboard) {
    return (
      <div style={styles.center}>

        <div style={styles.error}>
          {error}
        </div>

        <button
          onClick={loadDashboard}
          style={styles.button}
        >
          Retry
        </button>

      </div>
    );
  }


  // ========================================
  // NO STORE
  // ========================================

  if (!dashboard) {
    return (
      <div style={styles.center}>

        <div style={styles.noStore}>

          <h2>
            You don't have a store
          </h2>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {!showRegister ? (

            <button
              onClick={() =>
                setShowRegister(true)
              }
              style={styles.button}
            >
              Register Your Store
            </button>

          ) : (

            <form
              onSubmit={handleCreateStore}
              style={styles.form}
            >

              <h2>
                Register Your Store
              </h2>

              <input
                type="text"
                placeholder="Store Name"
                value={storeName}
                onChange={(e) =>
                  setStoreName(e.target.value)
                }
                required
                style={styles.input}
              />

              <input
                type="email"
                placeholder="Store Email"
                value={storeEmail}
                onChange={(e) =>
                  setStoreEmail(e.target.value)
                }
                required
                style={styles.input}
              />

              <textarea
                placeholder="Store Address"
                value={storeAddress}
                onChange={(e) =>
                  setStoreAddress(e.target.value)
                }
                required
                style={styles.textarea}
              />

              <button
                type="submit"
                disabled={creating}
                style={styles.button}
              >
                {creating
                  ? "Creating Store..."
                  : "Register Store"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowRegister(false)
                }
                style={styles.cancel}
              >
                Cancel
              </button>

            </form>

          )}

        </div>

      </div>
    );
  }


  // ========================================
  // STORE DASHBOARD
  // ========================================

  const store = dashboard.store;

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <header style={styles.header}>

        <h1>
          Owner Dashboard
        </h1>

        <button
          onClick={logout}
          style={styles.logout}
        >
          Logout
        </button>

      </header>


      {/* CONTENT */}

      <main style={styles.container}>

        <h2>
          {store.name}
        </h2>

        <p>
          📧 {store.email}
        </p>

        <p>
          📍 {store.address}
        </p>


        {/* RATING SUMMARY */}

        <div style={styles.stats}>

          <div style={styles.card}>

            <h3>
              Total Ratings
            </h3>

            <p style={styles.number}>
              {dashboard.totalRatings}
            </p>

          </div>


          <div style={styles.card}>

            <h3>
              Average Rating
            </h3>

            <p style={styles.number}>
              ⭐ {dashboard.averageRating}
            </p>

          </div>

        </div>


        {/* RATINGS */}

        <div style={styles.ratings}>

          <h2>
            Customer Ratings
          </h2>

          {dashboard.ratings?.length === 0 ? (

            <p>
              No ratings yet.
            </p>

          ) : (

            dashboard.ratings?.map((item) => (

              <div
                key={item.id}
                style={styles.rating}
              >

                <strong>
                  {item.user?.name}
                </strong>

                <p>
                  ⭐ {item.rating}
                </p>

                <small>
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </small>

              </div>

            ))

          )}

        </div>

      </main>

    </div>
  );
}


// ========================================
// STYLES
// ========================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f6f8"
  },

  header: {
    background: "#2563eb",
    color: "white",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  logout: {
    background: "white",
    color: "#2563eb",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  container: {
    maxWidth: "1000px",
    margin: "auto",
    padding: "40px"
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    padding: "30px"
  },

  noStore: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)",
    width: "400px",
    maxWidth: "90%"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px"
  },

  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px"
  },

  textarea: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    minHeight: "100px",
    resize: "vertical"
  },

  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  },

  cancel: {
    background: "#666",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px"
  },

  stats: {
    display: "flex",
    gap: "20px",
    marginTop: "30px"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    flex: 1,
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)"
  },

  number: {
    fontSize: "28px",
    fontWeight: "bold"
  },

  ratings: {
    background: "white",
    marginTop: "30px",
    padding: "25px",
    borderRadius: "10px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)"
  },

  rating: {
    borderBottom: "1px solid #eee",
    padding: "15px 0"
  }
};

export default OwnerDashboard;
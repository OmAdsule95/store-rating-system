import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add User form
  const [showUserForm, setShowUserForm] = useState(false);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userRole, setUserRole] = useState("USER");

  // Store details for OWNER
  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  const [formLoading, setFormLoading] = useState(false);

  // ==================================================
  // LOAD ADMIN DASHBOARD
  // ==================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        usersResponse,
        storesResponse
      ] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/stores")
      ]);

      setData(
        dashboardResponse.data.data
      );

      setUsers(
        usersResponse.data.users || []
      );

      setStores(
        storesResponse.data.stores || []
      );

    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load admin dashboard"
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // LOAD WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };


  // ==================================================
  // RESET USER FORM
  // ==================================================

  const resetUserForm = () => {
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserAddress("");

    setUserRole("USER");

    setStoreName("");
    setStoreEmail("");
    setStoreAddress("");
  };


  // ==================================================
  // CREATE USER / OWNER
  // ==================================================

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);

      const response = await api.post(
        "/admin/users",
        {
          name: userName,
          email: userEmail,
          password: userPassword,
          address: userAddress,
          role: userRole,

          ...(userRole === "OWNER"
            ? {
                storeName,
                storeEmail,
                storeAddress
              }
            : {})
        }
      );

      alert(
        response.data.message ||
        "User created successfully"
      );

      resetUserForm();

      setShowUserForm(false);

      await loadDashboard();

    } catch (error) {
      console.error(
        "Create user error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to create user"
      );

    } finally {
      setFormLoading(false);
    }
  };


  // ==================================================
  // DELETE USER
  // ==================================================

  const handleDeleteUser = async (user) => {

    // ADMIN CANNOT BE DELETED
    if (user.role === "ADMIN") {
      alert(
        "Admin accounts cannot be deleted."
      );

      return;
    }


    // CONFIRMATION
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?\n\n` +
      `Role: ${user.role}\n` +
      `Email: ${user.email}\n\n` +
      `If this is an OWNER, their store will also be deleted.\n\n` +
      `This action cannot be undone.`
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await api.delete(
        `/admin/users/${user.id}`
      );


      alert(
        response.data.message ||
        "User deleted successfully"
      );


      // Reload dashboard
      await loadDashboard();


    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to delete user"
      );
    }
  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (
      <div style={styles.center}>

        <h2>
          Loading Admin Dashboard...
        </h2>

      </div>
    );
  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {

    return (
      <div style={styles.center}>

        <div style={styles.error}>
          {error}
        </div>

        <button
          onClick={loadDashboard}
          style={styles.retry}
        >
          Retry
        </button>

      </div>
    );
  }


  // ==================================================
  // NO DATA
  // ==================================================

  if (!data) {

    return (
      <div style={styles.center}>

        <h2>
          No dashboard data found
        </h2>

        <button
          onClick={loadDashboard}
          style={styles.retry}
        >
          Reload
        </button>

      </div>
    );
  }


  // ==================================================
  // ADMIN DASHBOARD
  // ==================================================

  return (

    <div style={styles.page}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header style={styles.header}>

        <h1 style={styles.title}>
          Admin Dashboard
        </h1>

        <button
          onClick={logout}
          style={styles.logout}
        >
          Logout
        </button>

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main style={styles.container}>


        {/* ==================================================
            ADD USER BUTTON
        ================================================== */}

        <div style={styles.actions}>

          <button
            style={styles.addUserButton}

            onClick={() => {

              resetUserForm();

              setShowUserForm(true);

            }}
          >
            ➕ Add User
          </button>

        </div>


        {/* ==================================================
            ADD USER FORM
        ================================================== */}

        {showUserForm && (

          <div style={styles.formCard}>

            <div style={styles.formHeader}>

              <h2>
                Add User
              </h2>

              <button
                style={styles.closeButton}

                onClick={() => {

                  setShowUserForm(false);

                  resetUserForm();

                }}
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={handleCreateUser}
            >


              {/* NAME */}

              <input
                style={styles.input}

                type="text"

                placeholder="Full Name"

                value={userName}

                onChange={(e) =>
                  setUserName(
                    e.target.value
                  )
                }

                required
              />


              {/* EMAIL */}

              <input
                style={styles.input}

                type="email"

                placeholder="Email"

                value={userEmail}

                onChange={(e) =>
                  setUserEmail(
                    e.target.value
                  )
                }

                required
              />


              {/* PASSWORD */}

              <input
                style={styles.input}

                type="password"

                placeholder="Password"

                value={userPassword}

                onChange={(e) =>
                  setUserPassword(
                    e.target.value
                  )
                }

                required
              />


              {/* ADDRESS */}

              <textarea
                style={styles.textarea}

                placeholder="Address"

                value={userAddress}

                onChange={(e) =>
                  setUserAddress(
                    e.target.value
                  )
                }

                required
              />


              {/* ROLE */}

              <label style={styles.label}>
                Register as:
              </label>


              <div style={styles.radioContainer}>

                {/* USER */}

                <label style={styles.radioLabel}>

                  <input
                    type="radio"

                    name="role"

                    value="USER"

                    checked={
                      userRole === "USER"
                    }

                    onChange={() =>
                      setUserRole("USER")
                    }
                  />

                  <span>
                    Customer
                  </span>

                </label>


                {/* OWNER */}

                <label style={styles.radioLabel}>

                  <input
                    type="radio"

                    name="role"

                    value="OWNER"

                    checked={
                      userRole === "OWNER"
                    }

                    onChange={() =>
                      setUserRole("OWNER")
                    }
                  />

                  <span>
                    Store Owner
                  </span>

                </label>

              </div>


              {/* ==================================================
                  STORE DETAILS
                  ONLY FOR OWNER
              ================================================== */}

              {userRole === "OWNER" && (

                <div
                  style={styles.ownerSection}
                >

                  <h3>
                    Store Details
                  </h3>


                  {/* STORE NAME */}

                  <input
                    style={styles.input}

                    type="text"

                    placeholder="Store Name"

                    value={storeName}

                    onChange={(e) =>
                      setStoreName(
                        e.target.value
                      )
                    }

                    required
                  />


                  {/* STORE EMAIL */}

                  <input
                    style={styles.input}

                    type="email"

                    placeholder="Store Email"

                    value={storeEmail}

                    onChange={(e) =>
                      setStoreEmail(
                        e.target.value
                      )
                    }

                    required
                  />


                  {/* STORE ADDRESS */}

                  <textarea
                    style={styles.textarea}

                    placeholder="Store Address"

                    value={storeAddress}

                    onChange={(e) =>
                      setStoreAddress(
                        e.target.value
                      )
                    }

                    required
                  />

                </div>

              )}


              {/* CREATE BUTTON */}

              <button
                type="submit"

                style={styles.submitButton}

                disabled={formLoading}
              >

                {formLoading
                  ? "Creating..."
                  : userRole === "OWNER"
                  ? "Create Owner & Store"
                  : "Create User"}

              </button>

            </form>

          </div>

        )}


        {/* ==================================================
            SYSTEM OVERVIEW
        ================================================== */}

        <h2 style={styles.heading}>
          System Overview
        </h2>


        <div style={styles.stats}>


          {/* USERS */}

          <div style={styles.statCard}>

            <div style={styles.icon}>
              👥
            </div>

            <h3>
              Total Users
            </h3>

            <p style={styles.number}>
              {data.totalUsers}
            </p>

          </div>


          {/* STORES */}

          <div style={styles.statCard}>

            <div style={styles.icon}>
              🏪
            </div>

            <h3>
              Total Stores
            </h3>

            <p style={styles.number}>
              {data.totalStores}
            </p>

          </div>


          {/* RATINGS */}

          <div style={styles.statCard}>

            <div style={styles.icon}>
              ⭐
            </div>

            <h3>
              Total Ratings
            </h3>

            <p style={styles.number}>
              {data.totalRatings}
            </p>

          </div>

        </div>


        {/* ==================================================
            USERS TABLE
        ================================================== */}

        <div style={styles.section}>

          <h2 style={styles.sectionTitle}>
            👥 Registered Users & Owners
          </h2>


          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Name
                  </th>

                  <th style={styles.th}>
                    Email
                  </th>

                  <th style={styles.th}>
                    Address
                  </th>

                  <th style={styles.th}>
                    Role
                  </th>

                  <th style={styles.th}>
                    Store
                  </th>

                  <th style={styles.th}>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                  >

                    {/* ID */}

                    <td style={styles.td}>
                      {user.id}
                    </td>


                    {/* NAME */}

                    <td style={styles.td}>
                      {user.name}
                    </td>


                    {/* EMAIL */}

                    <td style={styles.td}>
                      {user.email}
                    </td>


                    {/* ADDRESS */}

                    <td style={styles.td}>
                      {user.address}
                    </td>


                    {/* ROLE */}

                    <td style={styles.td}>

                      <span
                        style={{
                          ...styles.role,

                          ...(user.role ===
                          "ADMIN"
                            ? styles.adminRole
                            : user.role ===
                              "OWNER"
                            ? styles.ownerRole
                            : styles.userRole)
                        }}
                      >
                        {user.role}
                      </span>

                    </td>


                    {/* STORE */}

                    <td style={styles.td}>

                      {user.role ===
                        "OWNER" &&
                      user.store ? (

                        <div>

                          <strong>
                            {user.store.name}
                          </strong>

                          <br />

                          <small>
                            {user.store.email}
                          </small>

                          <br />

                          <small>
                            {user.store.address}
                          </small>

                          <br />

                          ⭐{" "}

                          {user.store
                            .averageRating ??
                            "No ratings"}

                        </div>

                      ) : (

                        "—"

                      )}

                    </td>


                    {/* ACTION */}

                    <td style={styles.td}>

                      {user.role === "ADMIN" ? (

                        <span
                          style={styles.protected}
                        >
                          🔒 Protected
                        </span>

                      ) : (

                        <button
                          style={
                            styles.deleteButton
                          }

                          onClick={() =>
                            handleDeleteUser(
                              user
                            )
                          }
                        >
                          🗑 Delete
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* ==================================================
            STORES TABLE
        ================================================== */}

        <div style={styles.section}>

          <h2 style={styles.sectionTitle}>
            🏪 Registered Stores
          </h2>


          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Store Name
                  </th>

                  <th style={styles.th}>
                    Email
                  </th>

                  <th style={styles.th}>
                    Address
                  </th>

                  <th style={styles.th}>
                    Rating
                  </th>

                </tr>

              </thead>


              <tbody>

                {stores.map((store) => (

                  <tr
                    key={store.id}
                  >

                    <td style={styles.td}>
                      {store.id}
                    </td>

                    <td style={styles.td}>
                      {store.name}
                    </td>

                    <td style={styles.td}>
                      {store.email}
                    </td>

                    <td style={styles.td}>
                      {store.address}
                    </td>

                    <td style={styles.td}>

                      ⭐{" "}

                      {store.rating ||
                        "No ratings"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* ==================================================
            REFRESH
        ================================================== */}

        <button
          onClick={loadDashboard}
          style={styles.refresh}
        >
          🔄 Refresh Data
        </button>


      </main>

    </div>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f6f8"
  },


  header: {
    background: "#111827",
    color: "white",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },


  title: {
    margin: 0,
    fontSize: "28px"
  },


  logout: {
    background: "white",
    color: "#111827",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px"
  },


  container: {
    maxWidth: "1400px",
    margin: "auto",
    padding: "40px"
  },


  actions: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px"
  },


  addUserButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px"
  },


  formCard: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "35px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)"
  },


  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },


  closeButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "7px 12px",
    cursor: "pointer"
  },


  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px"
  },


  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "90px",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
    resize: "vertical"
  },


  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "12px"
  },


  radioContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px"
  },


  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "16px"
  },


  ownerSection: {
    padding: "20px",
    marginBottom: "20px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },


  submitButton: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px"
  },


  heading: {
    marginBottom: "25px"
  },


  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px"
  },


  statCard: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)"
  },


  icon: {
    fontSize: "40px",
    marginBottom: "10px"
  },


  number: {
    fontSize: "38px",
    fontWeight: "bold",
    margin: "10px 0",
    color: "#2563eb"
  },


  section: {
    background: "white",
    marginTop: "35px",
    padding: "30px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.08)"
  },


  sectionTitle: {
    marginTop: 0,
    marginBottom: "25px"
  },


  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },


  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px"
  },


  th: {
    background: "#111827",
    color: "white",
    padding: "14px",
    textAlign: "left",
    border: "1px solid #ddd"
  },


  td: {
    padding: "14px",
    border: "1px solid #ddd",
    verticalAlign: "top"
  },


  role: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "12px"
  },


  adminRole: {
    background: "#fee2e2",
    color: "#b91c1c"
  },


  ownerRole: {
    background: "#fef3c7",
    color: "#92400e"
  },


  userRole: {
    background: "#dbeafe",
    color: "#1d4ed8"
  },


  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px"
  },


  protected: {
    background: "#e5e7eb",
    color: "#374151",
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "bold"
  },


  refresh: {
    marginTop: "30px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px"
  },


  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "15px"
  },


  retry: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "6px",
    cursor: "pointer"
  },


  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px"
  }

};


export default AdminDashboard;
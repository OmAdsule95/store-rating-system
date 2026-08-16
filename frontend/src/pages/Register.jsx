import { useState } from "react";
import api from "../services/api";

function Register() {

  // ==================================================
  // USER DETAILS
  // ==================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  // ==================================================
  // ROLE
  // ==================================================

  const [role, setRole] = useState("USER");

  // ==================================================
  // STORE DETAILS
  // ==================================================

  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  // ==================================================
  // STATUS
  // ==================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      setLoading(true);

      const requestData = {
        name,
        email,
        password,
        address,
        role
      };


      // ---------------------------------------------
      // Add store information for OWNER
      // ---------------------------------------------

      if (role === "OWNER") {

        requestData.storeName = storeName;
        requestData.storeEmail = storeEmail;
        requestData.storeAddress = storeAddress;

      }


      // ---------------------------------------------
      // API REQUEST
      // ---------------------------------------------

      const response =
        await api.post(
          "/auth/register",
          requestData
        );


      // ---------------------------------------------
      // SUCCESS
      // ---------------------------------------------

      setSuccess(
        response.data.message ||
        "Account created successfully"
      );


      // Clear fields

      setName("");
      setEmail("");
      setPassword("");
      setAddress("");

      setStoreName("");
      setStoreEmail("");
      setStoreAddress("");

      setRole("USER");


      // ---------------------------------------------
      // Go to login after 1.5 seconds
      // ---------------------------------------------

      setTimeout(() => {

        window.location.href = "/";

      }, 1500);


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // BACK TO LOGIN
  // ==================================================

  const backToLogin = () => {

    window.location.href = "/";

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        {/* ==================================================
            TITLE
        ================================================== */}

        <h1 style={styles.title}>
          Store Rating System
        </h1>

        <h2 style={styles.heading}>
          Create Account
        </h2>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div style={styles.error}>
            {error}
          </div>

        )}


        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (

          <div style={styles.success}>
            {success}
          </div>

        )}


        <form
          onSubmit={handleRegister}
        >


          {/* ==================================================
              FULL NAME
          ================================================== */}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={styles.input}
            required
          />


          {/* ==================================================
              EMAIL
          ================================================== */}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
            required
          />


          {/* ==================================================
              PASSWORD
          ================================================== */}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
            required
          />


          {/* ==================================================
              ADDRESS
          ================================================== */}

          <textarea
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            style={styles.textarea}
            required
          />


          {/* ==================================================
              ROLE SELECTION
          ================================================== */}

          <div style={styles.roleSection}>

            <h3 style={styles.roleTitle}>
              Register as:
            </h3>


            {/* CUSTOMER */}

            <label style={styles.roleOption}>

              <input
                type="radio"
                name="role"
                value="USER"
                checked={
                  role === "USER"
                }
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
                style={styles.radio}
              />

              <span>
                Customer
              </span>

            </label>


            {/* STORE OWNER */}

            <label style={styles.roleOption}>

              <input
                type="radio"
                name="role"
                value="OWNER"
                checked={
                  role === "OWNER"
                }
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
                style={styles.radio}
              />

              <span>
                Store Owner
              </span>

            </label>

          </div>


          {/* ==================================================
              STORE INFORMATION
              ONLY OWNER
          ================================================== */}

          {role === "OWNER" && (

            <div style={styles.storeSection}>

              <h3 style={styles.storeTitle}>
                Store Information
              </h3>


              {/* STORE NAME */}

              <input
                type="text"
                placeholder="Store Name"
                value={storeName}
                onChange={(e) =>
                  setStoreName(
                    e.target.value
                  )
                }
                style={styles.input}
                required
              />


              {/* STORE EMAIL */}

              <input
                type="email"
                placeholder="Store Email"
                value={storeEmail}
                onChange={(e) =>
                  setStoreEmail(
                    e.target.value
                  )
                }
                style={styles.input}
                required
              />


              {/* STORE ADDRESS */}

              <textarea
                placeholder="Store Address"
                value={storeAddress}
                onChange={(e) =>
                  setStoreAddress(
                    e.target.value
                  )
                }
                style={styles.textarea}
                required
              />

            </div>

          )}


          {/* ==================================================
              CREATE ACCOUNT
          ================================================== */}

          <button
            type="submit"
            style={styles.createButton}
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>


        {/* ==================================================
            LOGIN
        ================================================== */}

        <p style={styles.loginText}>
          Already have an account?
        </p>

        <button
          type="button"
          onClick={backToLogin}
          style={styles.loginButton}
        >
          Back to Login
        </button>

      </div>

    </div>

  );
}


// ==================================================
// STYLES
// ==================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },


  card: {
    width: "100%",
    maxWidth: "580px",
    background: "white",
    padding: "35px",
    borderRadius: "14px",
    boxShadow:
      "0 4px 25px rgba(0,0,0,0.08)",
    boxSizing: "border-box"
  },


  title: {
    textAlign: "center",
    fontSize: "42px",
    margin: "0 0 20px 0",
    color: "#111827"
  },


  heading: {
    textAlign: "center",
    fontSize: "30px",
    margin: "0 0 30px 0",
    color: "#111827"
  },


  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    marginBottom: "18px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "18px",
    outline: "none"
  },


  textarea: {
    width: "100%",
    minHeight: "120px",
    boxSizing: "border-box",
    padding: "14px 16px",
    marginBottom: "18px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "18px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none"
  },


  // ==================================================
  // ROLE SECTION
  // ==================================================

  roleSection: {
    marginTop: "5px",
    marginBottom: "25px"
  },


  roleTitle: {
    margin: "0 0 15px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827"
  },


  roleOption: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
    cursor: "pointer",
    fontSize: "18px",
    color: "#111827"
  },


  radio: {
    width: "20px",
    height: "20px",
    margin: "0",
    padding: "0",
    cursor: "pointer",
    flexShrink: "0"
  },


  // ==================================================
  // STORE SECTION
  // ==================================================

  storeSection: {
    marginTop: "10px",
    padding: "20px",
    background: "#f9fafb",
    borderRadius: "10px",
    border:
      "1px solid #e5e7eb",
    marginBottom: "20px"
  },


  storeTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#111827"
  },


  // ==================================================
  // BUTTONS
  // ==================================================

  createButton: {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "5px"
  },


  loginButton: {
    width: "100%",
    background: "#555",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600"
  },


  loginText: {
    textAlign: "center",
    fontSize: "17px",
    margin:
      "25px 0 12px 0",
    color: "#111827"
  },


  // ==================================================
  // MESSAGES
  // ==================================================

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "14px",
    borderRadius: "7px",
    marginBottom: "20px",
    fontSize: "16px"
  },


  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "14px",
    borderRadius: "7px",
    marginBottom: "20px",
    fontSize: "16px"
  }

};


export default Register;
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
  // STATUS
  // ==================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==================================================
  // REGISTER CUSTOMER
  // ==================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      setLoading(true);

      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
          address,

          // -----------------------------------------
          // Public registration is always CUSTOMER
          // -----------------------------------------

          role: "USER"
        }
      );


      // ==================================================
      // SUCCESS
      // ==================================================

      setSuccess(
        response.data.message ||
        "Account created successfully"
      );


      // Clear fields

      setName("");
      setEmail("");
      setPassword("");
      setAddress("");


      // ==================================================
      // REDIRECT TO LOGIN
      // ==================================================

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


        {/* ==================================================
            REGISTRATION FORM
        ================================================== */}

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


  loginText: {
    textAlign: "center",
    fontSize: "17px",
    margin:
      "25px 0 12px 0",
    color: "#111827"
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
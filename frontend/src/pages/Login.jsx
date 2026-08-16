import { useState } from "react";
import api from "../services/api";

function Login() {
  // ==================================================
  // LOGIN STATE
  // ==================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ==================================================
  // CHANGE PASSWORD STATE
  // ==================================================

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [changeEmail, setChangeEmail] = useState("");
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changeLoading, setChangeLoading] =
    useState(false);

  const [changeError, setChangeError] =
    useState("");

  const [changeSuccess, setChangeSuccess] =
    useState("");


  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      const data = response.data;

      // Save token
      localStorage.setItem(
        "token",
        data.token
      );

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      // ==================================================
      // REDIRECT BASED ON ROLE
      // ==================================================

      if (data.user.role === "ADMIN") {

  window.location.href = "/admin";

} else if (
  data.user.role === "OWNER"
) {

  window.location.href = "/owner";

} else {

  window.location.href = "/user";

}

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Invalid email or password"
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // CHANGE PASSWORD
  // ==================================================

  const handleChangePassword = async (e) => {

    e.preventDefault();

    setChangeError("");
    setChangeSuccess("");


    // ---------------------------------------------
    // Check password match
    // ---------------------------------------------

    if (
      newPassword !==
      confirmPassword
    ) {

      setChangeError(
        "New passwords do not match"
      );

      return;
    }


    // ---------------------------------------------
    // Password length
    // ---------------------------------------------

    if (newPassword.length < 6) {

      setChangeError(
        "New password must be at least 6 characters"
      );

      return;
    }


    try {

      setChangeLoading(true);


      const response =
        await api.post(
          "/auth/change-password",
          {
            email: changeEmail,
            currentPassword,
            newPassword,
            confirmPassword
          }
        );


      setChangeSuccess(
        response.data.message ||
        "Password changed successfully"
      );


      // Clear fields

      setChangeEmail("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


    } catch (error) {

      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log(
        "RESPONSE:",
        error.response?.data
      );

      console.log(
        "REQUEST URL:",
        error.config?.url
      );


      setChangeError(
        error.response?.data?.message ||
        `Request failed (${error.response?.status || "No response"})`
      );


    } finally {

      setChangeLoading(false);

    }
  };


  // ==================================================
  // GO TO REGISTER
  // ==================================================

  const goToRegister = () => {
    window.location.href = "/register";
  };


  // ==================================================
  // BACK TO LOGIN
  // ==================================================

  const backToLogin = () => {

    setShowChangePassword(false);

    setChangeError("");
    setChangeSuccess("");

    setChangeEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

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


        {/* ==================================================
            LOGIN
        ================================================== */}

        {!showChangePassword ? (

          <>

            <h2 style={styles.heading}>
              Login
            </h2>


            {/* ERROR */}

            {error && (

              <div style={styles.error}>
                {error}
              </div>

            )}


            <form
              onSubmit={handleLogin}
            >


              {/* EMAIL */}

              <label style={styles.label}>
                Email
              </label>

              <input
                style={styles.input}

                type="email"

                placeholder="Enter your email"

                value={email}

                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }

                required
              />


              {/* PASSWORD */}

              <label style={styles.label}>
                Password
              </label>

              <input
                style={styles.input}

                type="password"

                placeholder="Enter your password"

                value={password}

                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }

                required
              />


              {/* LOGIN */}

              <button
                type="submit"

                style={styles.loginButton}

                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Login"}

              </button>

            </form>


            {/* ==================================================
                CHANGE PASSWORD
            ================================================== */}

            <button
              type="button"

              style={styles.changeLink}

              onClick={() => {

                setShowChangePassword(
                  true
                );

                setError("");

              }}
            >

              🔑 Change Password

            </button>


            {/* ==================================================
                CREATE ACCOUNT
            ================================================== */}

            <button
              type="button"

              style={styles.createAccountButton}

              onClick={goToRegister}
            >

              Create Account

            </button>

          </>

        ) : (

          /* ==================================================
             CHANGE PASSWORD PAGE
          ================================================== */

          <>

            <h2 style={styles.heading}>
              Change Password
            </h2>


            <p style={styles.description}>
              Enter your current password
              and choose a new password.
            </p>


            {/* ERROR */}

            {changeError && (

              <div style={styles.error}>
                {changeError}
              </div>

            )}


            {/* SUCCESS */}

            {changeSuccess && (

              <div style={styles.success}>
                {changeSuccess}
              </div>

            )}


            <form
              onSubmit={
                handleChangePassword
              }
            >


              {/* EMAIL */}

              <label style={styles.label}>
                Email
              </label>

              <input
                style={styles.input}

                type="email"

                placeholder="Enter your email"

                value={changeEmail}

                onChange={(e) =>
                  setChangeEmail(
                    e.target.value
                  )
                }

                required
              />


              {/* CURRENT PASSWORD */}

              <label style={styles.label}>
                Current Password
              </label>

              <input
                style={styles.input}

                type="password"

                placeholder="Enter current password"

                value={
                  currentPassword
                }

                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }

                required
              />


              {/* NEW PASSWORD */}

              <label style={styles.label}>
                New Password
              </label>

              <input
                style={styles.input}

                type="password"

                placeholder="Enter new password"

                value={
                  newPassword
                }

                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }

                required
              />


              {/* CONFIRM PASSWORD */}

              <label style={styles.label}>
                Confirm New Password
              </label>

              <input
                style={styles.input}

                type="password"

                placeholder="Confirm new password"

                value={
                  confirmPassword
                }

                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }

                required
              />


              {/* CHANGE PASSWORD */}

              <button
                type="submit"

                style={styles.loginButton}

                disabled={
                  changeLoading
                }
              >

                {changeLoading
                  ? "Changing..."
                  : "Change Password"}

              </button>

            </form>


            {/* ==================================================
                BACK TO LOGIN
            ================================================== */}

            <button
              type="button"

              style={styles.changeLink}

              onClick={backToLogin}
            >

              ← Back to Login

            </button>

          </>

        )}

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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
    padding: "20px"
  },


  card: {
    width: "100%",
    maxWidth: "450px",
    background: "white",
    padding: "35px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.1)"
  },


  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#111827"
  },


  heading: {
    marginBottom: "20px",
    color: "#111827"
  },


  description: {
    color: "#6b7280",
    marginBottom: "20px",
    lineHeight: "1.5"
  },


  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
    color: "#374151"
  },


  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "18px",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none"
  },


  loginButton: {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "13px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "5px"
  },


  changeLink: {
    display: "block",
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#2563eb",
    marginTop: "18px",
    cursor: "pointer",
    fontSize: "14px",
    padding: "8px"
  },


  createAccountButton: {
    display: "block",
    width: "100%",
    background: "#111827",
    color: "white",
    border: "none",
    padding: "13px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "8px"
  },


  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "18px",
    fontSize: "14px"
  },


  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "18px",
    fontSize: "14px"
  }

};


export default Login;
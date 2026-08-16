import { useEffect, useState } from "react";
import api from "../services/api";

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(null);

  // =========================
  // LOAD STORES
  // =========================
  const loadStores = async () => {
    try {
      setError("");

      const response = await api.get("/stores");

      const storeList = response.data.stores || [];

      setStores(storeList);

      // Load user's existing ratings if backend provides them
      const existingRatings = {};

      storeList.forEach((store) => {
        if (
          store.myRating !== undefined &&
          store.myRating !== null
        ) {
          existingRatings[store.id] = store.myRating;
        }
      });

      setRatings(existingRatings);

    } catch (error) {
      console.error("Load stores error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load stores"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD STORES WHEN PAGE OPENS
  // =========================
  useEffect(() => {
    loadStores();
  }, []);

  // =========================
  // SELECT STAR RATING
  // =========================
  const handleRatingChange = (storeId, rating) => {
    setRatings((previousRatings) => ({
      ...previousRatings,
      [storeId]: rating
    }));
  };

  // =========================
  // SUBMIT / UPDATE RATING
  // =========================
  const submitRating = async (storeId) => {
    const rating = ratings[storeId];

    if (!rating) {
      alert("Please select a rating from 1 to 5");
      return;
    }

    try {
      setSubmitting(storeId);

      /*
        First try UPDATE.

        If the user has already rated the store,
        PUT will work.

        If the user has NOT rated the store,
        backend returns 404 and we create
        a new rating using POST.
      */

      try {
        await api.put(`/ratings/${storeId}`, {
          rating: Number(rating)
        });

        alert("Rating updated successfully!");

      } catch (updateError) {

        console.log(
          "Update rating response:",
          updateError.response
        );

        // No existing rating → create one
        if (updateError.response?.status === 404) {

          await api.post("/ratings", {
            storeId: Number(storeId),
            rating: Number(rating)
          });

          alert("Rating submitted successfully!");

        } else {
          throw updateError;
        }
      }

      // Reload stores so overall rating is updated
      await loadStores();

    } catch (error) {
      console.error("Rating error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save rating"
      );

    } finally {
      setSubmitting(null);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  // =========================
  // PAGE
  // =========================
  return (
    <div style={styles.page}>

      {/* =========================
          HEADER
      ========================= */}

      <header style={styles.header}>

        <h1 style={styles.headerTitle}>
          Store Rating System
        </h1>

        <button
          onClick={logout}
          style={styles.logout}
        >
          Logout
        </button>

      </header>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main style={styles.container}>

        <h2 style={styles.heading}>
          Available Stores
        </h2>


        {/* LOADING */}

        {loading && (
          <p>Loading stores...</p>
        )}


        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}


        {/* NO STORES */}

        {!loading &&
          !error &&
          stores.length === 0 && (
            <p>No stores available.</p>
          )}


        {/* =========================
            STORE CARDS
        ========================= */}

        <div style={styles.grid}>

          {stores.map((store) => {

            /*
              Get the selected rating for THIS store.

              Important:
              selectedRating is declared here,
              where it is actually available.
            */

            const selectedRating =
              ratings[store.id] || 0;

            return (

              <div
                key={store.id}
                style={styles.card}
              >

                {/* STORE NAME */}

                <h3 style={styles.storeName}>
                  {store.name}
                </h3>


                {/* STORE EMAIL */}

                <p style={styles.info}>
                  📧 {store.email}
                </p>


                {/* STORE ADDRESS */}

                <p style={styles.info}>
                  📍 {store.address}
                </p>


                {/* OVERALL RATING */}

                <div style={styles.overallRating}>

                  Overall Rating:

                  <strong>
                    {" "}
                    ⭐ {store.overallRating ?? 0}
                  </strong>

                </div>


                <hr style={styles.line} />


                {/* USER RATING */}

                <p style={styles.yourRating}>
                  Your Rating:
                </p>


                {/* STARS */}

                <div style={styles.stars}>

                  {[1, 2, 3, 4, 5].map((star) => (

                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        handleRatingChange(
                          store.id,
                          star
                        )
                      }
                      style={{
                        ...styles.star,

                        color:
                          star <= selectedRating
                            ? "#f59e0b"
                            : "#d1d5db"
                      }}
                    >
                      ★
                    </button>

                  ))}

                </div>


                {/* SUBMIT / UPDATE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    submitRating(store.id)
                  }
                  disabled={
                    submitting === store.id
                  }
                  style={styles.submit}
                >

                  {submitting === store.id
                    ? "Saving..."
                    : selectedRating
                      ? "Update Rating"
                      : "Submit Rating"}

                </button>

              </div>

            );
          })}

        </div>

      </main>

    </div>
  );
}


// ======================================================
// STYLES
// ======================================================

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

  headerTitle: {
    margin: 0,
    fontSize: "28px"
  },

  logout: {
    background: "white",
    color: "#2563eb",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px"
  },

  container: {
    padding: "40px",
    maxWidth: "1200px",
    margin: "auto"
  },

  heading: {
    marginBottom: "25px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.1)"
  },

  storeName: {
    marginTop: 0,
    marginBottom: "12px"
  },

  info: {
    margin: "8px 0"
  },

  overallRating: {
    marginTop: "18px",
    fontSize: "17px"
  },

  line: {
    border: "none",
    borderTop: "1px solid #ddd",
    margin: "20px 0"
  },

  yourRating: {
    marginBottom: "8px"
  },

  stars: {
    display: "flex",
    gap: "5px",
    margin: "10px 0 20px"
  },

  star: {
    background: "transparent",
    border: "none",
    fontSize: "34px",
    cursor: "pointer",
    padding: "0"
  },

  submit: {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px"
  }
};

export default UserDashboard;
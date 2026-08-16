const prisma = require("../config/prisma");

// ======================================================
// GET ALL STORES
// ======================================================

const getStores = async (req, res) => {
  try {
    const {
      name,
      address,
      sortBy = "name",
      order = "asc"
    } = req.query;

    const allowedSortFields = [
      "name",
      "address",
      "createdAt"
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const sortOrder = order === "desc" ? "desc" : "asc";

    const stores = await prisma.store.findMany({
      where: {
        name: name
          ? {
              contains: name
            }
          : undefined,

        address: address
          ? {
              contains: address
            }
          : undefined
      },

      orderBy: {
        [sortField]: sortOrder
      },

      include: {
        ratings: {
          select: {
            rating: true
          }
        }
      }
    });

    const formattedStores = stores.map((store) => {
      let overallRating = 0;

      if (store.ratings.length > 0) {
        const total = store.ratings.reduce(
          (sum, item) => sum + item.rating,
          0
        );

        overallRating = Number(
          (total / store.ratings.length).toFixed(2)
        );
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating
      };
    });

    res.json({
      success: true,
      count: formattedStores.length,
      stores: formattedStores
    });

  } catch (error) {
    console.error("Get stores error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stores"
    });
  }
};


// ======================================================
// CREATE STORE
// OWNER ONLY
// ======================================================

const createStore = async (req, res) => {
  try {

    // IMPORTANT:
    // ownerId comes from JWT/auth middleware.
    // Owner does NOT send ownerId from frontend.

    const ownerId = req.user.id;

    const {
      name,
      email,
      address
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || !email || !address) {
      return res.status(400).json({
        success: false,
        message: "Store name, email and address are required"
      });
    }

    // -----------------------------
    // Check owner role
    // -----------------------------

    if (req.user.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only store owners can create a store"
      });
    }

    // -----------------------------
    // Check if owner already
    // has a store
    // -----------------------------

    const existingStore = await prisma.store.findUnique({
      where: {
        ownerId: ownerId
      }
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "This owner already has a store"
      });
    }

    // -----------------------------
    // Create store
    // -----------------------------

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId
      }
    });

    // -----------------------------
    // Response
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId
      }
    });

  } catch (error) {

    console.error("Create store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create store"
    });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getStores,
  createStore
};
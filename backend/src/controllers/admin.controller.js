const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");


// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getDashboard = async (req, res) => {
  try {

    const totalUsers = await prisma.user.count();

    const totalStores = await prisma.store.count();

    const totalRatings = await prisma.rating.count();

    return res.json({
      success: true,

      data: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin dashboard"
    });
  }
};


// =====================================================
// CREATE USER / OWNER / ADMIN
// =====================================================

const createUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      address,
      role,
      storeName,
      storeEmail,
      storeAddress
    } = req.body;


    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (
      !name ||
      !email ||
      !password ||
      !address
    ) {

      return res.status(400).json({
        success: false,
        message:
          "All user fields are required"
      });
    }


    // =================================================
    // NAME VALIDATION
    // =================================================

    if (
      name.length < 20 ||
      name.length > 60
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Name must be between 20 and 60 characters"
      });
    }


    // =================================================
    // PASSWORD VALIDATION
    // =================================================

    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters"
      });
    }


    // =================================================
    // ROLE VALIDATION
    // =================================================

    const allowedRoles = [
      "USER",
      "OWNER",
      "ADMIN"
    ];

    if (
      !allowedRoles.includes(role)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Allowed roles are USER, OWNER and ADMIN"
      });
    }


    // =================================================
    // CHECK EXISTING EMAIL
    // =================================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email
        }
      });


    if (existingUser) {

      return res.status(409).json({
        success: false,
        message:
          "Email already registered"
      });
    }


    // =================================================
    // OWNER VALIDATION
    // =================================================

    if (role === "OWNER") {

      if (
        !storeName ||
        !storeEmail ||
        !storeAddress
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Store name, store email and store address are required for owners"
        });
      }


      if (
        storeName.length < 3 ||
        storeName.length > 60
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Store name must be between 3 and 60 characters"
        });
      }
    }


    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // =================================================
    // TRANSACTION
    // =================================================

    const result =
      await prisma.$transaction(
        async (tx) => {

          // -------------------------------------------
          // CREATE USER
          // -------------------------------------------

          const user =
            await tx.user.create({

              data: {

                name,

                email,

                password:
                  hashedPassword,

                address,

                role
              }

            });


          let store = null;


          // -------------------------------------------
          // CREATE STORE FOR OWNER
          // -------------------------------------------

          if (role === "OWNER") {

            store =
              await tx.store.create({

                data: {

                  name:
                    storeName,

                  email:
                    storeEmail,

                  address:
                    storeAddress,

                  ownerId:
                    user.id
                }

              });
          }


          return {
            user,
            store
          };

        }
      );


    // =================================================
    // RESPONSE
    // =================================================

    let message;

    if (role === "ADMIN") {

      message =
        "Admin created successfully";

    } else if (role === "OWNER") {

      message =
        "Store owner and store created successfully";

    } else {

      message =
        "User created successfully";
    }


    return res.status(201).json({

      success: true,

      message,

      user: {

        id:
          result.user.id,

        name:
          result.user.name,

        email:
          result.user.email,

        address:
          result.user.address,

        role:
          result.user.role

      },

      ...(result.store && {

        store: {

          id:
            result.store.id,

          name:
            result.store.name,

          email:
            result.store.email,

          address:
            result.store.address,

          ownerId:
            result.store.ownerId

        }

      })

    });

  } catch (error) {

    console.error(
      "Admin create user error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to create user"

    });
  }
};


// =====================================================
// CREATE STORE
// =====================================================

const createStore = async (req, res) => {
  try {

    const {
      name,
      email,
      address,
      ownerId
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
      !name ||
      !email ||
      !address ||
      !ownerId
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Store name, email, address and owner are required"
      });
    }


    // =================================================
    // CHECK OWNER
    // =================================================

    const owner =
      await prisma.user.findUnique({

        where: {
          id: Number(ownerId)
        }

      });


    if (!owner) {

      return res.status(404).json({
        success: false,
        message:
          "Owner not found"
      });
    }


    if (owner.role !== "OWNER") {

      return res.status(400).json({
        success: false,
        message:
          "Selected user is not an owner"
      });
    }


    // =================================================
    // CHECK EXISTING STORE
    // =================================================

    const existingStore =
      await prisma.store.findFirst({

        where: {
          ownerId: owner.id
        }

      });


    if (existingStore) {

      return res.status(409).json({
        success: false,
        message:
          "This owner already has a store"
      });
    }


    // =================================================
    // CREATE STORE
    // =================================================

    const store =
      await prisma.store.create({

        data: {

          name,

          email,

          address,

          ownerId:
            owner.id

        }

      });


    return res.status(201).json({

      success: true,

      message:
        "Store created successfully",

      store

    });

  } catch (error) {

    console.error(
      "Create store error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to create store"

    });
  }
};


// =====================================================
// GET ALL USERS
// =====================================================

const getUsers = async (req, res) => {
  try {

    const users =
      await prisma.user.findMany({

        orderBy: {
          id: "asc"
        },

        select: {

          id: true,

          name: true,

          email: true,

          address: true,

          role: true,

          createdAt: true

        }

      });


    return res.json({

      success: true,

      count:
        users.length,

      users

    });

  } catch (error) {

    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch users"

    });
  }
};


// =====================================================
// GET ALL STORES
// =====================================================

const getStores = async (req, res) => {
  try {

    const stores =
      await prisma.store.findMany({

        orderBy: {
          id: "asc"
        },

        include: {

          owner: {

            select: {

              id: true,

              name: true,

              email: true

            }

          },

          ratings: {

            select: {

              rating: true

            }

          }

        }

      });


    // =================================================
    // CALCULATE AVERAGE RATING
    // =================================================

    const formattedStores =
      stores.map((store) => {

        let overallRating = 0;


        if (
          store.ratings &&
          store.ratings.length > 0
        ) {

          const total =
            store.ratings.reduce(
              (sum, item) =>
                sum + item.rating,
              0
            );


          overallRating =
            Number(
              (
                total /
                store.ratings.length
              ).toFixed(2)
            );
        }


        return {

          id:
            store.id,

          name:
            store.name,

          email:
            store.email,

          address:
            store.address,

          owner:
            store.owner,

          overallRating

        };

      });


    return res.json({

      success: true,

      count:
        formattedStores.length,

      stores:
        formattedStores

    });

  } catch (error) {

    console.error(
      "Get admin stores error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch stores"

    });
  }
};


// =====================================================
// GET USER DETAILS
// =====================================================

const getUserDetails = async (req, res) => {
  try {

    const userId =
      Number(req.params.id);


    if (
      Number.isNaN(userId)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid user ID"

      });
    }


    const user =
      await prisma.user.findUnique({

        where: {
          id: userId
        },

        select: {

          id: true,

          name: true,

          email: true,

          address: true,

          role: true,

          createdAt: true,

          stores: {

            select: {

              id: true,

              name: true,

              email: true,

              address: true

            }

          }

        }

      });


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });
    }


    return res.json({

      success: true,

      user

    });

  } catch (error) {

    console.error(
      "Get user details error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch user details"

    });
  }
};


// =====================================================
// DELETE USER
// =====================================================

const deleteUser = async (req, res) => {
  try {

    const userId =
      Number(req.params.id);


    if (
      Number.isNaN(userId)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid user ID"

      });
    }


    // =================================================
    // FIND USER
    // =================================================

    const user =
      await prisma.user.findUnique({

        where: {
          id: userId
        }

      });


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });
    }


    // =================================================
    // DELETE ADMIN
    // =================================================
    //
    // Admin deletion is allowed now because
    // multiple admins are allowed.
    //
    // The currently logged-in admin cannot delete
    // themselves.
    // =================================================

    if (
      req.user &&
      Number(req.user.id) === userId
    ) {

      return res.status(400).json({

        success: false,

        message:
          "You cannot delete your own account"

      });
    }


    // =================================================
    // DELETE USER
    // =================================================

    await prisma.$transaction(
      async (tx) => {

        // -------------------------------------------
        // Delete ratings made by this user
        // -------------------------------------------

        await tx.rating.deleteMany({

          where: {
            userId: userId
          }

        });


        // -------------------------------------------
        // If OWNER, delete their stores
        // -------------------------------------------

        await tx.store.deleteMany({

          where: {
            ownerId: userId
          }

        });


        // -------------------------------------------
        // Delete user
        // -------------------------------------------

        await tx.user.delete({

          where: {
            id: userId
          }

        });

      }
    );


    return res.json({

      success: true,

      message:
        "User deleted successfully"

    });

  } catch (error) {

    console.error(
      "Delete user error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to delete user"

    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  getDashboard,

  createUser,

  createStore,

  getUsers,

  getStores,

  getUserDetails,

  deleteUser

};
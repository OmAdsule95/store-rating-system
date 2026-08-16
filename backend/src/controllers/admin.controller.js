const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");


// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getDashboard = async (req, res) => {
  try {

    const totalUsers = await prisma.user.count();

    const totalStores = await prisma.store.count();

    const totalRatings = await prisma.rating.count();

    res.json({
      success: true,

      data: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};


// =====================================================
// CREATE USER / OWNER
// ADMIN CANNOT CREATE ADMIN
// OWNER CREATES STORE AUTOMATICALLY
// =====================================================

const createUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      address,
      role = "USER",

      // Store details for OWNER
      storeName,
      storeEmail,
      storeAddress
    } = req.body;


    // ---------------------------------------------
    // Required user fields
    // ---------------------------------------------

    if (
      !name ||
      !email ||
      !password ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and address are required"
      });
    }


    // ---------------------------------------------
    // Name validation
    // ---------------------------------------------

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


    // ---------------------------------------------
    // Address validation
    // ---------------------------------------------

    if (address.length > 400) {
      return res.status(400).json({
        success: false,
        message:
          "Address cannot exceed 400 characters"
      });
    }


    // ---------------------------------------------
    // Password validation
    // 8-16 characters
    // At least one uppercase
    // At least one special character
    // ---------------------------------------------

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-16 characters with at least one uppercase letter and one special character"
      });
    }


    // ---------------------------------------------
    // Only USER and OWNER
    // ---------------------------------------------

    if (
      !["USER", "OWNER"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Admin can only create USER or OWNER accounts"
      });
    }


    // ---------------------------------------------
    // OWNER store validation
    // ---------------------------------------------

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
        storeName.length < 20 ||
        storeName.length > 60
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Store name must be between 20 and 60 characters"
        });
      }


      if (storeAddress.length > 400) {
        return res.status(400).json({
          success: false,
          message:
            "Store address cannot exceed 400 characters"
        });
      }
    }


    // ---------------------------------------------
    // Check duplicate USER email
    // ---------------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: email
        }
      });


    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User email already exists"
      });
    }


    // ---------------------------------------------
    // Check duplicate STORE email
    // ---------------------------------------------

    if (role === "OWNER") {

      const existingStore =
        await prisma.store.findFirst({
          where: {
            email: storeEmail
          }
        });


      if (existingStore) {
        return res.status(409).json({
          success: false,
          message:
            "Store email already exists"
        });
      }
    }


    // ---------------------------------------------
    // Hash password
    // ---------------------------------------------

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
          // Create USER / OWNER
          // -------------------------------------------

          const user =
            await tx.user.create({
              data: {
                name: name,
                email: email,
                password: hashedPassword,
                address: address,
                role: role
              }
            });


          let store = null;


          // -------------------------------------------
          // Automatically create store for OWNER
          // -------------------------------------------

          if (role === "OWNER") {

            store =
              await tx.store.create({
                data: {
                  name: storeName,
                  email: storeEmail,
                  address: storeAddress,
                  ownerId: user.id
                }
              });
          }


          return {
            user,
            store
          };
        }
      );


    // ---------------------------------------------
    // Remove password from response
    // ---------------------------------------------

    const {
      password: _password,
      ...userWithoutPassword
    } = result.user;


    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(201).json({

      success: true,

      message:
        role === "OWNER"
          ? "Owner and store created successfully"
          : "User created successfully",

      user: userWithoutPassword,

      ...(result.store
        ? {
            store: result.store
          }
        : {})
    });


  } catch (error) {

    console.error(
      "Create user error:",
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
// ADMIN ONLY
// =====================================================

const createStore = async (req, res) => {
  try {

    const {
      name,
      email,
      address,
      ownerId
    } = req.body;


    // ---------------------------------------------
    // Required fields
    // ---------------------------------------------

    if (
      !name ||
      !email ||
      !address ||
      !ownerId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, address and ownerId are required"
      });
    }


    // ---------------------------------------------
    // Store name validation
    // ---------------------------------------------

    if (
      name.length < 20 ||
      name.length > 60
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Store name must be between 20 and 60 characters"
      });
    }


    // ---------------------------------------------
    // Address validation
    // ---------------------------------------------

    if (address.length > 400) {
      return res.status(400).json({
        success: false,
        message:
          "Address cannot exceed 400 characters"
      });
    }


    // ---------------------------------------------
    // Find owner
    // ---------------------------------------------

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
          "Store owner not found"
      });
    }


    // ---------------------------------------------
    // Verify OWNER role
    // ---------------------------------------------

    if (owner.role !== "OWNER") {
      return res.status(400).json({
        success: false,
        message:
          "Selected user is not a store owner"
      });
    }


    // ---------------------------------------------
    // One owner = one store
    // ---------------------------------------------

    const existingStore =
      await prisma.store.findUnique({
        where: {
          ownerId: Number(ownerId)
        }
      });


    if (existingStore) {
      return res.status(409).json({
        success: false,
        message:
          "This owner already has a store"
      });
    }


    // ---------------------------------------------
    // Check duplicate store email
    // ---------------------------------------------

    const existingStoreEmail =
      await prisma.store.findFirst({
        where: {
          email: email
        }
      });


    if (existingStoreEmail) {
      return res.status(409).json({
        success: false,
        message:
          "Store email already exists"
      });
    }


    // ---------------------------------------------
    // Create store
    // ---------------------------------------------

    const store =
      await prisma.store.create({
        data: {
          name: name,
          email: email,
          address: address,
          ownerId: Number(ownerId)
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

    const {
      name,
      email,
      address,
      role,
      sortBy = "name",
      order = "asc"
    } = req.query;


    const allowedSortFields = [
      "name",
      "email",
      "address",
      "role",
      "createdAt"
    ];


    const sortField =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : "name";


    const sortOrder =
      order === "desc"
        ? "desc"
        : "asc";


    const users =
      await prisma.user.findMany({

        where: {

          name: name
            ? {
                contains: name
              }
            : undefined,

          email: email
            ? {
                contains: email
              }
            : undefined,

          address: address
            ? {
                contains: address
              }
            : undefined,

          role:
            role &&
            ["ADMIN", "USER", "OWNER"]
              .includes(role)
              ? role
              : undefined
        },


        orderBy: {
          [sortField]: sortOrder
        },


        select: {

          id: true,

          name: true,

          email: true,

          address: true,

          role: true,

          createdAt: true,


          // OWNER STORE
          store: {

            select: {

              id: true,

              name: true,

              email: true,

              address: true,


              ratings: {

                select: {
                  rating: true
                }
              }
            }
          }
        }
      });


    // ---------------------------------------------
    // Format users
    // ---------------------------------------------

    const formattedUsers =
      users.map((user) => {

        let averageRating = null;


        if (
          user.store &&
          user.store.ratings.length > 0
        ) {

          const total =
            user.store.ratings.reduce(
              (sum, item) =>
                sum + item.rating,
              0
            );


          averageRating =
            Number(
              (
                total /
                user.store.ratings.length
              ).toFixed(2)
            );
        }


        return {

          id: user.id,

          name: user.name,

          email: user.email,

          address: user.address,

          role: user.role,

          createdAt:
            user.createdAt,


          store: user.store
            ? {

                id:
                  user.store.id,

                name:
                  user.store.name,

                email:
                  user.store.email,

                address:
                  user.store.address,

                averageRating
              }

            : null
        };
      });


    res.json({

      success: true,

      count:
        formattedUsers.length,

      users:
        formattedUsers
    });


  } catch (error) {

    console.error(
      "Get users error:",
      error
    );

    res.status(500).json({

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

    const {
      name,
      email,
      address,
      sortBy = "name",
      order = "asc"
    } = req.query;


    const allowedSortFields = [
      "name",
      "email",
      "address",
      "createdAt"
    ];


    const sortField =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : "name";


    const sortOrder =
      order === "desc"
        ? "desc"
        : "asc";


    const stores =
      await prisma.store.findMany({

        where: {

          name: name
            ? {
                contains: name
              }
            : undefined,

          email: email
            ? {
                contains: email
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


    // ---------------------------------------------
    // Calculate rating
    // ---------------------------------------------

    const formattedStores =
      stores.map((store) => {

        let averageRating = 0;


        if (
          store.ratings.length > 0
        ) {

          const total =
            store.ratings.reduce(
              (sum, item) =>
                sum + item.rating,
              0
            );


          averageRating =
            Number(
              (
                total /
                store.ratings.length
              ).toFixed(2)
            );
        }


        return {

          id: store.id,

          name: store.name,

          email: store.email,

          address: store.address,

          rating:
            averageRating
        };
      });


    res.json({

      success: true,

      count:
        formattedStores.length,

      stores:
        formattedStores
    });


  } catch (error) {

    console.error(
      "Get stores error:",
      error
    );

    res.status(500).json({

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

    const id =
      Number(req.params.id);


    if (!Number.isInteger(id)) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid user ID"
      });
    }


    const user =
      await prisma.user.findUnique({

        where: {
          id: id
        },


        select: {

          id: true,

          name: true,

          email: true,

          address: true,

          role: true,


          store: {

            select: {

              id: true,

              name: true,

              email: true,

              address: true,


              ratings: {

                select: {
                  rating: true
                }
              }
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


    let averageRating = null;


    if (
      user.store &&
      user.store.ratings.length > 0
    ) {

      const total =
        user.store.ratings.reduce(
          (sum, item) =>
            sum + item.rating,
          0
        );


      averageRating =
        Number(
          (
            total /
            user.store.ratings.length
          ).toFixed(2)
        );
    }


    res.json({

      success: true,

      user: {

        id: user.id,

        name: user.name,

        email: user.email,

        address: user.address,

        role: user.role,


        store: user.store
          ? {

              id:
                user.store.id,

              name:
                user.store.name,

              email:
                user.store.email,

              address:
                user.store.address,

              averageRating
            }

          : null
      }
    });


  } catch (error) {

    console.error(
      "User details error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch user details"
    });
  }
};


// =====================================================
// DELETE USER
// ADMIN CANNOT BE DELETED
// =====================================================

const deleteUser = async (req, res) => {
  try {

    const id =
      Number(req.params.id);


    if (!Number.isInteger(id)) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid user ID"
      });
    }


    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user =
      await prisma.user.findUnique({

        where: {
          id: id
        },


        include: {

          store: true,

          ratings: true
        }
      });


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"
      });
    }


    // ---------------------------------------------
    // Protect ADMIN
    // ---------------------------------------------

    if (user.role === "ADMIN") {

      return res.status(403).json({

        success: false,

        message:
          "Admin accounts cannot be deleted"
      });
    }


    // ---------------------------------------------
    // Delete related data
    // ---------------------------------------------

    await prisma.$transaction(
      async (tx) => {

        // Delete ratings
        await tx.rating.deleteMany({

          where: {
            userId: id
          }
        });


        // Delete store if OWNER
        if (user.store) {

          await tx.store.delete({

            where: {
              id: user.store.id
            }
          });
        }


        // Delete user
        await tx.user.delete({

          where: {
            id: id
          }
        });
      }
    );


    return res.json({

      success: true,

      message:
        "User and related data deleted successfully"
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
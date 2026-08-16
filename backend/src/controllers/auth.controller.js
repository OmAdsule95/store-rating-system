const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");


// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
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

    // ---------------------------------------------
    // Required fields
    // ---------------------------------------------

    if (
      !name ||
      !email ||
      !password ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All user fields are required"
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
    // Password validation
    // ---------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters"
      });
    }

    // ---------------------------------------------
    // Only USER or OWNER
    // ---------------------------------------------

    const userRole =
      role === "OWNER"
        ? "OWNER"
        : "USER";

    // ---------------------------------------------
    // OWNER store validation
    // ---------------------------------------------

    if (userRole === "OWNER") {

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
    }

    // ---------------------------------------------
    // Check existing user
    // ---------------------------------------------

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

    // ---------------------------------------------
    // Hash password
    // ---------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // ---------------------------------------------
    // TRANSACTION
    // ---------------------------------------------

    const result =
      await prisma.$transaction(
        async (tx) => {

          const user =
            await tx.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                address,
                role: userRole
              }
            });

          let store = null;

          // Create store automatically for OWNER

          if (userRole === "OWNER") {

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
    // Response
    // ---------------------------------------------

    return res.status(201).json({

      success: true,

      message:
        userRole === "OWNER"
          ? "Owner account and store created successfully"
          : "Registration successful",

      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        address: result.user.address,
        role: result.user.role
      },

      ...(result.store && {

        store: {
          id: result.store.id,
          name: result.store.name,
          email: result.store.email,
          address: result.store.address,
          ownerId: result.store.ownerId
        }

      })

    });

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Registration failed"
    });
  }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    // ---------------------------------------------
    // Validation
    // ---------------------------------------------

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required"
      });
    }

    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email
        }
      });

    if (!user) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    // ---------------------------------------------
    // Compare password
    // ---------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    // ---------------------------------------------
    // JWT
    // ---------------------------------------------

    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1d"
        }
      );

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.json({

      success: true,

      message:
        "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }

    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed"
    });
  }
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {

    const {
      email,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // ---------------------------------------------
    // Required fields
    // ---------------------------------------------

    if (
      !email ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      return res.status(400).json({
        success: false,
        message:
          "All fields are required"
      });
    }

    // ---------------------------------------------
    // Confirm new password
    // ---------------------------------------------

    if (
      newPassword !==
      confirmPassword
    ) {

      return res.status(400).json({
        success: false,
        message:
          "New passwords do not match"
      });
    }

    // ---------------------------------------------
    // Password validation
    // ---------------------------------------------

    if (newPassword.length < 6) {

      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters"
      });
    }

    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email
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
    // Verify current password
    // ---------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {

      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect"
      });
    }

    // ---------------------------------------------
    // Prevent same password
    // ---------------------------------------------

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {

      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password"
      });
    }

    // ---------------------------------------------
    // Hash new password
    // ---------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // ---------------------------------------------
    // Update password
    // ---------------------------------------------

    await prisma.user.update({

      where: {
        id: user.id
      },

      data: {
        password:
          hashedPassword
      }

    });

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.json({

      success: true,

      message:
        "Password changed successfully"

    });

  } catch (error) {

    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to change password"

    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  register,
  login,
  changePassword
};
const prisma = require("../config/prisma");

// Submit a rating
const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "storeId and rating are required"
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: Number(storeId)
      }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: Number(storeId)
        }
      }
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this store"
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating: Number(rating),
        userId,
        storeId: Number(storeId)
      }
    });

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      rating: newRating
    });

  } catch (error) {
    console.error("Submit rating error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit rating"
    });
  }
};


// Update a rating
const updateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    if (
      rating === undefined ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      }
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: "You have not rated this store yet"
      });
    }

    const updatedRating = await prisma.rating.update({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      },
      data: {
        rating: Number(rating)
      }
    });

    res.json({
      success: true,
      message: "Rating updated successfully",
      rating: updatedRating
    });

  } catch (error) {
    console.error("Update rating error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update rating"
    });
  }
};


// Get current user's rating
const getMyRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = Number(req.params.storeId);

    const rating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      }
    });

    res.json({
      success: true,
      rating: rating || null
    });

  } catch (error) {
    console.error("Get rating error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch rating"
    });
  }
};


module.exports = {
  submitRating,
  updateRating,
  getMyRating
};
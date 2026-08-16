const prisma = require("../config/prisma");

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find owner's store
    const store = await prisma.store.findUnique({
      where: {
        ownerId: ownerId
      },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "You don't have a store"
      });
    }

    // Calculate average rating
    const totalRatings = store.ratings.length;

    const averageRating =
      totalRatings > 0
        ? Number(
            (
              store.ratings.reduce(
                (sum, item) => sum + item.rating,
                0
              ) / totalRatings
            ).toFixed(2)
          )
        : 0;

    res.json({
      success: true,
      dashboard: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address
        },

        totalRatings,

        averageRating,

        ratings: store.ratings.map((item) => ({
          id: item.id,
          rating: item.rating,
          createdAt: item.createdAt,

          user: {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            address: item.user.address
          }
        }))
      }
    });

  } catch (error) {
    console.error("Owner dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load owner dashboard"
    });
  }
};

module.exports = {
  getOwnerDashboard
};  
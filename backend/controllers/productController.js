/**
 * Product Controller
 * Customer-facing product browsing and search.
 */

const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");
const QueryBuilder = require("../utils/queryBuilder");

// ─── Get All Products ─────────────────────────────────────────────────────────

exports.getAllProducts = asyncHandler(async (req, res) => {
  const baseQuery = Product.find({ isActive: true }).populate("category", "name slug");

  const builder = new QueryBuilder(baseQuery, req.query)
    .filter()
    .search(["name", "brand", "description"])
    .sort()
    .selectFields()
    .paginate();

  // Count total matching docs for pagination metadata
  const filterQuery = Product.find({ isActive: true });
  const countBuilder = new QueryBuilder(filterQuery, req.query).filter().search(["name", "brand", "description"]);
  const total = await countBuilder.query.countDocuments();

  const products = await builder.query;

  ApiResponse.success(res, 200, "Products retrieved", { products }, {
    total,
    page: builder.page,
    limit: builder.limit,
    pages: Math.ceil(total / builder.limit),
  });
});

// ─── Get Single Product ───────────────────────────────────────────────────────

exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .populate("category", "name slug")
    .populate({
      path: "reviews",
      populate: { path: "user", select: "name avatar" },
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }

  ApiResponse.success(res, 200, "Product retrieved", { product });
});

// ─── Search Products ──────────────────────────────────────────────────────────

exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, minRating, sort } = req.query;

  const filter = { isActive: true };

  if (q) {
    filter.$or = [
      { name: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
      { brand: new RegExp(q, "i") },
    ];
  }

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minRating) filter.ratings = { $gte: Number(minRating) };

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 12);
  const skip = (page - 1) * limit;

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  else if (sort === "price_desc") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { ratings: -1 };
  else if (sort === "popular") sortOption = { numReviews: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Product.countDocuments(filter),
  ]);

  ApiResponse.success(res, 200, "Search results", { products }, {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});

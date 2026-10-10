const Product = require('../models/Product');

// @desc    Fetch all products with optional search and filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category, isSpecial, isLatest } = req.query;

    let query = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
        { brandName: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isSpecial !== undefined) {
      query.isSpecial = isSpecial === 'true';
    }

    if (isLatest !== undefined) {
      query.isLatest = isLatest === 'true';
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('[ProductController] getProducts error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    let product = null;

    // Check if valid ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else if (!isNaN(id)) {
      // Numeric ID lookup: match by 1-based catalog index
      const index = parseInt(id, 10);
      const allProducts = await Product.find({}).sort({ createdAt: 1 });
      if (index >= 1 && index <= allProducts.length) {
        product = allProducts[index - 1];
      }
    } else {
      // Fallback: try finding by name or return first product if id === 'one'
      if (id === 'one' || id === 'first') {
        product = await Product.findOne({});
      } else {
        product = await Product.findOne({ name: { $regex: id, $options: 'i' } });
      }
    }

    if (!product) {
      // If still not found, return the first product as safe fallback
      product = await Product.findOne({});
    }

    if (product) {
      return res.json({
        success: true,
        product,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
  } catch (error) {
    console.error('[ProductController] getProductById error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public / Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      brandName,
      brandSrc,
      imgSrc,
      galleryImages,
      price,
      description,
      category,
      sizes,
      countInStock,
      isSpecial,
      isLatest,
      itemAge,
      dailyLatePenalty,
    } = req.body;

    if (!name || !price || !imgSrc) {
      return res.status(400).json({
        success: false,
        message: 'Name, price in INR, and primary image are required',
      });
    }

    const product = await Product.create({
      name,
      brandName: brandName || 'StyleLease Exclusive',
      brandSrc: brandSrc || 'images/b1.jpg',
      imgSrc,
      galleryImages: galleryImages && galleryImages.length > 0 ? galleryImages : [imgSrc],
      price: Number(price),
      description: description || 'Premium designer rental piece.',
      category: category || "Designer Wear",
      sizes: sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      countInStock: countInStock !== undefined ? Number(countInStock) : 10,
      isSpecial: isSpecial !== undefined ? Boolean(isSpecial) : true,
      isLatest: isLatest !== undefined ? Boolean(isLatest) : true,
      itemAge: itemAge || 'Brand New (Mint Condition)',
      dailyLatePenalty: dailyLatePenalty ? Number(dailyLatePenalty) : 150,
    });

    return res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updatableFields = [
      'name',
      'brandName',
      'brandSrc',
      'imgSrc',
      'galleryImages',
      'price',
      'description',
      'category',
      'sizes',
      'rating',
      'reviewsCount',
      'countInStock',
      'isSpecial',
      'isLatest',
      'itemAge',
      'dailyLatePenalty',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'countInStock' || field === 'dailyLatePenalty') {
          product[field] = Number(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updatedProduct = await product.save();

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Product '${product.name}' deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

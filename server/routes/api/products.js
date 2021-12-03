const express = require('express');
const { findById } = require('../../models/Product');
const router = express.Router();

// Product model
const Product = require('../../models/Product');

/**
 * @route   GET api/products/search
 * @desc    Full text search by title
 * @access  Public
 */
router.get('/search', async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage) : 8;
    if (!req.query.q) return res.status(400).json({ msg: 'You did not enter your search query...' });
    try {
        const products = await Product.find(
            { $text: { $search : req.query.q } },  
            { score : { $meta: 'textScore' } } 
        ).sort( 
            {  score: { $meta : 'textScore' } }
        ).skip((page - 1) * perPage).limit(perPage);
        if (!products.length) throw Error('No products found...');
        const count = await Product.find(
            { $text: { $search : req.query.q } }
        );
        console.log(count.length);

        res.status(200).json({
            total_pages: (count.length % perPage) ? parseInt(count.length / perPage) + 1 : parseInt(count.length / perPage),
            page: page,
            perPage: perPage,
            products: products
        });
    } catch (e) {
        res.status(404).json({ msg: e.message });
    }
});

/**
 * @route   GET api/products/:id
 * @desc    Get a Product by Id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) throw Error('No product found with this id...');

        res.status(200).json(product);
    } catch (e) {
        res.status(404).json({ msg: e.message });
    }
});

/**
 * @route   GET api/products
 * @desc    Get All Products
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 8;
        const products = await Product.find().sort({updated_at: -1}).skip((page - 1) * perPage).limit(perPage);
        if (!products.length) throw Error('No products');
        const count = await Product.estimatedDocumentCount();
        console.log(count);
        res.status(200).json({
            total_pages: (count % perPage) ? parseInt(count / perPage) + 1 : parseInt(count / perPage),
            page: page,
            perPage: perPage,
            products: products
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/products
 * @desc    Create a Product
 * @access  Private
 */
router.post('/', async (req, res) => {
    const newProduct = new Product({
        title: req.body.title,
        brand: req.body.brand,
        description: req.body.description,
        unit_price: req.body.unit_price,
        quantity: req.body.quantity,
        // image: req.body.image,
    })

    try {
        const product = await newProduct.save();
        if (!product) throw Error('Something went wrong saving the item');

        res.status(201).json(product);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   PUT api/products/:id
 * @desc    Update a Product
 * @access  Private
 */
router.put('/:id', async (req, res) => {
    const newData = req.body;
    newData.updated_at = Date.now();
    try {
        const product = await Product.findById(req.params.id);
        if (!product) throw Error('Could not find a product with this id...');
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, newData, {runValidators: true, new: true});
        if (!updatedProduct) throw Error('Something went wrong when updating this product...');

        res.status(200).json(updatedProduct);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   DELETE api/products/:id
 * @desc    Delete a Product
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) throw Error('No product found with this id');
        const removed = await product.remove();
        if (!removed) throw Error('Something went wrong while trying to delete the product');

        res.status(200).json({success: true});
    } catch (e) {
        res.status(400).json({ msg: e.message, success: false });
    }
});

module.exports = router;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema
const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    brand: {
        type: String,
        required: true
    },
    unit_price: {
        type: Number,
        required: [true, 'the unit price is required'],
        min: [0, 'the unit price cannot be lower than 0']
    },
    created_at: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    active: {
        type: Boolean,
        default: false,
    },
    quantity: {
        type: Number,
        required: [true, 'the quantity is required'],
        min: [0, 'the quantity cannot be lower than 0'],
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
        }
    },
    image: {
        type: String,
    }
});

productSchema.index(
    {
        title: 'text', 
        brand: 'text',
        description: 'text'
    },
    {
        weights : 
            { 
                title : 5, 
                brand : 4,
                description : 2
            }
     }
);

module.exports = Product = mongoose.model('product', productSchema);
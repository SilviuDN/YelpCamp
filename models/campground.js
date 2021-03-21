const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //to shorten code

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}); 
  
CampgroundSchema.post('findOneAndDelete', async function (deletedDocument) {
    if(deletedDocument){
        await Review.remove({
            _id: {
                $in: deletedDocument.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
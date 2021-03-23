const campground = require('../models/campground');
const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}


module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    
    // if( !req.body.campground ) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;                            //add geometry from geocoding API
    campground.images = req.files.map( f => ({ url: f.path, filename: f.filename}));    //add file urls from cloudinary
    campground.author = req.user._id;                                                   // add author as currently login author
    await campground.save();
    // console.log(campground);
    req.flash('success', 'Succesfully made a new campground.')
    res.redirect(`campgrounds/${campground._id}`);
    // res.render("campgrounds/show", {campground});

}

module.exports.showCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find this campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground} );
    // res.render('campgrounds/show', {campground, msg: req.flash('success')} ); // we set up a middleware
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    // console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find this campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res, next) => {
    const {id} = req.params;
    // console.log(req.body);

    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    const imgs = req.files.map( f => ({ url: f.path, filename: f.filename}));
    campground.images.push( ...imgs );
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Succesfully edited campground.')
    res.redirect(`/campgrounds/${campground._id}`);
}


// module.exports.updateCampground = async (req, res, next) => {
//     // res.send(req.body);
// const {id} = req.params;
// console.log("********************************************");
// console.log(req.body);
// console.log("********************************************");
// // const campground = await Campground.findById(id);
// // if(!campground.author.equals(req.user._id)){
// //     req.flash('error', 'Yo do not have permission to do this.');
// //     return res.redirect(`/campgrounds/${id}`);
// // }
// const campground2 = await Campground.findByIdAndUpdate(id, req.body.campground);
// const imgs = req.files.map( f => ({ url: f.path, filename: f.filename}));
// campground2.images.push( ...imgs );
// await campground2.save();
// // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
// //Asa nu merge:
// // res.redirect(`campgrounds/${campground._id}`);
// //A trebuit sa pun un slash nenecesar in ruta pentru New!!!
// req.flash('success', 'Succesfully edited campground.')
// res.redirect(`/campgrounds/${campground2._id}`);
// }

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted campground.')
    res.redirect('/campgrounds');
}
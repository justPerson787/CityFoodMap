const Foodplace = require('../models/foodplace');

module.exports.findIndex = async (req, res) => {
    const restaurants = await Foodplace.find({ });
    res.render('restaurants/index', { restaurants })
}

module.exports.renderNewForm = (req, res) => {    
    res.render('restaurants/add');
}

module.exports.createRestaurant = async (req, res, next) => {     
        
     const restaurant = new Foodplace(req.body.restaurant);
     restaurant.images = req.files.map(file => ({ url: file.path, filename: file.filename})); 
     restaurant.author = req.user._id;
     await restaurant.save();
     req.flash('success', 'New restaurant added!');
     res.redirect(`/restaurants/${restaurant._id}`)    
}

module.exports.showRestaurant = async (req, res) => {
    const restaurant = await Foodplace.findById(req.params.id).populate('reviews').populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
       }).populate('author');      
    if(!restaurant){
       req.flash('error', 'Cannot find the place');
       return res.redirect('/restaurants');
   } 
    res.render('restaurants/show', { restaurant });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const restaurant = await Foodplace.findById(id);      
    if(!restaurant){
        req.flash('error', 'Cannot find the place');
        return res.redirect('/restaurants');
    }          
    res.render('restaurants/edit', { restaurant });
}

module.exports.updateRestaurant = async (req, res) => {
    const { id } = req.params;    
    const rest = await Foodplace.findByIdAndUpdate(id, { ...req.body.restaurant });
    req.flash('success', 'Restaurant updated successfully!')
    res.redirect(`/restaurants/${rest._id}`);
}

module.exports.deleteRestaurant = async (req, res) => {
    const { id } = req.params;
    await Foodplace.findByIdAndDelete(id);
    req.flash('success', 'Restaurant deleted successfully');
    res.redirect('/restaurants');
}
const Listing = require("../models/listing");


// ==================== GEOCODING FUNCTION ====================

async function geocodeLocation(location, country) {
    const query = encodeURIComponent(`${location}, ${country}`);

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
        {
            headers: {
                "User-Agent": "WanderlustLearningProject/1.0"
            }
        }
    );

    if (!response.ok) {
        throw new Error("Geocoding service failed");
    }

    const data = await response.json();

    if (data.length === 0) {
        return null;
    }

    return {
        type: "Point",
        coordinates: [
            Number(data[0].lon),
            Number(data[0].lat)
        ]
    };
}


// ==================== INDEX ====================

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});

    res.render("listings/index", {
        allListings
    });
};


// ==================== NEW FORM ====================

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// ==================== SHOW ====================

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    // Old listings ke liye geometry/coordinates create karo
    if (
        !listing.geometry ||
        !listing.geometry.coordinates ||
        listing.geometry.coordinates.length !== 2
    ) {
        const geometry = await geocodeLocation(
            listing.location,
            listing.country
        );

        if (geometry) {
            listing.geometry = geometry;
            await listing.save();
        }
    }

    res.render("listings/show.ejs", {
        listing
    });
};


// ==================== CREATE ====================

module.exports.createListing = async (req, res) => {

    const { location, country } = req.body.listing;

    // Location ko coordinates me convert karo
    const geometry = await geocodeLocation(
        location,
        country
    );

    if (!geometry) {
        req.flash(
            "error",
            "Location not found. Please enter a valid location."
        );

        return res.redirect("/listings/new");
    }

    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(
        req.body.listing
    );

    // Logged-in user owner hoga
    newListing.owner = req.user._id;

    // Cloudinary image
    newListing.image = {
        url,
        filename
    };

    // Map coordinates
    newListing.geometry = geometry;

    const savedListing = await newListing.save();

    console.log(savedListing);

    req.flash(
        "success",
        "New Listing Created!"
    );

    res.redirect("/listings");
};


// ==================== EDIT FORM ====================

module.exports.renderEditForm = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/h_300,w_250"
    );

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};


// ==================== UPDATE ====================

module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    // Listing ki information update
    Object.assign(
        listing,
        req.body.listing
    );

    // Location change hone par map coordinates bhi update karo
    const { location, country } = req.body.listing;

    const geometry = await geocodeLocation(
        location,
        country
    );

    if (geometry) {
        listing.geometry = geometry;
    }

    // Agar new image upload hui hai
    if (typeof req.file !== "undefined") {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash(
        "success",
        "Listing Updated!"
    );

    res.redirect(`/listings/${id}`);
};


// ==================== DELETE ====================

module.exports.destroyListing = async (req, res) => {

    let { id } = req.params;

    const deletedListing =
        await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    req.flash(
        "success",
        "Listing deleted!"
    );

    res.redirect("/listings");
};
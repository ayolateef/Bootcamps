const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

//@desc Get  all reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  //test to see if there is a bootcamp Id
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    //Get all tve reviews
    res.status(200).json(res.advancedResults);
  }
});

//@desc Get  singlel review
// @route GET /api/v1/review/:id
//@access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc    Add review
// @route  POST /api/v1/bootcamps/:bootcampId/reviews
//@access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  // add the bootcamp and user Id
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  //check for the bootcamp of it exist
  if(!bootcamp){
    return next(
      new ErrorResponse(`No bootcamp found with the id of ${req.params.bootcampId}`,404)
    );
  } 

  // If it exist create a review
  const review = await Review.create(req.body)

  res.status(201).json({
    success: true,
    data: review
  });
});

//@desc     Update review
// @route  PUT /api/v1/:id
//@access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  // Find review by id
  let review = await Review.findById(req.params.id );

  //check for the review if it exist
  if(!review){
    return next(
      new ErrorResponse(`No bootcamp found with the id of ${req.params.id}`,404)
    );
  } 

  // Make sure review belongs to user or user is admin 
  if(review.user.toString()!== req.user.id && req.user.role !=='admin') {
    return next(
      new ErrorResponse(`Not autohrize to update review`,401
      )
    );
  }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });  
  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc     Delete review
// @route  PUT /api/v1/:id
//@access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  // Find review by id
  let review = await Review.findById(req.params.id );

  //check for the review if it exist
  if(!review){
    return next(
      new ErrorResponse(`No bootcamp found with the id of ${req.params.id}`,404)
    );
  } 

  // Make sure review belongs to user or user is admin 
  if(review.user.toString()!== req.user.id && req.user.role !=='admin') {
    return next(
      new ErrorResponse(`Not autohrize to update review`,401
      )
    );
  }
   await review.remove()

  res.status(200).json({
    success: true,
    data: {}
  });
});

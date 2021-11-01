const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
// Load profile validation
const validatorProfileInput = require("../../validation/profile");
const validatorExperienceInput = require("../../validation/experience");
const validatorEducationInput = require("../../validation/education");

// Load profile module
const Profile = require("../../modules/profile");
//Load  user module
const Users = require("../../modules/Users");

//@route Get api/users/test
//@desc Tests profile route
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "this is profile page" });
});

//@route Get api/profiles
//@desc get current user profile
//@access private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
       .populate('users',['name','avatar'])
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          res.status(404).json(errors);
        }
        res.json(profile);
      })
      
  }
);

//@route Get api/profiles/handle/:handle
//@desc Get profile by handle
//@access public
router.get('/handle/:handle',(req,res)=>{
  const errors = {}
  Profile.findOne({handle:req.params.handle})
  .populate('user',['name','avatar'])
  .then(profile=>{
    if(!profile){
      errors.noprofile = 'There is no profile for this user'
      res.status(404).json(errors)
    }
    res.status(200).json(profile)
  }).catch(err=>res.status(404).json(err))
  
})
//@route Get api/profiles/user/:user_id
//@desc Get profile by user_id
//@access public
router.get('/user/:user_id',(req,res)=>{
  const errors = {}
  Profile.findOne({user:req.params.user_id})
  .populate('user',['name','avatar'])
  .then(profile=>{
    if(!profile){
      errors.noprofile = 'There is no profile for this user_id'
      res.status(404).json(errors)
    }
    res.status(200).json(profile)
  }).catch(err=>res.status(404).json({profile:'There is no profile for this user'}))
  
})
//@route Get api/profiles/all
//@desc Get profile all user
//@access public

router.get('/all',(req,res)=>{
  const errors = {}
  Profile.find({})
  .populate('user',['name','avatar'])
  .then(profiles=>{
    if(!profiles){
      errors.noprofile = 'There are no profiles'
      res.status(404).json(errors)
    }
    res.status(200).json(profiles)
  }).catch(err=>res.status(404).json({profile:'There are no profiles'}))

})

//@route post api/profiles
//@desc create user profile
//@access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // validation check
    const { errors, isValid } = validatorProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;

    if (req.body.location) profileFields.location = req.body.location;

    if (req.body.status) profileFields.status = req.body.status;

    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubsername)
      profileFields.githubsername = req.body.githubsername;
    // skills - splits into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // social links
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          //update
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then((profile) => res.json(profile));
        } else {
          //create

          //Check if handle exist
          Profile.findOne({ handle: profileFields.handle }).then((profile) => {
            if (profile) {
              errors.handle = "That handle already exist";
              res.status(400).json(errors);
            }
            //save profile
            new Profile(profileFields).save().then((profile) => {
              res.json(profile).catch((err) => console.log(err));
            });
          });
        }
      })
      .catch((err) => console.log(err));
  }
);
//@route Post api/profiles/experience
//@desc post profile add experience
//@access private

router.post('/experience',passport.authenticate('jwt',{session:false}),(req,res)=>{
  const {errors,isValid} = validatorExperienceInput(req.body)
  if(!isValid){
    return res.status(404).json(errors)
  }
  Profile.findOne({user:req.user.id})
        .then(profile=>{
          const newExp = {
            title:req.body.title,
            company:req.body.company,
            from:req.body.from,
            location:req.body.location,
            to:req.body.to,
            current:req.body.current,
            description:req.body.description
          }
          //add to experience array
          profile.experience.unshift(newExp)
          profile.save().then(profile=>res.json(profile)).catch(err=>res.status(200).json(err))

        }).catch(err=>res.status(200).json(err))

    
})
//@route Post api/profiles/education
//@desc post profile add education
//@access private

router.post('/education',passport.authenticate('jwt',{session:false}),(req,res)=>{
   
  const {errors,isValid} = validatorEducationInput(req.body)
  if(!isValid){
    return res.status(404).json(errors)
  }

  Profile.findOne({user:req.user.id})
        .then(profile=>{
          const newEdu = {
            school:req.body.school,
            degree:req.body.degree,
            fieldofstudy:req.body.fieldofstudy,
            from:req.body.from,
            to:req.body.to,
            current:req.body.current,
            description:req.body.description
          }
          profile.education.unshift(newEdu)
          profile.save().then(profile=>res.json(profile)).catch(err=>res.json(err))
        })
}) 
//@route delete api/profiles/experience
//@desc delete experience profile
//@access private

router.delete('/experience/:exp_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
          //Get remove index
          const removeIndex = profile.experience
          .map(item=>item.id)
          .indexOf(req.params.exp_id)
          
          //splice out of array
          profile.experience.splice(removeIndex,1)
          //save
          profile.save().then(profile=>res.status(200).json(profile)).catch(err=>res.status(404).json(err))
        })
})
//@route delete api/profiles/education
//@desc delete education from profile
//@access private

router.delete('/education/:edu_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
  Profile.findOne({user:req.user.id})
      .then(profile=>{
        //Get remove index
        const removeIndex = profile.education
        .map(item=>item.id)
        .indexOf(req.params.edu_id)

        //splice out of array
        profile.education.splice(removeIndex,1)
        //save
        profile.save().then(profile=>res.status(200).json(profile)).catch(err=>res.json(err))
      })
})
//@route delete api/profiles/
//@desc delete profile
//@access private

router.delete('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
  Profile.findOneAndRemove({user:req.user.id})
      .then(()=>{
        Users.findOneAndRemove({_id:req.user.id}).then(()=>
           res.json({success:true})
        )
      })
})

module.exports = router;

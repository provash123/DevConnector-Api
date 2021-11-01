const express = require('express')

const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

//Load post module
const Post = require('../../modules/post')

//Load Profile module
const Profile = require('../../modules/profile')


//Load validation
const validatorPostInput = require('../../validation/post')
const { route } = require('./users')

router.get('/test',(req,res)=>{
    res.json({msg:'this is posts page'})
})

//@route Get api/posts
//@desc Get posts
//@access public
router.get('/',(req,res)=>{
    const errors = {}
    Post.find()
        .sort({date:-1})
        .then(posts=>res.status(200).json(posts))
        .catch(err=>res.status(404).json({notfound:'Post not found'}))

})

//@route Get api/posts/:id
//@desc Get posts by id
//@access public
router.get('/:id',(req,res)=>{
    Post.findById(req.params.id)
        .then(post=>res.status(200).json(post))
        .catch(err=>res.status(404).json({notfound:'No post found with that id'}))

})

//@route post api/posts
//@desc create post
//@access private

router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid} = validatorPostInput(req.body)
    if(!isValid){
        return res.status(404).json(errors)
    }
    const newPost =new Post ({
        
        text:req.body.text,
        name:req.body.name,
        avatar:req.body.avatar,
        user:req.user.id,
    })
    newPost.save().then(post=>res.json(post)).catch(err=>res.json({notfound:'Post not found'}))
})

//@route Delete api/posts
//@desc Delete post
//@access private

router.delete('/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
   Profile.findOne({user:req.user.id})
   .then(profile=>{
       Post.findById(req.params.id)
       .then(post=>{
           // Check for post owenr
           if(post.user.toString() !== req.user.id ){
               return res.status(401).json({notauthorized:'User not authorized'})
           }
           // Delete
           post.remove().then(()=>res.json({success:true}))
           .catch(err=> res.status(404).json({postnotfound:'no post found'}))
       })
   })
})


//@route Post api/posts/like/:id
//@desc like post
//@access private

router.post('/like/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
    .then((profile)=>{
        Post.findById(req.params.id)
        
        .then(post=>{
            if(post.likes.filter(like=>like.user.toString() === req.user.id).length>0 ){
                return res.status(404).json({alreadylike:'user already like'})

            }
            //add user id like array
            post.likes.unshift({user:req.user.id})
            //save
            post.save().then(post=>res.json(post))
        })
    })
})
//@route post  api/posts/unlike/:id
//@desc unlike post
//@access private

router.post('/unlike/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
    .then((profile)=>{
        Post.findById(req.params.id)
        
        .then(post=>{
            if(post.likes.filter(like=>like.user.toString() === req.user.id).length === 0 ){
                return res.status(404).json({unlike:'yoy have not yet like this post'})

            }
            //get remove index
            const removeIndex = post.likes
            .map(item=>item.user.toString())
            .indexOf(req.user.id)

            // splice array
            post.likes.splice(removeIndex,1)

            //save
            post.save().then(post=>res.json(post))
          
        })
    })
})

//@route Post api/posts/comment/:id
//@desc add comment post
//@access private

router.post('/comment/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {errors,isValid} = validatorPostInput(req.body)
    if(!isValid){
        return res.status(404).json(errors)
    }
   Post.findById(req.params.id)
   .then(post=>{
       const newComment = {
           text:req.body.text,
           name:req.body.name,
           avatar:req.body.avatar,
           user:req.user.id
       }
       // add to comments array
       post.comments.unshift(newComment)
       post.save().then(post=>res.json(post))
   })
   .catch(err=>res.status(404).json({postnotfound:'post not found'}))
})


//@route delete api/posts/comment/:id/:comment_id
//@desc delete comment post
//@access private

router.delete('/comment/:id/:comment_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    
   Post.findById(req.params.id)
   .then(post=>{
       // check to see if comment exist
      if(post.comments.filter(comment=>comment._id.toString() === req.params.comment_id).length === 0){
          return res.status(404).json({commentnotexists:'comment doesnot exist'})
      }
      // get remove index
      const removeIndex = post.comments
                            .map(item=>item._id.toString())
                            .indexOf(req.params.comment_id)
        // splice comment out of array
        post.comments.splice(removeIndex,1)
        post.save().then(post=>res.json(post))                    
   })
   .catch(err=>res.status(404).json({postnotfound:'post not found'}))
})
module.exports = router



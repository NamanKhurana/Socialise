const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const User = require('../../models/User')
const Profile = require('../../models/Profile')
const Post = require('../../models/Post')

//@route POST api/posts
//@desc  Create a post
//@access PRIVATE
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() })
        }

        try {

            const user = await User.findById(req.user.id).select('-password')

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })

            const post = await newPost.save()
            res.json(post)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }
    })


//@route GET api/posts
//@desc  GET ALL POSTS
//@access PRIVATE
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

//@route GET api/posts/:id
//@desc  GET POSTS BY ID
//@access PRIVATE
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ msg: 'No post with the given id is found' })
        }
        res.json(post)
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'No post with the given id is found' })
        }

        console.error(err.message)
        res.status(500).send('Server error')
    }
})

//@route DELETE api/posts/:id
//@desc  DELETE POSTS BY ID
//@access PRIVATE
router.delete('/:id', auth, async (req, res) => {
    try {

        // const post = await Post.findByIdAndRemove(req.params.id)
        // if (!post) {
        //     return res.status(404).json({ msg: 'No post with the given id is found' })
        // }
        // res.json({msg:'Post deleted'})

        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ msg: 'No post with the given id is found' })
        }

        //Check User
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }

        await post.remove()
        res.status(200).json({ msg: 'Post removed' })

    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'No post with the given id is found' })
        }

        console.error(err.message)
        res.status(500).send('Server error')
    }
})

//@route PUT api/posts/like/:id
//@desc  Like a post
//@access PRIVATE
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ msg: 'No post with the given id is found' })
        }

        //Check if post has already been liked by a user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked by you' })
        }

        post.likes.unshift({ user: req.user.id })

        await post.save()

        res.json(post.likes)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


//@route PUT api/posts/unlike/:id
//@desc  Like a post
//@access PRIVATE
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ msg: 'No post with the given id is found' })
        }

        //Check if post has already been liked by a user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked' })
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save()

        res.json(post.likes)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//@route POST api/posts/comment/:id
//@desc  Comment on a post
//@access PRIVATE
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() })
        }

        try {

            const user = await User.findById(req.user.id).select('-password')
            const post = await Post.findById(req.params.id)

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)

            await post.save()
            res.json(post.comments)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }
    })

//@route DELETE api/posts/comment/:id/:comment_id
//@desc  Delete a post
//@access PRIVATE
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id)

        const comment = post.comments.find(comment => comment.id === req.params.comment_id)

        if (!comment) {
            return res.status(404).json({ msg: 'Comment with the given id doesn\'t exist' })
        }

        //Check if user is authorised 
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User is unauthorised to delete this comment' })
        }

        //Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex,1)

        await post.save()
        res.json(post.comments)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})


module.exports = router
const express = require('express')
const router = express.Router()
const userModel = require('../models/user')
const postModel = require('../models/post')
const dp = require('./dpupload')
const upload = require('./postupload')
const bcrypt = require('bcrypt')
const path = require('path')
const { check, validationResult } = require('express-validator')

router.post('/api/register', [
    check('fullname')
        .notEmpty().withMessage('Full Name cannot be empty'),
    check('username')
        .notEmpty().withMessage('Username cannot be empty'),
    check('password')
        .notEmpty().withMessage('Password cannot be empty')
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    try {
        const { fullname, username, password } = req.body
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const createdUser = new userModel({ fullname, username, password: hash })
        await createdUser.save()
        res.send({ login: true })
    }
    catch (error) {
        return res.status(400).json({ error: 'Username already exists' });
    }
})

router.post('/api/login', [
    check('username')
        .notEmpty().withMessage('Username cannot be empty'),
    check('password')
        .notEmpty().withMessage('Password cannot be empty')
], async (req, res, next) => {

    if (validationResult(req).errors.length != 0) {
        res.status(404).send('Fields Cannot be Empty')
        return
    }

    const { username, password } = req.body
    const userLogin = await userModel.findOne({ username })
    const passcheck = await bcrypt.compare(password, userLogin.password)
    if (passcheck) {
        res.json({ login: true })
    } else {
        res.status(401).send('not found')
    }
})

router.post('/api/getuser', async (req, res) => {
    const user = await userModel.findOne({ username: req.body.username }).select('-salt -hash')
    res.json(user)
})

router.post('/api/getuserposts', async (req, res) => {
    const user = await userModel.findOne({ username: req.body.user }).select('-salt -hash').populate('posts')
    res.json(user.posts)
})

router.post('/api/editdp', dp.single('file'), async (req, res, next) => {

    const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
        dp: req.file.filename
    }, { new: true })
    res.send(userdata)
})

router.post('/api/editname', [
    check('fullname')
        .notEmpty().withMessage('Fullname cannot be empty'),
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
        fullname: req.body.fullname
    }, { new: true })
    res.send(userdata)
})

router.post('/api/editdob', [
    check('dob')
        .notEmpty().withMessage('dob cannot be empty'),
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
        dob: req.body.dob
    }, { new: true })
    res.send(userdata)
})

router.post('/api/editusername', [
    check('username')
        .notEmpty().withMessage('Username cannot be empty'),
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    try {

        const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
            username: req.body.username
        }, { new: true })
        res.send(userdata)
    }
    catch (err) {
        return res.status(400).json({ error: 'Username already exists' });

    }
})

router.post('/api/editemail', [
    check('email')
        .notEmpty().withMessage('email cannot be empty'),
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    try {

        const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
            email: req.body.email
        }, { new: true })
        res.send(userdata)
    }
    catch (err) {
        return res.status(400).json({ error: ' already exists' });

    }
})

router.post('/api/editpassword', [
    check('password')
        .notEmpty().withMessage('password cannot be empty'),
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    const { oldpassword, newpassword } = req.body
    const userLogin = await userModel.findOne({ username: req.body.user })
    const passcheck = await bcrypt.compare(oldpassword, userLogin.password)
    if (passcheck) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpassword, salt)
        const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
            password: hash
        }, { new: true })
    } else {
        res.status(401).send('not found')
    }

    res.send(userdata)
})

router.post('/api/editbio', [
    check('bio')
        .notEmpty().withMessage('bio cannot be empty'),
], async (req, res, next) => {
    if (validationResult(req).errors.length != 0) {
        res.status(403).send('Fields Cannot be Empty')
        return
    }
    const userdata = await userModel.findOneAndUpdate({ username: req.body.user }, {
        bio: req.body.bio
    }, { new: true })
    res.send(userdata)
})

router.post('/api/uploadpost', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        res.status(400).json({ error: 'no file' })
        return
    }
    const userdata = await userModel.findOne({ username: req.body.user })
    const createdPost = new postModel({
        post: req.file.filename,
        caption: req.body.caption,
        userid: userdata._id
    });
    await createdPost.save();

    userdata.posts.push(createdPost._id);
    await userdata.save();
    res.status(200).send('done')
})

router.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '../public/images/dp', imageName);

    res.sendFile(imagePath);
});

router.get('/posts/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '../public/images/data', imageName);

    res.sendFile(imagePath);
});

router.get('/api/getallpost', async (req, res) => {
    const posts = await postModel.find({})
    res.json(posts)
})


module.exports = router
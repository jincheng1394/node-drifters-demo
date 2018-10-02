let express = require('express')
let redis = require('../models/redis')
let mongodb = require('../models/mongodb')
let router = express.Router()

/**
 * 捡一个漂流瓶
 * GET /?user=xxx[&type=xxx]
 */
router.get('/', (req, res) => {
    if (!(req.query.user)) {
        return res.json({code: 0, msg: "信息不完整"})
    }

    if (req.query.type && (["male", "female"].indexOf(req.query.type) === -1)) {
        return res.json({code: 0, msg: "类型错误"})
    }

    redis.pick(req.query).then(result => {
        res.json(result)
        if (result.code === 1) {
            mongodb.save(req.query.user, result.msg)
        }
    })
})

/**
 * 扔一个漂流瓶
 * POST owner=xxx&type=xxx&content=xxx[&time=xxx]
 */
router.post('/', (req, res) => {
    if (!(req.body.owner && req.body.type && req.body.content)) {
        return res.json({code: 0, msg: "信息不完整"})
    }

    if (req.body.type && (["male", "female"].indexOf(req.body.type) === -1)) {
        return res.json({code: 0, msg: "类型错误"})
    }

    redis.throw(req.body).then(result => {
        res.json(result)
    })

})

/**
 * 获取一个用户所有的漂流瓶
 * GET /user/nswbmw
 */
router.get('/user/:user', async (req, res) => {
    let info = await mongodb.getAll(req.params.user)
    res.json(info)
})

/**
 * 获取特定id的漂流瓶
 * GET /bottle/5baba3328cd3d82bc9747a65
 */
router.get('/bottle/:_id', async (req, res) => {
    let result = await mongodb.getOne(req.params._id)
    res.json(result)

})

/**
 * 回复特定id的漂流瓶
 * POST user=xxx&content=xxx[&time=xxx]
 */
router.post('/reply/:_id', async (req, res) => {
    if (!(req.body.user && req.body.content)) {
        return res.json({
            code: 0,
            msg: "回复信息不完整！"
        })
    }

    let result = await mongodb.reply(req.params._id, req.body)

    return res.json(result)
})

/**
 * 删除特定id的漂流瓶
 * GET /bottle/5baba3328cd3d82bc9747a65
 */
router.get('/delete/:_id', async (req, res) => {
    let result = await mongodb.delete(req.params._id)
    res.json(result)
})
module.exports = router

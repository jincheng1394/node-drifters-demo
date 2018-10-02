import mongoose from "mongoose"

// 定义漂流瓶模型，并设置数据存储到bottles集合
let bottleModel = mongoose.model('Bottle', new mongoose.Schema({
    bottle: Array,
    message: Array
}, {
    collection: "bottles"
}))

// 将用户捡到漂流瓶改变格式保存
exports.save = (picker, _bottle) => {
    return new Promise((resolve, reject) => {
        let bottle = {
            bottle: [],
            message: []
        }

        bottle.bottle.push(picker)
        bottle.message.push([_bottle.owner, _bottle.time, _bottle.content])
        bottle = new bottleModel(bottle)
        bottle.save()
        resolve(true)
    })
}

// 获取用户捡到的所有漂流瓶
exports.getAll = (user) => {
    return new Promise((resolve, reject) => {
        bottleModel.find({
            bottle: user
        }).then(bottles => {
            return resolve({code: 1, msg: bottles})
        }).catch(err => {
            return resolve({code: 0, msg: "获取漂流瓶列表失败..."})
        })
    })
}

/**
 * 获取特定id的漂流瓶
 * @param _id
 * @returns {Promise<any>}
 */
exports.getOne = (_id) => {
    return new Promise((resolve, reject) => {
        // 通过id获取特定的漂流瓶
        bottleModel.findById(_id).then(bottle => {
            return resolve({code: 1, msg: bottle})
        }).catch(err => {
            return resolve({code: 0, msg: "获取漂流瓶失败..."})
        })
    })
}

/**
 * 回复特定id的漂流瓶
 * @param _id
 * @param reply
 * @returns {Promise<any>}
 */
exports.reply = (_id, reply) => {
    return new Promise(async (resolve, reject) => {
        reply.time = reply.time || Date.now()

        try {
            // 通过id找到要回复的漂流瓶
            let _bottle = await bottleModel.findById(_id)
            let newBottle = {}
            newBottle.bottle = _bottle.bottle
            newBottle.message = _bottle.message

            // 如果捡瓶子的人第一次回复漂流瓶，则在bottle键添加漂流瓶主人
            // 如果已经回复过漂流瓶，则不再添加
            if (newBottle.bottle.length === 1) {
                newBottle.bottle.push(_bottle.message[0][0])
            }

            // 在message键添加一条回复信息
            newBottle.bottle.push([reply.user, reply.time, reply.content])
            // 更新数据库中该漂流瓶信息
            bottleModel.findByIdAndUpdate(_id, newBottle).then(bottle => {
                return resolve({
                    code: 1,
                    msg: bottle
                })
            }).catch(e => {
                return resolve({
                    code: 0,
                    msg: "回复漂流瓶失败..."
                })
            })
        } catch (e) {
            return resolve({
                code: 0,
                msg: "回复漂流瓶失败..."
            })
        }
    })
}

/**
 * 删除特定id的漂流瓶
 * @param _id
 * @returns {Promise<any>}
 */
exports.delete = (_id)=>{
    return new Promise(async (resolve, reject)=>{
        // 通过id查找并删除漂流瓶
        bottleModel.findByIdAndRemove(_id).then(()=>{
            return resolve({
                code:1,
                msg:"删除成功"
            })
        }).catch(e=>{
            return resolve({
                code:0,
                msg:"删除漂流瓶失败…"
            })
        })
    })
}
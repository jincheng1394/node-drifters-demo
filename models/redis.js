import redis from "redis"

let client = redis.createClient()
let client2 = redis.createClient()
let client3 = redis.createClient()

/**
 * 扔一个漂流瓶
 * @param bottle
 */
exports.throw = (bottle) => {
    return new Promise((resolve, reject) => {
        // 先到2号数据库检查用户是否超过扔瓶次数限制
        client2.SELECT(2, () => {
            // 获取该用户扔瓶次数
            client2.GET(bottle.owner, (err, result) => {
                if (result >= 10) {
                    return resolve({
                        code: 0,
                        msg: "今天扔瓶子的机会已用完啦~"
                    })
                }

                // 扔瓶次数加1
                client2.INCR(bottle.owner, () => {
                    // 检查是否是当天第一次扔瓶子
                    // 若是，则设置记录该用户扔瓶次数键的生存期为1天
                    // 若不是，生存期保持不变
                    client2.TTL(bottle.owner, (err, ttl) => {
                        if (ttl === -1) {
                            client2.EXPIRE(bottle.owner, 86400)
                        }
                    })
                })
            })
        })

        bottle.time = bottle.time || Date.now()
        // 为每个漂流瓶随机生成一个ID
        let bottleId = Math.random().toString(16)
        let type = {
            male: 0,
            female: 1
        }

        // 根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
        client.SELECT(type[bottle.type], () => {

            client.HMSET(bottleId, bottle, (err, result) => {
                if (err) {
                    return reject({
                        code: 0,
                        msg: "过会儿再试试吧！"
                    })
                }

                // 设置漂流瓶生存期为1天
                client.EXPIRE(bottleId, 86400)

                // 返回结果，成功时返回 OK
                return resolve({
                    code: 1,
                    msg: result
                })
            })


        })


    })
}

// 捡一个漂流瓶
exports.pick = (info) => {
    return new Promise((resolve, reject) => {
        // 先到3号数据库检查用户是否超过捡瓶次数限制
        client3.SELECT(3, () => {
            // 获取该用户捡瓶次数
            client3.GET(info.user, (err, result) => {
                if (result >= 10) {
                    return resolve({
                        code: 0,
                        msg: "今天捡瓶子的机会已经用完啦~"
                    })
                }

                // 捡瓶次数加1
                client3.INCR(info.user, () => {
                    // 检查是否是当天第一次扔瓶子
                    // 若是，则设置记录该用户捡瓶次数键的生存期为1天
                    // 若不是，生存期保持不变
                    client3.TTL(info.user, (err, ttl) => {
                        if (ttl === -1) {
                            client3.EXPIRE(info.user, 86400)
                        }
                    })
                })
            })
        })

        // 20%概率捡到海星
        if (Math.random() <= 0.2) {
            return resolve({code: 0, msg: "海星"})
        }


        let type = {
            all: Math.round(Math.random()),
            male: 0,
            female: 1
        }

        info.type = info.type || "all"

        // 根据请求的瓶子类型到不同的数据库中取
        client.SELECT(type[info.type], () => {
            // 随机返回一个漂流瓶ID
            client.RANDOMKEY((err, bottleId) => {
                if (err) {
                    return resolve({code: 0, msg: err})
                }

                if (!bottleId) {
                    return resolve({code: 0, msg: "海星"})
                }

                // 根据漂流瓶 id 取到漂流瓶完整信息
                client.HGETALL(bottleId, (err, bottle) => {
                    if (err) {
                        return resolve({code: 0, msg: "漂流瓶破损了..."})
                    }

                    // 从 Redis 中删除该漂流瓶
                    client.DEL(bottleId);

                    // 返回结果，成功时包含捡到的漂流瓶信息
                    return resolve({code: 1, msg: bottle})
                })
            })
        })
    })

}

// 将捡到的漂流瓶扔回海里
exports.throwBack = (bottle) => {
    return new Promise((resolve, reject) => {
        let type = {
            male: 0,
            female: 1
        }

        // 为漂流瓶随机生成一个id
        let bottleId = Math.random().toString(16)

        // 根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
        client.SELECT(type[bottle.type], () => {
            // 以hash类型保存漂流瓶对象
            client.HMSET(bottleId, bottle, (err, result) => {
                if (err) {
                    return resolve({
                        code: 0,
                        msg: "过会儿再试试吧！"
                    })
                }

                // 根据漂流瓶的原始时间戳设置生存期
                client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now())

                // 返回结果，成功时返回OK
                return resolve({
                    code: 1,
                    msg: result
                })
            })
        })
    })
}

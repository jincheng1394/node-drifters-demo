import request from "request"

for (let i = 1; i <= 5; i++) {
    ((i) => {
        request.post({
            url: "http://127.0.0.1:3000",
            json: {
                "owner": `bottle${i}`,
                "type": "male",
                "content": `content${i}`
            }
        })
    })(i)
}

for (let i = 6; i <= 10; i++) {
    ((i) => {
        request.post({
            url: "http://127.0.0.1:3000",
            json: {"owner": `bottle${i}`, "type": "female", "content": `content${i}`}
        })
    })(i)
}
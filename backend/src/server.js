import express from 'express'
import {PrismaClient} from '@prisma/client'

const app = express ()
const prisma = new PrismaClient()

// get all posts
app.get("/api/posts", async (req, res) => {
    const posts = await prisma.posts.findMany({orderBy: [{created: 'desc'}]})
    res.send(posts)
})
//create new post
app.post('/api/posts', async(req, res) => {
    console.log("req.body", req.body)
    res.send({})
})

//delete  post
app.delete("/api/posts.:id", async (req, res) => {
    const id = +req.params.id
    res.send({})
})

app.listen(8080, () => console.log("listening on 8080"))
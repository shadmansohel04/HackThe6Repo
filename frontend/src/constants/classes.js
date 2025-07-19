class Sprite{
    constructor({position, imageSource}){
        this.position = position
        this.width = 50
        this.height = 150
        this.image = new Image()
        this.image.src = imageSource
    }

    draw(context){
        context.drawImage(this.image, this.position.x, this.position.y)
    }

    update(context){
        this.draw(context)
    }

}

class Sprite{
    constructor({position, imageSource}){
        this.position = position
        this.width = 50
        this.height = 150
        this.image = new Image()
        this.image.src = imageSource
    }

    draw(context){
        context.drawImage(this.image, this.position.x, this.position.y)
    }

    update(context){
        this.draw(context)
    }

}

export {Sprite}
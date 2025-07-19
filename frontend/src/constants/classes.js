class Sprite{
    constructor({position, imageSource, scaleX = 1, scaleY = 1, width, height, framesMax = 1, framesHold}){
        this.position = position
        this.scaleX = scaleX
        this.scaleY = scaleY
        this.width = width
        this.height = height
        this.image = new Image()
        this.image.src = imageSource
        this.framesMax = framesMax
        this.currentFrame = 0
        this.framesPassed = 0
        this.framesHold = framesHold
    }

    draw(context){
        context.drawImage(
            this.image,
            this.currentFrame *(this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x || 0,
            this.position.y || 0,
            (this.image.width / this.framesMax) * this.scaleX,
            this.height * this.scaleY,
        )

    }

    update(context){
        this.draw(context)
        if(this.framesPassed < this.framesHold){
            this.framesPassed +=1
        }
        else{
            this.framesPassed = 0
            if(this.currentFrame < this.framesMax - 1){
                this.currentFrame += 1
            }
            else{
                this.currentFrame = 0
            }
        }

    }
}

class Player extends Sprite{
    constructor({position, jump, velocity, canvasHeight, canvasWidth, color, start, health, attackPower, imageSource, scaleX = 1, scaleY = 1, framesMax = 1, framesHold}){
        super({
            position,
            scaleX,
            scaleY
        })
        
        this.moves = imageSource
        this.image = new Image()
        this.image.src = imageSource.idle.source

        this.framesMax = imageSource.idle.framesMax
        this.framesHold = imageSource.idle.framesHold

        this.velocity = velocity
        this.height = 300
        this.width = 100
        this.jump = jump || -15

        this.canvasHeight = canvasHeight,
        this.gravity = 0.7
        this.lastKey = start
        this.jumping = false
        this.attackBox = {
            position: this.position,
            width: 100,
            height: 50
        }
        this.color = color
        this.isAttacking = false
        this.health = health
        this.attackPower = attackPower
        this.canvasWidth = canvasWidth

        for(const sprite in this.moves){
            this.moves[sprite].Image = new Image()
            this.moves[sprite].Image.src = this.moves[sprite].source
        }
        console.log(this.moves)

    }
    update(context){
        this.draw(context)
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        // HEIGHT OF FLOOR
        if(this.position.y + this.height + this.velocity.y >= this.canvasHeight - 50){
            this.velocity.y = 0
            this.jumping = false
        }
        else{
            this.velocity.y += this.gravity
        }

        if(this.position.x <= 0){
            this.velocity.x = 0
            this.position.x = 0
        }
        else if(this.position.x + this.width >= this.canvasWidth){
            this.velocity.x = 0
            this.position.x = this.canvasWidth - this.width
        }

        if(this.framesPassed < this.framesHold){
            this.framesPassed +=1
        }
        else{
            this.framesPassed = 0
            if(this.currentFrame < this.framesMax - 1){
                this.currentFrame += 1
            }
            else{
                this.currentFrame = 0
            }
        }

    }

    attack(context){
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false
         }, 100);
    }
}



export {Sprite, Player}
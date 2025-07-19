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
    constructor({flip, position, jump, velocity, canvasHeight, canvasWidth, color, start, health, attackPower, imageSource, scaleX = 1, scaleY = 1, framesMax = 1, framesHold}){
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
            width: this.moves.attack.hitbox,
            height: 50
        }
        this.color = color
        this.isAttacking = false
        this.health = health
        this.attackPower = attackPower
        this.canvasWidth = canvasWidth
        this.flip = flip
        this.lastAttackTime = 0

        for(const sprite in this.moves){
            this.moves[sprite].Image = new Image()
            this.moves[sprite].Image.src = this.moves[sprite].source
        }

    }

    update(context){
        this.draw(context)
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if(this.position.y + this.height + this.velocity.y >= this.canvasHeight - 50){
            this.velocity.y = 0
            this.jumping = false
        }
        else{
            this.velocity.y += this.gravity
        }

        if(this.position.x <= -150){
            this.velocity.x = 0
            this.position.x = -150
        }
        else if(this.position.x + this.width >= this.canvasWidth - 80){
            this.velocity.x = 0
            this.position.x = this.canvasWidth - 80 - this.width
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
                this.switchSprite('idle', false)
            }
        }
    }

    draw(context) {
        context.save()

        const frameWidth = this.image.width / this.framesMax
        const drawX = this.position.x
        const drawY = this.position.y

        if (this.flip) {
            context.translate(drawX + frameWidth * this.scaleX, drawY)
            context.scale(-1, 1)
        } else {
            context.translate(drawX, drawY)
        }

        context.drawImage(
            this.image,
            this.currentFrame * frameWidth, // source x
            0,                              // source y
            frameWidth,                     // source width
            this.image.height,     
            0,                              
            0,                              // destination y (after translate)
            frameWidth * this.scaleX,       // destination width
            this.height * this.scaleY       // destination height
        )

        context.restore()
    }

    attack(context){
        const now = Date.now();
        if (now - this.lastAttackTime < 400){
            console.log("poop")
            return
        };
        
        this.lastAttackTime = now;
        this.switchSprite('attack')
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false
         }, 100);
    }

    switchSprite(sprite, flag){
        if(this.image === this.moves.attack.Image && flag == null){
            return
        }
        switch(sprite){
            case 'idle':
                if(this.image !== this.moves.idle.Image){
                    this.image = this.moves.idle.Image
                    this.framesMax = this.moves.idle.framesMax
                    this.framesHold = this.moves.idle.framesHold
                }
            break
            case 'run':
                if(this.image !== this.moves.run.Image){
                    this.image = this.moves.run.Image
                    this.framesMax = this.moves.run.framesMax
                    this.framesHold = this.moves.run.framesHold
                }
            break
            case 'jump':
                if(this.image !== this.moves.jump.Image){
                    this.image = this.moves.jump.Image
                    this.framesMax = this.moves.jump.framesMax
                    this.framesHold = this.moves.jump.framesHold
                    this.currentFrame = 0
                }
            break
            case 'attack':
                if(this.image !== this.moves.attack.Image){
                    this.image = this.moves.attack.Image
                    this.framesMax = this.moves.attack.framesMax
                    this.framesHold = this.moves.attack.framesHold
                    this.currentFrame = 0
                }
            break
        }
    }
}



export {Sprite, Player}
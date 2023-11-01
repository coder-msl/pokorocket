/*
 *  Copyright (C) <2013>  
 *  <Mateusz Sławomir Lach>
 *  <Sławomir Lach>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Object.prototype.inherit = function(baseClass)
{
    try
    {
        if(baseClass !== undefined)
        {
            tmpObj = new baseClass();
            for(prop in tmpObj)
            {
                this[prop] = tmpObj[prop];
            }
        }
    }
    catch(TypeError)
    {
        //do nothing, just trap for jQuery error
    }
};
Object.prototype.test = function() {};//dummy function 4 jQuery  to prevent errors

var PokoGame = {
    ARROW_LEFT  : 37,
    ARROW_UP    : 38,
    ARROW_RIGHT : 39,
    ARROW_BOTTOM: 40,
    ARROW_REVERSED: 68,
    KEY_P: 80,
    KEY_R: 82,
    KEY_DEL: 46,
    FIELD_TYPE_EMPTY : 0x0,
    FIELD_TYPE_ROCKET: 0x1,
    FIELD_TYPE_HOLE  : 0x2,
    FIELD_TYPE_ARROW : 0x3,
    board: null,
    timer: null,
    ctx: null,
    keyDownLock: false,
    FPS: 1000/24,
    imagesDir: "images",
    draw: function()
    {
        PokoGame.ctx.clearRect(0,0, PokoGame.board.getWidth(), PokoGame.board.getHeight());
        PokoGame.board.draw();        
    },
    isOppositeDirectionToArrow: function(Arrow, Object)
    {
        return (Arrow.getType() === PokoGame.ARROW_LEFT && Object.getDirection() === PokoGame.ARROW_RIGHT)
                 || (Arrow.getType() === PokoGame.ARROW_RIGHT && Object.getDirection() === PokoGame.ARROW_LEFT)
                 || (Arrow.getType() === PokoGame.ARROW_UP && Object.getDirection() === PokoGame.ARROW_BOTTOM)
                 || (Arrow.getType() === PokoGame.ARROW_BOTTOM && Object.getDirection() === PokoGame.ARROW_UP);

    }
 };

var Sprite = function(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height= height;
    
    this.toJSON = function()
    {
        var position = PokoGame.board.getClickedXY(this.x, this.y);
        return {"x": position.x, "y":position.y};
    }

    this.intersectsPoint = function(testX, testY)
    {
        return testX >= this.x && testX <= this.x+this.width 
                && testY >= this.y && testY <= this.y+this.height;
    };             

    this.intersectsRect = function(testX, testY, testWidth, testHeight)
    {
        return this.intersectsPoint(testX, testY) 
            || this.intersectsPoint(testX+testWidth, testY)
            || this.intersectsPoint(testX+testWidth, testY+testHeight)
            || this.intersectsPoint(testX, testY+testHeight);
    };

    this.containsRect = function(testX, testY, testWidth, testHeight)
    {
        return this.intersectsPoint(testX, testY) 
            && this.intersectsPoint(testX+testWidth, testY+testHeight);                  
    };   
    
    this.isCloseToRect = function(testX, testY, testWidth, testHeight, widthPercentage)
    {
        var distance = widthPercentage * this.width;
        return Math.sqrt(Math.pow(Math.abs(this.x-testX),2) 
                       + Math.pow(Math.abs(this.y-testY), 2)) < distance
               && Math.sqrt(Math.pow(Math.abs( (this.x+this.width)-(testX+testWidth) ),2) 
                       + Math.pow(Math.abs(this.y-testY), 2)) < distance
               && Math.sqrt(Math.pow(Math.abs( (this.x+this.width)-(testX+testWidth) ),2) 
                       + Math.pow(Math.abs( (this.y+this.height)-(testY+testHeight) ), 2)) < distance
               && Math.sqrt(Math.pow(Math.abs( (this.x)-(testX) ),2) 
                       + Math.pow(Math.abs( (this.y+this.height)-(testY+testHeight) ), 2)) < distance;  
    };
    
    this.getWidth = function()
    {
        return this.width;
    };
    
    this.getHeight = function()
    {
        return this.height;
    };
    
    this.getX = function()
    {
        return this.x;
    };
    
    this.getY = function()
    {
        return this.y;
    };

    this.drawIntersection = function(testX, testY, testWidth, testHeight)
    {
        var instersectsTopLeft   = this.intersectsPoint(testX, testY);
        var intersectsTopRight   = this.intersectsPoint(testX+testWidth, testY);
        var intersectsBottomLeft = this.intersectsPoint(testX, testY+testHeight);
        var intersectsBottomRight= this.intersectsPoint(testX+testWidth, testY+testHeight);
        
        var prevStrokeStyle = PokoGame.ctx.strokeStyle;
        var prevStrokWidth  = PokoGame.ctx.strokeWidth;
        PokoGame.ctx.beginPath();
        PokoGame.ctx.strokeStyle = 'red';
        PokoGame.ctx.strokeWidth = 3;
        if(instersectsTopLeft)
        {
            if(intersectsBottomLeft)
            {
                PokoGame.ctx.arc(testX, testY+(testHeight/2), testWidth/2, 0, Math.PI*2, true);
            }
            else if(intersectsTopRight)
            {
                PokoGame.ctx.arc(testX+(testWidth/2), testY, testWidth/2, 0, Math.PI*2, true);
            }
            else
            {
                PokoGame.ctx.arc(testX, testY, testWidth/2, 0, Math.PI*2, true);
            }
        }
        else if(intersectsBottomRight)
        {
            if(intersectsBottomLeft)
            {
                PokoGame.ctx.arc(testX+(testWidth/2), testY+(testHeight), testWidth/2, 0, Math.PI*2, true);
            }
            else if(intersectsTopRight)
            {
                PokoGame.ctx.arc(testX+(testWidth), testY+(testHeight/2), testWidth/2, 0, Math.PI*2, true);
            }
            else
            {
                PokoGame.ctx.arc(testX+(testWidth), testY+(testHeight), testWidth/2, 0, Math.PI*2, true);
            }
        }
        else if(intersectsTopRight)
        {
            PokoGame.ctx.arc(testX+(testWidth), testY, testWidth/2, 0, Math.PI*2, true);
        }
        else if(intersectsBottomLeft)
        {
            PokoGame.ctx.arc(testX, testY+(testHeight), testWidth/2, 0, Math.PI*2, true);
        }
        PokoGame.ctx.stroke();
        PokoGame.ctx.strokeStyle = prevStrokeStyle;
        PokoGame.ctx.strokeWidth = prevStrokWidth;
    };
        
    
    this.draw = function() {};
};

var Arrow = function(x, y, width, height, arrowType)
{
    this.inherit(Sprite);
    this.x = x;
    this.y = y;
    this.width = (width === null) ? 50 : width;
    this.height= (height=== null) ? 50 : height;
    var img = new Image();
    var type= arrowType;
    var lives = 2;

    if(type === PokoGame.ARROW_LEFT)
    {
        img.src = PokoGame.imagesDir+"/arrow_left.png";
    }
    else if(type === PokoGame.ARROW_UP)
    {
        img.src = PokoGame.imagesDir+"/arrow_top.png";
    }
    else if(type === PokoGame.ARROW_RIGHT)
    {
        img.src = PokoGame.imagesDir+"/arrow_right.png";
    }
    else if(type === PokoGame.ARROW_BOTTOM)
    {
        img.src = PokoGame.imagesDir+"/arrow_bottom.png";
    }
    else if(type === PokoGame.ARROW_REVERSED)
    {
        img.src = PokoGame.imagesDir+"/arrow_reversed.png";
    }

    this.draw = function()
    {
        try
        {
            var offset = 0;
            if (lives === 2) 
            {
               offset = this.width * 0.02;
            }
            else if (lives === 1)
            {
               offset = this.width * 0.15;
            }
            PokoGame.ctx.drawImage(img, this.x + offset, this.y + offset, this.width - 2*offset, this.height - 2*offset);
                
        } 
        catch(DOMException) {}
    };
            
    this.getType = function()
    {
        return type;
    };
    
    this.getLives = function()
    {
        return lives;
    };
   
    this.decLives = function()
    {
        --lives;
    };
    
    this.reset = function()
    {
       lives = 2; 
    };
    
};

var Hole = function(x, y, width, height)
{
    this.inherit(Sprite);
    this.x = x;
    this.y = y;
    this.width = (width === null) ? 50 : width;
    this.height= (height=== null) ? 50 : height;
    var img = new Image();
    img.src = PokoGame.imagesDir+"/Hole.png";

    this.draw = function()
    {
        try
        {
            PokoGame.ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } 
        catch(DOMException) {}
    };    
};

var Rocket = function(x, y, width, height) 
{
    this.inherit(Sprite);
    this.x = x;
    this.y = y;
    this.width = (width === null) ? 50 : width;
    this.height= (height=== null) ? 50 : height;
    var img = new Image();
    img.src = PokoGame.imagesDir+"/Rocket.png";

    this.draw = function()
    {
        try
        {
            PokoGame.ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } 
        catch(DOMException) {}
    };
};

var Mice = function(x, y, width, height)
{
    this.inherit(Sprite);
    this.framesNumber = 10;
    this.currentFrameNumber = 1;
    this.img = new Image;

    this.height = height == null ? 30 : height;
    this.width  = width  == null ? 30 : width;

    this.x = x === null ? 0 : x;
    this.y = y === null ? 0 : y;

    this.margin = 5;

    this.speed = this.width/10;
    this.dx = this.speed;
    this.dy = 0;
    this.img.src = PokoGame.imagesDir+"/mice.png";
    
    this.frameHeight = 100;//parseInt(this.img.height)/4;
    this.frameWidth  = 100;//parseInt(this.img.width)/this.framesNumber;
    this.directionFrameOffset = 0;
    
    this.reversedTurning = false;
    this.turningAlreadyReversed = false;
    
    this.initialState = {
        "x"    : this.x, 
        "y"    : this.y,
        "dx"   : this.dx,
        "dy"   : this.dy,
        "speed": this.speed,
        "reversedTurning": this.reversedTurning
    };
    
    this.toJSON = function()
    {
        var position = PokoGame.board.getClickedXY(this.x, this.y);
        return {"x": position.x, "y": position.y, "direction": this.getDirection()};
    };
    
    this.setSpeed = function(newSpeed)
    {
        this.speed = newSpeed;
    };
    
    this.avoidWalls = function()
    {
        ptTL = PokoGame.board.getClickedXY(this.x, this.y);
        if (this.dx > 0)
        {
            if (PokoGame.board.getVerticalWall(ptTL.x + 1, ptTL.y))
            {
                if (PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y + 1))
                {
                    if (!PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y))
                    {
                        this.turnLeft();
                    }
                    else
                    {
                        this.turnRight();
                        this.turnRight();
                    }
                }
                else
                {
                    if(this.reversedTurning && !PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y))
                    {
                        this.turnLeft();
                        this.turningAlreadyReversed = false;
                    }
                    else
                    {
                        this.turnRight();
                    } 
                }
            }
            else 
            {
                this.turnRight();
            }
        } 
        else if (this.dx < 0)
        {
            if (PokoGame.board.getVerticalWall(ptTL.x, ptTL.y))
            {
                if (PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y))
                {
                    if (!PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y+1))
                    {
                        this.turnLeft();
                    }
                    else
                    {
                        this.turnRight();
                        this.turnRight();
                    }
                }
                else
                {
                    if(this.reversedTurning && !PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y+1))
                    {
                        this.turnLeft();
                        this.turningAlreadyReversed = false;
                    }
                    else
                    {
                        this.turnRight();
                    } 
                }
            }
            else 
            {
                this.turnRight();
            }
        }
        else if (this.dy > 0)
        {
            if (PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y + 1))
            {
                if (PokoGame.board.getVerticalWall(ptTL.x, ptTL.y))
                {
                    if (!PokoGame.board.getVerticalWall(ptTL.x+1, ptTL.y))
                    {
                        this.turnLeft();
                    }
                    else
                    {
                        this.turnRight();
                        this.turnRight();
                    }
                }
                else
                {
                    if(this.reversedTurning && !PokoGame.board.getVerticalWall(ptTL.x+1, ptTL.y))
                    {
                        this.turnLeft();

                    }
                    else
                    {
                        this.turnRight();
                    }
                }
            }
            else 
            {
                this.turnRight();

            }
        }
        else if (this.dy < 0)
        {
            if (PokoGame.board.getHorizontalWall(ptTL.x, ptTL.y))
            {
                if (PokoGame.board.getVerticalWall(ptTL.x + 1, ptTL.y))
                {
                    if (!PokoGame.board.getVerticalWall(ptTL.x, ptTL.y))
                    {
                        this.turnLeft();
                    }
                    else
                    {
                        this.turnRight();
                        this.turnRight();
                    }
                }
                else
                {
                    if(this.reversedTurning && !PokoGame.board.getVerticalWall(ptTL.x, ptTL.y))
                    {
                        this.turnLeft();
                    }
                    else
                    {
                        this.turnRight();
                    }
                }
            }
            else 
            {
                this.turnRight();
            }
        }
    };
    
    this.update = function()
    {   
        //next step point top-left
        ptTL = PokoGame.board.getClickedXY(
                this.x+this.dx/*+this.margin*/, 
                this.y+this.dy/*+this.margin*/
        );
            
        //next step point bottom-right  
        ptBR = PokoGame.board.getClickedXY(
                this.x+this.width+this.dx/*+this.margin*/, 
                this.y+this.height+this.dy/*+this.margin*/
        );
            
        //current point top-left
        currPtTL = PokoGame.board.getClickedXY(
                this.x/*+this.margin*/, 
                this.y/*+this.margin*/
        );
            
        //current point bottom-right
        currPtBR = PokoGame.board.getClickedXY(
                this.x+this.width/*+this.margin*/, 
                this.y+this.height/*+this.margin*/
        );
        if (currPtTL.x === currPtBR.x && ptTL.x !== ptBR.x)
        {
            if (PokoGame.board.getVerticalWall(ptBR.x, ptBR.y))
            {
                this.avoidWalls();
            }
          
        } 
        else if (currPtTL.y === currPtBR.y && ptTL.y !== ptBR.y)
        {
            if (PokoGame.board.getHorizontalWall(ptBR.x, ptBR.y))
            {
                this.avoidWalls();
            }      
        }
        exit = PokoGame.board.isOnBoard(this.x, this.y);
        if (exit === PokoGame.ARROW_LEFT && this.getDirection() === PokoGame.ARROW_LEFT)
        {
            this.x = PokoGame.board.getWidth();
        }
        else if (exit === PokoGame.ARROW_RIGHT && this.getDirection() === PokoGame.ARROW_RIGHT)
        {
            this.x = 0 - this.width;
        }
        else if (exit === PokoGame.ARROW_UP && this.getDirection() === PokoGame.ARROW_UP)
        {
            this.y = PokoGame.board.getHeight();
        }
        else if (exit === PokoGame.ARROW_BOTTOM && this.getDirection() === PokoGame.ARROW_BOTTOM)
        {   
            this.y = 0 - this.height;
        }
        this.x += this.dx;
        this.y += this.dy;        
    };
    
    this.reset = function()
    {
        for(item in this.initialState)
        {
            this[item] = this.initialState[item];
        }
        this.changeDirection(this.getDirection(this.dx, this.dy));
    };

    this.draw = function()
    {
        PokoGame.ctx.drawImage(
            this.img, 
            (this.currentFrameNumber-1)*this.frameWidth, this.directionFrameOffset, this.frameWidth, this.frameHeight,
            this.x, this.y, this.width, this.height
        );
        if(this.currentFrameNumber+1 > this.framesNumber)
        {
            this.currentFrameNumber = 1;
        }
        else
        {
            this.currentFrameNumber++;
        }
    };
    
    this.refresh = function()
    {
        this.update();
        this.draw();
    };

    this.goLeft = function()
    {
        this.dx = -this.speed;
        this.dy = 0;         
        this.directionFrameOffset = this.frameHeight;
    };

    this.goRight = function()
    {
        this.dx = this.speed;
        this.dy = 0;        
        this.directionFrameOffset = 0;
    };

    this.goUp = function()
    {
        this.dx = 0;
        this.dy = -this.speed;  
        this.directionFrameOffset = 2*this.frameHeight;
    };

    this.goBottom = function()
    {
        this.dx = 0;
        this.dy = this.speed;
        this.directionFrameOffset = 3*this.frameHeight;
    };    
    
    this.turnRight = function()
    {
        if(this.dx > 0 && this.dy === 0)
        {
            this.goBottom();
        }
        else if(this.dx === 0 && this.dy > 0)
        {
            this.goLeft();
        }
        else if(this.dx === 0 && this.dy < 0)
        {
            this.goRight();
        }
        else if(this.dx < 0 && this.dy === 0)
        {
            this.goUp();
        }
    };
    
    this.turnLeft = function() 
    {
        if(this.dx > 0 && this.dy === 0)
        {
            this.goUp();
        }
        else if(this.dx === 0 && this.dy > 0)
        {
            this.goRight();
        }
        else if(this.dx === 0 && this.dy < 0)
        {
            this.goLeft();
        }
        else if(this.dx < 0 && this.dy === 0)
        {
            this.goBottom();
        }
    };
    
    this.turnBack = function()
    {
        var direction = this.getDirection(this.dx, this.dy);
        switch(direction)
        {
            case PokoGame.ARROW_BOTTOM:
                this.goUp();
                break;
            case PokoGame.ARROW_UP:
                this.goBottom();
                break;
            case PokoGame.ARROW_LEFT:
                this.goRight();
                break;
            case PokoGame.ARROW_RIGHT:
                this.goLeft();
                break;
        }
        this.turningAlreadyReversed = false;
    };
    
    this.getDirection = function(dx, dy)
    {
        var result = null;
        if(dx === undefined || dx === null)
        {
            dx = this.dx;
        }
        if(dy === undefined || dy === null)
        {
            dy = this.dy;
        }
        if(dx > 0 && dy === 0)
        {
            result = PokoGame.ARROW_RIGHT;
        }
        else if(dx < 0 && dy === 0)
        {
            result = PokoGame.ARROW_LEFT;
        }
        else if(dx === 0 && dy > 0)
        {
            result = PokoGame.ARROW_BOTTOM;
        }
        else if(dx === 0 && dy < 0)
        {
            result = PokoGame.ARROW_UP;
        }
        return result;
    };
    
    this.toggleReversedTurning = function()
    {
        if(!this.turningAlreadyReversed)
        {
            this.reversedTurning = !this.reversedTurning;
            this.turningAlreadyReversed = true;
        }
    };
    
    this.changeDirection = function(direction, saveAsInitial)
    {
        switch(direction)
        {
            case PokoGame.ARROW_BOTTOM:
                this.goBottom();
                break;
            case PokoGame.ARROW_LEFT:
                this.goLeft();
                break;
            case PokoGame.ARROW_UP:
                this.goUp();
                break;
            case PokoGame.ARROW_RIGHT:
                this.goRight();
                break;
        }
        
        if(saveAsInitial)
        {
            this.initialState.dx = this.dx;
            this.initialState.dy = this.dy;
        }
    };
};     

var Cat = function(x, y, width, height)
{
    this.inherit(Mice);
    this.x = x;
    this.y = y;
    this.width  = width == null ? 30 : width;
    this.height = height == null ? 30 : height;

    this.img.src = PokoGame.imagesDir+"/cat.png";
    this.speed = this.width/20;
    this.dx = this.speed;
    this.dy = 0;
    for(item in this.initialState)
    {
        this.initialState[item] = this[item];
    }
};


var Field = function(x, y, width, height, leftBorder, topBorder, rightBorder, bottomBorder, fieldType, odd)
{
    var borders = {"leftBorder":leftBorder, "topBorder":topBorder, "rightBorder":rightBorder,"bottomBorder":bottomBorder};
    var fieldType = fieldType;
    
    var x = x;
    var y = y;
    var width = width;
    var height= height;
    
    var selected = false;
    
    var fillColor = (odd == true) ? '#f6fbb9' : '#c4ba62';
    var borderColor = '#000000';
    var selectedBorderColor = '#ff0000';
    
    var spriteHolder = null;
    
    this.select = function()
    {
        selected = true;
    };
    
    this.unselect = function()
    {
        selected = false;
    };
    
    this.isSelected = function()
    {
        return selected;
    };
    
    this.getBorders = function()
    {
        return borders;
    };
    
    this.getFieldType = function()
    {
        return fieldType;
    };
    
    this.draw = function()
    {
        PokoGame.ctx.fillStyle = fillColor;
        PokoGame.ctx.lineWidth = 0;
        PokoGame.ctx.beginPath();
        PokoGame.ctx.rect(x, y, width, height);
        PokoGame.ctx.fill();
        
        if(selected)
        {
            PokoGame.ctx.strokeStyle = selectedBorderColor;
            PokoGame.ctx.lineWidth = 3;
        }
        else
        {
            PokoGame.ctx.strokeStyle = borderColor;
            PokoGame.ctx.lineWidth = 3;
        }    
        if(PokoGame.board.getVerticalWall(Math.floor(x/width), Math.floor(y/height)) || selected)
        {
            PokoGame.ctx.beginPath();
            PokoGame.ctx.moveTo(x, y);
            PokoGame.ctx.lineTo(x, y+height);
            PokoGame.ctx.stroke();
        }
        
        if(PokoGame.board.getVerticalWall(Math.floor(x/width) + 1, Math.floor(y/height)) || selected)
        {
            PokoGame.ctx.beginPath();
            PokoGame.ctx.moveTo(x+width, y);
            PokoGame.ctx.lineTo(x+width, y+height);
            PokoGame.ctx.stroke();
        }
        
        if(PokoGame.board.getHorizontalWall(Math.floor(x/width), Math.floor(y/height)) || selected)
        {
            PokoGame.ctx.beginPath();
            PokoGame.ctx.moveTo(x, y);
            PokoGame.ctx.lineTo(x+width, y);
            PokoGame.ctx.stroke();
        }
        
        if(PokoGame.board.getHorizontalWall(Math.floor(x/width), Math.floor(y/height) + 1) || selected)
        {
            PokoGame.ctx.beginPath();
            PokoGame.ctx.moveTo(x, y+height);
            PokoGame.ctx.lineTo(x+width, y+height);
            PokoGame.ctx.stroke();
        }
        
        if(spriteHolder !== null)
        {
            spriteHolder.draw();
        }
    };
    
    this.drawSprite = function()
    {
        if(spriteHolder !== null)
        {
            spriteHolder.draw();
        }
    };
    
    this.getWidth = function()
    {
        return width;
    };
    
    this.getHeight = function()
    {
        return height;
    };
    
    this.getX = function()
    {
        return x;
    };
    
    this.getY = function()
    {
        return y;
    };
    
    this.setSprite = function(sprite)
    {
        if(fieldType === PokoGame.FIELD_TYPE_EMPTY || fieldType === PokoGame.FIELD_TYPE_ARROW)
        {
            spriteHolder = sprite;
            if(sprite instanceof Arrow)
            {
                fieldType = PokoGame.FIELD_TYPE_ARROW;
            }
            else if(sprite instanceof Hole)
            {
                fieldType = PokoGame.FIELD_TYPE_HOLE;
            }
            else if(sprite instanceof Rocket)
            {
                fieldType = PokoGame.FIELD_TYPE_ROCKET;
            }
        }
    };
    
    this.removeSprite = function()
    {
        spriteHolder = null;
        fieldType = PokoGame.FIELD_TYPE_EMPTY;
    };
    
    this.getSprite = function()
    {
        return spriteHolder;
    };
};


var Board = function(width, height, xFields, yFields, boardFields)
{
    var width = width;
    var height= height;
    
    var maxWidth = width;
    var maxHeight= height;
    var fields   = new Array();
    
    var fieldHeight = height/yFields;
    var fieldWidth  = width/xFields;
    
    var selectedField = null;
    
    var initialPaint = true;
    var cacheEnabled = true;
    
    var leftArrowsAmount    = 0;
    var rightArrowsAmount   = 0;
    var upArrowsAmount      = 0;
    var bottomArrowsAmount  = 0;
    var reversedArrowsAmount= 0;
    
    var isRunning = false;
    var drawingBlocked = false;
    var isLocked = false;
    
    var verticalWalls;
    var horizontalWalls;
    
    var backgroundTag = document.createElement("canvas");
    backgroundTag.height = maxHeight;
    backgroundTag.width  = maxWidth; 
    
    var backgroundCtx = backgroundTag.getContext('2d');
    
    var sprites         = new Array();
    var arrows          = new Array();
    var removedSprites  = new Array();
    var removedArrows   = new Array();
    this.miceAndCats    = new Array();
    this.miceCount = 0;
    this.catCount  = 0;
    
    var quadTree= new QuadTree(0, 0, width, height, 1);

    if(typeof boardFields === Array)
    {
        fields = boardFields;
    }
    
    this.setCacheEnabled = function(enabled)
    {
        cacheEnabled = enabled;
    };
    
    this.toJSON = function()
    {
        var result = {"xFields": this.getWidth() / fields[0][0].getWidth(), "yFields": this.getHeight() / fields[0][0].getHeight(), "mices": [],
                "cats": [], "holes": [], "rockets": [], "arrows": {"left": 0, "right": 0,
                "top": 0, "bottom": 0}, "verticalWalls": [], "horizontalWalls": []};

        for (var x  = 0; x < this.miceAndCats.length; ++x)
        {
            if (this.miceAndCats[x] instanceof Mice)
            {
                result.mices[result.mices.length] = this.miceAndCats[x].toJSON();
            }
            else if (this.miceAndCats[x] instanceof Cat)
            {
                result.cats[result.cats.length] = this.miceAndCats[x].toJSON();
            }
        }
        
        for (var x  = 0; x < sprites.length; ++x)
        {
            if (sprites[x] instanceof Rocket)
            {
                result.rockets[result.rockets.length] = sprites[x].toJSON();
            }
            else if (sprites[x] instanceof Hole)
            {
                result.holes[result.holes.length] = sprites[x].toJSON();
            }
            else if (sprites[x] instanceof Arrow)
            {
                if (sprites[x].getType() === PokGame.ARROW_LEFT) 
                {
                    ++result.arrows.left;
                } 
                else if (sprites[x].getType() === PokGame.ARROW_RIGHT) 
                {
                    ++result.arrows.right;
                } 
                else if (sprites[x].getType() === PokGame.ARROW_UP) 
                {
                    ++result.arrows.up;
                } 
                else if (sprites[x].getType() === PokGame.ARROW_DOWN) 
                {
                    ++result.arrows.down;
                }
            }
        }
        
        for (var y = 0; y < result.yFields; ++y)
        {
            result.verticalWalls[y] = new Array();
            for (var x = 0; x < result.xFields; ++x)
            {
                result.verticalWalls[y][x] = this.getVerticalWall(x, y);
            }
        }
        for (var y = 0; y < result.yFields; ++y)
        {
            result.horizontalWalls[y] = new Array();
            for (var x = 0; x < result.xFields; ++x)
            {
                result.horizontalWalls[y][x] = this.getHorizontalWall(x, y);
            }
        }
        return result;
    };
    
    this.isRunning = function()
    {
        return isRunning;
    };
    
    this.setInitalPaint = function()
    {
        initialPaint = true;  
    };
    
    this.getWidth = function()
    {
        return width;
    };
    
    this.getBoardWidth = function()
    {
        return fieldWidth*xFields;
    };
    
    this.getBoardHeight = function()
    {
        return fieldHeight*yFields;
    };
    
    this.setHorizontalWall = function(x,y,value)
    {
        horizontalWalls[y][x] = value;   
    };
    
    this.setVerticalWall = function(x,y,value)
    {
      verticalWalls[y][x] = value;  
    };

    this.isOnBoard = function (left, top)
    {
        if (left > width)
        {
            return PokoGame.ARROW_RIGHT;
        }
        if (top > height)
        {
            return PokoGame.ARROW_BOTTOM;
        }        
        if (left < 0)
        {
            return PokoGame.ARROW_LEFT;       
        }
        if (top < 0)
        {
            return PokoGame.ARROW_UP;       
        }
        
        return 0;
    };
    
    this.setArrows = function(left, right, up, down, reversed)
    {
       leftArrowsAmount     = left     === undefined ? 0 : left;
       rightArrowsAmount    = right    === undefined ? 0 : right;
       upArrowsAmount       = up       === undefined ? 0 : up;
       bottomArrowsAmount   = down     === undefined ? 0 : down;
       reversedArrowsAmount = reversed === undefined ? 0 : reversed;
       this.updateArrowsAmount();
    };
    
    this.setLocked = function(lock)
    {
        isLocked = lock;
    };
        
    this.getHeight = function()
    {
        return height;
    };
    
    this.getClickedXY = function(x, y)
    {
        var fieldX = Math.floor(x/fieldWidth);
        var fieldY = Math.floor(y/fieldHeight);
        
        return {"x" : fieldX, "y": fieldY};
    };
    
    this.getClickedField = function(x, y)
    {
        var position = this.getClickedXY(x, y);
        return fields[position.x][position.y];
    };
    
    this.click = function(x, y)
    {
        if(!isLocked && x < width && y < height)
        {
            var position = this.getClickedXY(x, y);
            if(position.x < 0 || position.x > xFields || position.y < 0 || position.y > yFields)
            {
                return;
            }
            var clicked  = fields[position.x][position.y];
            if(selectedField === clicked)
            {
                selectedField.unselect();
                selectedField = null;
            }
            else if(clicked !== undefined)
            {
                if(selectedField !== null)
                {
                    selectedField.unselect();
                }
                clicked.select();
                selectedField = clicked;
            }    
        }
    };
    
    this.isPointInBoard = function(x, y)
    {
        return x < fieldWidth*xFields && y < fieldHeight*yFields;
    };
    
    this.isFieldInBoard = function(x, y)
    {
        return x < xFields && y < yFields;
    };
    
    this.addArrow = function(arrow)
    {
        var position = this.getClickedXY(arrow.x, arrow.y);
        if(this.isFieldInBoard(position.x, position.y))
        {
            arrows[arrows.length] = arrow;
            fields[position.x][position.y].setSprite(arrow);
            return true;
        }
        return false;
    };
    
    this.deleteArrow = function(arrow)
    {
        var position = this.getClickedXY(arrow.x, arrow.y);
        
        if(this.isFieldInBoard(position.x, position.y))
        {        
            arrows.splice(arrows.indexOf(arrow), 1);
            sprites.splice(sprites.indexOf(sprites), 1);
            fields[position.x][position.y].removeSprite();
            return true;
        }
        return false;
    };
    
    this.keyUp = function(evtNumber, event)
    {
        if(!isLocked)
        {
            var internalFunction = function(evtNumber, event)
            {
                if(evtNumber === PokoGame.ARROW_BOTTOM || evtNumber === PokoGame.ARROW_LEFT 
                        || evtNumber === PokoGame.ARROW_RIGHT || evtNumber === PokoGame.ARROW_UP
                        || evtNumber === PokoGame.ARROW_REVERSED)
                {
                    if(selectedField !== null && !isRunning)
                    {
                        var fieldType = selectedField.getFieldType();
                        if(fieldType === PokoGame.FIELD_TYPE_EMPTY || fieldType === PokoGame.FIELD_TYPE_ARROW)
                        {
                            prevArrow = selectedField.getSprite();
                            arrow = new Arrow(
                                        selectedField.getX(), selectedField.getY(),
                                        fieldWidth, fieldHeight, evtNumber
                                    );

                            if (prevArrow !== null)
                            {
                                arrows.splice(arrows.indexOf(prevArrow), 1);
                                selectedField.removeSprite();
                                if (prevArrow.getType() === PokoGame.ARROW_LEFT)
                                {
                                    leftArrowsAmount++;
                                }
                                else if (prevArrow.getType() === PokoGame.ARROW_RIGHT)
                                {
                                    rightArrowsAmount++;
                                }
                                else if (prevArrow.getType() === PokoGame.ARROW_UP)
                                {
                                    upArrowsAmount++;
                                }
                                else if (prevArrow.getType() === PokoGame.ARROW_BOTTOM)
                                {
                                    bottomArrowsAmount++;
                                }
                                else if(prevArrow.getType() === PokoGame.ARROW_REVERSED)
                                {
                                    reversedArrowsAmount++;
                                }
                                //below if needet for arrow removing
                                if(prevArrow.getType() === arrow.getType()) 
                                {
                                    return;
                                }
                            }
                            if (evtNumber === PokoGame.ARROW_LEFT)
                            {
                                if (leftArrowsAmount === 0)
                                {
                                    return;
                                }

                                leftArrowsAmount--;
                            }
                            else if (evtNumber === PokoGame.ARROW_RIGHT)
                            {
                                if (rightArrowsAmount === 0)
                                {
                                    return;
                                }

                                rightArrowsAmount--;
                            }
                            else if (evtNumber === PokoGame.ARROW_BOTTOM)
                            {
                                if (bottomArrowsAmount === 0)
                                {
                                    return;
                                }

                                bottomArrowsAmount--;
                            }
                            else if (evtNumber === PokoGame.ARROW_UP)
                            {
                                if (upArrowsAmount === 0)
                                {
                                    return;
                                }

                                upArrowsAmount--;
                            }
                            else if(evtNumber === PokoGame.ARROW_REVERSED)
                            {
                                if(reversedArrowsAmount === 0)
                                {
                                    return;
                                }

                                reversedArrowsAmount--;
                            }
                            selectedField.setSprite(arrow);
                            arrows[arrows.length] = arrow;
                        }
                    }    
                    if(selectedField !== null && event !== undefined)
                    {
                        event.preventDefault();
                    }
                }

                if(evtNumber === PokoGame.KEY_P)
                {
                    PokoGame.board.toggleRunning();
                }
                else if(evtNumber === PokoGame.KEY_R)
                {
                    PokoGame.board.reset();
                }   
            };
            internalFunction(evtNumber, event);
            this.updateArrowsAmount();
            
        }
    };
    
    this.toggleRunning = function()
    {
        if(isRunning && this.miceCount)
        {
            return;
        }
        isRunning = !isRunning;
    };
    
    this.reset = function()
    {
        for(var i=0; i<removedSprites.length; i++)
        {
            this.miceAndCats[this.miceAndCats.length] = removedSprites[i];
            if(removedSprites[i] instanceof Cat)
            {
                this.catCount++;
            }
            else if(removedSprites[i] instanceof Mice)
            {
                this.miceCount++;
            }
        }
        for(var i=0; i<removedArrows.length; i++)
        {
            arrows[arrows.length] = removedArrows[i];
            this.getClickedField(removedArrows[i].x, removedArrows[i].y).setSprite(removedArrows[i]);
        }
        removedSprites = new Array();
        removedArrows  = new Array();
        for(var i=0; i<this.miceAndCats.length; i++)
        {
            this.miceAndCats[i].reset();
        }
        for(var i=0; i<arrows.length; i++)
        {
            arrows[i].reset();
        }
        
        if(!isRunning)
        {
            for(var i=0; i<arrows.length; i++) 
            {
                var type = arrows[i].getType();
                switch(type)
                {
                    case PokoGame.ARROW_BOTTOM:
                        bottomArrowsAmount++;
                        break;
                    case PokoGame.ARROW_UP:
                        upArrowsAmount++;
                        break;
                    case PokoGame.ARROW_LEFT:
                        leftArrowsAmount++;
                        break;
                    case PokoGame.ARROW_RIGHT:
                        rightArrowsAmount++;
                        break;
                    case PokoGame.ARROW_REVERSED:
                        reversedArrowsAmount++;
                        break;
                }
            }
            arrows = new Array();
            for(var x=0; x<xFields; x++)
            {
                for(var y=0; y<yFields; y++)
                {
                    if(fields[x][y].getFieldType() === PokoGame.FIELD_TYPE_ARROW)
                    {
                        fields[x][y].removeSprite();
                    }
                }
            }
        }
        if(PokoGame.timer === false)
        {
            PokoGame.timer = setInterval(PokoGame.draw, PokoGame.FPS);
        }
        isRunning = false;
        this.updateArrowsAmount();
    };
    
    this.isClean = function()
    {
        return (this.miceCount === 0);
    };
    
    this.win = function()
    {
         this.nextLevel();  
    };
    
    this.updateArrowsAmount = function()
    {
        $("#arrowsLeft").html(leftArrowsAmount);
        $("#arrowsRight").html(rightArrowsAmount);
        $("#arrowsUp").html(upArrowsAmount);
        $("#arrowsDown").html(bottomArrowsAmount);
        $("#arrowsReversed").html(reversedArrowsAmount);
    };
    
    this.addSprite = function(type, fieldX, fieldY)
    {
        var height = fieldHeight*0.8;
        var width  = fieldWidth*0.8;
        var x      = (fieldX*fieldWidth)+(Math.abs(fieldWidth-width)/2);
        var y      = (fieldY*fieldHeight)+(Math.abs(fieldHeight-height)/2);
        var sprite = new type(x, y, width, height);
        
        fields[fieldX][fieldY].setSprite(sprite);
        sprites[sprites.length] = sprite;
    };
    
    this.removeSprite = function(fieldX, fieldY)
    {
        if(fields.length > fieldX && fields[fieldX].length > fieldY)
        {
            var sprite = fields[fieldX][fieldY].getSprite();
            var indexof = sprites.indexOf(sprite);
            if (indexof !== -1)
            {
                sprites.splice(indexof, 1);
                fields[fieldX][fieldY].removeSprite();
            }
        }
    };
    
    this.addMiceOrCat = function(type, fieldX, fieldY, toField) 
    {
        var height = fieldHeight*0.8;
        var width  = fieldWidth *0.8;
        var x      = (fieldX*fieldWidth)+(Math.abs(fieldWidth-width)/2);
        var y      = (fieldY*fieldHeight)+(Math.abs(fieldHeight-height)/2);
        var sprite = new type(x, y, width, height);
        
        if(this.isPointInBoard(x, y))
        {
            if (type === Mice)
            {
                this.miceCount++;
            }
            else if (type === Cat)
            {
                this.catCount++;        
            }

            if(toField === true)
            {
                fields[fieldX][fieldY].setSprite(sprite);
            }
            else
            {
                this.miceAndCats[this.miceAndCats.length] = sprite;
            }
            return true;
        }
        else
        {
            return false;
        }
    };
    
    this.getSelectedField = function() 
    {
        return selectedField;
    };
    
    this.drawFields = function()
    {
        for(var i=0; i<fields.length; i++)
        {
            for(var j=0; j<fields[i].length; j++)
            {
                fields[i][j].draw();
            }
        }        
    };
    
    this.draw = function()
    {
        if(drawingBlocked)
        {
            return;
        }
        if(initialPaint)
        {
            //needed for clearing on nextLevel() when next board is smaller
            backgroundCtx.clearRect(0, 0, maxWidth, maxHeight);
            backgroundCtx.beginPath();
            backgroundCtx.fillStyle = '#a6a06f';
            backgroundCtx.fillRect(0, 0, maxWidth, maxHeight);
            backgroundCtx.closePath();
            PokoGame.ctx.beginPath();
            PokoGame.ctx.fillStyle = '#a6a06f';
            PokoGame.ctx.fillRect(0, 0, maxWidth, maxHeight);
            PokoGame.ctx.closePath();            
            PokoGame.ctx.drawImage(backgroundTag, 0, 0);
            //end-of needed for clearing on nextLevel() when next board is smaller
            this.drawFields();//drawing fields on initial paint
            if(cacheEnabled)
            {
                backgroundCtx.drawImage(document.getElementById('canvas'), 0, 0);//save board in cache
            }
            initialPaint = false;
        }
        else
        {
            if(cacheEnabled)
            {
                PokoGame.ctx.drawImage(backgroundTag, 0, 0);//draw board from cache
            }
            else
            {
                this.drawFields();
            }
            quadTree.clear();
            for(var i=0; i<sprites.length; i++)
            {
                quadTree.add(sprites[i], sprites[i].getX(), sprites[i].getY(), 
                                     sprites[i].getWidth(), sprites[i].getHeight());
            }
            for(i=0; i<arrows.length; i++)
            {
                quadTree.add(arrows[i], arrows[i].getX(), arrows[i].getY(),
                                arrows[i].getX(), arrows[i].getY());
            }

            for(i=0; i<this.miceAndCats.length; i++)
            {
                quadTree.add(this.miceAndCats[i], 
                             this.miceAndCats[i].getX(), 
                             this.miceAndCats[i].getY(),
                             this.miceAndCats[i].getX(), 
                             this.miceAndCats[i].getY());
            }
            var endOfGame = false;
            for(var i=0; i<this.miceAndCats.length && isRunning; i++) //available only when isRunnig
            {
                currSprite = this.miceAndCats[i];
                var closeSprites = quadTree.getElemsNearby(this.miceAndCats[i].x, 
                                                           this.miceAndCats[i].y, 
                                                           this.miceAndCats[i].width, 
                                                           this.miceAndCats[i].height);

                for(var j=0; j<closeSprites.length; j++)
                {
                    if(Object.getPrototypeOf(currSprite) === Object.getPrototypeOf(closeSprites[j]))
                    {
                        continue;
                    }
                    if(closeSprites[j].intersectsRect(currSprite.x, currSprite.y, 
                                                      currSprite.width, currSprite.height))
                    {
                         if (closeSprites[j] instanceof Arrow)
                         {
                            if (closeSprites[j].containsRect(currSprite.x, currSprite.y,
                                    currSprite.width, currSprite.height))
                            {
                                direction = closeSprites[j].getType();
                                if (currSprite instanceof Cat)
                                {
                                    if (PokoGame.isOppositeDirectionToArrow(closeSprites[j], currSprite))
                                    {
                                        closeSprites[j].decLives();
                                        if (closeSprites[j].getLives() === 0)
                                        {
                                            var removed = arrows.splice(arrows.indexOf(closeSprites[j]), 1);
                                            removedArrows[removedArrows.length] = removed[0];
                                            this.getClickedField(closeSprites[j].x, closeSprites[j].y).removeSprite();
                                            --j;
                                        }
                                    }

                                }
                                if(direction !== PokoGame.ARROW_REVERSED)
                                {
                                    currSprite.changeDirection(direction);
                                }
                                else
                                {
                                    currSprite.toggleReversedTurning();
                                }
                            }

                         }
                         else if (currSprite instanceof Mice)
                         {
                             if(closeSprites[j] instanceof Hole)
                             {
                                 endOfGame = true;
                                 currSprite.drawIntersection(closeSprites[j].x, closeSprites[j].y, 
                                                          closeSprites[j].width, closeSprites[j].height);
                             }
                             else if (closeSprites[j] instanceof Cat)
                             {
                                 if(closeSprites[j].isCloseToRect(currSprite.x, currSprite.y, 
                                                      currSprite.width, currSprite.height, 0.85))
                                 {
                                     endOfGame = true;
                                     currSprite.drawIntersection(closeSprites[j].x, closeSprites[j].y, 
                                                             closeSprites[j].width, closeSprites[j].height); 
                                 }
                             }
                             else if(closeSprites[j] instanceof Rocket)
                             {
                                if(closeSprites[j].isCloseToRect(currSprite.x, currSprite.y, 
                                                      currSprite.width, currSprite.height, 0.25))
                                {
                                    var removed = this.miceAndCats.splice(this.miceAndCats.indexOf(currSprite), 1);
                                    i--;
                                    this.miceCount--;
                                    removedSprites[removedSprites.length] = removed[0];
                                    if (this.isClean())
                                    {
                                        this.win();
                                        return;
                                    }
                                }
                             }
                         }
                         else
                         {
                             if(closeSprites[j] instanceof Hole)
                             { 
                                if(closeSprites[j].isCloseToRect(currSprite.x, currSprite.y, 
                                                      currSprite.width, currSprite.height, 0.25))
                                {                                 
                                    var removed = this.miceAndCats.splice(this.miceAndCats.indexOf(currSprite), 1);
                                    removedSprites[removedSprites.length] = removed[0];
                                    i--;
                                }
                             }
                             else if(closeSprites[j] instanceof Rocket)
                             {
                                 endOfGame = true;
                                 currSprite.drawIntersection(closeSprites[j].x, closeSprites[j].y, 
                                                         closeSprites[j].width, closeSprites[j].height);
                             }
                         }
                    }
                }
            }
            if(endOfGame)
            {
                clearInterval(PokoGame.timer);
                PokoGame.timer = false;                
            }
        }
        
        if(selectedField !== null)
        {
            selectedField.draw();
        }
        for(i=0; i<arrows.length; i++)
        {
            arrows[i].draw();
        }
        for(i=0; i<sprites.length; i++)
        {
            sprites[i].draw();
        }
        for (i=0; i < this.miceAndCats.length; i++)
        {
            if(isRunning)
            {
                this.miceAndCats[i].update();
            }
            this.miceAndCats[i].draw();   
        }
    };
    
    this.clearAll = function()
    {
        removedSprites      = new Array();
        removedArrows       = new Array();
        this.miceAndCats    = new Array();
        arrows      = new Array();
        sprites     = new Array();
        fields      = new Array();
        selectedField = null;
    };
    
    this.load = function(stage)
    {
        drawingBlocked = true;
        if(typeof stage !== "object")
        {
            stage = jQuery.parseJSON(stage);
        }
        
        this.clearAll();
        
        xFields = stage.xFields;
        yFields = stage.yFields;
        fieldHeight = (maxHeight/yFields < maxWidth/xFields) ? maxHeight/yFields : maxWidth/xFields;
        fieldWidth  = (maxHeight/yFields < maxWidth/xFields) ? maxHeight/yFields : maxWidth/xFields;
        
        width = fieldWidth * xFields;
        height= fieldHeight* yFields;
        
        for(var x=0; x<xFields; x++)
        {
            fields[x] = new Array();
            for(var y=0; y<yFields; y++)
            {
                fields[x][y] = new Field(x*fieldWidth, y*fieldHeight, 
                                         fieldWidth, fieldHeight, 0, 0, 0, 0, 0, (x+y)%2);
            }
        }
        
        if(stage.mices !== undefined)
        {
            for(var i=0; i<stage.mices.length; i++)
            {
                this.addMiceOrCat(Mice, stage.mices[i].x, stage.mices[i].y, false);
                if(stage.mices[i].direction !== undefined)
                {
                    this.miceAndCats[this.miceAndCats.length-1].changeDirection(stage.mices[i].direction, true);
                }
            }
            this.miceCount = stage.mices.length;
        }
        
        if(stage.cats !== undefined)
        {
            for(var i=0; i<stage.cats.length; i++)
            {
                this.addMiceOrCat(Cat, stage.cats[i].x, stage.cats[i].y, false);
                if(stage.cats[i].direction !== undefined)
                {
                    this.miceAndCats[this.miceAndCats.length-1].changeDirection(stage.cats[i].direction, true);
                }
            }
            this.catCount = stage.cats.length;
        }
        
        if(stage.rockets !== undefined)
        {
            for(var i=0; i<stage.rockets.length; i++)
            {
                this.addSprite(Rocket, stage.rockets[i].x, stage.rockets[i].y, false);
            }
        }
        
        if(stage.holes !== undefined)
        {
            for(var i=0; i<stage.holes.length; i++)
            {
                this.addSprite(Hole, stage.holes[i].x, stage.holes[i].y, false);
            }
        }
        
        if(stage.boardArrows !== undefined)
        {
            for(var i=0; i<stage.boardArrows.length; i++)
            {
                var x = stage.boardArrows[i].x;
                var y = stage.boardArrows[i].y;
                var field = fields[x][y];
                var arrow = new Arrow(
                    field.getX(), field.getY(), fieldWidth, 
                    fieldHeight, stage.boardArrows[i].direction
                );  
                    
                arrows[arrows.length] = arrow;
            }
        }
        
        if(stage.horizontalWalls !== undefined && stage.horizontalWalls instanceof Array
                && stage.verticalWalls !== undefined && stage.verticalWalls instanceof Array
                && stage.horizontalWalls.length > 0 && stage.verticalWalls.length > 0)
        {
            verticalWalls = stage.verticalWalls;
            horizontalWalls = stage.horizontalWalls;
        }
        else
        {
            verticalWalls   = new Array();
            horizontalWalls = new Array();
            
            for(var y=0; y<yFields; y++)
            {
                verticalWalls[y]   = new Array();
                horizontalWalls[y] = new Array();
                for(var x=0; x<xFields; x++)
                {
                    horizontalWalls[y][x] = 0;
                    verticalWalls[y][x] = 0;
                }
            }
        }
        
        if(stage.arrows !== undefined)
        {
            this.setArrows(
                stage.arrows.left, 
                stage.arrows.right, 
                stage.arrows.top, 
                stage.arrows.bottom,
                stage.arrows.reversed
            );
        }
        
        initialPaint = true;
        drawingBlocked = false;
        $('#currLevel').html($.cookie('currLevel'));
    };
    
    this.init = function()
    {
        var cookies = $.cookie();
        if(cookies.currLevel === undefined)
        {
            $.cookie('currLevel', 1);
        }
        loadLevel($.cookie('currLevel'));
        
    };
    
    this.nextLevel = function()
    {
        if(this.miceCount === 0)
        {
            window.clearInterval(PokoGame.timer);
            var solvedLevel = parseInt($.cookie('currLevel'));
            var nextLevel   = solvedLevel+1;
            $.cookie('currLevel', nextLevel);
            isRunning = false;
            loadLevel(nextLevel);
            PokoGame.timer = window.setInterval(PokoGame.draw, PokoGame.FPS);
        }
    };
    
    loadLevel = function(lvlNumber)
    {
        $.ajax('levels/lvl'+lvlNumber+'.json')
            .done(function(data)
                {
                    PokoGame.board.load(data);
                    $('#buttonStart').attr('disabled', false);
                })
            .fail(function(data)
            {
                window.clearInterval(PokoGame.timer);
                if(confirm('Koniec gry! Zaczac od nowa?'))
                {
                    $.cookie('currLevel', 1);
                    PokoGame.board.init();
                    PokoGame.timer = window.setInterval(PokoGame.draw, PokoGame.FPS);
                }
            });          
    };
    
    this.getVerticalWall = function(x, y) 
    {
        if (x == xFields)
        {
          x = 0;       
        }
        if (y == yFields)
        {
          y = 0;       
        }
        
        if (x > xFields || y > yFields)
        {
            return true;        
        }
        return verticalWalls[y][x];
    };
    
    this.getHorizontalWall = function(x, y) 
    {
        if (x == xFields)
        {
          x = 0;       
        }
        if (y == yFields)
        {
          y = 0;       
        }
        if (x > xFields || y > yFields)
        {
            return true;        
        }
        return horizontalWalls[y][x];
    };
};



$(document).ready(function()
{
    var contextTag = $('#canvas');
    PokoGame.ctx     = contextTag[0].getContext('2d');
    PokoGame.board   = new Board(contextTag.width(), contextTag.height(), 10, 10, null);
    
    PokoGame.board.init();
    
    PokoGame.timer = setInterval(PokoGame.draw, PokoGame.FPS);
    
    $('#canvas').click(function(evt)
    {
        if(evt.which === 3)
        {
            return false;
        }
        PokoGame.board.click(evt.clientX-$(this).offset().left+$(document).scrollLeft(), 
                             evt.clientY-$(this).offset().top+$(document).scrollTop());
    });
    
    $('body').bind("contextmenu", function()
    {
       return false; 
    });
    
    $(this).keydown(function(evt)
    {
        if(!PokoGame.keyDownLock)
        {
            PokoGame.keyDownLock = true;
            PokoGame.board.keyUp(evt.which, evt);
            PokoGame.keyDownLock = false;
        }
    });

    $('#buttonStart').click(function()
    {
        PokoGame.board.toggleRunning();
        $(this).attr('disabled', true);
    });
    
    $('#buttonReset').click(function()
    {
        $('#buttonStart').attr('disabled', false);
        PokoGame.board.reset();
    });
    
    $('.arrow').click(function()
    {
        PokoGame.board.keyUp(PokoGame[$(this).attr('id')]);
    });
});



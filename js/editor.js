
var brush = 'rocket';
var leftArrowsAmount = 0;
var rightArrowsAmount = 0;
var bottomArrowsAmount = 0;
var upArrowsAmount = 0;

PokoGame.Editor = {
    Brushes: {
        ARROW: 1,
        CAT: 2,
        DELETE: 3,
        HOLE: 4,
        MICE: 5,
        POINTER: 6,
        ROCKET: 7,
        WALL: 8
    },
    currentBrush: 5, //pointer
    isLocked: false
};

function setBrush(newbrush)
{
    PokoGame.Editor.currentBrush = newbrush;    
}

function editorClick(x, y) 
{
    var position = PokoGame.board.getClickedXY(x, y);
    var spritePos;
    var brush = PokoGame.Editor.currentBrush;
    var brushes = PokoGame.Editor.Brushes;
  
    if (PokoGame.board.isRunning()) 
    {
        return;
    }
    if (brush === brushes.DELETE)
    {
        for (var i = 0; i < PokoGame.board.miceAndCats.length; ++i)
        {
            spritePos = PokoGame.board.getClickedXY(PokoGame.board.miceAndCats[i].x, PokoGame.board.miceAndCats[i].y);
            if (spritePos["x"] === position["x"] && spritePos["y"] === position["y"])
            {
                if (PokoGame.board.miceAndCats[i] instanceof Mice)
                {
                    --PokoGame.board.miceCount;
                }
                else if (PokoGame.board.miceAndCats[i] instanceof Cat)
                {
                    --PokoGame.board.catCount;
                }
                PokoGame.board.miceAndCats.splice(i, 1);
            }
        }
        PokoGame.board.removeSprite(position["x"], position["y"]);
    }
    else if(PokoGame.board.isFieldInBoard(position.x, position.y))
    {
        switch(brush)
        {
            case brushes.MICE:
                PokoGame.board.addMiceOrCat(Mice, position["x"], position["y"], false);
                break;
            case brushes.CAT:
                PokoGame.board.addMiceOrCat(Cat, position["x"], position["y"], false);
                break;
            case brushes.ROCKET:
                PokoGame.board.addSprite(Rocket, position["x"], position["y"]);  
                break;
            case brushes.HOLE:
                PokoGame.board.addSprite(Hole, position["x"], position["y"]);
                break;
        }
        
    }
}

function rotatePet(keyNumber)
{
    var selectedField = PokoGame.board.getSelectedField();
    if (!selectedField)
    {
        return;    
    }
    
    var sprite = selectedField.getSprite(); 
    var mapPosition = PokoGame.board.getClickedXY(selectedField.getX(), selectedField.getY());
    var spritePos;
   
    if (PokoGame.board.isRunning())
    {
        return;
    }
    for (var x = 0; x < PokoGame.board.miceAndCats.length; ++x)
    {   
         spritePos = PokoGame.board.getClickedXY(
                         PokoGame.board.miceAndCats[x].x, 
                         PokoGame.board.miceAndCats[x].y
                     );
         if (mapPosition["x"] === spritePos["x"] && mapPosition["y"] === spritePos["y"])
         {
             PokoGame.board.miceAndCats[x].changeDirection(keyNumber, true);
         }
    }
    
}

function changeArrow(evtNumber)
{
    var field = PokoGame.board.getSelectedField();
    if(field !== null)
    {
        var prevArrow = field.getSprite();
        var arrow = new Arrow(field.getX(), field.getY(), field.getWidth(), field.getHeight(), evtNumber); 

        if (prevArrow)
        {
            if (prevArrow.getType() === PokoGame.ARROW_LEFT)
            {
                leftArrowsAmount--;
            }
            else if (prevArrow.getType() === PokoGame.ARROW_RIGHT)
            {
                rightArrowsAmount--;
            }
            else if (prevArrow.getType() === PokoGame.ARROW_UP)
            {
                upArrowsAmount--;
            }
            else if (prevArrow.getType() === PokoGame.ARROW_BOTTOM)
            {
                bottomArrowsAmount--;
            }
            else if (prevArrow.getType() === PokoGame.ARROW_REVERSED)
            {
                reversedArrowsAmount--;
            }
            PokoGame.board.deleteArrow(prevArrow);
            if(prevArrow.getType() === arrow.getType())
            {
                PokoGame.board.setArrows(leftArrowsAmount, rightArrowsAmount, upArrowsAmount, bottomArrowsAmount);
                return;
            }            
        }
        if (evtNumber === PokoGame.ARROW_LEFT)
        {
            leftArrowsAmount++;
        }
        else if (evtNumber === PokoGame.ARROW_RIGHT)
        {

            rightArrowsAmount++;
        }
        else if (evtNumber === PokoGame.ARROW_BOTTOM)
        {

            bottomArrowsAmount++;
        }
        else if (evtNumber === PokoGame.ARROW_UP)
        {

            upArrowsAmount++;
        }
        else if (evtNumber === PokoGame.ARROW_REVERSED)
        {
            reversedArrowsAmount++;
        }
        field.setSprite(arrow);
        PokoGame.board.addArrow(arrow);
        PokoGame.board.setArrows(leftArrowsAmount, rightArrowsAmount, upArrowsAmount, bottomArrowsAmount);
    }
}

function changeWall(keyNumber)
{
    var field = PokoGame.board.getSelectedField();
    var position = PokoGame.board.getClickedXY(field.getX(), field.getY());
    if (keyNumber === PokoGame.ARROW_UP) 
    {
        value = PokoGame.board.getHorizontalWall(position["x"], position["y"]);
        value = 1 - value;
        PokoGame.board.setHorizontalWall(position["x"], position["y"], value);
    }
    else if (keyNumber === PokoGame.ARROW_BOTTOM) 
    {
        value = PokoGame.board.getHorizontalWall(position["x"], position["y"] + 1);
        value = 1 - value;
        PokoGame.board.setHorizontalWall(position["x"], position["y"] + 1, value);
    }
    else if (keyNumber === PokoGame.ARROW_LEFT) 
    {
        value = PokoGame.board.getVerticalWall(position["x"], position["y"]);
        value = 1 - value;
        PokoGame.board.setVerticalWall(position["x"], position["y"], value);
    }
    else if (keyNumber === PokoGame.ARROW_RIGHT) 
    {
        value = PokoGame.board.getVerticalWall(position["x"] + 1, position["y"]);
        value = 1 - value;
        PokoGame.board.setVerticalWall(position["x"] + 1, position["y"], value);
    }
}

function newmap()
{
    var contextTag = $('#canvas');
    var width = document.getElementById("width").value;
    var height = document.getElementById("height").value;
    
    PokoGame.board.setArrows(0, 0, 0, 0);
    PokoGame.board.reset();
    PokoGame.board.miceCount = 0;
    PokoGame.board.catCount  = 0;
    PokoGame.board.load({"yFields": height, "xFields": width});
    PokoGame.board.setCacheEnabled(false);
    $('.brushPicker').height(PokoGame.board.getBoardHeight());
}

function editorKeydown(keyNumber, event) 
{
    var brush = PokoGame.Editor.currentBrush,
        brushes = PokoGame.Editor.Brushes;

    $('#submitBtn').attr('disabled', true);
    if (brush === brushes.CAT || brush === brushes.MICE)
    {
        rotatePet(keyNumber);
    }
    else if (brush === brushes.ARROW)
    {
        changeArrow(keyNumber);
    }
    else if (brush === brushes.WALL)
    {
        changeWall(keyNumber);
    }
}

function submitMap()
{
    alert(JSON.stringify(PokoGame.board.toJSON()));
};

$(document).ready(function() 
{
    var contextTag = $('#canvas');

    PokoGame.ctx     = contextTag[0].getContext('2d');
    PokoGame.board   = new Board(contextTag.width(), contextTag.height(), width, height, null);
    PokoGame.board.init();


    PokoGame.board.win = function() 
    {
        PokoGame.board.reset();
        $('#submitBtn').attr('disabled', false);
    };

    $('#submitBtn').click(submitMap);

    PokoGame.board.setArrows(0, 0, 0, 0);
  
    $('#canvas').click(function(evt)
    {
        if(evt.which === 3 || PokoGame.Editor.isLocked)
        {
            return false;
        }
        editorClick(evt.clientX-$(this).offset().left+$(document).scrollLeft(), 
                    evt.clientY-$(this).offset().top+$(document).scrollTop());
    });
    
    $(this).unbind('keydown');
    $(this).keydown(function(evt)
    {
        if(!PokoGame.keyDownLock && !PokoGame.Editor.isLocked)
        {
            PokoGame.keyDownLock = true;
            editorKeydown(evt.which, evt);
            PokoGame.keyDownLock = false;
        }
        if(PokoGame.board.getSelectedField() !== null)
        {
            evt.preventDefault();
            return false;
        }
    });
    
    $('.setBrush').click(function(event)
    {
        event.preventDefault();
        setBrush(PokoGame.Editor.Brushes[$(this).attr('rel')]);
        $('td.active').removeClass('active');
        $(this).parent().addClass('active');
        return false;
    });
    
    $('.brushPicker').height(PokoGame.board.getBoardHeight());
  }
);
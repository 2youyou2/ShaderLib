/**
 * Created by wuhao on 14-4-27.
 */
//touch handling
var touchEvent = cc.EventListener.create({
    event: cc.EventListener.TOUCH_ONE_BY_ONE,
    swallowTouches: true,
    body:null,
    joint:null,
    shape:null,
    targetBody:null,
    onTouchBegan:function(touch, e){
        var p = touch.getLocation();
        var shape = space.pointQueryFirst(p, TENTACLE_LAYER, cp.NO_GROUP);
        if(shape)
        {
            var targetbody = this.targetBody = shape.body;
            var touchbody = this.body = space.staticBody;
            //var touchShape = this.shape = space.addShape(new cp.CircleShape(touchbody, 5, cp.v(0,0)));
            //touchShape.setCollisionType(2);
            var touchJoint = this.joint = new cp.PivotJoint(touchbody, targetbody, touch.getLocation());
            //var touchJoint = this.joint = new cp.DampedSpring(touchbody, targetbody, touch.getLocation(), targetbody.p, 2, 20, 20);
            touchJoint.maxForce = 50000;
            touchJoint.errorBias = Math.pow(1 - 0.15, 60);
            space.addConstraint(touchJoint);
            //space.addBody(touchbody);
            return true;
        }
        else{
            return false;
        }
    },
    onTouchMoved:function(touch, e){
        /*        if(touch.getLocation().y > 400)
         {
         return false;
         }*/
        if(this.body)
        {
            var p = cc.pAdd(this.body.p, touch.getDelta());
            //p.y = Math.min(p.y, 420);
            this.body.setPos(p);
            //console.log(this.body.p);
            //this.targetBody.setVel(cp.v(0,0));
        }
    },
    onTouchEnded:function(touch, e){
        space.removeConstraint(this.joint);
        //space.removeBody(this.body);
        //space.removeShape(this.shape);
        this.body = this.joint = this.shape = null;

    }
});
var KeyboardEvent = cc.EventListener.create({
    event:cc.EventListener.KEYBOARD,
    up:false,
    down:false,
    left:false,
    right:false,
    onKeyPressed:function(x){
        //console.log(x);
        switch(x){
            case 87:
            case 38:
                this.up = true;
                break;
            case 65:
            case 37:
                this.left = true;
                break;
            case 68:
            case 39:
                this.right = true;
                break;
            case 83:
            case 40:
                this.down = true;
                break;
        }
    },
    onKeyReleased:function(x){
        switch(x) {
            case 87:
            case 38:
                this.up = false;
                break;
            case 65:
            case 37:
                this.left = false;
                break;
            case 68:
            case 39:
                this.right = false;
                break;
            case 83:
            case 40:
                this.down = false;
                break;
        }
    }
});
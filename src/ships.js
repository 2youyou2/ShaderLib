
var Ship = cc.PhysicsSprite.extend({
    shipWidth:0,
    shipHeight:0,
    mass:0,
    body:null,
    shape:null,
    alive:true,
    verts:null,
    deadMassRatio:2,
    tumbleIncrement:0,
    crew:1,
    moveForce:1,
    forceYOffset:2,
    ctor:function(x, width, height, verts, pos, offset){
        this._super(x);
        this.shipWidth = width;
        this.shipHeight = height;
        this.mass = 0.3*FLUID_DENSITY*width*height;
        this.verts = verts;
        var moment = cp.momentForPoly(this.mass, verts, cp.v(0,0));

        this.body = space.addBody( new cp.Body(this.mass, moment));
        this.body.setPos( pos);
        //body.setVel( cp.v(0, -100));
        //this.body.setAngVel( 5);

        offset = offset || cp.v(0,0);
        this.shape = space.addShape( new cp.PolyShape(this.body, verts, offset));
        this.shape.setFriction(0.8);
        this.shape.setCollisionType(COLLSHIPS);
        this.setBody(this.body);
        this.texture.setAliasTexParameters();
        this.schedule(this.checkAlive, 1, Infinity);
        this.tumbleIncrement = (this.mass*this.deadMassRatio - this.mass)/4;

        this.shape.userData = this;
        this.shape.group = FLOATING_GROUP;
    },
    takeDamage:function(impulse){
        impulse = Math.min(cc.pLength(impulse)/(this.body.m*8), 70);
        //console.log(impulse);
        var c = (this.crew * impulse* 0.01)|0;
        //console.log(this.crew / impulse);
        this.crew -= c;
        return c;
    },
    checkAlive:function(){
        if(this.alive && Math.abs(this.rotation)%360 >160)
        {
            console.log("im dying");
            this.body.resetForces();
            //this.alive = false;
            if(this.body.m < this.mass*this.deadMassRatio){
                this.body.setMass(this.body.m + this.tumbleIncrement);
                var c = this.crew - (this.crew/5)|0;
                this.crew -= c;
                for(var i = 0; i < c; i++)
                {
                    var p = cc.p(this.body.p.x + (this.shipWidth*Math.random()- this.shipWidth/2) , this.body.p.y);
                    crewsToAdd.push(p);
                }
            }
            else{
                this.alive = false;
                var c = this.crew - (this.crew/2)|0;
                this.crew = 0;
                for(var i = 0; i < c; i++)
                {
                    var p = cc.p(this.body.p.x + (this.shipWidth*Math.random()- this.shipWidth/2) , this.body.p.y);
                    crewsToAdd.push(p);
                }

                //console.log(this.body);
                this.scheduleOnce(this.willDie, 7);
            }
            //console.log(this.body);
        }
        if(this.body.p.x > 1200 || this.body.p.x <-200)
        {
            this.remove();
        }
    },
    willDie:function(){
        this.runAction(cc.Sequence.create(cc.FadeOut.create(3), cc.CallFunc.create(this.die, this)));
    },
    die:function(){
        this.remove();
        console.log("i died");
    },
    remove:function(){
        space.removeBody(this.body);
        space.removeShape(this.shape);
        this.removeFromParent(true);
        var ax = g_boats.indexOf(this);
        if(ax!== -1)
        {
            g_boats.splice(ax, 1);
        }
    },
    move:function(x){
        if(x == 1)
        {
            //going left, need to flip,
            this.scaleX = -1;
            this.body.applyForce(cp.v(-this.moveForce,0),cp.v(this.width/2,-this.height/this.forceYOffset));
        }
        else{
            this.body.applyForce(cp.v(this.moveForce,0),cp.v(this.width/2,-this.height/this.forceYOffset));

        }
    }
});
var Destroyer = Ship.extend({
    deadMassRatio:2.16,
    crew:100,
    moveForce:40,

    ctor:function(pos){
        this._super(res.ship1, 270, 50, [144,-13,  111,-46,  -111,-46,  -144,-13],pos);
    }
});
var Raft = Ship.extend({
    deadMassRatio:1.57,
    crew:2,
    moveForce:0.5,
    forceYOffset:2.6,
    ctor:function(pos){
        this._super(res.raft1, 24, 8, [12,-10.5,  14,-14,  -14,-14,  -12,-10.5], pos);
    }
});
var FishingBoat = Ship.extend({
    deadMassRatio:1.8,
    crew:5,
    moveForce:1,
    forceYOffset:2.6,
    ctor:function(pos){
        this._super(res.fishing, 39, 15, [19.5,-16.5,  19,-24.5,  -19,-24.5,  -19.5,-16.5], pos);
    }
});
var Caravel = Ship.extend({
    deadMassRatio:2.2,
    crew:20,
    moveForce:3,
    forceYOffset:2.5,
    ctor:function(pos){
        this._super(res.caravel, 80, 25, [35,-22.5,  33,-41.5,  -33,-41.5,  -35,-22.5], pos);
    }
});
var GunBoat = Ship.extend({
    crew:20,
    moveForce:10,
    deadMassRatio:2.41,
    ctor:function(pos){
        this._super(res.gunboat, 132, 30, [65,-13,  63,-35,  -63,-35,  -65,-13], pos, cp.v(1,0));
    }
});
/**
 * Created by wuhao on 14-4-27.
 */

var Tentacle = cc.Class.extend({
    vlimit:200,
    errorB:0.1,
    maxForce:300000,
    nextNode:null,
    tentacle:true,
    mass:0.4,
    body:null,
    shape:null,
    rotlimit:15,
    radius:null,
    ctor:function(size, pos){
        var moment = cp.momentForCircle(this.mass, size, 0, cp.v(0,0));
        var body = this.body = space.addBody(new cp.Body(this.mass,moment));
        var shape = this.shape = space.addShape(new cp.CircleShape(body, size, cp.v(0,0)));
        shape.setLayers(TENTACLE_LAYER);
        body.setPos(pos);
        shape.setCollisionType(2);
        body.applyForce(cp.v(0,700*this.mass), cp.v(0,0));
        body.v_limit = this.vlimit;
        shape.group = KRAKEN_GROUP;
        this.radius = size;
        this.body.setAngVel(Math.random()*140-70);
    },
    attachTo:function(parent){
        if(parent === space.staticBody)
        {
            var j = space.addConstraint(new cp.RotaryLimitJoint(this.body, space.staticBody, -cc.degreesToRadians(this.rotlimit), cc.degreesToRadians(this.rotlimit)));
            j.errorBias = this.errorB;
            j.maxForce = this.maxForce;
        }
        else{
            space.addConstraint(new cp.PivotJoint(this.body, parent.body, parent.body.p));
            var j = space.addConstraint(new cp.RotaryLimitJoint(this.body, parent.body, -cc.degreesToRadians(this.rotlimit), cc.degreesToRadians(this.rotlimit)));
            j.errorBias = this.errorB;
            j.maxForce = this.maxForce;
            parent.nextNode = this;
            this.parent = parent;
        }
    }
});
Tentacle.create = function(size, pos, segs, x, y, angle){
    x = x || 0;
    y = y || 1;
    pos = cc.pAdd(pos, cc.p(-size*3*x, -size*3*y));
    //pos = cc.pAdd(pos, cc.p(-size*3*Math.cos(angle), -size*3*Math.sin(angle)));
    var base;
    //var last = new Tentacle(size, cc.pAdd(pos, cc.p(size*3*Math.cos(angle), size*3*Math.sin(angle))));
    var last = new Tentacle(size, pos);
    base = last;
    //last.body.setAngle(-cc.degreesToRadians(angle));
    last.segs = segs;
    last.drawAngle = -cc.degreesToRadians(angle);
    for(var i = 0; i < segs; i++)
    {
        size = size * 0.9;
        pos = cc.pAdd(pos, cc.p(-size*3*x, -size*3*y));
        var curr = new Tentacle(size, pos);
        curr.attachTo(last);
        last = curr;
        //curr.body.setAngle(- cc.degreesToRadians(angle));
    }
    base.lineWidth = size;
    return base;
};
Tentacle.drawVertices = function(tentBase, drawNode){
    var res = {left:[], right:[]};
    var size = tentBase.lineWidth;
    var ang = tentBase.drawAngle || 0;
    for(var tent = tentBase; tent; tent= tent.nextNode)
    {
//        var vertices = [
//            cc.p(this.tent1.body.p.x - 15* Math.cos(this.tent1.body.a),
//                    this.tent1.body.p.y - 15*Math.sin(this.tent1.body.a)),
//            cc.p(this.tent2.body.p.x - 12.5* Math.cos(this.tent2.body.a),
//                    this.tent2.body.p.y - 12.5*Math.sin(this.tent2.body.a)),
//            this.tent3.body.p
//        ];
        var p = tent.body.p;
        var a = tent.body.a;
        if(tent.nextNode)
        {
            var vert = cc.p(p.x - tent.radius*Math.cos(a+ang), p.y - tent.radius*Math.sin(a+ang));
            var vert2 = cc.p(p.x + tent.radius*Math.cos(a+ang), p.y + tent.radius*Math.sin(a+ang));
        }
        else{
            var vert = p;
            var vert2 = p;
        }
        res.left.push(vert);
        res.right.push(vert2);
    }
    //drawNode.drawCardinalSpline(res.left, 0, 10, size*2, cc.color(79,72,140,255));
    //drawNode.drawCardinalSpline(res.right, 0, 10, size*2, cc.color(79,72,140,255));
    //console.log(tentBase.parent);
    drawNode.drawPoly([res.left[0],res.right[0],tentBase.parent.body.p],cc.color(79,72,140,255), 0 , cc.color(0,0,0,0));

    var count = res.left.length;
    for(var i = 0; i < count-1; i++)
    {
        var left1, left2, right2, right1;
        if(i == count-2)
        {
            left1 = res.left[i];
            right1 = res.right[i];
            left2 = res.left[i+1];
            drawNode.drawPoly([left1, left2, right1], cc.color(79,72,140,255), 0 , cc.color(0,0,0,0));
        }
        else{
            left1 = res.left[i];
            left2 = res.left[i+1];
            right2 = res.right[i+1];
            right1 = res.right[i];
            drawNode.drawPoly([left1, left2, right2, right1], cc.color(79,72,140,255), 0 , cc.color(0,0,0,0));
        }

        //this.drawn.drawPoly([cc.p(200, 200), cc.p(300,200), cc.p(300,300), cc.p(200,300)], cc.color(255,0,0,255), 0, cc.color(0,0,0,0));

    }

    return res;
};
var Kraken = cc.Class.extend({
    body:null,
    shape:null,
    mass:1,
    radius:50,
    moment:null,
    tentacles:[],
    sprite:null,
    ctor:function(){
        this.moment = cp.momentForCircle(this.mass, 0, this.radius, cp.v(0,0));
        console.log(this.moment);

        this.body = space.addBody(new cp.Body(this.mass, this.moment));
        this.body.setPos(cp.v(500,300));
        this.shape = space.addShape(new cp.CircleShape(this.body, this.radius, cp.v(0,0)));
        this.shape.setCollisionType(2);
        this.shape.group = KRAKEN_GROUP;
        this.body.applyForce(cp.v(0,700), cp.v(0,0));

        this.sprite = cc.PhysicsSprite.create(res.octopus);
        this.sprite.setBody(this.body);
        this.sprite.scale = 1.5;
        this.sprite.texture.setAliasTexParameters();
        //create 6 tentacles
        var angle = 18;
        for(var i = 0; i < 6; i++)
        {
            angle = i*28 + 18;
            var tent = Tentacle.create(13, this.body.p, 8, Math.cos(cc.degreesToRadians(angle)), Math.sin(cc.degreesToRadians(angle)), -angle+90);
            tent.attachTo(this);
            this.tentacles.push(tent);
            //tent.body.setAngVel(Math.random()*200-100);
        }

        //right side large tentacle

        //this.body.setVel(cp.v(Math.random()*300-150, Math.random()*300-150));

    }
});
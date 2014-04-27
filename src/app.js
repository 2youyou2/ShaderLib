

var GameLayer = cc.Layer.extend({
    water:null,
    waterShape:null,
    elapsed:0,
    //crewToAdd:[],
    ctor:function() {
        this._super();
        //sky

        var debug = cc.PhysicsDebugNode.create(space);
        debug.visible = false;
        this.addChild(debug);
        var bb = new cp.BB(-500, 0, 2000, 600);
        var shape = space.addShape( new cp.BoxShape2(staticBody, bb) );
        shape.setSensor(true);
        shape.setCollisionType(1);
        space.addCollisionHandler( 1, COLLSHIPS, null, this.waterPreSolve, null);
        space.addCollisionHandler( 2, COLLSHIPS, null, null, this.solveCol.bind(this));
        space.addCollisionHandler( 1, COLLCREWS, null, this.waterPreSolve);
        space.addCollisionHandler( 2, COLLCREWS, this.eatCrew);
        this.waterShape = shape;

        // Create segments around the edge of the screen.
        //left
        var shape = space.addShape( new cp.SegmentShape(staticBody, cp.v(0,0), cp.v(0,500), 6.0));
        shape.setElasticity(1.0);
        shape.setFriction(1.0);
        shape.setLayers(NOT_GRABABLE_MASK);

        //right
        shape = space.addShape( new cp.SegmentShape(staticBody, cp.v(1000,0), cp.v(1000,500), 6.0));
        shape.setElasticity(1.0);
        shape.setFriction(1.0);
        shape.setLayers(NOT_GRABABLE_MASK);

        //bottom
        shape = space.addShape( new cp.SegmentShape(staticBody, cp.v(0,-50), cp.v(1000,-50), 10.0));
        shape.setElasticity(1.0);
        shape.setFriction(1.0);
        shape.setLayers(NOT_GRABABLE_MASK);

        this.scheduleUpdate();
        this.schedule(this.spawnBoats, 1.5, Infinity);

        var draw = cc.DrawNode.create();
        this.addChild(draw);
        this.drawn = draw;





/*        var boattest = new Destroyer(cc.p(500, 630));
        var raftTest = new Raft(cc.p(100, 615));
        var fishingtest = new FishingBoat(cc.p(200,915));
        var caraveltest = new Caravel(cc.p(700, 615));
        var gunboattest = new GunBoat(cc.p(850, 615));
        this.addChild(boattest);
        this.addChild(raftTest);
        this.addChild(fishingtest);
        this.addChild(caraveltest);
        this.addChild(gunboattest);*/

        window.debug = debug;
        this.kraken = window.kraken = new Kraken();
        this.addChild(this.kraken.sprite);
/*        window.destroyer = boattest;
        window.gunbout = gunboattest;
        window.raft = raftTest;
        window.fishing = fishingtest;
        window.caravel = caraveltest;*/
        window.game = this;

        this.water = new Water;
        this.addChild(this.water, 999);
        this.schedule(this.waves, 0.4, Infinity);


        //var tentTest = this.tent = Tentacle.create(10, cc.p(800,200), 8,-0.7,-0.7, 45);
        cc.eventManager.addListener(touchEvent, this);
        cc.eventManager.addListener(KeyboardEvent, this);
        this.batch = new cc.SpriteBatchNode(res.crew);
        this.addChild(this.batch,99);
        UI = new UILayer();
        this.addChild(UI, 99999);

        //cc.screen.autoFullScreen()//cc.$("#fulldiv"));//cc.$("#full"));
/*        cc.view.setResizeCallback(function(){
            var a = cc.$("#fulldiv");
            a.style.position = "absolute";
            a.style.height = "100%";
            a.style.width = "100%";
            a.style.top = "0";
        });*/
/*        cc.view.setResizeCallback(function(){
*//*            var a = cc.$("#fulldiv");
            if(a.style.position == "absolute")
            {
                console.log("exit");
            }*//*
        });
        cc.$("#full").addEventListener("click", function(){
            var a = cc.$("#Cocos2dGameContainer");
            a.style.position="absolute";
            a.style.width="100%";
            a.style.height="100%";
            a.style.top=0;
            cc.screen.requestFullScreen(a);
        })*/
    },
    onEnter:function(){
        this._super();
        var logo = new cc.Sprite(res.logo);
        this.addChild(logo, 999999);
        logo.attr({
            x: 500,
            y: 375,
            scale: 2
        });
        logo.texture.setAliasTexParameters();
        logo.runAction(
            cc.Sequence.create(
                cc.DelayTime.create(6),
                cc.FadeOut.create(1),
                cc.CallFunc.create(function(){
                    logo.removeFromParent(true);
                })
            )
        );
    },
    eatCrew:function(a){
        var crew = a.getB().userDate;
        crew.remove();
        var rand = (Math.random()*3+1)|0;
        var c = "coin"+rand;
        cc.audioEngine.playEffect(res[c]);
        UI.addScore(1);
    },
    solveCol:function(a,y,z){
        if(a.isFirstContact())
        {
            //console.log(cc.pLength(a.totalImpulse())/(a.getB().getBody().m*8));
            var b = a.getB();
            var s = b.userData;
            var crews = s.takeDamage(a.totalImpulse());
            for(var i = 0; i < crews; i++)
            {
                var p = b.getBody().p;
                p = cc.p(p.x + (s.shipWidth*Math.random()- s.shipWidth/2) , p.y);
                crewsToAdd.push(p);
            }
        }
        return true;
    },

    waves:function(dt){
        //console.log(this.waterShape);
        //console.log(1);
        this.waterShape.bb_t = 600 + (Math.random()-0.5)*1;
    },
    spawnBoats:function(dt){
        if(g_boats.length < 10)
        {
            if(this.elapsed < 20)
            {
                //only raft and fishing boat
                var type = (Math.random()*3)|0;
            }
            else if(this.elapsed < 40)
            {
                //raft fishing caravel
                var type = (Math.random()*4)|0;
            }
            else if(this.elapsed < 60)
            {
                var type = (Math.random()*5)|0;
            }
            else if(this.elapsed < 90)
            {
                var type = (Math.random()*6)|0;
            }
            else if(this.elapsed < 120)
            {
                var type = (Math.random()*7)|0;
            }
            else if(this.elapsed < 150)
            {
                var type = (Math.random()*8)|0;
            }
            else
            {
                var type = (Math.random()*this.elapsed/17)|0;
            }
            var leftRight = (Math.random()*2)|0;
            var x = -100 + 1200*leftRight;
            switch(type)
            {
                case 0:
                    var ship = new Raft(cc.p(x, 615));
                    g_boats.push(ship);
                    break;
                case 1:
                case 2:
                    var ship = new FishingBoat(cc.p(x, 615));
                    g_boats.push(ship);
                    break;
                case 3:
                case 4:
                    var ship = new Caravel(cc.p(x, 615));
                    g_boats.push(ship);
                    break;
                case 5:
                case 6:
                case 7:
                    var ship = new GunBoat(cc.p(x, 615));
                    g_boats.push(ship);
                    break;
                default:
                    var ship = new Destroyer(cc.p(x, 615));
                    g_boats.push(ship);
            }
            ship.move(leftRight);
            this.addChild(ship);
            //console.log(this.elapsed);
        }
    },
    update:function(dt){
        this.elapsed += dt;
        if(dt > 22){
            console.warn("game running slow");
        }

        this.drawn.clear();
        //Tentacle.drawVertices(this.tent, this.drawn);

        for(var i = 0; i < 6; i++)
        {
            Tentacle.drawVertices(this.kraken.tentacles[i], this.drawn);
        }
        var crews = crewsToAdd;
        for(var j=0; j<crews.length; j++)
        {
            this.batch.addChild(new Crew(res.crew, crews[j]));
        }
        crewsToAdd = [];

        var k = this.kraken.body;
        if(k.p.y > 400)
        {
            this.kraken.body.applyImpulse(cp.v(0,-(k.p.y-300)), cp.v(0,0));
            //k.setVel(cp.v(k.getVel().x, -10));
        }

        if(KeyboardEvent.up)
        {
            this.kraken.body.applyImpulse(cp.v(0, 100), cp.v(0,1));
        }
        if(KeyboardEvent.down)
        {
            this.kraken.body.applyImpulse(cp.v(0, -100), cp.v(0,-1));
        }
        if(KeyboardEvent.left)
        {
            this.kraken.body.applyImpulse(cp.v(-100, 0), cp.v(-1,0));
        }
        if(KeyboardEvent.right)
        {
            this.kraken.body.applyImpulse(cp.v(100, 0), cp.v(1,0));
        }

        space.step(dt);
    },
    waterPreSolve:function(arb, space) {
        var shapes = arb.getShapes();
        var water = shapes[0];
        var poly = shapes[1];

        var body = poly.getBody();

        // Get the top of the water sensor bounding box to use as the water level.
        var level = water.getBB().t;

        // Clip the polygon against the water level
        var count = poly.getNumVerts();

        var clipped = [];

        var j=count-1;
        for(var i=0; i<count; i++) {
            var a = body.local2World( poly.getVert(j));
            var b = body.local2World( poly.getVert(i));

            if(a.y < level){
                clipped.push( a.x );
                clipped.push( a.y );
            }

            var a_level = a.y - level;
            var b_level = b.y - level;

            if(a_level*b_level < 0.0){
                var t = Math.abs(a_level)/(Math.abs(a_level) + Math.abs(b_level));

                var v = cp.v.lerp(a, b, t);
                clipped.push(v.x);
                clipped.push(v.y);
            }
            j=i;
        }

        // Calculate buoyancy from the clipped polygon area
        var clippedArea = cp.areaForPoly(clipped);

        var displacedMass = clippedArea*FLUID_DENSITY;
        var centroid = cp.centroidForPoly(clipped);
        var r = cp.v.sub(centroid, body.getPos());

        var dt = space.getCurrentTimeStep();
        var g = space.gravity;

        // Apply the buoyancy force as an impulse.
        body.applyImpulse( cp.v.mult(g, -displacedMass*dt), r);

        // Apply linear damping for the fluid drag.
        var v_centroid = cp.v.add(body.getVel(), cp.v.mult(cp.v.perp(r), body.w));
        var k = 1; //k_scalar_body(body, r, cp.v.normalize_safe(v_centroid));
        var damping = clippedArea*FLUID_DRAG*FLUID_DENSITY;
        var v_coef = Math.exp(-damping*dt*k); // linear drag
    //	var v_coef = 1.0/(1.0 + damping*dt*cp.v.len(v_centroid)*k); // quadratic drag
        body.applyImpulse( cp.v.mult(cp.v.sub(cp.v.mult(v_centroid, v_coef), v_centroid), 1.0/k), r);

        // Apply angular damping for the fluid drag.
        var w_damping = cp.momentForPoly(FLUID_DRAG*FLUID_DENSITY*clippedArea, clipped, cp.v.neg(body.p));
        body.w *= Math.exp(-w_damping*dt* (1/body.i));

        return true;
    }
});

var Sky = cc.LayerColor.extend({
    ctor:function(){
        var c = cc.color(228,171,226,255);
        this._super(c,1000,750);
    }
});

var Water = cc.LayerColor.extend({
    ctor:function(){
        var c = cc.color(205,130,203,153);
        this._super(c, 1000, 600);
        var horizon = new cc.LayerColor(cc.color(255,255,255,125), 1000, 2);
        horizon.y = 598;
        this.addChild(horizon);
    }
});




var Crew = cc.PhysicsSprite.extend({
    mass:0.3*FLUID_DENSITY*3.8*4,
    ctor:function(x, pos){
        this._super(x);
        var verts = [-2,2,  2,2,  2,0,  -2,0];
        var moment = cp.momentForPoly(this.mass, verts,cp.v(0,5));
        this.body = space.addBody(new cp.Body(this.mass, moment));
        this.body.setPos(pos);

        this.shape = space.addShape(new cp.PolyShape(this.body, verts, cp.v(0,5)));
        this.shape.setCollisionType(COLLCREWS);
        this.setBody(this.body);
        this.texture.setAliasTexParameters();
        this.shape.userData = this;

        //gve random rotation and direction
        this.body.setVel(cp.v(Math.random()*200-100, Math.random()*200));
        this.body.setAngVel(Math.random()*20-10);
        this.shape.group = FLOATING_GROUP;
        this.shape.userDate = this;
    },
    remove:function(){
        this.scheduleOnce(this._remove);
    },
    _remove:function(){
        this.removeFromParent(true);
        space.removeBody(this.body);
        space.removeShape(this.shape);
    }
});





var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        //this.addChild(new Sky);
        this.addChild(layer);

    }
});
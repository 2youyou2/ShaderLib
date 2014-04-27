/**
 * Created by wuhao on 14-4-27.
 */
//Physics stuff
var space =new cp.Space();
space.gravity = cp.v(0,-700);
//	cpSpaceSetDamping(space, 0.5);
space.sleepTimeThreshold = 0.5;
space.collisionSlop = 0.1;
var staticBody = space.staticBody;
var FLUID_DENSITY = 0.00014;
var FLUID_DRAG = 2;
var TENTACLE_LAYER = 345435;
var KRAKEN_GROUP = 4534;
var FLOATING_GROUP = 4;
var GRABABLE_MASK_BIT = 1<<31;
var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;
var COLLSHIPS = 43976;
var COLLCREWS = 354;
var crewsToAdd = [];
var g_boats = [];

var UI = null;
/**
 * Created by wuhao on 14-4-28.
 */

var UILayer = cc.Layer.extend({
    score:0,
    ctor:function(){
        this._super();
        var eaten = new cc.Sprite(res.eaten);
        eaten.attr({
            x: 850,
            y: 50
        });
        this.addChild(eaten);
        this.scoreL = new cc.LabelTTF("0", "mono", 18);
        this.addChild(this.scoreL);
        this.scoreL.attr({
            x: 900,
            y: 50
        })
    },
    addScore:function(v){
        this.score += v;
        this.scoreL.setString(this.score);
    }

});
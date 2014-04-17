#ifndef __SHADER_NODE_H__
#define __SHADER_NODE_H__

#include "cocos2d.h"


class ShaderNode : public cocos2d::Node
{
public:
    ShaderNode();
    ~ShaderNode();

    bool initWithVertex(const char *vert, const char *frag);
    void loadShaderVertex(const char *vert, const char *frag);

    virtual void update(float dt);
    virtual void setPosition(const cocos2d::Point &newPosition);
    virtual void setContentSize(const cocos2d::Size & size);
    virtual void draw(cocos2d::Renderer *renderer, const kmMat4 &transform, bool transformUpdated) override;

    static ShaderNode* create(const char *vert, const char *frag);

protected:
    void onDraw(const kmMat4 &transform, bool transformUpdated);

    cocos2d::Vertex2F _center;
    cocos2d::Vertex2F _resolution;
    float      _time;
    GLuint     _uniformCenter, _uniformResolution, _uniformTime;
    std::string _vertFileName;
    std::string _fragFileName;
    cocos2d::CustomCommand _customCommand;
};

#endif /*__SHADER_NODE_H__*/
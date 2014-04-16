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
    void onEnter();

    virtual void update(float dt);
    virtual void setPosition(const cocos2d::Point &newPosition);
    virtual void draw(cocos2d::Renderer *renderer, const kmMat4& transform, bool transformUpdated);
    virtual void setContentSize(const cocos2d::Size& contentSize);

    static ShaderNode* create(const char *vert, const char *frag);

protected:

    float _size_x;
    float _size_y;

    cocos2d::Vertex2F _center;
    cocos2d::Vertex2F _resolution;
    float      _time;
    GLuint     _uniformCenter, _uniformResolution, _uniformTime, _uniformMouse, _uniformTex;
    std::string _vertFileName;
    std::string _fragFileName;
};

#endif /*__SHADER_NODE_H__*/
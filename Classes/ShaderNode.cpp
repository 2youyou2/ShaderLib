#include "ShaderNode.h"

using namespace cocos2d;

ShaderNode::ShaderNode()
    :_center(Vertex2F(0.0f, 0.0f))
    ,_resolution(vertex2(0.0f, 0.0f))
    ,_time(0.0f)
    ,_uniformCenter(0)
    ,_uniformResolution(0)
    ,_uniformTime(0)
    ,_uniformMouse(0)
    ,_uniformTex(0)
{
}

ShaderNode::~ShaderNode()
{
}

ShaderNode* ShaderNode::create(const char *vert, const char *frag)
{
    ShaderNode *node = new ShaderNode();
    node->initWithVertex(vert, frag);
    node->autorelease();

    return node;
}

bool ShaderNode::initWithVertex(const char *vert, const char *frag)
{
    loadShaderVertex(vert, frag);

    _time = 0;
    _resolution = Vertex2F(_size_x, _size_y);

    setContentSize(Size(256, 256));
    setAnchorPoint(ccp(0.5f, 0.5f));

    _vertFileName = vert;
    _fragFileName = frag;

    return true;
}

void ShaderNode::onEnter()
{
    this->setShaderProgram(NULL);
    loadShaderVertex(_vertFileName.c_str(), _fragFileName.c_str());
}

void ShaderNode::loadShaderVertex(const char *vert, const char *frag)
{
    CCGLProgram *shader = new CCGLProgram();
    shader->initWithVertexShaderFilename(vert, frag);

    shader->addAttribute("aVertex", kCCVertexAttrib_Position);
    shader->link();

    shader->updateUniforms();

    _uniformCenter = glGetUniformLocation(shader->getProgram(), "center");
    _uniformResolution = glGetUniformLocation(shader->getProgram(), "resolution");
    _uniformTime = glGetUniformLocation(shader->getProgram(), "time");
    _uniformMouse = glGetUniformLocation(shader->getProgram(), "iMouse");
    _uniformTex = glGetUniformLocation(shader->getProgram(),"iChannel0");

    this->setShaderProgram(shader);

    shader->release();
}

void ShaderNode::update(float dt)
{
    _time += dt;
}

void ShaderNode::setPosition(const CCPoint &newPosition)
{
    Node::setPosition(newPosition);
    Point position = getPosition();
    _center = vertex2(position.x * CC_CONTENT_SCALE_FACTOR(), position.y * CC_CONTENT_SCALE_FACTOR());
}

void ShaderNode::draw(cocos2d::Renderer *renderer, const kmMat4& transform, bool transformUpdated)
{
    CC_NODE_DRAW_SETUP();

    float w = _contentSize.width, h = _contentSize.height;
    GLfloat vertices[12] = {0,0, w,0, w,h, 0,0, 0,h, w,h};

    //
    // Uniforms
    //
    getShaderProgram()->setUniformLocationWith2f(_uniformCenter, _center.x, _center.y);
    getShaderProgram()->setUniformLocationWith2f(_uniformResolution, _resolution.x, _resolution.y);


    // time changes all the time, so it is Ok to call OpenGL directly, and not the "cached" version
    glUniform1f(_uniformTime, _time);

    ccGLEnableVertexAttribs( kCCVertexAttribFlag_Position );

    glVertexAttribPointer(kCCVertexAttrib_Position, 2, GL_FLOAT, GL_FALSE, 0, vertices);

    glDrawArrays(GL_TRIANGLES, 0, 6);

    CC_INCREMENT_GL_DRAWS(1);
}

void ShaderNode::setContentSize(const Size& contentSize)
{
    Node::setContentSize(contentSize);

    _resolution.x = contentSize.width;
    _resolution.y = contentSize.height;
}

#include "ShaderNode.h"

using namespace cocos2d;

///---------------------------------------
// 
// ShaderNode
// 
///---------------------------------------
enum 
{
    SIZE_X = 256,
    SIZE_Y = 256,
};

ShaderNode::ShaderNode()
    :_center(Vertex2F(0.0f, 0.0f))
    ,_resolution(Vertex2F(0.0f, 0.0f))
    ,_time(0.0f)
    ,_uniformCenter(0)
    ,_uniformResolution(0)
    ,_uniformTime(0)
{
}

ShaderNode::~ShaderNode()
{
}

ShaderNode* ShaderNode::create(const char *vert, const char *frag)
{
    auto node = new ShaderNode();
    node->initWithVertex(vert, frag);
    node->autorelease();

    return node;
}

bool ShaderNode::initWithVertex(const char *vert, const char *frag)
{
#if CC_ENABLE_CACHE_TEXTURE_DATA
    auto listener = EventListenerCustom::create(EVENT_COME_TO_FOREGROUND, [this](EventCustom* event){
        this->setShaderProgram(nullptr);
        loadShaderVertex(_vertFileName.c_str(), _fragFileName.c_str());
    });

    _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
#endif

    loadShaderVertex(vert, frag);

    _time = 0;

    scheduleUpdate();

    setContentSize(Size(SIZE_X, SIZE_Y));
    setAnchorPoint(Point(0.5f, 0.5f));

    _vertFileName = vert;
    _fragFileName = frag;

    return true;
}

void ShaderNode::loadShaderVertex(const char *vert, const char *frag)
{
    auto shader = new GLProgram();
    shader->initWithFilenames(vert, frag);

    shader->bindAttribLocation(GLProgram::ATTRIBUTE_NAME_POSITION, GLProgram::VERTEX_ATTRIB_POSITION);
    shader->link();

    shader->updateUniforms();

    _uniformCenter      = shader->getUniformLocation("center");
    _uniformResolution  = shader->getUniformLocation("resolution");
    _uniformTime        = shader->getUniformLocation("time");

    this->setShaderProgram(shader);

    shader->release();
}

void ShaderNode::update(float dt)
{
    _time += dt;
}

void ShaderNode::setPosition(const Point &newPosition)
{
    Node::setPosition(newPosition);
    auto position = getPosition();
    _center = Vertex2F(position.x * CC_CONTENT_SCALE_FACTOR(), position.y * CC_CONTENT_SCALE_FACTOR());
}

void ShaderNode::setContentSize(const Size & size)
{
    Node::setContentSize(size);

    _resolution = Vertex2F(size.width, size.height);
}

void ShaderNode::draw(Renderer *renderer, const kmMat4 &transform, bool transformUpdated)
{
    _customCommand.init(_globalZOrder);
    _customCommand.func = CC_CALLBACK_0(ShaderNode::onDraw, this, transform, transformUpdated);
    renderer->addCommand(&_customCommand);
}

void ShaderNode::onDraw(const kmMat4 &transform, bool transformUpdated)
{
    auto shader = getShaderProgram();
    shader->use();
    shader->setUniformsForBuiltins(transform);
    shader->setUniformLocationWith2f(_uniformCenter, _center.x, _center.y);
    shader->setUniformLocationWith2f(_uniformResolution, _resolution.x, _resolution.y);

    // time changes all the time, so it is Ok to call OpenGL directly, and not the "cached" version
    glUniform1f(_uniformTime, _time);

    GL::enableVertexAttribs( cocos2d::GL::VERTEX_ATTRIB_FLAG_POSITION );

    float w = _contentSize.width, h = _contentSize.height;
    GLfloat vertices[] = {0,0, w,0, w,h, 0,0, 0,h, w,h};

    glVertexAttribPointer(GLProgram::VERTEX_ATTRIB_POSITION, 2, GL_FLOAT, GL_FALSE, 0, vertices);

    glDrawArrays(GL_TRIANGLES, 0, 6);

    CC_INCREMENT_GL_DRAWN_BATCHES_AND_VERTICES(1,6);

}
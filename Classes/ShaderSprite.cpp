#include "ShaderSprite.h"

// ShaderSprite
ShaderSprite::ShaderSprite()
{
}

ShaderSprite::~ShaderSprite()
{
}

void ShaderSprite::setBackgroundNotification()
{
#if CC_ENABLE_CACHE_TEXTURE_DATA
    auto listener = EventListenerCustom::create(EVENT_COME_TO_FOREGROUND, [this](EventCustom* event){
            this->setShaderProgram(nullptr);
            this->initShader();
        });
    _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
#endif
}

void ShaderSprite::initShader()
{
    GLchar * fragSource = (GLchar*) String::createWithContentsOfFile(
                                                                     FileUtils::getInstance()->fullPathForFilename(_fragSourceFile).c_str())->getCString();
    auto program = new GLProgram();
    program->initWithByteArrays(ccPositionTextureColor_vert, fragSource);
    setShaderProgram(program);
    program->release();
    
    CHECK_GL_ERROR_DEBUG();
    
    program->bindAttribLocation(GLProgram::ATTRIBUTE_NAME_POSITION, GLProgram::VERTEX_ATTRIB_POSITION);
    program->bindAttribLocation(GLProgram::ATTRIBUTE_NAME_COLOR, GLProgram::VERTEX_ATTRIB_COLOR);
    program->bindAttribLocation(GLProgram::ATTRIBUTE_NAME_TEX_COORD, GLProgram::VERTEX_ATTRIB_TEX_COORDS);
    
    CHECK_GL_ERROR_DEBUG();
    
    program->link();
    
    CHECK_GL_ERROR_DEBUG();
    
    program->updateUniforms();
    
    CHECK_GL_ERROR_DEBUG();
    
    buildCustomUniforms();
    
    CHECK_GL_ERROR_DEBUG();
}

void ShaderSprite::draw(Renderer *renderer, const kmMat4 &transform, bool transformUpdated)
{
    _renderCommand.init(_globalZOrder);
    _renderCommand.func = CC_CALLBACK_0(ShaderSprite::onDraw, this, transform, transformUpdated);
    renderer->addCommand(&_renderCommand);

}

void ShaderSprite::onDraw(const kmMat4 &transform, bool transformUpdated)
{
    auto shader = getShaderProgram();
    shader->use();
    shader->setUniformsForBuiltins(transform);

    setCustomUniforms();
    
    GL::enableVertexAttribs(cocos2d::GL::VERTEX_ATTRIB_FLAG_POS_COLOR_TEX );
    GL::blendFunc(_blendFunc.src, _blendFunc.dst);
    GL::bindTexture2D( getTexture()->getName());
    
    //
    // Attributes
    //
    #define kQuadSize sizeof(_quad.bl)
    size_t offset = (size_t)&_quad;
    
    // vertex
    int diff = offsetof( V3F_C4B_T2F, vertices);
    glVertexAttribPointer(GLProgram::VERTEX_ATTRIB_POSITION, 3, GL_FLOAT, GL_FALSE, kQuadSize, (void*) (offset + diff));
    
    // texCoods
    diff = offsetof( V3F_C4B_T2F, texCoords);
    glVertexAttribPointer(GLProgram::VERTEX_ATTRIB_TEX_COORDS, 2, GL_FLOAT, GL_FALSE, kQuadSize, (void*)(offset + diff));
    
    // color
    diff = offsetof( V3F_C4B_T2F, colors);
    glVertexAttribPointer(GLProgram::VERTEX_ATTRIB_COLOR, 4, GL_UNSIGNED_BYTE, GL_TRUE, kQuadSize, (void*)(offset + diff));
    
    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
    CC_INCREMENT_GL_DRAWN_BATCHES_AND_VERTICES(1, 4);
}


// NormalSprite
NormalSprite::NormalSprite()
{
    _fragSourceFile = "Shaders/example_normal.fsh";
}

void NormalSprite::buildCustomUniforms()
{
    
}

void NormalSprite::setCustomUniforms()
{
    
}

class GreyScaleSprite : public ShaderSprite, public ShaderSpriteCreator<GreyScaleSprite>
{
public:
    CREATE_FUNC(GreyScaleSprite);
    GreyScaleSprite();
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};

GreyScaleSprite::GreyScaleSprite()
{
    _fragSourceFile = "Shaders/example_greyScale.fsh";
}

void GreyScaleSprite::buildCustomUniforms()
{
    
}

void GreyScaleSprite::setCustomUniforms()
{
    
}



// BlurSprite
BlurSprite::BlurSprite()
{
    _fragSourceFile = "Shaders/example_Blur.fsh";
}

void BlurSprite::buildCustomUniforms()
{
    auto s = getTexture()->getContentSizeInPixels();
    _blurRadius = 0;
    _pixelSize = Point(1/s.width, 1/s.height);
    _samplingRadius = 0;

    setBlurSize(3.0f);
    auto program = getShaderProgram();
    pixelSizeLocation = program->getUniformLocation("onePixelSize");
    coefficientLocation = program->getUniformLocation("gaussianCoefficient");
}

void BlurSprite::setCustomUniforms()
{
    auto program = getShaderProgram();
    program->setUniformLocationWith2f(pixelSizeLocation, _pixelSize.x, _pixelSize.y);
    program->setUniformLocationWith4f(coefficientLocation, _samplingRadius, _scale,_cons,_weightSum);
}

void BlurSprite::setBlurSize(float f)
{
    if(_blurRadius == (int)f)
        return;
    _blurRadius = (int)f;
    
    _samplingRadius = _blurRadius;
    if (_samplingRadius > 10)
    {
        _samplingRadius = 10;
    }
    if (_blurRadius > 0)
    {
        float sigma = _blurRadius / 2.0f;
        _scale = -0.5f / (sigma * sigma);
        _cons = -1.0f * _scale / 3.141592f;
        _weightSum = -_cons;
        
        float weight;
        int squareX;
        for(int dx = 0; dx <= _samplingRadius; ++dx)
        {
            squareX = dx * dx;
            weight = _cons * exp(squareX * _scale);
            _weightSum += 2.0 * weight;
            for (int dy = 1; dy <= _samplingRadius; ++dy)
            {
                weight = _cons * exp((squareX + dy * dy) * _scale);
                _weightSum += 4.0 * weight;
            }
        }
    }
    log("_blurRadius:%d",_blurRadius);
}



// NoiseSprite
NoiseSprite::NoiseSprite()
{
    _fragSourceFile = "Shaders/example_Noisy.fsh";
}

void NoiseSprite::buildCustomUniforms()
{
    auto program = getShaderProgram();
    _resolutionLoc = program->getUniformLocation("resolution");
}

void NoiseSprite::setCustomUniforms()
{
    _resolution[0] = getTexture()->getContentSizeInPixels().width;
    _resolution[1] = getTexture()->getContentSizeInPixels().height;
    
    getShaderProgram()->setUniformLocationWith2fv(_resolutionLoc, _resolution, 1);
}



// EdgeDetectionSprite
EdgeDetectionSprite::EdgeDetectionSprite()
{
    _fragSourceFile = "Shaders/example_edgeDetection.fsh";
}

void EdgeDetectionSprite::buildCustomUniforms()
{
    auto program = getShaderProgram();
    _resolutionLoc = program->getUniformLocation("resolution");
}

void EdgeDetectionSprite::setCustomUniforms()
{
    _resolution[0] = getTexture()->getContentSizeInPixels().width;
    _resolution[1] = getTexture()->getContentSizeInPixels().height;
    
    getShaderProgram()->setUniformLocationWith2fv(_resolutionLoc, _resolution, 1);
}




// BloomSprite
BloomSprite::BloomSprite()
{
    _fragSourceFile = "Shaders/example_bloom.fsh";
}

void BloomSprite::buildCustomUniforms()
{
    auto program = getShaderProgram();
    _resolutionLoc = program->getUniformLocation("resolution");
}

void BloomSprite::setCustomUniforms()
{
    _resolution[0] = getTexture()->getContentSizeInPixels().width;
    _resolution[1] = getTexture()->getContentSizeInPixels().height;
    
    getShaderProgram()->setUniformLocationWith2fv(_resolutionLoc, _resolution, 1);
}



// CelShadingSprite
CelShadingSprite::CelShadingSprite()
{
    _fragSourceFile = "Shaders/example_celShading.fsh";
}

void CelShadingSprite::buildCustomUniforms()
{
    auto program = getShaderProgram();
    _resolutionLoc = program->getUniformLocation("resolution");
}

void CelShadingSprite::setCustomUniforms()
{
    _resolution[0] = getTexture()->getContentSizeInPixels().width;
    _resolution[1] = getTexture()->getContentSizeInPixels().height;
    
    getShaderProgram()->setUniformLocationWith2fv(_resolutionLoc, _resolution, 1);
}


// LensFlareSprite
LensFlareSprite::LensFlareSprite()
{
    _fragSourceFile = "Shaders/example_lensFlare.fsh";
}

void LensFlareSprite::buildCustomUniforms()
{
    auto program = getShaderProgram();
    _resolutionLoc = program->getUniformLocation("resolution");
    _textureResolutionLoc = program->getUniformLocation("textureResolution");
}

void LensFlareSprite::setCustomUniforms()
{
    _textureResolution[0] = getTexture()->getContentSizeInPixels().width;
    _textureResolution[1] = getTexture()->getContentSizeInPixels().height;
    
    _resolution[0] = getContentSize().width;
    _resolution[1] = getContentSize().height;
    
    getShaderProgram()->setUniformLocationWith2fv(_resolutionLoc, _resolution, 1);
    getShaderProgram()->setUniformLocationWith2fv(_textureResolutionLoc, _textureResolution, 1);
}

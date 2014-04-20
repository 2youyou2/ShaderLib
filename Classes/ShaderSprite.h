#ifndef _SHADER_TEST2_H_
#define _SHADER_TEST2_H_

#include "cocos2d.h"
#include "renderer/CCRenderCommand.h"
#include "renderer/CCCustomCommand.h"

using namespace cocos2d;

template <class spriteType>
class ShaderSpriteCreator
{
public:
    static spriteType* createSprite(const std::string& filename)
    {
        spriteType* ret = spriteType::create();
        ret->setTexture(filename);
        ret->initShader();
        ret->setBackgroundNotification();
        return ret;
    }
};

class ShaderSprite : public Sprite
{
public:
    ShaderSprite();
    ~ShaderSprite();

    virtual void initShader();
    void setBackgroundNotification();

    virtual void draw(Renderer *renderer, const kmMat4 &transform, bool transformUpdated) override;
    void listenBackToForeground(Ref *obj);

protected:
    virtual void buildCustomUniforms() = 0;
    virtual void setCustomUniforms() = 0;
protected:
    std::string _fragSourceFile;

protected:
    CustomCommand _renderCommand;
    void onDraw(const kmMat4 &transform, bool transformUpdated);

};


class NormalSprite : public ShaderSprite, public ShaderSpriteCreator<NormalSprite>
{
public:
    CREATE_FUNC(NormalSprite);
    NormalSprite();
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};


class BlurSprite : public ShaderSprite, public ShaderSpriteCreator<BlurSprite>
{
public:
    CREATE_FUNC(BlurSprite);
    BlurSprite();
    void setBlurSize(float f);
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
protected:
    int       _blurRadius;
    Point     _pixelSize;

    int       _samplingRadius;
    float     _scale;
    float     _cons;
    float     _weightSum;

    GLuint    pixelSizeLocation;
    GLuint    coefficientLocation;
};


class NoiseSprite : public ShaderSprite, public ShaderSpriteCreator<NoiseSprite>
{
public:
    CREATE_FUNC(NoiseSprite);
    NoiseSprite();

private:
    GLfloat _resolution[2];
    GLuint _resolutionLoc;
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};


class EdgeDetectionSprite : public ShaderSprite, public ShaderSpriteCreator<EdgeDetectionSprite>
{
public:
    CREATE_FUNC(EdgeDetectionSprite);
    EdgeDetectionSprite();

private:
    GLfloat _resolution[2];
    GLuint _resolutionLoc;
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};


class BloomSprite : public ShaderSprite, public ShaderSpriteCreator<BloomSprite>
{
public:
    CREATE_FUNC(BloomSprite);
    BloomSprite();

private:
    GLfloat _resolution[2];
    GLuint _resolutionLoc;
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};


class CelShadingSprite : public ShaderSprite, public ShaderSpriteCreator<CelShadingSprite>
{
public:
    CREATE_FUNC(CelShadingSprite);
    CelShadingSprite();

private:
    GLfloat _resolution[2];
    GLuint _resolutionLoc;
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};



class LensFlareSprite : public ShaderSprite, public ShaderSpriteCreator<LensFlareSprite>
{
public:
    CREATE_FUNC(LensFlareSprite);
    LensFlareSprite();

private:
    GLfloat _resolution[2];
    GLfloat _textureResolution[2];
    GLuint _resolutionLoc;
    GLuint _textureResolutionLoc;
protected:
    virtual void buildCustomUniforms();
    virtual void setCustomUniforms();
};

#endif
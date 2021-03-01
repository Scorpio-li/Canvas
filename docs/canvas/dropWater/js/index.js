"use strict";
var __extends = (this && this.__extends) || (function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] }
                instanceof Array && function(d, b) { d.__proto__ = b; }) ||
            function(d, b) {
                for (var p in b)
                    if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
            };
        return extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);

        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
        for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("https://cdn.skypack.dev/three@0.124.0"));
var OrbitControls_1 = require("https://cdn.skypack.dev/three@0.124.0/examples/jsm/controls/OrbitControls");
var GLTFLoader_1 = require("https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader");
var FBXLoader_1 = require("https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/FBXLoader");
var stats_module_1 = __importDefault(require("https://cdn.skypack.dev/three@0.124.0/examples/jsm/libs/stats.module"));
var dat = __importStar(require("https://cdn.skypack.dev/dat.gui@0.7.7"));
var calcAspect = function(el) { return el.clientWidth / el.clientHeight; };
var getNormalizedMousePos = function(e) {
    return {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
    };
};
var matcapTextureUrl = "https://i.loli.net/2021/02/27/7zhBySIYxEqUFW3.png";
var rayMarchingVertexShader = "\nvarying vec2 vUv;\n\nvoid main(){\n    vec4 modelPosition=modelMatrix*vec4(position,1.);\n    vec4 viewPosition=viewMatrix*modelPosition;\n    vec4 projectedPosition=projectionMatrix*viewPosition;\n    gl_Position=projectedPosition;\n    \n    vUv=uv;\n}\n";
var rayMarchingFragmentShader = "\nuniform float uTime;\nuniform vec2 uMouse;\nuniform vec2 uResolution;\nuniform float uVelocityBox;\nuniform float uProgress;\nuniform float uAngle;\nuniform float uDistance;\nuniform float uVelocitySphere;\nuniform sampler2D uTexture;\n\nvarying vec2 vUv;\n\nconst float EPSILON=.0001;\nconst float PI=3.14159265359;\n\n// https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c\nmat4 rotationMatrix(vec3 axis,float angle){\n    axis=normalize(axis);\n    float s=sin(angle);\n    float c=cos(angle);\n    float oc=1.-c;\n    \n    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,\n        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,\n        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,\n    0.,0.,0.,1.);\n}\n\nvec3 rotate(vec3 v,vec3 axis,float angle){\n    mat4 m=rotationMatrix(axis,angle);\n    return(m*vec4(v,1.)).xyz;\n}\n\nvec3 background(vec2 uv){\n    float dist=length(uv-vec2(.5));\n    vec3 bg=mix(vec3(.3),vec3(.0),dist);\n    return bg;\n}\n\n// https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm\nfloat sdSphere(vec3 p,float r)\n{\n    return length(p)-r;\n}\n\nfloat sdBox(vec3 p,vec3 b)\n{\n    vec3 q=abs(p)-b;\n    return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);\n}\n\n// https://www.iquilezles.org/www/articles/smin/smin.htm\nfloat smin(float a,float b,float k)\n{\n    float h=clamp(.5+.5*(b-a)/k,0.,1.);\n    return mix(b,a,h)-k*h*(1.-h);\n}\n\nfloat movingSphere(vec3 p,float shape){\n    float rad=uAngle*PI;\n    vec3 pos=vec3(cos(rad),sin(rad),0.)*uDistance;\n    vec3 displacement=pos*fract(uTime*uVelocitySphere);\n    float gotoCenter=sdSphere(p-displacement,.1);\n    return smin(shape,gotoCenter,.3);\n}\n\nfloat sdf(vec3 p){\n    vec3 p1=rotate(p,vec3(1.),uTime*uVelocityBox);\n    float box=sdBox(p1,vec3(.3));\n    float sphere=sdSphere(p,.3);\n    float sBox=smin(box,sphere,.3);\n    float mixedBox=mix(sBox,box,uProgress);\n    mixedBox=movingSphere(p,mixedBox);\n    float aspect=uResolution.x/uResolution.y;\n    vec2 mousePos=uMouse;\n    mousePos.x*=aspect;\n    float mouseSphere=sdSphere(p-vec3(mousePos,0.),.15);\n    return smin(mixedBox,mouseSphere,.1);\n}\n\n// http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/\n// https://gist.github.com/sephirot47/f942b8c252eb7d1b7311\nfloat rayMarch(vec3 eye,vec3 ray,float end,int maxIter){\n    float depth=0.;\n    for(int i=0;i<maxIter;i++){\n        vec3 pos=eye+depth*ray;\n        float dist=sdf(pos);\n        depth+=dist;\n        if(dist<EPSILON||dist>=end){\n            break;\n        }\n    }\n    return depth;\n}\n\nvec2 centerUv(vec2 uv){\n    uv=2.*uv-1.;\n    float aspect=uResolution.x/uResolution.y;\n    uv.x*=aspect;\n    return uv;\n}\n\n// https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm\nvec3 calcNormal(in vec3 p)\n{\n    const float eps=.0001;\n    const vec2 h=vec2(eps,0);\n    return normalize(vec3(sdf(p+h.xyy)-sdf(p-h.xyy),\n    sdf(p+h.yxy)-sdf(p-h.yxy),\n    sdf(p+h.yyx)-sdf(p-h.yyx)));\n}\n\n// https://github.com/hughsk/matcap/blob/master/matcap.glsl\nvec2 matcap(vec3 eye,vec3 normal){\n    vec3 reflected=reflect(eye,normal);\n    float m=2.8284271247461903*sqrt(reflected.z+1.);\n    return reflected.xy/m+.5;\n}\n\n// https://www.shadertoy.com/view/4scSW4\nfloat fresnel(float bias,float scale,float power,vec3 I,vec3 N)\n{\n    return bias+scale*pow(1.+dot(I,N),power);\n}\n\nvoid main(){\n    vec2 cUv=centerUv(vUv);\n    vec3 eye=vec3(0.,0.,2.5);\n    vec3 ray=normalize(vec3(cUv,-eye.z));\n    vec3 bg=background(vUv);\n    vec3 color=bg;\n    float end=5.;\n    int maxIter=256;\n    float depth=rayMarch(eye,ray,end,maxIter);\n    if(depth<end){\n        vec3 pos=eye+depth*ray;\n        vec3 normal=calcNormal(pos);\n        vec2 matcapUv=matcap(ray,normal);\n        color=texture2D(uTexture,matcapUv).rgb;\n        float F=fresnel(0.,.4,3.2,ray,normal);\n        color=mix(color,bg,F);\n    }\n    gl_FragColor=vec4(color,1.);\n}\n";
var Base = /** @class */ (function() {
    function Base(sel, debug) {
        if (debug === void 0) { debug = false; }
        this.debug = debug;
        this.container = document.querySelector(sel);
        this.perspectiveCameraParams = {
            fov: 75,
            near: 0.1,
            far: 100
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(0, 3, 10);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.rendererParams = {
            outputEncoding: THREE.LinearEncoding,
            config: {
                alpha: true,
                antialias: true
            }
        };
        this.mousePos = new THREE.Vector2(0, 0);
    }
    // 初始化
    Base.prototype.init = function() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createMesh({});
        this.createLight();
        this.createOrbitControls();
        this.addListeners();
        this.setLoop();
    };
    // 创建场景
    Base.prototype.createScene = function() {
        var scene = new THREE.Scene();
        if (this.debug) {
            scene.add(new THREE.AxesHelper());
            var stats = stats_module_1.default();
            this.container.appendChild(stats.dom);
            this.stats = stats;
        }
        this.scene = scene;
    };
    // 创建透视相机
    Base.prototype.createPerspectiveCamera = function() {
        var _a = this,
            perspectiveCameraParams = _a.perspectiveCameraParams,
            cameraPosition = _a.cameraPosition,
            lookAtPosition = _a.lookAtPosition;
        var fov = perspectiveCameraParams.fov,
            near = perspectiveCameraParams.near,
            far = perspectiveCameraParams.far;
        var aspect = calcAspect(this.container);
        var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    };
    // 创建正交相机
    Base.prototype.createOrthographicCamera = function() {
        var _a = this,
            orthographicCameraParams = _a.orthographicCameraParams,
            cameraPosition = _a.cameraPosition,
            lookAtPosition = _a.lookAtPosition;
        var left = orthographicCameraParams.left,
            right = orthographicCameraParams.right,
            top = orthographicCameraParams.top,
            bottom = orthographicCameraParams.bottom,
            near = orthographicCameraParams.near,
            far = orthographicCameraParams.far;
        var camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    };
    // 更新正交相机参数
    Base.prototype.updateOrthographicCameraParams = function() {
        var container = this.container;
        var _a = this.orthographicCameraParams,
            zoom = _a.zoom,
            near = _a.near,
            far = _a.far;
        var aspect = calcAspect(container);
        this.orthographicCameraParams = {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
            near: near,
            far: far,
            zoom: zoom
        };
    };
    // 创建渲染
    Base.prototype.createRenderer = function(useWebGL1) {
        var _a;
        if (useWebGL1 === void 0) { useWebGL1 = false; }
        var rendererParams = this.rendererParams;
        var outputEncoding = rendererParams.outputEncoding,
            config = rendererParams.config;
        var renderer = !useWebGL1 ?
            new THREE.WebGLRenderer(config) :
            new THREE.WebGL1Renderer(config);
        renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        renderer.outputEncoding = outputEncoding;
        this.resizeRendererToDisplaySize();
        (_a = this.container) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.renderer.setClearColor(0x000000, 0);
    };
    // 允许投影
    Base.prototype.enableShadow = function() {
        this.renderer.shadowMap.enabled = true;
    };
    // 调整渲染器尺寸
    Base.prototype.resizeRendererToDisplaySize = function() {
        var renderer = this.renderer;
        if (!renderer) {
            return;
        }
        var canvas = renderer.domElement;
        var pixelRatio = window.devicePixelRatio;
        var clientWidth = canvas.clientWidth,
            clientHeight = canvas.clientHeight;
        var width = (clientWidth * pixelRatio) | 0;
        var height = (clientHeight * pixelRatio) | 0;
        var isResizeNeeded = canvas.width !== width || canvas.height !== height;
        if (isResizeNeeded) {
            renderer.setSize(width, height, false);
        }
        return isResizeNeeded;
    };
    // 创建网格
    Base.prototype.createMesh = function(meshObject, container) {
        if (container === void 0) { container = this.scene; }
        var _a = meshObject.geometry,
            geometry = _a === void 0 ? new THREE.BoxGeometry(1, 1, 1) : _a,
            _b = meshObject.material,
            material = _b === void 0 ? new THREE.MeshStandardMaterial({
                color: new THREE.Color("#d9dfc8")
            }) : _b,
            _c = meshObject.position,
            position = _c === void 0 ? new THREE.Vector3(0, 0, 0) : _c;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        container.add(mesh);
        return mesh;
    };
    // 创建光源
    Base.prototype.createLight = function() {
        var dirLight = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 0.5);
        dirLight.position.set(0, 50, 0);
        this.scene.add(dirLight);
        var ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
        this.scene.add(ambiLight);
    };
    // 创建轨道控制
    Base.prototype.createOrbitControls = function() {
        var controls = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
        var lookAtPosition = this.lookAtPosition;
        controls.target.copy(lookAtPosition);
        controls.update();
        this.controls = controls;
    };
    // 监听事件
    Base.prototype.addListeners = function() {
        this.onResize();
    };
    // 监听画面缩放
    Base.prototype.onResize = function() {
        var _this = this;
        window.addEventListener("resize", function(e) {
            if (_this.camera instanceof THREE.PerspectiveCamera) {
                var aspect = calcAspect(_this.container);
                var camera = _this.camera;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            } else if (_this.camera instanceof THREE.OrthographicCamera) {
                _this.updateOrthographicCameraParams();
                var camera = _this.camera;
                var _a = _this.orthographicCameraParams,
                    left = _a.left,
                    right = _a.right,
                    top_1 = _a.top,
                    bottom = _a.bottom,
                    near = _a.near,
                    far = _a.far;
                camera.left = left;
                camera.right = right;
                camera.top = top_1;
                camera.bottom = bottom;
                camera.near = near;
                camera.far = far;
                camera.updateProjectionMatrix();
            }
            _this.renderer.setSize(_this.container.clientWidth, _this.container.clientHeight);
        });
    };
    // 动画
    Base.prototype.update = function() {
        console.log("animation");
    };
    // 渲染
    Base.prototype.setLoop = function() {
        var _this = this;
        this.renderer.setAnimationLoop(function() {
            _this.resizeRendererToDisplaySize();
            _this.update();
            if (_this.controls) {
                _this.controls.update();
            }
            if (_this.stats) {
                _this.stats.update();
            }
            if (_this.composer) {
                _this.composer.render();
            } else {
                _this.renderer.render(_this.scene, _this.camera);
            }
        });
    };
    // 创建文本
    Base.prototype.createText = function(text, config, material) {
        if (text === void 0) { text = ""; }
        if (material === void 0) {
            material = new THREE.MeshStandardMaterial({
                color: "#ffffff"
            });
        }
        var geo = new THREE.TextGeometry(text, config);
        var mesh = new THREE.Mesh(geo, material);
        return mesh;
    };
    // 创建音效源
    Base.prototype.createAudioSource = function() {
        var listener = new THREE.AudioListener();
        this.camera.add(listener);
        var sound = new THREE.Audio(listener);
        this.sound = sound;
    };
    // 加载音效
    Base.prototype.loadAudio = function(url) {
        var _this = this;
        var loader = new THREE.AudioLoader();
        return new Promise(function(resolve) {
            loader.load(url, function(buffer) {
                _this.sound.setBuffer(buffer);
                resolve(buffer);
            });
        });
    };
    // 加载模型
    Base.prototype.loadModel = function(url) {
        var loader = new GLTFLoader_1.GLTFLoader();
        return new Promise(function(resolve, reject) {
            loader.load(url, function(gltf) {
                var model = gltf.scene;
                resolve(model);
            }, undefined, function(err) {
                console.log(err);
                reject();
            });
        });
    };
    // 加载FBX模型
    Base.prototype.loadFBXModel = function(url) {
        var loader = new FBXLoader_1.FBXLoader();
        return new Promise(function(resolve, reject) {
            loader.load(url, function(obj) {
                resolve(obj);
            }, undefined, function(err) {
                console.log(err);
                reject();
            });
        });
    };
    // 加载字体
    Base.prototype.loadFont = function(url) {
        var loader = new THREE.FontLoader();
        return new Promise(function(resolve) {
            loader.load(url, function(font) {
                resolve(font);
            });
        });
    };
    // 创建点选模型
    Base.prototype.createRaycaster = function() {
        this.raycaster = new THREE.Raycaster();
        this.trackMousePos();
    };
    // 追踪鼠标位置
    Base.prototype.trackMousePos = function() {
        var _this = this;
        window.addEventListener("mousemove", function(e) {
            _this.setMousePos(e);
        });
        window.addEventListener("mouseout", function() {
            _this.clearMousePos();
        });
        window.addEventListener("mouseleave", function() {
            _this.clearMousePos();
        });
        window.addEventListener("touchstart", function(e) {
            _this.setMousePos(e.touches[0]);
        }, { passive: false });
        window.addEventListener("touchmove", function(e) {
            _this.setMousePos(e.touches[0]);
        });
        window.addEventListener("touchend", function() {
            _this.clearMousePos();
        });
    };
    // 设置鼠标位置
    Base.prototype.setMousePos = function(e) {
        var _a = getNormalizedMousePos(e),
            x = _a.x,
            y = _a.y;
        this.mousePos.x = x;
        this.mousePos.y = y;
    };
    // 清空鼠标位置
    Base.prototype.clearMousePos = function() {
        this.mousePos.x = -100000;
        this.mousePos.y = -100000;
    };
    // 获取点击物
    Base.prototype.getInterSects = function() {
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children, true);
        return intersects;
    };
    // 选中点击物时
    Base.prototype.onChooseIntersect = function(target) {
        var intersects = this.getInterSects();
        var intersect = intersects[0];
        if (!intersect || !intersect.face) {
            return null;
        }
        var object = intersect.object;
        return target === object ? intersect : null;
    };
    return Base;
}());
var RayMarching = /** @class */ (function(_super) {
    __extends(RayMarching, _super);

    function RayMarching(sel, debug) {
        var _this = _super.call(this, sel, debug) || this;
        _this.clock = new THREE.Clock();
        _this.cameraPosition = new THREE.Vector3(0, 0, 0);
        _this.orthographicCameraParams = {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0,
            far: 1,
            zoom: 1
        };
        return _this;
    }
    // 初始化
    RayMarching.prototype.init = function() {
        this.createScene();
        this.createOrthographicCamera();
        this.createRenderer();
        this.createRayMarchingMaterial();
        this.createPlane();
        this.createLight();
        this.trackMousePos();
        this.createDebugPanel();
        this.setLoop();
    };
    // 创建光线追踪材质
    RayMarching.prototype.createRayMarchingMaterial = function() {
        var loader = new THREE.TextureLoader();
        var texture = loader.load(matcapTextureUrl);
        var rayMarchingMaterial = new THREE.ShaderMaterial({
            vertexShader: rayMarchingVertexShader,
            fragmentShader: rayMarchingFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uTexture: {
                    value: texture
                },
                uProgress: {
                    value: 1
                },
                uVelocityBox: {
                    value: 0.25
                },
                uVelocitySphere: {
                    value: 0.5
                },
                uAngle: {
                    value: 1.5
                },
                uDistance: {
                    value: 1.2
                }
            }
        });
        this.rayMarchingMaterial = rayMarchingMaterial;
    };
    // 创建平面
    RayMarching.prototype.createPlane = function() {
        var geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
        var material = this.rayMarchingMaterial;
        this.createMesh({
            geometry: geometry,
            material: material
        });
    };
    // 动画
    RayMarching.prototype.update = function() {
        var elapsedTime = this.clock.getElapsedTime();
        var mousePos = this.mousePos;
        if (this.rayMarchingMaterial) {
            this.rayMarchingMaterial.uniforms.uTime.value = elapsedTime;
            this.rayMarchingMaterial.uniforms.uMouse.value = mousePos;
        }
    };
    // 创建调试面板
    RayMarching.prototype.createDebugPanel = function() {
        var rayMarchingMaterial = this.rayMarchingMaterial;
        var gui = new dat.GUI({ width: 300 });
        gui
            .add(rayMarchingMaterial.uniforms.uProgress, "value")
            .min(0)
            .max(1)
            .step(0.01)
            .name("progress");
        gui
            .add(rayMarchingMaterial.uniforms.uVelocityBox, "value")
            .min(0)
            .max(1)
            .step(0.01)
            .name("velocityBox");
        gui
            .add(rayMarchingMaterial.uniforms.uVelocitySphere, "value")
            .min(0)
            .max(1)
            .step(0.01)
            .name("velocitySphere");
        gui
            .add(rayMarchingMaterial.uniforms.uAngle, "value")
            .min(0)
            .max(2)
            .step(0.01)
            .name("angle");
        gui
            .add(rayMarchingMaterial.uniforms.uDistance, "value")
            .min(0)
            .max(2)
            .step(0.01)
            .name("distance");
    };
    return RayMarching;
}(Base));
var start = function() {
    var rayMarching = new RayMarching(".ray-marching", true);
    rayMarching.init();
};
start();
(function() {

    var lightCaches = {};

    function getLightCache(light) {
        if(lightCaches[light.uuid] !== undefined) {
            return lightCaches[light.uuid];
        }

        var cache;
        switch ( light.lightType ) {
            case LIGHT_TYPE.DIRECT:
                cache = {
                    direction: new Float32Array(3),
                    color: new Float32Array([0, 0, 0, 1]),
                    shadow: false,
                    shadowBias: 0,
                    shadowRadius: 1,
                    shadowMapSize: new Float32Array(2)
                };
                break;
            case LIGHT_TYPE.POINT:
                cache = {
                    position: new Float32Array(3),
                    color: new Float32Array([0, 0, 0, 1]),
                    distance: 0,
                    decay: 0,
                    shadow: false,
                    shadowBias: 0,
                    shadowRadius: 1,
                    shadowMapSize: new Float32Array(2),
                    shadowCameraNear: 1,
                    shadowCameraFar: 1000
                };
                break;
            case LIGHT_TYPE.SPOT:
                cache = {
                    position: new Float32Array(3),
                    direction: new Float32Array(3),
                    color: new Float32Array([0, 0, 0, 1]),
                    distance: 0,
                    coneCos: 0,
                    penumbraCos: 0,
                    decay: 0,
                    shadow: false,
                    shadowBias: 0,
                    shadowRadius: 1,
                    shadowMapSize: new Float32Array(2)
                };
                break;
        }

        lightCaches[light.uuid] = cache;

        return cache;
    }

    var LightCache = function() {
        this.ambient = new Float32Array([0, 0, 0, 1]);
        this.directional = [];
        this.directionalShadowMap = [];
        this.directionalShadowMatrix = [];
        this.point = [];
        this.pointShadowMap = [];
        this.pointShadowMatrix = [];
        this.spot = [];
        this.spotShadowMap = [];
        this.spotShadowMatrix = [];
        this.shadows = [];
        this.ambientsNum = 0;
        this.directsNum = 0;
        this.pointsNum = 0;
        this.spotsNum = 0;
        this.shadowsNum = 0;
        this.totalNum = 0;
    }

    LightCache.prototype.startCount = function () {
        for(var i = 0; i < 3; i++) {
            this.ambient[i] = 0;
        }
        this.shadows.length = 0;
        this.ambientsNum = 0;
        this.directsNum = 0;
        this.pointsNum = 0;
        this.spotsNum = 0;
        this.shadowsNum = 0;
        this.totalNum = 0;
    };

    var LIGHT_TYPE = zen3d.LIGHT_TYPE;

    LightCache.prototype.add = function (object) {
        if (object.lightType == LIGHT_TYPE.AMBIENT) {
            this._doAddAmbientLight(object);
        } else if (object.lightType == LIGHT_TYPE.DIRECT) {
            this._doAddDirectLight(object);
        } else if (object.lightType == LIGHT_TYPE.POINT) {
            this._doAddPointLight(object);
        } else if (object.lightType == LIGHT_TYPE.SPOT) {
            this._doAddSpotLight(object);
        }

        if (object.castShadow && object.lightType !== LIGHT_TYPE.AMBIENT) {
            this.shadows.push(object);
            this.shadowsNum++;
        }

        this.totalNum++;
    };

    LightCache.prototype.endCount = function () {
        // do nothing
    };

    LightCache.prototype._doAddAmbientLight = function (object) {
        var intensity = object.intensity;
        var color = object.color;

        this.ambient[0] += color.r * intensity;
        this.ambient[1] += color.g * intensity;
        this.ambient[2] += color.b * intensity;

        this.ambientsNum++;
    };

    var helpVector3 = new zen3d.Vector3();

    LightCache.prototype._doAddDirectLight = function (object) {
        var intensity = object.intensity;
        var color = object.color;

        var cache = getLightCache(object);

        cache.color[0] = color.r * intensity;
        cache.color[1] = color.g * intensity;
        cache.color[2] = color.b * intensity;

        var direction = helpVector3;
        object.getWorldDirection(direction);
        //direction.transformDirection(camera.viewMatrix);

        cache.direction[0] = direction.x;
        cache.direction[1] = direction.y;
        cache.direction[2] = direction.z;

        if(object.castShadow) {
            cache.shadow = true;
            cache.shadowBias = object.shadow.bias;
            cache.shadowRadius = object.shadow.radius;
            cache.shadowMapSize[0] = object.shadow.mapSize.x;
            cache.shadowMapSize[1] = object.shadow.mapSize.y;
        } else {
            cache.shadow = false;
        }

        if(object.castShadow) {

            // resize typed array
            var needSize = (this.directsNum + 1) * 16;
            if(this.directionalShadowMatrix.length < needSize) {
                var old = this.directionalShadowMatrix;
                this.directionalShadowMatrix = new Float32Array(needSize);
                this.directionalShadowMatrix.set(old);
            }

            this.directionalShadowMatrix.set(object.shadow.matrix.elements, this.directsNum * 16);
            this.directionalShadowMap[this.directsNum] = object.shadow.map;
        }

        this.directional[this.directsNum] = cache;

        this.directsNum++;
    };

    LightCache.prototype._doAddPointLight = function (object) {
        var intensity = object.intensity;
        var color = object.color;
        var distance = object.distance;
        var decay = object.decay;

        var cache = getLightCache(object);

        cache.color[0] = color.r * intensity;
        cache.color[1] = color.g * intensity;
        cache.color[2] = color.b * intensity;

        cache.distance = distance;
        cache.decay = decay;

        var position = helpVector3.setFromMatrixPosition(object.worldMatrix);//.applyMatrix4(camera.viewMatrix);

        cache.position[0] = position.x;
        cache.position[1] = position.y;
        cache.position[2] = position.z;

        if(object.castShadow) {
            cache.shadow = true;
            cache.shadowBias = object.shadow.bias;
            cache.shadowRadius = object.shadow.radius;
            cache.shadowMapSize[0] = object.shadow.mapSize.x;
            cache.shadowMapSize[1] = object.shadow.mapSize.y;
            cache.shadowCameraNear = object.shadow.cameraNear;
            cache.shadowCameraFar = object.shadow.cameraFar;
        } else {
            cache.shadow = false;
        }

        if(object.castShadow) {

            // resize typed array
            var needSize = (this.pointsNum + 1) * 16;
            if(this.pointShadowMatrix.length < needSize) {
                var old = this.pointShadowMatrix;
                this.pointShadowMatrix = new Float32Array(needSize);
                this.pointShadowMatrix.set(old);
            }

            this.pointShadowMatrix.set(object.shadow.matrix.elements, this.pointsNum * 16);
            this.pointShadowMap[this.pointsNum] = object.shadow.map;
        }

        this.point[this.pointsNum] = cache;

        this.pointsNum++;
    };

    LightCache.prototype._doAddSpotLight = function (object) {
        var intensity = object.intensity;
        var color = object.color;
        var distance = object.distance;
        var decay = object.decay;

        var cache = getLightCache(object);

        cache.color[0] = color.r * intensity;
        cache.color[1] = color.g * intensity;
        cache.color[2] = color.b * intensity;

        cache.distance = distance;
        cache.decay = decay;

        var position = helpVector3.setFromMatrixPosition(object.worldMatrix);//.applyMatrix4(camera.viewMatrix);

        cache.position[0] = position.x;
        cache.position[1] = position.y;
        cache.position[2] = position.z;

        var direction = helpVector3;
        object.getWorldDirection(helpVector3);
        // helpVector3.transformDirection(camera.viewMatrix);

        cache.direction[0] = direction.x;
        cache.direction[1] = direction.y;
        cache.direction[2] = direction.z;

        var coneCos = Math.cos(object.angle);
        var penumbraCos = Math.cos(object.angle * (1 - object.penumbra));

        cache.coneCos = coneCos;
        cache.penumbraCos = penumbraCos;

        if(object.castShadow) {
            cache.shadow = true;
            cache.shadowBias = object.shadow.bias;
            cache.shadowRadius = object.shadow.radius;
            cache.shadowMapSize[0] = object.shadow.mapSize.x;
            cache.shadowMapSize[1] = object.shadow.mapSize.y;
        } else {
            cache.shadow = false;
        }

        if(object.castShadow) {

            // resize typed array
            var needSize = (this.spotsNum + 1) * 16;
            if(this.spotShadowMatrix.length < needSize) {
                var old = this.spotShadowMatrix;
                this.spotShadowMatrix = new Float32Array(needSize);
                this.spotShadowMatrix.set(old);
            }

            this.spotShadowMatrix.set(object.shadow.matrix.elements, this.spotsNum * 16);
            this.spotShadowMap[this.spotsNum] = object.shadow.map;
        }

        this.spot[this.spotsNum] = cache;

        this.spotsNum++;
    };

    zen3d.LightCache = LightCache;
})();